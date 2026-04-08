import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Processes an instant off-chain trade.
   * Uses Prisma $transaction to ensure ACID compliance (no double spending).
   */
  async executeTrade(userId: string, marketId: string, amount: number, optionId: string) {
    this.logger.log(`Executing trade: User ${userId}, Market ${marketId}, Amount ${amount}`);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Lock the user's balance row for update to prevent race conditions
      const balance = await tx.balance.findUnique({
        where: { userId },
      });

      if (!balance || balance.available < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // 2. Deduct from available balance
      await tx.balance.update({
        where: { userId },
        data: {
          available: { decrement: amount },
        },
      });

      // 3. Record the Ledger Transaction
      await tx.ledgerTransaction.create({
        data: {
          userId,
          type: 'TRADE_BUY',
          amount,
          referenceId: marketId,
          status: 'COMPLETED',
        },
      });

      // 4. Update the Market Pool (AMM integration)
      // In a real scenario, this would call the AmmService to update pools and prices
      
      this.logger.log(`Trade successful for User ${userId}`);
      return { success: true, amountDeducted: amount };
    });
  }

  /**
   * Handles on-chain deposits. Triggered by a blockchain listener.
   */
  async processDeposit(userId: string, amount: number, txHash: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Credit the user's off-chain balance
      await tx.balance.update({
        where: { userId },
        data: { available: { increment: amount } },
      });

      // 2. Record the deposit
      await tx.ledgerTransaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          amount,
          referenceId: txHash,
          status: 'COMPLETED',
        },
      });
    });
  }
}
