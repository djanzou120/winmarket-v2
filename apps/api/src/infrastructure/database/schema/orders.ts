import { pgTable, uuid, varchar, text, decimal, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { users } from "./users";
import { products } from "./products";

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
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "WALLET",
  "MANUAL_PAYMENT",
  "CASH_ON_DELIVERY"
]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("PENDING"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),

  // Amounts
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0.00"),

  // Shipping information
  shippingAddress: text("shipping_address").notNull(), // JSON object
  shippingProvider: varchar("shipping_provider", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),

  // Notes and metadata
  buyerNotes: text("buyer_notes"),
  sellerNotes: text("seller_notes"),
  internalNotes: text("internal_notes"),
  metadata: text("metadata"), // JSON object for additional data

  // Timestamps
  placedAt: timestamp("placed_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  variantId: uuid("variant_id"), // references product_variants.id
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  productSnapshot: text("product_snapshot"), // JSON snapshot of product at order time
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type", { length: 50 }).notNull(), // DEPOSIT, WITHDRAWAL, COMMISSION, PAYMENT, REFUND
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }),
  reference: varchar("reference", { length: 100 }).unique(), // External reference
  metadata: text("metadata"), // JSON object
  createdAt: timestamp("created_at").notNull().defaultNow()
});