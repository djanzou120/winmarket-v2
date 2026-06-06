import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum, integer } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER_UPDATE",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PRODUCT_APPROVED",
  "PRODUCT_REJECTED",
  "REVIEW_RECEIVED",
  "MESSAGE_RECEIVED",
  "WALLET_DEPOSIT",
  "WALLET_WITHDRAWAL",
  "PROMOTION_AVAILABLE",
  "SYSTEM_ANNOUNCEMENT"
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "IN_APP",
  "EMAIL",
  "PUSH",
  "SMS"
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  recipientId: uuid("recipient_id").notNull().references(() => users.id),
  senderId: uuid("sender_id").references(() => users.id), // null for system notifications

  // Content
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url", { length: 500 }), // Deep link or URL to take action

  // Rich content
  imageUrl: varchar("image_url", { length: 500 }),
  metadata: text("metadata"), // JSON object with additional data

  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),

  // Delivery tracking
  channels: text("channels"), // JSON array of channels this was sent to
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  pushSent: boolean("push_sent").default(false),
  pushSentAt: timestamp("push_sent_at"),
  smsSent: boolean("sms_sent").default(false),
  smsSentAt: timestamp("sms_sent_at"),

  // Scheduling
  scheduledFor: timestamp("scheduled_for"), // null = send immediately

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),

  // Channel preferences
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),

  // Type preferences (JSON object with notification types as keys)
  typePreferences: text("type_preferences"), // { "ORDER_UPDATE": ["email", "push"], "PROMOTION": ["email"] }

  // Timing preferences
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default("22:00"), // HH:mm format
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default("08:00"), // HH:mm format
  timezone: varchar("timezone", { length: 50 }).default("Europe/Paris"),

  // Frequency limits
  maxEmailsPerDay: integer("max_emails_per_day").default(10),
  maxPushPerDay: integer("max_push_per_day").default(20),
  maxSmsPerMonth: integer("max_sms_per_month").default(5),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Device information
  token: varchar("token", { length: 500 }).notNull().unique(),
  platform: varchar("platform", { length: 20 }).notNull(), // ios, android, web
  deviceId: varchar("device_id", { length: 255 }),
  appVersion: varchar("app_version", { length: 50 }),

  // Status
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});