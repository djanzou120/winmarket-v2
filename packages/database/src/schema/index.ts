// Export all schemas and relations
export * from './users';
export * from './wallets';
export * from './products';
export * from './orders';
export * from './reviews';
export * from './admin';

// Re-export for convenience
import {
  users,
  userProfiles,
  addresses,
  usersRelations,
  userProfilesRelations,
  addressesRelations,
  userRoleEnum,
  userStatusEnum
} from './users';

import {
  wallets,
  walletTransactions,
  commissions,
  walletsRelations,
  walletTransactionsRelations,
  commissionsRelations,
  transactionTypeEnum,
  transactionStatusEnum
} from './wallets';

import {
  categories,
  products,
  deliveryProviders,
  deliveryOptions,
  categoriesRelations,
  productsRelations,
  deliveryProvidersRelations,
  deliveryOptionsRelations,
  productStatusEnum,
  deliveryTypeEnum
} from './products';

import {
  orders,
  orderItems,
  orderStatusHistory,
  ordersRelations,
  orderItemsRelations,
  orderStatusHistoryRelations,
  orderStatusEnum
} from './orders';

import {
  reviews,
  reviewHelpfulness,
  chatRooms,
  chatMessages,
  reviewsRelations,
  reviewHelpfulnessRelations,
  chatRoomsRelations,
  chatMessagesRelations,
  reviewStatusEnum
} from './reviews';

import {
  reports,
  auditLogs,
  notifications,
  systemConfig,
  analyticsEvents,
  dailyStats,
  reportsRelations,
  auditLogsRelations,
  notificationsRelations,
  systemConfigRelations,
  analyticsEventsRelations,
  reportTypeEnum,
  reportStatusEnum,
  reportReasonEnum
} from './admin';

// All tables
export const schema = {
  // User management
  users,
  userProfiles,
  addresses,

  // Wallet & financial
  wallets,
  walletTransactions,
  commissions,

  // Product catalog
  categories,
  products,
  deliveryProviders,
  deliveryOptions,

  // Orders & commerce
  orders,
  orderItems,
  orderStatusHistory,

  // Reviews & communication
  reviews,
  reviewHelpfulness,
  chatRooms,
  chatMessages,

  // Admin & system
  reports,
  auditLogs,
  notifications,
  systemConfig,
  analyticsEvents,
  dailyStats,
};

// All relations
export const relations = {
  usersRelations,
  userProfilesRelations,
  addressesRelations,
  walletsRelations,
  walletTransactionsRelations,
  commissionsRelations,
  categoriesRelations,
  productsRelations,
  deliveryProvidersRelations,
  deliveryOptionsRelations,
  ordersRelations,
  orderItemsRelations,
  orderStatusHistoryRelations,
  reviewsRelations,
  reviewHelpfulnessRelations,
  chatRoomsRelations,
  chatMessagesRelations,
  reportsRelations,
  auditLogsRelations,
  notificationsRelations,
  systemConfigRelations,
  analyticsEventsRelations,
};

// All enums
export const enums = {
  userRoleEnum,
  userStatusEnum,
  transactionTypeEnum,
  transactionStatusEnum,
  productStatusEnum,
  deliveryTypeEnum,
  orderStatusEnum,
  reviewStatusEnum,
  reportTypeEnum,
  reportStatusEnum,
  reportReasonEnum,
};