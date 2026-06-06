import { authResolvers } from '../modules/auth/auth.module';
import { productsResolvers } from '../modules/products/products.module';
import { walletResolvers } from '../modules/wallet/wallet.module';
import { ordersResolvers } from '../modules/orders/orders.module';
import { reviewsResolvers } from '../modules/reviews/reviews.module';
import { deliveryResolvers } from '../modules/delivery/delivery.module';
import { notificationsResolvers } from '../modules/notifications/notifications.module';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';

// Custom scalar resolvers
const scalarResolvers = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
};

// Base resolvers for common types
const baseResolvers = {
  Query: {
    _empty: () => 'GraphQL API is running',
  },

  Mutation: {
    _empty: () => 'GraphQL API is running',
  },

  Subscription: {
    _empty: () => 'GraphQL API is running',
  },

  User: {
    profile: async (parent: any, _args: any, context: any) => {
      return context.db.query.userProfiles.findFirst({
        where: (profiles: any, { eq }: any) => eq(profiles.userId, parent.id),
      });
    },

    wallet: async (parent: any, _args: any, context: any) => {
      return context.db.query.userWallets.findFirst({
        where: (userWallets: any, { eq }: any) => eq(userWallets.userId, parent.id),
      });
    },
  },

  UserProfile: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },
  },

  Review: {
    product: async (parent: any, _args: any, context: any) => {
      return context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, parent.productId),
      });
    },

    buyer: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.buyerId),
      });
    },

    order: async (parent: any, _args: any, context: any) => {
      return context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, parent.orderId),
      });
    },
  },
};

// Merge all resolvers
export const resolvers = {
  ...scalarResolvers,

  Query: {
    ...baseResolvers.Query,
    ...authResolvers.Query,
    ...productsResolvers.Query,
    ...walletResolvers.Query,
    ...ordersResolvers.Query,
    ...reviewsResolvers.Query,
    ...deliveryResolvers.Query,
    ...notificationsResolvers.Query,
  },

  Mutation: {
    ...baseResolvers.Mutation,
    ...authResolvers.Mutation,
    ...productsResolvers.Mutation,
    ...walletResolvers.Mutation,
    ...ordersResolvers.Mutation,
    ...reviewsResolvers.Mutation,
    ...deliveryResolvers.Mutation,
    ...notificationsResolvers.Mutation,
  },

  Subscription: {
    ...baseResolvers.Subscription,
    ...(walletResolvers.Subscription || {}),
    ...(ordersResolvers.Subscription || {}),
    ...(notificationsResolvers.Subscription || {}),
  },

  // Type resolvers
  User: {
    ...baseResolvers.User,
  },

  UserProfile: {
    ...baseResolvers.UserProfile,
  },

  Product: {
    ...productsResolvers.Product,
  },

  Category: {
    ...productsResolvers.Category,
  },

  Wallet: {
    ...walletResolvers.Wallet,
  },

  WalletTransaction: {
    ...walletResolvers.WalletTransaction,
  },

  Order: {
    ...ordersResolvers.Order,
  },

  OrderItem: {
    ...ordersResolvers.OrderItem,
  },

  OrderStatusHistory: {
    ...ordersResolvers.OrderStatusHistory,
  },

  // Reviews type resolvers
  Review: {
    ...baseResolvers.Review,
    ...reviewsResolvers.Review,
  },

  ReviewVote: {
    ...reviewsResolvers.ReviewVote,
  },

  ReviewReport: {
    ...reviewsResolvers.ReviewReport,
  },

  // Delivery type resolvers
  DeliveryProvider: {
    ...deliveryResolvers.DeliveryProvider,
  },

  DeliveryOption: {
    ...deliveryResolvers.DeliveryOption,
  },

  DeliveryZone: {
    ...deliveryResolvers.DeliveryZone,
  },

  // Notifications type resolvers
  Notification: {
    ...notificationsResolvers.Notification,
  },

  NotificationPreference: {
    ...notificationsResolvers.NotificationPreference,
  },

  DeviceToken: {
    ...notificationsResolvers.DeviceToken,
  },
};