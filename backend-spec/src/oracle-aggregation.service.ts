import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AggregatedData {
  marketId: string;
  computedValue: number;
  confidence: number;
  sourcesUsed: number;
}

@Injectable()
export class OracleAggregationService {
  private readonly logger = new Logger(OracleAggregationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Aggregates data from multiple sources (e.g., TikTok API, Scrapers)
   * to determine a single, reliable value for a market.
   */
  async aggregateData(marketId: string): Promise<AggregatedData | null> {
    this.logger.log(`Aggregating data for market: ${marketId}`);

    // Fetch recent snapshots for this market
    const snapshots = await this.prisma.dataSnapshot.findMany({
      where: {
        marketId,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    });

    if (snapshots.length === 0) {
      this.logger.warn(`No recent data snapshots found for market ${marketId}`);
      return null;
    }

    let totalWeight = 0;
    let weightedSum = 0;
    let confidence = 0;

    // Apply weights based on trust level
    snapshots.forEach(snapshot => {
      const weight = snapshot.trustLevel === 'HIGH' ? 0.8 : 0.2;
      weightedSum += snapshot.value * weight;
      totalWeight += weight;
    });

    const computedValue = weightedSum / totalWeight;

    // Calculate confidence based on number of sources and variance
    // Simplified logic: more sources = higher confidence
    const uniqueSources = new Set(snapshots.map(s => s.source)).size;
    confidence = Math.min(uniqueSources * 0.3, 1.0); // Max confidence 1.0

    // If we have both HIGH and LOW trust sources, and they agree, boost confidence
    const hasHighTrust = snapshots.some(s => s.trustLevel === 'HIGH');
    const hasLowTrust = snapshots.some(s => s.trustLevel === 'LOW');
    if (hasHighTrust && hasLowTrust) {
      confidence = Math.min(confidence + 0.2, 1.0);
    }

    return {
      marketId,
      computedValue,
      confidence,
      sourcesUsed: uniqueSources,
    };
  }
}
