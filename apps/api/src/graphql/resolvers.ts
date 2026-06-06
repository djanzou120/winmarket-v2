import { authResolvers, usersResolvers } from '../domains';
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
    ...usersResolvers.Query,
    // Autres domaines seront ajoutés progressivement
  },

  Mutation: {
    ...baseResolvers.Mutation,
    ...authResolvers.Mutation,
    ...usersResolvers.Mutation,
    // Autres domaines seront ajoutés progressivement
  },

  Subscription: {
    ...baseResolvers.Subscription,
    // Subscriptions seront ajoutées progressivement
  },

  // Type resolvers par domaine
  User: {
    ...baseResolvers.User,
    ...usersResolvers.User,
  },

  UserProfile: {
    ...usersResolvers.UserProfile,
  },

  Wallet: {
    ...usersResolvers.Wallet,
  },

  // Autres resolvers de types seront ajoutés au fur et à mesure
};