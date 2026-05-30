import { gql } from 'graphql-tag';
import type { Resolvers } from '../../generated/graphql';
import { WalletService } from './wallet.service';
import { requireAuth } from '../../infrastructure/context';

export const walletTypeDefs = gql`
  type Wallet {
    id: ID!
    userId: ID!
    user: User!
    balance: Float!
    currency: String!
    transactions: [WalletTransaction!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type WalletTransaction {
    id: ID!
    walletId: ID!
    wallet: Wallet!
    type: TransactionType!
    amount: Float!
    balanceBefore: Float!
    balanceAfter: Float!
    description: String!
    provider: String
    externalId: String
    status: TransactionStatus!
    metadata: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Commission {
    id: ID!
    orderId: ID!
    sellerId: ID!
    productId: ID!
    productPrice: Float!
    commissionRate: Float!
    commissionAmount: Float!
    sellerReceived: Float!
    createdAt: DateTime!
  }

  enum TransactionType {
    DEPOSIT
    WITHDRAWAL
    PURCHASE
    SALE
    COMMISSION
    REFUND
  }

  enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
    CANCELLED
  }

  input DepositInput {
    amount: Float!
    provider: String!
    externalId: String!
  }

  input WithdrawInput {
    amount: Float!
    provider: String!
    externalAccountId: String!
  }

  type WalletTransactionResult {
    transactions: [WalletTransaction!]!
    total: Int!
    hasMore: Boolean!
  }

  input WalletTransactionsInput {
    type: TransactionType
    status: TransactionStatus
    limit: Int = 20
    offset: Int = 0
    startDate: DateTime
    endDate: DateTime
  }

  extend type Query {
    myWallet: Wallet
    walletTransactions(input: WalletTransactionsInput): WalletTransactionResult!
    walletTransaction(id: ID!): WalletTransaction

    # Admin only
    userWallet(userId: ID!): Wallet
    allWalletTransactions(input: WalletTransactionsInput): WalletTransactionResult!
  }

  extend type Mutation {
    # Deposit funds to wallet
    depositFunds(input: DepositInput!): WalletTransaction!

    # Withdraw funds from wallet
    withdrawFunds(input: WithdrawInput!): WalletTransaction!

    # Admin only - manually adjust wallet
    adjustWalletBalance(userId: ID!, amount: Float!, reason: String!): WalletTransaction!
  }

  # Subscriptions for real-time updates
  extend type Subscription {
    walletUpdated: Wallet!
    transactionCreated: WalletTransaction!
  }
`;

export const walletResolvers: Resolvers = {
  Query: {
    myWallet: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const service = new WalletService(context.db);
      return service.getWalletByUserId(user.id);
    },

    walletTransactions: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const service = new WalletService(context.db);
      const wallet = await service.getWalletByUserId(user.id);
      return service.getWalletTransactions(wallet.id, input);
    },

    walletTransaction: async (_parent, { id }, context) => {
      const user = requireAuth(context);
      const service = new WalletService(context.db);
      return service.getTransactionById(id, user.id);
    },

    // Admin only
    userWallet: async (_parent, { userId }, context) => {
      requireAdmin(context);
      const service = new WalletService(context.db);
      return service.getWalletByUserId(userId);
    },

    allWalletTransactions: async (_parent, { input }, context) => {
      requireAdmin(context);
      const service = new WalletService(context.db);
      return service.getAllWalletTransactions(input);
    },
  },

  Mutation: {
    depositFunds: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const service = new WalletService(context.db);
      return service.depositFunds(user.id, input);
    },

    withdrawFunds: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const service = new WalletService(context.db);
      return service.withdrawFunds(user.id, input);
    },

    adjustWalletBalance: async (_parent, { userId, amount, reason }, context) => {
      requireAdmin(context);
      const service = new WalletService(context.db);
      return service.adjustWalletBalance(userId, amount, reason);
    },
  },

  Wallet: {
    user: async (parent, _args, context) => {
      return context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, parent.userId),
      });
    },

    transactions: async (parent, _args, context) => {
      return context.db.query.walletTransactions.findMany({
        where: (transactions, { eq }) => eq(transactions.walletId, parent.id),
        orderBy: (transactions, { desc }) => desc(transactions.createdAt),
        limit: 10, // Default limit for nested queries
      });
    },
  },

  WalletTransaction: {
    wallet: async (parent, _args, context) => {
      return context.db.query.wallets.findFirst({
        where: (wallets, { eq }) => eq(wallets.id, parent.walletId),
      });
    },
  },
};

// Import required functions
import { requireAdmin } from '../../infrastructure/context';