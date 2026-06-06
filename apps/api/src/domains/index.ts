// Index central des domaines métier - Architecture DDD
import { gql } from 'graphql-tag';

// Import des modules de domaines
import { authTypeDefs, authResolvers } from './auth';
import { usersTypeDefs, usersResolvers } from './users';
import { productsTypeDefs, productsResolvers } from './products';
import { ordersTypeDefs, ordersResolvers } from './orders';
import { reviewsTypeDefs, reviewsResolvers } from './reviews';
import { deliveryTypeDefs, deliveryResolvers } from './delivery';
import { notificationsTypeDefs, notificationsResolvers } from './notifications';

// Re-export des modules de domaines
export {
  authTypeDefs, authResolvers,
  usersTypeDefs, usersResolvers,
  productsTypeDefs, productsResolvers,
  ordersTypeDefs, ordersResolvers,
  reviewsTypeDefs, reviewsResolvers,
  deliveryTypeDefs, deliveryResolvers,
  notificationsTypeDefs, notificationsResolvers
};

// Types GraphQL de base (partagés)
export const baseTypeDefs = gql`
  scalar DateTime
  scalar JSON

  # Common input types
  input PaginationInput {
    limit: Int = 20
    offset: Int = 0
  }

  # Common response types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type PaginatedResponse {
    total: Int!
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }

  # Base Query and Mutation types
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

// Combine tous les typeDefs des domaines
export const allTypeDefs = [
  baseTypeDefs,
  authTypeDefs,
  usersTypeDefs,
  productsTypeDefs,
  ordersTypeDefs,
  reviewsTypeDefs,
  deliveryTypeDefs,
  notificationsTypeDefs,
];

// Combine tous les resolvers des domaines
export const allResolvers = [
  authResolvers,
  usersResolvers,
  productsResolvers,
  ordersResolvers,
  reviewsResolvers,
  deliveryResolvers,
  notificationsResolvers,
];

// Export du schéma de base de données
export * from './schema';