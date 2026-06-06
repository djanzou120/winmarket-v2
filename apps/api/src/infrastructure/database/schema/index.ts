// Configuration du schéma de base de données - Migration vers la structure par domaines

// ⚠️ TRANSITION: Ce fichier maintient la compatibilité avec l'ancien système
// Tout est maintenant organisé par domaine métier dans /src/domains/

// Export de compatibilité avec l'ancien système
export * from "./users";
export * from "./products";
export * from "./orders";
export * from "./reviews";
export * from "./delivery";
export * from "./notifications";

// Import pour compatibilité
import { users, userProfiles, userWallets } from "./users";
import { categories, products, productVariants } from "./products";
import { orders, orderItems, walletTransactions } from "./orders";
import { reviews, reviewVotes, reviewReports } from "./reviews";
import { deliveryProviders, deliveryOptions, deliveryZones } from "./delivery";
import { notifications, notificationPreferences, deviceTokens } from "./notifications";

// Schéma existant (maintenu pour compatibilité)
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

// TODO: Export du nouveau schéma organisé par domaines
// export { schema as domainsSchema } from '../../../domains/schema';

export type Schema = typeof schema;