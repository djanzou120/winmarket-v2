import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { products, deliveryOptions } from './products';

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  orderNumber: varchar('order_number', { length: 20 }).unique().notNull(), // ORD-202412-001
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 8, scale: 2 }).default('0.00').notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),

  // Delivery information
  deliveryMethod: varchar('delivery_method', { length: 20 }).notNull(), // PICKUP, DELIVERY
  deliveryProviderId: uuid('delivery_provider_id').references(() => deliveryProviders.id),
  deliveryAddress: text('delivery_address'), // JSON with full address
  trackingNumber: varchar('tracking_number', { length: 100 }),

  // Payment information
  paymentMethod: varchar('payment_method', { length: 20 }).default('WALLET').notNull(),
  paidAt: timestamp('paid_at'),

  // Timestamps
  estimatedDelivery: timestamp('estimated_delivery'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'restrict' }).notNull(),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Product snapshot at time of order
  productTitle: varchar('product_title', { length: 200 }).notNull(),
  productImage: text('product_image'),

  // Pricing
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),

  // Commission (visible to seller and admin only)
  commissionRate: decimal('commission_rate', { precision: 5, scale: 4 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 2 }).notNull(),
  sellerAmount: decimal('seller_amount', { precision: 12, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  fromStatus: orderStatusEnum('from_status'),
  toStatus: orderStatusEnum('to_status').notNull(),
  note: text('note'),
  changedBy: uuid('changed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  deliveryProvider: one(deliveryProviders, {
    fields: [orders.deliveryProviderId],
    references: [deliveryProviders.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  commissions: many(commissions),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  seller: one(users, {
    fields: [orderItems.sellerId],
    references: [users.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  changedBy: one(users, {
    fields: [orderStatusHistory.changedBy],
    references: [users.id],
  }),
}));

// Import other tables for relations
import { deliveryProviders } from './products';
import { commissions } from './wallets';