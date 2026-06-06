import { pgTable, varchar, text, uuid, boolean, timestamp, integer, pgEnum, json } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

// Enums for notifications domain
export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER_CREATED",
  "ORDER_CONFIRMED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PRODUCT_LOW_STOCK",
  "PRODUCT_OUT_OF_STOCK",
  "NEW_REVIEW",
  "REVIEW_RESPONSE",
  "ACCOUNT_CREATED",
  "EMAIL_VERIFIED",
  "PASSWORD_CHANGED",
  "PROFILE_UPDATED",
  "PROMOTION_ALERT",
  "SYSTEM_MAINTENANCE",
  "SECURITY_ALERT",
  "CUSTOM"
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "IN_APP",
  "EMAIL",
  "SMS",
  "PUSH"
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT"
]);

export const devicePlatformEnum = pgEnum("device_platform", [
  "ANDROID",
  "IOS",
  "WEB"
]);

// Main notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  priority: notificationPriorityEnum("priority").notNull().default("NORMAL"),

  // Content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionText: varchar("action_text", { length: 100 }),
  actionUrl: varchar("action_url", { length: 500 }),

  // Metadata
  data: json("data"), // Additional structured data
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // ORDER, PRODUCT, USER, etc.
  relatedEntityId: uuid("related_entity_id"),

  // Status
  isRead: boolean("is_read").notNull().default(false),
  isSent: boolean("is_sent").notNull().default(false),
  isDelivered: boolean("is_delivered").default(false),

  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  deliveredAt: timestamp("delivered_at"),

  // Tracking
  clickedAt: timestamp("clicked_at"),
  dismissedAt: timestamp("dismissed_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().unique(),

  // Email preferences
  emailOrderUpdates: boolean("email_order_updates").default(true),
  emailPromotions: boolean("email_promotions").default(true),
  emailSecurity: boolean("email_security").default(true),
  emailReviews: boolean("email_reviews").default(true),
  emailNewsletter: boolean("email_newsletter").default(false),

  // SMS preferences
  smsOrderUpdates: boolean("sms_order_updates").default(false),
  smsSecurity: boolean("sms_security").default(true),
  smsPromotions: boolean("sms_promotions").default(false),

  // Push notification preferences
  pushOrderUpdates: boolean("push_order_updates").default(true),
  pushPromotions: boolean("push_promotions").default(true),
  pushSecurity: boolean("push_security").default(true),
  pushReviews: boolean("push_reviews").default(true),

  // In-app preferences
  inAppOrderUpdates: boolean("in_app_order_updates").default(true),
  inAppPromotions: boolean("in_app_promotions").default(true),
  inAppSecurity: boolean("in_app_security").default(true),
  inAppReviews: boolean("in_app_reviews").default(true),

  // Global settings
  emailFrequency: varchar("email_frequency", { length: 20 }).default("IMMEDIATE"), // IMMEDIATE, DAILY, WEEKLY
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default("08:00"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Device tokens for push notifications
export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  platform: devicePlatformEnum("platform").notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  deviceModel: varchar("device_model", { length: 100 }),
  osVersion: varchar("os_version", { length: 50 }),
  appVersion: varchar("app_version", { length: 50 }),

  isActive: boolean("is_active").notNull().default(true),
  lastUsed: timestamp("last_used").notNull().defaultNow(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notification templates for different types
export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  type: notificationTypeEnum("type").notNull(),
  channel: notificationChannelEnum("channel").notNull(),

  // Template content
  titleTemplate: varchar("title_template", { length: 500 }).notNull(),
  messageTemplate: text("message_template").notNull(),
  actionTextTemplate: varchar("action_text_template", { length: 100 }),
  actionUrlTemplate: varchar("action_url_template", { length: 500 }),

  // Email specific (when channel is EMAIL)
  emailSubject: varchar("email_subject", { length: 255 }),
  emailHtml: text("email_html"),

  // Metadata
  variables: json("variables"), // Available template variables
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email unsubscribe tracking
export const emailUnsubscribes = pgTable("email_unsubscribes", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  userId: uuid("user_id"),
  type: varchar("type", { length: 50 }).notNull(), // PROMOTIONS, NEWSLETTER, ALL
  token: varchar("token", { length: 100 }).notNull().unique(),

  unsubscribedAt: timestamp("unsubscribed_at").notNull().defaultNow(),
  resubscribedAt: timestamp("resubscribed_at"),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(notifications, {
    fields: [notifications.userId],
    references: [notifications.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(notificationPreferences, {
    fields: [notificationPreferences.userId],
    references: [notificationPreferences.id],
  }),
}));

export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(deviceTokens, {
    fields: [deviceTokens.userId],
    references: [deviceTokens.id],
  }),
}));

export const notificationsSchema = {
  notifications,
  notificationPreferences,
  deviceTokens,
  notificationTemplates,
  emailUnsubscribes,
};

// Type exports
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert;

export type DeviceToken = typeof deviceTokens.$inferSelect;
export type NewDeviceToken = typeof deviceTokens.$inferInsert;

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;