import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { users } from "./users";
import { products } from "./products";
import { orders } from "./orders";

export const reviewStatusEnum = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED", "HIDDEN"]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  images: text("images"), // JSON array of image URLs
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(true),
  status: reviewStatusEnum("status").notNull().default("PENDING"),

  // Seller response
  sellerResponse: text("seller_response"),
  sellerResponseAt: timestamp("seller_response_at"),

  // Moderation
  moderatorId: uuid("moderator_id").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  moderationReason: text("moderation_reason"),

  // Metadata
  helpfulVotes: integer("helpful_votes").default(0),
  reportCount: integer("report_count").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reviewVotes = pgTable("review_votes", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  reviewId: uuid("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  isHelpful: boolean("is_helpful").notNull(), // true = helpful, false = not helpful
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviewReports = pgTable("review_reports", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  reviewId: uuid("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  reporterId: uuid("reporter_id").notNull().references(() => users.id),
  reason: varchar("reason", { length: 100 }).notNull(), // spam, inappropriate, fake, etc.
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING, RESOLVED, DISMISSED
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});