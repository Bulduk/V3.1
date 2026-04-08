import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OracleDecisionEngine {
  private readonly logger = new Logger(OracleDecisionEngine.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Determines the final outcome of a market based on validated data.
   */
  async resolveMarket(marketId: string) {
    this.logger.log(`Attempting to resolve market: ${marketId}`);

    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market || market.status !== 'OPEN') {
      this.logger.warn(`Market ${marketId} is not open or does not exist.`);
      return;
    }

    // Get the latest validation result
    const latestValidation = await this.prisma.validationResult.findFirst({
      where: { marketId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestValidation) {
      this.logger.warn(`No validation data found for market ${marketId}`);
      return;
    }

    // Security: Do not resolve if an anomaly is detected
    if (latestValidation.anomalyDetected) {
      this.logger.warn(`Anomaly detected for market ${marketId}. Moving to DISPUTED state for human review.`);
      await this.prisma.market.update({
        where: { id: marketId },
        data: { status: 'DISPUTED' },
      });
      return;
    }

    // Decision Logic (Simplified example for a YES/NO market based on a threshold)
    // In a real system, the threshold would be stored in the Market model
    const THRESHOLD = 1000000; // e.g., 1 Million views
    const outcome = latestValidation.computedValue >= THRESHOLD;

    this.logger.log(`Market ${marketId} resolved. Outcome: ${outcome ? 'YES' : 'NO'}`);

    // 1. Record Decision
    await this.prisma.oracleDecision.create({
      data: {
        marketId,
        outcome,
        status: 'PENDING', // Pending on-chain execution
      },
    });

    // 2. Update Market Status
    await this.prisma.market.update({
      where: { id: marketId },
      data: { status: 'RESOLVING' },
    });

    // 3. Trigger On-Chain Execution (Shadow Mode or Real)
    // this.shadowModeService.resolveMarketOnChain(marketId, outcome);
  }
}
