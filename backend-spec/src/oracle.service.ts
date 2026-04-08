import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private prisma: PrismaService) {
    // Initialize Ethers provider and wallet
    // In production, use AWS KMS or GCP Secret Manager instead of raw private keys
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
    
    // ABI for the PredixMarket Smart Contract
    const abi = [
      "function resolveMarket(uint256 marketId, bool outcome) external"
    ];
    this.contract = new ethers.Contract(process.env.MARKET_CONTRACT_ADDRESS, abi, this.wallet);
  }

  /**
   * Executes the final decision on the Polygon blockchain.
   * Triggered by the BullMQ 'oracle-execution' queue.
   */
  async executeDecision(marketId: string, computedValue: number) {
    this.logger.log(`Executing Oracle Decision for Market: ${marketId}`);

    // 1. Fetch Market Details to determine the target condition
    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market || market.status !== 'OPEN') {
      this.logger.error(`Market ${marketId} not found or not OPEN.`);
      return;
    }

    // 2. Determine Outcome based on market rules
    // Example: "Will video hit 1M views?" -> Target = 1,000,000
    // In a real system, the target condition would be stored in the Market model.
    const targetValue = 1000000; // Mocked target
    const outcome = computedValue >= targetValue;

    // 3. Create Pending Decision Record
    const decision = await this.prisma.oracleDecision.create({
      data: {
        marketId,
        outcome,
        status: 'PENDING'
      }
    });

    try {
      // 4. Sign and Send Transaction to Polygon
      this.logger.log(`Sending Tx to Polygon: Market ${marketId}, Outcome: ${outcome}`);
      
      // Convert string UUID to uint256 if necessary, or assume marketId is mapped
      // For this example, we assume marketId is a numeric string
      const tx = await this.contract.resolveMarket(BigInt(marketId), outcome);
      
      this.logger.log(`Tx sent. Waiting for confirmation... Hash: ${tx.hash}`);
      const receipt = await tx.wait();

      // 5. Update DB on Success
      await this.prisma.oracleDecision.update({
        where: { id: decision.id },
        data: {
          txHash: receipt.hash,
          status: 'EXECUTED'
        }
      });

      await this.prisma.market.update({
        where: { id: marketId },
        data: { status: 'RESOLVED' }
      });

      this.logger.log(`✅ Market ${marketId} successfully resolved on-chain.`);

    } catch (error) {
      // 6. Handle Failure
      this.logger.error(`❌ Failed to resolve market ${marketId} on-chain`, error);
      
      await this.prisma.oracleDecision.update({
        where: { id: decision.id },
        data: { status: 'FAILED' }
      });

      // Depending on the error (e.g., nonce issue, gas spike), we might want to throw 
      // so BullMQ retries the job.
      throw error;
    }
  }
}
