// Users and Authentication
export * from "./users";

// Products and Categories
export * from "./products";

// Orders and Payments
export * from "./orders";

// Re-export all tables for drizzle-kit
import { users, userProfiles, userWallets } from "./users";
import { categories, products, productVariants } from "./products";
import { orders, orderItems, walletTransactions } from "./orders";

export const schema = {
  // Users
  users,
  userProfiles,
  userWallets,

  // Products
  categories,
  products,
  productVariants,

  // Orders
  orders,
  orderItems,
  walletTransactions,
};

export type Schema = typeof schema;