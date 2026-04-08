import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OracleValidationService {
  private readonly logger = new Logger(OracleValidationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Validates aggregated data to prevent manipulation and anomalies.
   */
  async validateData(marketId: string, computedValue: number, confidence: number) {
    this.logger.log(`Validating data for market ${marketId}. Value: ${computedValue}, Confidence: ${confidence}`);

    let anomalyDetected = false;

    // 1. Confidence Check
    if (confidence < 0.6) {
      this.logger.warn(`Low confidence (${confidence}) for market ${marketId}. Flagging for review.`);
      anomalyDetected = true;
    }

    // 2. Spike Detection (Compare with previous validations)
    const previousValidation = await this.prisma.validationResult.findFirst({
      where: { marketId },
      orderBy: { createdAt: 'desc' },
    });

    if (previousValidation) {
      const percentageChange = Math.abs((computedValue - previousValidation.computedValue) / previousValidation.computedValue);
      
      // If value changes by more than 50% in a short time, flag it
      if (percentageChange > 0.5) {
        this.logger.warn(`Abnormal spike detected for market ${marketId}. Change: ${percentageChange * 100}%`);
        anomalyDetected = true;
      }
    }

    // Save validation result
    const result = await this.prisma.validationResult.create({
      data: {
        marketId,
        computedValue,
        confidence,
        anomalyDetected,
      },
    });

    return result;
  }
}
