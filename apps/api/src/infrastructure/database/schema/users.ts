import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const userTypeEnum = pgEnum("user_type", ["BUYER", "SELLER", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  avatar: text("avatar"),
  userType: userTypeEnum("user_type").notNull().default("BUYER"),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  timezone: varchar("timezone", { length: 50 }),
  language: varchar("language", { length: 10 }).default("fr"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  marketingEnabled: boolean("marketing_enabled").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const userWallets = pgTable("user_wallets", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  frozenBalance: decimal("frozen_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});