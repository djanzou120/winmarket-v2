import { pgTable, varchar, text, uuid, decimal, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

// Enums for orders domain
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CARD",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
  "WALLET"
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "PAYMENT",
  "REFUND",
  "DEPOSIT",
  "WITHDRAWAL",
  "COMMISSION",
  "BONUS"
]);

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  buyerId: uuid("buyer_id").notNull(),
  sellerId: uuid("seller_id").notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("PENDING"),
  paymentMethod: paymentMethodEnum("payment_method"),

  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("XOF"),

  // Shipping information
  shippingAddress: text("shipping_address"), // JSON object
  billingAddress: text("billing_address"), // JSON object
  shippingMethod: varchar("shipping_method", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),

  // Additional info
  notes: text("notes"),
  internalNotes: text("internal_notes"), // Admin only
  cancelReason: text("cancel_reason"),
  refundReason: text("refund_reason"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  cancelledAt: timestamp("cancelled_at"),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: uuid("order_id").notNull(),
  productId: uuid("product_id").notNull(),
  productVariantId: uuid("product_variant_id"),

  // Product snapshot (in case product is deleted/modified)
  productName: varchar("product_name", { length: 255 }).notNull(),
  productImage: varchar("product_image", { length: 500 }),
  productSku: varchar("product_sku", { length: 100 }),

  // Pricing
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

  // Variant info
  variantName: varchar("variant_name", { length: 100 }),
  variantValue: varchar("variant_value", { length: 100 }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  walletId: uuid("wallet_id").notNull(),
  orderId: uuid("order_id"),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("XOF"),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  metadata: text("metadata"), // JSON for additional data
  status: varchar("status", { length: 20 }).notNull().default("COMPLETED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Shopping cart table (for temporary storage)
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull(),
  productId: uuid("product_id").notNull(),
  productVariantId: uuid("product_variant_id"),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(orders, {
    fields: [orders.buyerId],
    references: [orders.id],
  }),
  seller: one(orders, {
    fields: [orders.sellerId],
    references: [orders.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  order: one(orders, {
    fields: [walletTransactions.orderId],
    references: [orders.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(cartItems, {
    fields: [cartItems.productId],
    references: [cartItems.id],
  }),
}));

export const ordersSchema = {
  orders,
  orderItems,
  walletTransactions,
  cartItems,
};

// Type exports
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;