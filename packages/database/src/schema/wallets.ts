import { pgTable, uuid, decimal, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const transactionTypeEnum = pgEnum('transaction_type', [
  'DEPOSIT',
  'WITHDRAWAL',
  'PURCHASE',
  'SALE',
  'COMMISSION',
  'REFUND'
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal('balance_before', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  provider: varchar('provider', { length: 100 }), // STRIPE, PAYPAL, BANK_TRANSFER, INTERNAL
  externalId: varchar('external_id', { length: 255 }), // ID from payment provider
  status: transactionStatusEnum('status').default('PENDING').notNull(),
  metadata: text('metadata'), // JSON for additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Commission tracking (separate from user transactions for admin visibility)
export const commissions = pgTable('commissions', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productPrice: decimal('product_price', { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 4 }).notNull(), // 0.0500 = 5%
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 2 }).notNull(),
  sellerReceived: decimal('seller_received', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  order: one(orders, {
    fields: [commissions.orderId],
    references: [orders.id],
  }),
  seller: one(users, {
    fields: [commissions.sellerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [commissions.productId],
    references: [products.id],
  }),
}));

// Import other tables for relations
import { orders } from './orders';
import { products } from './products';