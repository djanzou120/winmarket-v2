// Schéma central regroupant tous les domaines métier

// Auth domain
export * from './auth/schema/auth.schema';

// Users domain
export * from './users/schema/users.schema';

// Products domain
export * from './products/schema/products.schema';

// Orders domain (schéma simplifié)
import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { users } from './users/schema/users.schema';
import { products } from './products/schema/products.schema';
import { userWallets } from './users/schema/users.schema';

export const orderStatusEnum = pgEnum("order_status", ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["DEPOSIT", "WITHDRAWAL", "PAYMENT", "REFUND", "COMMISSION", "BONUS"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["PENDING", "COMPLETED", "FAILED", "CANCELLED"]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  sellerId: uuid("seller_id").references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  notes: text("notes"),
  metadata: text("metadata"), // JSON field for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at")
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  variantId: uuid("variant_id"), // Reference to product variants
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  productSnapshot: text("product_snapshot"), // JSON snapshot of product at time of order
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  walletId: uuid("wallet_id").notNull().references(() => userWallets.id),
  orderId: uuid("order_id").references(() => orders.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("PENDING"),
  description: varchar("description", { length: 500 }),
  reference: varchar("reference", { length: 255 }),
  metadata: text("metadata"), // JSON field
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at")
});

// Reviews domain (schéma simplifié)
export const reviewStatusEnum = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED", "HIDDEN"]);
export const reviewReportReasonEnum = pgEnum("review_report_reason", ["SPAM", "INAPPROPRIATE", "FAKE", "OFFENSIVE", "OTHER"]);
export const reviewReportStatusEnum = pgEnum("review_report_status", ["PENDING", "RESOLVED", "DISMISSED"]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: uuid("product_id").notNull().references(() => products.id),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  images: text("images").array(),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  status: reviewStatusEnum("status").notNull().default("PENDING"),
  helpfulVotes: integer("helpful_votes").notNull().default(0),
  totalVotes: integer("total_votes").notNull().default(0),
  sellerResponse: text("seller_response"),
  sellerResponseAt: timestamp("seller_response_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Delivery domain (schéma simplifié)
export const deliveryStatusEnum = pgEnum("delivery_provider_status", ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP"]);

export const deliveryProviders = pgTable("delivery_providers", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }),
  website: text("website"),
  apiUrl: text("api_url"),
  apiKey: varchar("api_key", { length: 255 }),
  trackingUrlTemplate: text("tracking_url_template").notNull(),
  coverageAreas: text("coverage_areas").array().notNull(),
  supportedServices: text("supported_services").array().notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(),
  status: deliveryStatusEnum("status").notNull().default("PENDING_VERIFICATION"),
  isVerified: boolean("is_verified").notNull().default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Notifications domain (schéma simplifié)
export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER_UPDATE", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "PRODUCT_APPROVED",
  "PRODUCT_REJECTED", "REVIEW_RECEIVED", "MESSAGE_RECEIVED", "WALLET_DEPOSIT",
  "WALLET_WITHDRAWAL", "PROMOTION_AVAILABLE", "SYSTEM_ANNOUNCEMENT"
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON field
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Types exportés
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type DeliveryProvider = typeof deliveryProviders.$inferSelect;
export type Notification = typeof notifications.$inferSelect;