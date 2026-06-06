// Index central des domaines métier
import { gql } from 'graphql-tag';

// Import des types GraphQL par domaine
export { authTypeDefs, authResolvers } from './auth';
export { usersTypeDefs, usersResolvers } from './users';

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

// Types GraphQL simplifiés pour les autres domaines
export const productsTypeDefs = gql`
  type Product {
    id: ID!
    sellerId: ID!
    seller: User!
    categoryId: ID!
    category: Category!
    title: String!
    slug: String!
    description: String
    shortDescription: String
    price: Float!
    originalPrice: Float
    condition: ProductCondition!
    status: ProductStatus!
    stock: Int!
    images: [String!]!
    isDigital: Boolean!
    shippingRequired: Boolean!
    allowReviews: Boolean!
    viewCount: Int!
    favoriteCount: Int!
    soldCount: Int!
    averageRating: Float!
    reviewCount: Int!
    variants: [ProductVariant!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    parentId: ID
    parent: Category
    children: [Category!]!
    products: [Product!]!
    isActive: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductVariant {
    id: ID!
    productId: ID!
    product: Product!
    name: String!
    value: String!
    price: Float
    stock: Int!
    sku: String
    image: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ProductStatus {
    DRAFT
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  enum ProductCondition {
    NEW
    LIKE_NEW
    GOOD
    FAIR
    POOR
  }

  extend type Query {
    products: [Product!]!
    product(id: ID!): Product
    categories: [Category!]!
    category(id: ID!): Category
  }
`;

export const ordersTypeDefs = gql`
  type Order {
    id: ID!
    buyerId: ID!
    buyer: User!
    sellerId: ID
    seller: User
    totalAmount: Float!
    status: OrderStatus!
    items: [OrderItem!]!
    shippingAddress: String
    trackingNumber: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    product: Product!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    createdAt: DateTime!
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  extend type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }
`;

export const walletTypeDefs = gql`
  type WalletTransaction {
    id: ID!
    walletId: ID!
    wallet: Wallet!
    type: TransactionType!
    amount: Float!
    balance: Float!
    status: TransactionStatus!
    description: String
    createdAt: DateTime!
  }

  enum TransactionType {
    DEPOSIT
    WITHDRAWAL
    PAYMENT
    REFUND
    COMMISSION
    BONUS
  }

  enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
    CANCELLED
  }

  extend type Query {
    walletTransactions: [WalletTransaction!]!
  }
`;

export const reviewsTypeDefs = gql`
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
    helpfulVotes: Int!
    totalVotes: Int!
    sellerResponse: String
    sellerResponseAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
    HIDDEN
  }

  extend type Query {
    reviews: [Review!]!
    review(id: ID!): Review
  }
`;

export const deliveryTypeDefs = gql`
  type DeliveryProvider {
    id: ID!
    name: String!
    slug: String!
    description: String
    contactEmail: String!
    website: String
    trackingUrlTemplate: String!
    coverageAreas: [String!]!
    supportedServices: [DeliveryType!]!
    commissionRate: Float!
    status: DeliveryProviderStatus!
    isVerified: Boolean!
    rating: Float
    totalDeliveries: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum DeliveryType {
    STANDARD
    EXPRESS
    SAME_DAY
    PICKUP
  }

  enum DeliveryProviderStatus {
    ACTIVE
    SUSPENDED
    PENDING_VERIFICATION
  }

  extend type Query {
    deliveryProviders: [DeliveryProvider!]!
  }
`;

export const notificationsTypeDefs = gql`
  type Notification {
    id: ID!
    userId: ID!
    user: User!
    type: NotificationType!
    title: String!
    message: String!
    data: JSON
    isRead: Boolean!
    readAt: DateTime
    createdAt: DateTime!
  }

  enum NotificationType {
    ORDER_UPDATE
    PAYMENT_SUCCESS
    PAYMENT_FAILED
    PRODUCT_APPROVED
    PRODUCT_REJECTED
    REVIEW_RECEIVED
    MESSAGE_RECEIVED
    WALLET_DEPOSIT
    WALLET_WITHDRAWAL
    PROMOTION_AVAILABLE
    SYSTEM_ANNOUNCEMENT
  }

  extend type Query {
    notifications: [Notification!]!
    notification(id: ID!): Notification
  }
`;

// Combine tous les typeDefs
export const allTypeDefs = [
  baseTypeDefs,
  authTypeDefs,
  usersTypeDefs,
  productsTypeDefs,
  ordersTypeDefs,
  walletTypeDefs,
  reviewsTypeDefs,
  deliveryTypeDefs,
  notificationsTypeDefs,
];

// Export du schéma de base de données
export * from './schema';