import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('oracle-execution') private oracleQueue: Queue,
  ) {}

  /**
   * Core validation logic. Triggered by a cron job or BullMQ worker
   * after data collectors have gathered enough snapshots.
   */
  async validateMarketData(marketId: string) {
    this.logger.log(`Starting validation for market: ${marketId}`);

    // 1. Fetch recent snapshots (last 1 hour)
    const snapshots = await this.prisma.dataSnapshot.findMany({
      where: { 
        marketId,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (snapshots.length === 0) {
      this.logger.warn(`No snapshots found for market ${marketId}`);
      return;
    }

    // 2. Separate by trust level
    const highTrust = snapshots.filter(s => s.trustLevel === 'HIGH');
    const lowTrust = snapshots.filter(s => s.trustLevel === 'LOW');

    // 3. Compute Metrics
    const consistencyScore = this.calculateConsistency(highTrust, lowTrust);
    const { isAnomaly, smoothedValue, timeStability } = this.analyzeTimeStability(snapshots);

    // 4. Calculate Final Confidence Score
    // Weighting: 50% Source Trust, 30% Consistency, 20% Time Stability
    const sourceWeight = highTrust.length > 0 ? 1.0 : 0.5;
    const confidence = (sourceWeight * 0.5) + (consistencyScore * 0.3) + (timeStability * 0.2);

    this.logger.log(`Market ${marketId} Validation: Value=${smoothedValue}, Confidence=${confidence}`);

    // 5. Store Validation Result for Audit
    await this.prisma.validationResult.create({
      data: {
        marketId,
        computedValue: smoothedValue,
        confidence,
        anomalyDetected: isAnomaly
      }
    });

    // 6. Oracle Execution Routing
    if (confidence >= 0.85 && !isAnomaly) {
      this.logger.log(`Confidence threshold met. Queuing Oracle execution for ${marketId}`);
      await this.oracleQueue.add('execute-decision', {
        marketId,
        computedValue: smoothedValue,
        confidence
      });
    } else {
      this.logger.warn(`Confidence too low (${confidence}) or anomaly detected. Delaying resolution.`);
      // System will naturally retry on the next cron tick, gathering more data.
    }
  }

  /**
   * Compares variance between High Trust (API) and Low Trust (Scrapers)
   */
  private calculateConsistency(high: any[], low: any[]): number {
    if (high.length === 0 || low.length === 0) return 0.5; // Neutral if missing one side
    
    const highAvg = high.reduce((acc, s) => acc + s.value, 0) / high.length;
    const lowAvg = low.reduce((acc, s) => acc + s.value, 0) / low.length;
    
    const diffPercentage = Math.abs(highAvg - lowAvg) / highAvg;
    
    // If difference is less than 5%, consistency is 1.0. Drops off as diff increases.
    return diffPercentage <= 0.05 ? 1.0 : Math.max(0, 1.0 - (diffPercentage * 2));
  }

  /**
   * Detects sudden spikes (view botting) using simple moving average & Z-Score concepts
   */
  private analyzeTimeStability(snapshots: any[]) {
    const values = snapshots.map(s => s.value);
    const latestValue = values[values.length - 1];
    
    // Simple smoothing (average of last 3)
    const recentValues = values.slice(-3);
    const smoothedValue = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

    // Anomaly Detection: If the latest value jumps by more than 20% compared to the smoothed average
    const jumpPercentage = (latestValue - smoothedValue) / smoothedValue;
    const isAnomaly = jumpPercentage > 0.20;

    // Time stability score: 1.0 if smooth, drops if erratic
    const timeStability = isAnomaly ? 0.2 : 1.0;

    return { isAnomaly, smoothedValue, timeStability };
  }
}
