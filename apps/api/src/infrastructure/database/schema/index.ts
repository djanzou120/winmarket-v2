// Users and Authentication
export * from "./users";

// Products and Categories
export * from "./products";

// Orders and Payments
export * from "./orders";

// Reviews and Feedback
export * from "./reviews";

// Delivery and Logistics
export * from "./delivery";

// Notifications and Communication
export * from "./notifications";

// Re-export all tables for drizzle-kit
import { users, userProfiles, userWallets } from "./users";
import { categories, products, productVariants } from "./products";
import { orders, orderItems, walletTransactions } from "./orders";
import { reviews, reviewVotes, reviewReports } from "./reviews";
import { deliveryProviders, deliveryOptions, deliveryZones } from "./delivery";
import { notifications, notificationPreferences, deviceTokens } from "./notifications";

export const schema = {
  // Users (3 tables)
  users,
  userProfiles,
  userWallets,

  // Products (3 tables)
  categories,
  products,
  productVariants,

  // Orders (3 tables)
  orders,
  orderItems,
  walletTransactions,

  // Reviews (3 tables)
  reviews,
  reviewVotes,
  reviewReports,

  // Delivery (3 tables)
  deliveryProviders,
  deliveryOptions,
  deliveryZones,

  // Notifications (3 tables)
  notifications,
  notificationPreferences,
  deviceTokens,
};

export type Schema = typeof schema;