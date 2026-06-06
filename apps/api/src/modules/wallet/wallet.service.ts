import { eq, and, desc, gte, lte } from 'drizzle-orm';
import type { Database } from '../../infrastructure/database/connection';
import { users, userWallets, walletTransactions } from '../../infrastructure/database/schema';
import { createId } from '@paralleldrive/cuid2';

export interface DepositInput {
  amount: number;
  provider: string;
  externalId: string;
}

export interface WithdrawInput {
  amount: number;
  provider: string;
  externalAccountId: string;
}

export interface WalletTransactionsInput {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export class WalletService {
  constructor(private db: Database) {}

  async getWalletByUserId(userId: string) {
    // Get or create wallet for user
    let wallet = await this.db.query.userWallets.findFirst({
      where: eq(userWallets.userId, userId),
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      const [newWallet] = await this.db.insert(userWallets).values({
        id: createId(),
        userId,
        balance: '0.00',
        frozenBalance: '0.00',
        totalEarnings: '0.00',
        totalSpent: '0.00',
      }).returning();
      wallet = newWallet;
    }

    return wallet;
  }

  async getWalletTransactions(walletId: string, input: WalletTransactionsInput) {
    const { limit = 20, offset = 0, type, status, startDate, endDate } = input;

    const conditions = [eq(walletTransactions.userId, walletId)];

    if (type) {
      conditions.push(eq(walletTransactions.type, type));
    }

    if (startDate) {
      conditions.push(gte(walletTransactions.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(walletTransactions.createdAt, endDate));
    }

    const transactions = await this.db.query.walletTransactions.findMany({
      where: and(...conditions),
      orderBy: desc(walletTransactions.createdAt),
      limit,
      offset,
    });

    const total = await this.db.$count(walletTransactions, and(...conditions));

    return {
      transactions,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getTransactionById(transactionId: string, userId: string) {
    return await this.db.query.walletTransactions.findFirst({
      where: and(
        eq(walletTransactions.id, transactionId),
        eq(walletTransactions.userId, userId)
      ),
    });
  }

  async getAllWalletTransactions(input: WalletTransactionsInput) {
    const { limit = 20, offset = 0, type, status, startDate, endDate } = input;

    const conditions = [];

    if (type) {
      conditions.push(eq(walletTransactions.type, type));
    }

    if (startDate) {
      conditions.push(gte(walletTransactions.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(walletTransactions.createdAt, endDate));
    }

    const transactions = await this.db.query.walletTransactions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: desc(walletTransactions.createdAt),
      limit,
      offset,
    });

    const total = await this.db.$count(
      walletTransactions,
      conditions.length > 0 ? and(...conditions) : undefined
    );

    return {
      transactions,
      total,
      hasMore: offset + limit < total,
    };
  }

  async depositFunds(userId: string, input: DepositInput) {
    return await this.db.transaction(async (tx) => {
      // Get wallet
      const wallet = await this.getWalletByUserId(userId);

      // Calculate new balance
      const currentBalance = parseFloat(wallet.balance);
      const newBalance = currentBalance + input.amount;

      // Update wallet balance
      await tx.update(userWallets)
        .set({
          balance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(userWallets.id, wallet.id));

      // Create transaction record
      const [transaction] = await tx.insert(walletTransactions).values({
        id: createId(),
        userId,
        type: 'DEPOSIT',
        amount: input.amount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `Deposit via ${input.provider}`,
        reference: input.externalId,
        metadata: JSON.stringify({ provider: input.provider }),
      }).returning();

      return transaction;
    });
  }

  async withdrawFunds(userId: string, input: WithdrawInput) {
    return await this.db.transaction(async (tx) => {
      // Get wallet
      const wallet = await this.getWalletByUserId(userId);

      // Check if sufficient funds
      const currentBalance = parseFloat(wallet.balance);
      if (currentBalance < input.amount) {
        throw new Error('Insufficient funds');
      }

      // Calculate new balance
      const newBalance = currentBalance - input.amount;

      // Update wallet balance
      await tx.update(userWallets)
        .set({
          balance: newBalance.toFixed(2),
          totalSpent: (parseFloat(wallet.totalSpent) + input.amount).toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(userWallets.id, wallet.id));

      // Create transaction record
      const [transaction] = await tx.insert(walletTransactions).values({
        id: createId(),
        userId,
        type: 'WITHDRAWAL',
        amount: (-input.amount).toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `Withdrawal via ${input.provider}`,
        metadata: JSON.stringify({
          provider: input.provider,
          externalAccountId: input.externalAccountId
        }),
      }).returning();

      return transaction;
    });
  }

  async adjustWalletBalance(userId: string, amount: number, reason: string) {
    return await this.db.transaction(async (tx) => {
      // Get wallet
      const wallet = await this.getWalletByUserId(userId);

      // Calculate new balance
      const currentBalance = parseFloat(wallet.balance);
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new Error('Adjustment would result in negative balance');
      }

      // Update wallet balance
      await tx.update(userWallets)
        .set({
          balance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(userWallets.id, wallet.id));

      // Create transaction record
      const [transaction] = await tx.insert(walletTransactions).values({
        id: createId(),
        userId,
        type: amount > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
        amount: amount.toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `Manual adjustment: ${reason}`,
        metadata: JSON.stringify({ reason, adminAdjustment: true }),
      }).returning();

      return transaction;
    });
  }
}