import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generates a custodial HD Wallet for a new user.
   * The private key is encrypted before storing in the database.
   */
  async createCustodialWallet(userId: string) {
    this.logger.log(`Generating custodial wallet for user: ${userId}`);

    // Generate a random EVM wallet
    const wallet = ethers.Wallet.createRandom();

    // In a real production environment, use AWS KMS or GCP Secret Manager
    // Here we use a mock AES-256-GCM encryption for demonstration
    const encryptedPrivateKey = this.mockKmsEncrypt(wallet.privateKey);

    await this.prisma.custodialWallet.create({
      data: {
        userId,
        address: wallet.address,
        encryptedPrivateKey,
      },
    });

    // Initialize balance
    await this.prisma.balance.create({
      data: { userId, available: 0, locked: 0 },
    });

    return wallet.address;
  }

  /**
   * Verifies a signature from an external wallet (MetaMask/WalletConnect)
   * using SIWE (Sign-In with Ethereum) logic.
   */
  async verifyExternalWallet(userId: string, signature: string, message: string) {
    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      // Link the external wallet to the user
      await this.prisma.user.update({
        where: { id: userId },
        data: { externalWallet: recoveredAddress },
      });

      this.logger.log(`Linked external wallet ${recoveredAddress} to user ${userId}`);
      return recoveredAddress;
    } catch (error) {
      throw new BadRequestException('Invalid signature');
    }
  }

  /**
   * MOCK: Encrypts a private key. 
   * MUST be replaced with AWS KMS in production.
   */
  private mockKmsEncrypt(privateKey: string): string {
    const algorithm = 'aes-256-gcm';
    const secretKey = crypto.scryptSync(process.env.KMS_SECRET || 'fallback_secret', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }
}
