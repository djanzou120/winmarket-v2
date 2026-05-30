import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum, integer, decimal } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { products } from './products';

export const reportTypeEnum = pgEnum('report_type', ['PRODUCT', 'USER', 'REVIEW', 'MESSAGE']);
export const reportStatusEnum = pgEnum('report_status', ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']);
export const reportReasonEnum = pgEnum('report_reason', [
  'INAPPROPRIATE_CONTENT',
  'SPAM',
  'HARASSMENT',
  'FAKE_PRODUCT',
  'INTELLECTUAL_PROPERTY',
  'OTHER'
]);

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportedUserId: uuid('reported_user_id').references(() => users.id, { onDelete: 'cascade' }),
  reportedProductId: uuid('reported_product_id').references(() => products.id, { onDelete: 'cascade' }),

  type: reportTypeEnum('type').notNull(),
  reason: reportReasonEnum('reason').notNull(),
  description: text('description').notNull(),
  evidence: text('evidence'), // JSON array of screenshots, URLs, etc.

  status: reportStatusEnum('status').default('PENDING').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id), // Admin who handles the report
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(), // CREATE_USER, UPDATE_PRODUCT, etc.
  entityType: varchar('entity_type', { length: 50 }).notNull(), // USER, PRODUCT, ORDER, etc.
  entityId: uuid('entity_id'),

  oldValues: text('old_values'), // JSON of previous values
  newValues: text('new_values'), // JSON of new values
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  type: varchar('type', { length: 50 }).notNull(), // ORDER_UPDATE, MESSAGE, PAYMENT, etc.
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  data: text('data'), // JSON for additional data (order ID, product ID, etc.)

  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),

  // Delivery channels
  sentEmail: boolean('sent_email').default(false).notNull(),
  sentPush: boolean('sent_push').default(false).notNull(),
  sentSms: boolean('sent_sms').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemConfig = pgTable('system_config', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).default('STRING').notNull(), // STRING, NUMBER, BOOLEAN, JSON
  category: varchar('category', { length: 50 }).default('GENERAL').notNull(),
  isEditable: boolean('is_editable').default(true).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analytics tables for business intelligence
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 100 }),

  event: varchar('event', { length: 100 }).notNull(), // PAGE_VIEW, PRODUCT_VIEW, ADD_TO_CART, etc.
  category: varchar('category', { length: 50 }).notNull(), // USER, PRODUCT, ORDER, etc.
  properties: text('properties'), // JSON data

  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daily aggregated stats
export const dailyStats = pgTable('daily_stats', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  date: timestamp('date').notNull(),

  // User metrics
  newUsers: integer('new_users').default(0).notNull(),
  activeUsers: integer('active_users').default(0).notNull(),

  // Product metrics
  newProducts: integer('new_products').default(0).notNull(),
  productViews: integer('product_views').default(0).notNull(),

  // Order metrics
  newOrders: integer('new_orders').default(0).notNull(),
  completedOrders: integer('completed_orders').default(0).notNull(),
  grossRevenue: decimal('gross_revenue', { precision: 12, scale: 2 }).default('0.00').notNull(),
  commissionRevenue: decimal('commission_revenue', { precision: 12, scale: 2 }).default('0.00').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
  }),
  reportedProduct: one(products, {
    fields: [reports.reportedProductId],
    references: [products.id],
  }),
  assignedTo: one(users, {
    fields: [reports.assignedTo],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const systemConfigRelations = relations(systemConfig, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemConfig.updatedBy],
    references: [users.id],
  }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));