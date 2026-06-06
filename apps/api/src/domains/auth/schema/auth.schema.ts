import { pgTable, uuid, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

// Table des sessions d'authentification
export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table des tentatives de connexion
export const authAttempts = pgTable("auth_attempts", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  success: boolean("success").notNull().default(false),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

// Table des tokens de réinitialisation
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Table des tokens de vérification email
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: uuid("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;

export type AuthAttempt = typeof authAttempts.$inferSelect;
export type NewAuthAttempt = typeof authAttempts.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;