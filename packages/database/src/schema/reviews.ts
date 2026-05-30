import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { products } from './products';
import { orders } from './orders';

export const reviewStatusEnum = pgEnum('review_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),

  rating: integer('rating').notNull(), // 1-5 stars
  title: varchar('title', { length: 200 }),
  comment: text('comment'),
  images: text('images'), // JSON array of review images

  isVerifiedPurchase: boolean('is_verified_purchase').default(true).notNull(),
  status: reviewStatusEnum('status').default('APPROVED').notNull(),

  // Seller response
  sellerResponse: text('seller_response'),
  sellerResponseAt: timestamp('seller_response_at'),

  // Moderation
  moderatedBy: uuid('moderated_by').references(() => users.id),
  moderatedAt: timestamp('moderated_at'),
  moderationNote: text('moderation_note'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviewHelpfulness = pgTable('review_helpfulness', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  reviewId: uuid('review_id').references(() => reviews.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isHelpful: boolean('is_helpful').notNull(), // true = helpful, false = not helpful
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Chat system for buyer-seller communication
export const chatRooms = pgTable('chat_rooms', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true).notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  roomId: uuid('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull(),
  attachments: text('attachments'), // JSON array of file URLs
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  buyer: one(users, {
    fields: [reviews.buyerId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  moderatedBy: one(users, {
    fields: [reviews.moderatedBy],
    references: [users.id],
  }),
  helpfulness: many(reviewHelpfulness),
}));

export const reviewHelpfulnessRelations = relations(reviewHelpfulness, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpfulness.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewHelpfulness.userId],
    references: [users.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  buyer: one(users, {
    fields: [chatRooms.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [chatRooms.sellerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [chatRooms.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [chatRooms.orderId],
    references: [orders.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));