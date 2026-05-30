import { gql } from 'graphql-tag';
import type { Resolvers } from '../../generated/graphql';
import { OrdersService } from './orders.service';
import { requireAuth, requireSeller, requireAdmin } from '../../infrastructure/context';

export const ordersTypeDefs = gql`
  type Order {
    id: ID!
    orderNumber: String!
    buyerId: ID!
    buyer: User!
    subtotal: Float!
    deliveryFee: Float!
    total: Float!
    status: OrderStatus!

    # Delivery information
    deliveryMethod: String!
    deliveryProviderId: ID
    deliveryProvider: DeliveryProvider
    deliveryAddress: Address
    trackingNumber: String

    # Payment information
    paymentMethod: String!
    paidAt: DateTime

    # Timestamps
    estimatedDelivery: DateTime
    shippedAt: DateTime
    deliveredAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relationships
    items: [OrderItem!]!
    statusHistory: [OrderStatusHistory!]!

    # Calculated fields (visible only to seller and admin)
    totalCommission: Float
    sellerTotal: Float
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    order: Order!
    productId: ID!
    product: Product!
    sellerId: ID!
    seller: User!

    # Product snapshot
    productTitle: String!
    productImage: String

    # Pricing
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!

    # Commission (visible only to seller and admin)
    commissionRate: Float
    commissionAmount: Float
    sellerAmount: Float

    createdAt: DateTime!
  }

  type OrderStatusHistory {
    id: ID!
    orderId: ID!
    order: Order!
    fromStatus: OrderStatus
    toStatus: OrderStatus!
    note: String
    changedById: ID
    changedBy: User
    createdAt: DateTime!
  }

  enum OrderStatus {
    PENDING
    PAID
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  type Address {
    street: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    deliveryOptionId: ID
    deliveryAddress: AddressInput
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input AddressInput {
    street: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
  }

  input UpdateOrderStatusInput {
    status: OrderStatus!
    note: String
    trackingNumber: String
  }

  input OrdersFilterInput {
    status: OrderStatus
    sellerId: ID
    buyerId: ID
    startDate: DateTime
    endDate: DateTime
    limit: Int = 20
    offset: Int = 0
  }

  type OrderSearchResult {
    orders: [Order!]!
    total: Int!
    hasMore: Boolean!
  }

  extend type Query {
    # Customer queries
    myOrders(input: OrdersFilterInput): OrderSearchResult!
    order(id: ID!): Order

    # Seller queries
    mySellerOrders(input: OrdersFilterInput): OrderSearchResult!

    # Admin queries
    allOrders(input: OrdersFilterInput): OrderSearchResult!
    orderAnalytics(startDate: DateTime!, endDate: DateTime!): OrderAnalytics!
  }

  extend type Mutation {
    # Create and process orders
    createOrder(input: CreateOrderInput!): Order!
    processOrderPayment(orderId: ID!): Order!

    # Update order status (seller only)
    updateOrderStatus(orderId: ID!, input: UpdateOrderStatusInput!): Order!

    # Cancel order (buyer or seller)
    cancelOrder(orderId: ID!, reason: String!): Order!

    # Admin actions
    refundOrder(orderId: ID!, reason: String!): Order!
  }

  extend type Subscription {
    orderStatusUpdated(orderId: ID!): Order!
    newOrderForSeller: Order!
  }

  type OrderAnalytics {
    totalOrders: Int!
    totalRevenue: Float!
    totalCommission: Float!
    averageOrderValue: Float!
    ordersByStatus: [OrderStatusCount!]!
    topSellingProducts: [ProductSalesInfo!]!
  }

  type OrderStatusCount {
    status: OrderStatus!
    count: Int!
  }

  type ProductSalesInfo {
    productId: ID!
    productTitle: String!
    totalSold: Int!
    totalRevenue: Float!
  }
`;

