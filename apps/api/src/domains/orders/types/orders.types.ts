// GraphQL Type Definitions for Orders Domain

export const ordersTypeDefs = `#graphql
  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  enum PaymentStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    REFUNDED
    PARTIALLY_REFUNDED
  }

  enum PaymentMethod {
    CARD
    MOBILE_MONEY
    BANK_TRANSFER
    CASH_ON_DELIVERY
    WALLET
  }

  enum TransactionType {
    PAYMENT
    REFUND
    DEPOSIT
    WITHDRAWAL
    COMMISSION
    BONUS
  }

  type Address {
    street: String!
    city: String!
    state: String
    postalCode: String
    country: String!
    phone: String
    name: String
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    productVariantId: ID
    product: Product
    productVariant: ProductVariant
    productName: String!
    productImage: String
    productSku: String
    unitPrice: Float!
    quantity: Int!
    totalPrice: Float!
    variantName: String
    variantValue: String
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: ID!
    orderNumber: String!
    buyerId: ID!
    sellerId: ID!
    buyer: User!
    seller: User!
    status: OrderStatus!
    paymentStatus: PaymentStatus!
    paymentMethod: PaymentMethod

    # Pricing
    subtotal: Float!
    taxAmount: Float!
    shippingAmount: Float!
    discountAmount: Float!
    totalAmount: Float!
    currency: String!

    # Shipping
    shippingAddress: Address
    billingAddress: Address
    shippingMethod: String
    trackingNumber: String
    estimatedDelivery: String
    actualDelivery: String

    # Order items
    items: [OrderItem!]!
    itemCount: Int!

    # Additional info
    notes: String
    cancelReason: String
    refundReason: String

    # Timestamps
    createdAt: String!
    updatedAt: String!
    confirmedAt: String
    shippedAt: String
    deliveredAt: String
    cancelledAt: String
  }

  type WalletTransaction {
    id: ID!
    walletId: ID!
    orderId: ID
    order: Order
    type: TransactionType!
    amount: Float!
    currency: String!
    balanceBefore: Float!
    balanceAfter: Float!
    description: String
    reference: String
    status: String!
    createdAt: String!
  }

  type CartItem {
    id: ID!
    userId: ID!
    productId: ID!
    productVariantId: ID
    product: Product!
    productVariant: ProductVariant
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    addedAt: String!
    updatedAt: String!
  }

  type Cart {
    items: [CartItem!]!
    itemCount: Int!
    subtotal: Float!
    currency: String!
    updatedAt: String!
  }

  type OrdersConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type OrderEdge {
    node: Order!
    cursor: String!
  }

  type OrderStats {
    totalOrders: Int!
    pendingOrders: Int!
    confirmedOrders: Int!
    shippedOrders: Int!
    deliveredOrders: Int!
    cancelledOrders: Int!
    totalRevenue: Float!
    averageOrderValue: Float!
    ordersByStatus: [OrderStatusCount!]!
    recentOrders: [Order!]!
  }

  type OrderStatusCount {
    status: OrderStatus!
    count: Int!
  }

  input OrderFilter {
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    buyerId: ID
    sellerId: ID
    dateFrom: String
    dateTo: String
    minAmount: Float
    maxAmount: Float
  }

  input AddressInput {
    street: String!
    city: String!
    state: String
    postalCode: String
    country: String!
    phone: String
    name: String
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: AddressInput!
    billingAddress: AddressInput
    paymentMethod: PaymentMethod!
    shippingMethod: String
    notes: String
    couponCode: String
  }

  input OrderItemInput {
    productId: ID!
    productVariantId: ID
    quantity: Int!
  }

  input UpdateOrderInput {
    status: OrderStatus
    paymentStatus: PaymentStatus
    shippingMethod: String
    trackingNumber: String
    estimatedDelivery: String
    notes: String
    internalNotes: String
  }

  input AddToCartInput {
    productId: ID!
    productVariantId: ID
    quantity: Int!
  }

  input UpdateCartItemInput {
    quantity: Int!
  }

  extend type Query {
    # Orders
    order(id: ID!): Order
    orderByNumber(orderNumber: String!): Order
    orders(
      filter: OrderFilter
      pagination: PaginationInput
    ): OrdersConnection!

    # User-specific orders
    myOrders(pagination: PaginationInput): OrdersConnection!
    myPurchases(pagination: PaginationInput): OrdersConnection!
    mySales(pagination: PaginationInput): OrdersConnection!

    # Cart
    myCart: Cart!

    # Stats (admin only)
    orderStats: OrderStats!

    # Wallet transactions
    myTransactions(pagination: PaginationInput): [WalletTransaction!]!
  }

  extend type Mutation {
    # Order management
    createOrder(input: CreateOrderInput!): Order!
    updateOrder(id: ID!, input: UpdateOrderInput!): Order!
    cancelOrder(id: ID!, reason: String!): Order!
    confirmOrder(id: ID!): Order!
    shipOrder(id: ID!, trackingNumber: String, estimatedDelivery: String): Order!
    deliverOrder(id: ID!): Order!

    # Refunds
    requestRefund(orderId: ID!, reason: String!): Order!
    processRefund(orderId: ID!, amount: Float): Order!

    # Cart management
    addToCart(input: AddToCartInput!): CartItem!
    updateCartItem(id: ID!, input: UpdateCartItemInput!): CartItem!
    removeFromCart(id: ID!): Boolean!
    clearCart: Boolean!

    # Quick checkout
    buyNow(input: CreateOrderInput!): Order!
  }
`;