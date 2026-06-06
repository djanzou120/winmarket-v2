import { pgTable, varchar, text, uuid, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

// Enums for reviews domain
export const reviewStatusEnum = pgEnum("review_status", ["PENDING", "APPROVED", "REJECTED", "HIDDEN"]);
export const voteTypeEnum = pgEnum("vote_type", ["HELPFUL", "NOT_HELPFUL"]);
export const reportReasonEnum = pgEnum("report_reason", [
  "INAPPROPRIATE_CONTENT",
  "SPAM",
  "FAKE_REVIEW",
  "OFFENSIVE_LANGUAGE",
  "COPYRIGHT_VIOLATION",
  "OTHER"
]);

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: uuid("product_id").notNull(),
  userId: uuid("user_id").notNull(),
  orderId: uuid("order_id"), // Optional: to verify purchase
  orderItemId: uuid("order_item_id"), // Optional: specific order item

  // Review content
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  content: text("content"),
  images: text("images"), // JSON array of image URLs

  // Metadata
  status: reviewStatusEnum("status").notNull().default("PENDING"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isAnonymous: boolean("is_anonymous").default(false),

  // Engagement metrics
  helpfulVotes: integer("helpful_votes").default(0),
  totalVotes: integer("total_votes").default(0),

  // Moderation
  moderatedBy: uuid("moderated_by"),
  moderatedAt: timestamp("moderated_at"),
  moderationReason: text("moderation_reason"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Review votes table (helpful/not helpful)
export const reviewVotes = pgTable("review_votes", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  reviewId: uuid("review_id").notNull(),
  userId: uuid("user_id").notNull(),
  voteType: voteTypeEnum("vote_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Review reports table
export const reviewReports = pgTable("review_reports", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  reviewId: uuid("review_id").notNull(),
  reporterId: uuid("reporter_id").notNull(),
  reason: reportReasonEnum("reason").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("PENDING"), // PENDING, REVIEWED, RESOLVED
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Review responses table (seller can respond to reviews)
export const reviewResponses = pgTable("review_responses", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  reviewId: uuid("review_id").notNull(),
  userId: uuid("user_id").notNull(), // Usually the seller
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(reviews, {
    fields: [reviews.productId],
    references: [reviews.id],
  }),
  user: one(reviews, {
    fields: [reviews.userId],
    references: [reviews.id],
  }),
  order: one(reviews, {
    fields: [reviews.orderId],
    references: [reviews.id],
  }),
  votes: many(reviewVotes),
  reports: many(reviewReports),
  responses: many(reviewResponses),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(reviewVotes, {
    fields: [reviewVotes.userId],
    references: [reviewVotes.id],
  }),
}));

export const reviewReportsRelations = relations(reviewReports, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewReports.reviewId],
    references: [reviews.id],
  }),
  reporter: one(reviewReports, {
    fields: [reviewReports.reporterId],
    references: [reviewReports.id],
  }),
}));

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewResponses.reviewId],
    references: [reviews.id],
  }),
  user: one(reviewResponses, {
    fields: [reviewResponses.userId],
    references: [reviewResponses.id],
  }),
}));

export const reviewsSchema = {
  reviews,
  reviewVotes,
  reviewReports,
  reviewResponses,
};

// Type exports
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type ReviewVote = typeof reviewVotes.$inferSelect;
export type NewReviewVote = typeof reviewVotes.$inferInsert;

export type ReviewReport = typeof reviewReports.$inferSelect;
export type NewReviewReport = typeof reviewReports.$inferInsert;

export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type NewReviewResponse = typeof reviewResponses.$inferInsert;