export const ordersResolvers: Resolvers = {
  Query: {
    myOrders: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const service = new OrdersService(context.db);
      return service.getOrdersByBuyer(user.id, input);
    },

    order: async (_parent, { id }, context) => {
      const user = requireAuth(context);
      const service = new OrdersService(context.db);
      return service.getOrderById(id, user.id);
    },

    mySellerOrders: async (_parent, { input }, context) => {
      const user = requireSeller(context);
      const service = new OrdersService(context.db);
      return service.getOrdersBySeller(user.id, input);
    },

    allOrders: async (_parent, { input }, context) => {
      requireAdmin(context);
      const service = new OrdersService(context.db);
      return service.getAllOrders(input);
    },

    orderAnalytics: async (_parent, { startDate, endDate }, context) => {
      requireAdmin(context);
      const service = new OrdersService(context.db);
      return service.getOrderAnalytics(startDate, endDate);
    },
  },

  Mutation: {
    createOrder: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const service = new OrdersService(context.db);
      return service.createOrder(user.id, input);
    },

    processOrderPayment: async (_parent, { orderId }, context) => {
      const user = requireAuth(context);
      const service = new OrdersService(context.db);
      return service.processOrderPayment(orderId, user.id);
    },

    updateOrderStatus: async (_parent, { orderId, input }, context) => {
      const user = requireSeller(context);
      const service = new OrdersService(context.db);
      return service.updateOrderStatus(orderId, user.id, input);
    },

    cancelOrder: async (_parent, { orderId, reason }, context) => {
      const user = requireAuth(context);
      const service = new OrdersService(context.db);
      return service.cancelOrder(orderId, user.id, reason);
    },

    refundOrder: async (_parent, { orderId, reason }, context) => {
      requireAdmin(context);
      const service = new OrdersService(context.db);
      return service.refundOrder(orderId, reason);
    },
  },

  Order: {
    buyer: async (parent, _args, context) => {
      return context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, parent.buyerId),
      });
    },

    deliveryProvider: async (parent, _args, context) => {
      if (!parent.deliveryProviderId) return null;
      return context.db.query.deliveryProviders.findFirst({
        where: (providers, { eq }) => eq(providers.id, parent.deliveryProviderId!),
      });
    },

    items: async (parent, _args, context) => {
      return context.db.query.orderItems.findMany({
        where: (items, { eq }) => eq(items.orderId, parent.id),
      });
    },

    statusHistory: async (parent, _args, context) => {
      return context.db.query.orderStatusHistory.findMany({
        where: (history, { eq }) => eq(history.orderId, parent.id),
        orderBy: (history, { desc }) => desc(history.createdAt),
      });
    },

    totalCommission: async (parent, _args, context) => {
      // Only visible to seller and admin
      if (!context.user || (context.user.role !== 'ADMIN' && context.user.role !== 'SELLER')) {
        return null;
      }

      const service = new OrdersService(context.db);
      return service.calculateOrderCommission(parent.id);
    },

    sellerTotal: async (parent, _args, context) => {
      // Only visible to seller and admin
      if (!context.user || (context.user.role !== 'ADMIN' && context.user.role !== 'SELLER')) {
        return null;
      }

      const service = new OrdersService(context.db);
      return service.calculateSellerTotal(parent.id);
    },
  },

  OrderItem: {
    order: async (parent, _args, context) => {
      return context.db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, parent.orderId),
      });
    },

    product: async (parent, _args, context) => {
      return context.db.query.products.findFirst({
        where: (products, { eq }) => eq(products.id, parent.productId),
      });
    },

    seller: async (parent, _args, context) => {
      return context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, parent.sellerId),
      });
    },

    // Commission fields only visible to seller and admin
    commissionRate: async (parent, _args, context) => {
      if (!context.user || (context.user.role !== 'ADMIN' &&
          (context.user.role !== 'SELLER' || context.user.id !== parent.sellerId))) {
        return null;
      }
      return parent.commissionRate;
    },

    commissionAmount: async (parent, _args, context) => {
      if (!context.user || (context.user.role !== 'ADMIN' &&
          (context.user.role !== 'SELLER' || context.user.id !== parent.sellerId))) {
        return null;
      }
      return parent.commissionAmount;
    },

    sellerAmount: async (parent, _args, context) => {
      if (!context.user || (context.user.role !== 'ADMIN' &&
          (context.user.role !== 'SELLER' || context.user.id !== parent.sellerId))) {
        return null;
      }
      return parent.sellerAmount;
    },
  },

  OrderStatusHistory: {
    order: async (parent, _args, context) => {
      return context.db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, parent.orderId),
      });
    },

    changedBy: async (parent, _args, context) => {
      if (!parent.changedById) return null;
      return context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, parent.changedById!),
      });
    },
  },
};