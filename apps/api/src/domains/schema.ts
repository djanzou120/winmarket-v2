// Schéma central regroupant tous les domaines métier - Architecture DDD

// Export de tous les schémas de domaines
export * from './auth/schema/auth.schema';
export * from './users/schema/users.schema';
export * from './products/schema/products.schema';
export * from './orders/schema/orders.schema';
export * from './reviews/schema/reviews.schema';
export * from './delivery/schema/delivery.schema';
export * from './notifications/schema/notifications.schema';

// Import des schémas de domaines individuels pour créer un schéma global unifié
import {
  authSessions,
  authAttempts,
  passwordResetTokens,
  emailVerificationTokens
} from './auth/schema/auth.schema';

import {
  users,
  userProfiles,
  userWallets
} from './users/schema/users.schema';

import {
  categories,
  products,
  productVariants
} from './products/schema/products.schema';

import {
  orders,
  orderItems,
  walletTransactions,
  cartItems
} from './orders/schema/orders.schema';

import {
  reviews,
  reviewVotes,
  reviewReports,
  reviewResponses
} from './reviews/schema/reviews.schema';

import {
  deliveryProviders,
  deliveryOptions,
  deliveryZones,
  deliveryTracking
} from './delivery/schema/delivery.schema';

import {
  notifications,
  notificationPreferences,
  deviceTokens,
  notificationTemplates
} from './notifications/schema/notifications.schema';

// Export du schéma combiné pour Drizzle
export const combinedSchema = {
  // Auth domain
  authSessions,
  authAttempts,
  passwordResetTokens,
  emailVerificationTokens,

  // Users domain
  users,
  userProfiles,
  userWallets,

  // Products domain
  categories,
  products,
  productVariants,

  // Orders domain
  orders,
  orderItems,
  walletTransactions,
  cartItems,

  // Reviews domain
  reviews,
  reviewVotes,
  reviewReports,
  reviewResponses,

  // Delivery domain
  deliveryProviders,
  deliveryOptions,
  deliveryZones,
  deliveryTracking,

  // Notifications domain
  notifications,
  notificationPreferences,
  deviceTokens,
  notificationTemplates,
};
