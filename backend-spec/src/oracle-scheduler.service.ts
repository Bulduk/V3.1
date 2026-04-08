import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OracleAggregationService } from './oracle-aggregation.service';
import { OracleValidationService } from './oracle-validation.service';
import { OracleDecisionEngine } from './oracle-decision.service';

@Injectable()
export class OracleSchedulerService {
  private readonly logger = new Logger(OracleSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aggregationService: OracleAggregationService,
    private readonly validationService: OracleValidationService,
    private readonly decisionEngine: OracleDecisionEngine,
  ) {}

  /**
   * Automated Task Scheduling for the Oracle System.
   * Runs every 5 minutes to aggregate data, validate it, and potentially resolve markets.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleOraclePipeline() {
    this.logger.log('Starting scheduled Oracle Pipeline execution...');

    try {
      // 1. Fetch all active markets that need continuous data tracking
      const activeMarkets = await this.prisma.market.findMany({
        where: { 
          status: 'OPEN',
        },
      });

      this.logger.log(`Found ${activeMarkets.length} active markets to process.`);

      for (const market of activeMarkets) {
        this.logger.log(`Processing pipeline for market: ${market.id}`);

        // Step 1: Aggregation
        const aggregatedData = await this.aggregationService.aggregateData(market.id);
        
        if (!aggregatedData) {
          this.logger.warn(`Skipping validation for market ${market.id} due to missing aggregated data.`);
          continue;
        }

        // Step 2: Validation
        const validationResult = await this.validationService.validateData(
          market.id, 
          aggregatedData.computedValue, 
          aggregatedData.confidence
        );

        // Step 3: Decision / Resolution Check
        // Check if the market has reached its end time
        const now = new Date();
        if (market.endTime <= now) {
          this.logger.log(`Market ${market.id} has reached its end time. Triggering resolution.`);
          
          if (validationResult.anomalyDetected) {
            this.logger.warn(`Cannot resolve market ${market.id} automatically due to data anomaly. Moving to DISPUTED.`);
            await this.prisma.market.update({
              where: { id: market.id },
              data: { status: 'DISPUTED' },
            });
          } else {
            // Proceed to resolve the market
            await this.decisionEngine.resolveMarket(market.id);
          }
        } else {
          this.logger.debug(`Market ${market.id} is still ongoing. Data recorded successfully.`);
        }
      }

      this.logger.log('Oracle Pipeline execution completed successfully.');
    } catch (error) {
      this.logger.error('Error during Oracle Pipeline execution', error);
    }
  }
}
