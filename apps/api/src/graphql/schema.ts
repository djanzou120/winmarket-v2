import { gql } from 'graphql-tag';
import { authTypeDefs } from '../modules/auth/auth.module';
import { productsTypeDefs } from '../modules/products/products.module';
import { walletTypeDefs } from '../modules/wallet/wallet.module';
import { ordersTypeDefs } from '../modules/orders/orders.module';

// Base schema with common types
const baseTypeDefs = gql`
  scalar DateTime
  scalar JSON

  # User types
  type User {
    id: ID!
    email: String!
    emailVerified: Boolean!
    role: UserRole!
    status: UserStatus!
    profile: UserProfile
    wallet: Wallet
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserProfile {
    id: ID!
    userId: ID!
    user: User!
    firstName: String
    lastName: String
    phone: String
    avatar: String
    bio: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UserRole {
    BUYER
    SELLER
    ADMIN
  }

  enum UserStatus {
    ACTIVE
    SUSPENDED
    DELETED
  }

  # Review types
  type Review {
    id: ID!
    productId: ID!
    product: Product!
    buyerId: ID!
    buyer: User!
    orderId: ID!
    order: Order!
    rating: Int!
    title: String
    comment: String
    images: [String!]
    isVerifiedPurchase: Boolean!
    status: ReviewStatus!
    sellerResponse: String
    sellerResponseAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
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

  # Common input types
  input PaginationInput {
    limit: Int = 20
    offset: Int = 0
  }

  # Common response types
  type PaginatedResponse {
    total: Int!
    hasMore: Boolean!
    limit: Int!
    offset: Int!
  }
`;

// Combine all type definitions
export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  productsTypeDefs,
  walletTypeDefs,
  ordersTypeDefs,
];