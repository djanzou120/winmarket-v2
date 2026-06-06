// GraphQL Type Definitions for Delivery Domain

export const deliveryTypeDefs = `#graphql
  enum DeliveryProviderStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  enum DeliveryMethod {
    STANDARD
    EXPRESS
    SAME_DAY
    PICKUP
  }

  enum DeliveryStatus {
    PENDING
    CONFIRMED
    PICKED_UP
    IN_TRANSIT
    OUT_FOR_DELIVERY
    DELIVERED
    FAILED
    RETURNED
  }

  type DeliveryProvider {
    id: ID!
    name: String!
    slug: String!
    description: String
    logo: String
    website: String
    contactEmail: String
    contactPhone: String

    # API config (admin only)
    apiBaseUrl: String
    trackingUrlPattern: String

    # Settings
    isActive: Boolean!
    status: DeliveryProviderStatus!
    supportsCOD: Boolean!
    supportsTracking: Boolean!
    coverageAreas: [String!]!

    # Relations
    options: [DeliveryOption!]!
    zones: [ProviderZone!]!

    createdAt: String!
    updatedAt: String!
  }

  type DeliveryOption {
    id: ID!
    providerId: ID!
    provider: DeliveryProvider!
    name: String!
    description: String
    method: DeliveryMethod!

    # Pricing
    basePrice: Float!
    pricePerKg: Float
    freeShippingThreshold: Float

    # Timeframes
    estimatedDays: Int!
    maxDays: Int

    # Constraints
    maxWeight: Float
    maxDimensions: String

    # Calculated for specific delivery
    calculatedPrice: Float
    isAvailable: Boolean!

    isActive: Boolean!
    sortOrder: Int!

    createdAt: String!
    updatedAt: String!
  }

  type DeliveryZone {
    id: ID!
    name: String!
    type: String!
    value: String!
    coordinates: String
    isActive: Boolean!

    # Relations
    providers: [ProviderZone!]!

    createdAt: String!
    updatedAt: String!
  }

  type ProviderZone {
    id: ID!
    providerId: ID!
    provider: DeliveryProvider!
    zoneId: ID!
    zone: DeliveryZone!
    additionalCost: Float!
    deliveryDaysModifier: Int!
    isActive: Boolean!
    createdAt: String!
  }

  type TrackingEvent {
    timestamp: String!
    status: String!
    location: String
    description: String!
    details: String
  }

  type DeliveryTracking {
    id: ID!
    orderId: ID!
    order: Order
    providerId: ID!
    provider: DeliveryProvider!
    trackingNumber: String!

    status: DeliveryStatus!

    # Addresses
    pickupAddress: Address
    deliveryAddress: Address

    # Dates
    pickupDate: String
    estimatedDelivery: String
    actualDelivery: String

    # Package details
    weight: Float
    dimensions: String

    # Driver info
    driverName: String
    driverPhone: String

    # Tracking
    trackingEvents: [TrackingEvent!]!
    trackingUrl: String

    notes: String

    createdAt: String!
    updatedAt: String!
  }

  type DeliveryRate {
    id: ID!
    optionId: ID!
    option: DeliveryOption!
    zoneId: ID!
    zone: DeliveryZone!

    minWeight: Float!
    maxWeight: Float
    rate: Float!

    minVolume: Float
    maxVolume: Float

    isActive: Boolean!
    createdAt: String!
  }

  type DeliveryQuote {
    option: DeliveryOption!
    price: Float!
    estimatedDays: Int!
    isAvailable: Boolean!
    restrictions: [String!]!
  }

  type DeliveryStats {
    totalDeliveries: Int!
    pendingDeliveries: Int!
    inTransitDeliveries: Int!
    deliveredToday: Int!
    failedDeliveries: Int!
    averageDeliveryTime: Float!
    onTimeDeliveryRate: Float!
  }

  input DeliveryCalculationInput {
    toAddress: AddressInput!
    fromAddress: AddressInput
    weight: Float
    dimensions: String
    value: Float
    codAmount: Float
  }

  input CreateDeliveryProviderInput {
    name: String!
    slug: String!
    description: String
    logo: String
    website: String
    contactEmail: String
    contactPhone: String
    apiBaseUrl: String
    apiKey: String
    trackingUrlPattern: String
    supportsCOD: Boolean
    supportsTracking: Boolean
    coverageAreas: [String!]
  }

  input UpdateDeliveryProviderInput {
    name: String
    description: String
    logo: String
    website: String
    contactEmail: String
    contactPhone: String
    apiBaseUrl: String
    apiKey: String
    trackingUrlPattern: String
    supportsCOD: Boolean
    supportsTracking: Boolean
    coverageAreas: [String!]
    status: DeliveryProviderStatus
    isActive: Boolean
  }

  input CreateDeliveryOptionInput {
    providerId: ID!
    name: String!
    description: String
    method: DeliveryMethod!
    basePrice: Float!
    pricePerKg: Float
    freeShippingThreshold: Float
    estimatedDays: Int!
    maxDays: Int
    maxWeight: Float
    maxDimensions: String
    sortOrder: Int
  }

  input UpdateDeliveryOptionInput {
    name: String
    description: String
    method: DeliveryMethod
    basePrice: Float
    pricePerKg: Float
    freeShippingThreshold: Float
    estimatedDays: Int
    maxDays: Int
    maxWeight: Float
    maxDimensions: String
    isActive: Boolean
    sortOrder: Int
  }

  input CreateDeliveryZoneInput {
    name: String!
    type: String!
    value: String!
    coordinates: String
  }

  input UpdateDeliveryZoneInput {
    name: String
    type: String
    value: String
    coordinates: String
    isActive: Boolean
  }

  input CreateTrackingInput {
    orderId: ID!
    providerId: ID!
    trackingNumber: String!
    pickupAddress: AddressInput
    deliveryAddress: AddressInput!
    estimatedDelivery: String
    weight: Float
    dimensions: String
  }

  input UpdateTrackingInput {
    status: DeliveryStatus
    pickupDate: String
    estimatedDelivery: String
    actualDelivery: String
    driverName: String
    driverPhone: String
    notes: String
  }

  input TrackingEventInput {
    timestamp: String!
    status: String!
    location: String
    description: String!
    details: String
  }

  extend type Query {
    # Delivery providers
    deliveryProvider(id: ID!): DeliveryProvider
    deliveryProviders: [DeliveryProvider!]!

    # Delivery options
    deliveryOption(id: ID!): DeliveryOption
    deliveryOptions(providerId: ID): [DeliveryOption!]!

    # Available options for address/package
    availableDeliveryOptions(input: DeliveryCalculationInput!): [DeliveryQuote!]!

    # Zones
    deliveryZone(id: ID!): DeliveryZone
    deliveryZones: [DeliveryZone!]!

    # Tracking
    trackDelivery(trackingNumber: String!): DeliveryTracking
    deliveryTracking(id: ID!): DeliveryTracking
    orderTracking(orderId: ID!): DeliveryTracking

    # Calculate shipping cost
    calculateShipping(input: DeliveryCalculationInput!): [DeliveryQuote!]!

    # Stats (admin)
    deliveryStats: DeliveryStats!
  }

  extend type Mutation {
    # Provider management (admin only)
    createDeliveryProvider(input: CreateDeliveryProviderInput!): DeliveryProvider!
    updateDeliveryProvider(id: ID!, input: UpdateDeliveryProviderInput!): DeliveryProvider!
    deleteDeliveryProvider(id: ID!): Boolean!

    # Options management (admin only)
    createDeliveryOption(input: CreateDeliveryOptionInput!): DeliveryOption!
    updateDeliveryOption(id: ID!, input: UpdateDeliveryOptionInput!): DeliveryOption!
    deleteDeliveryOption(id: ID!): Boolean!

    # Zone management (admin only)
    createDeliveryZone(input: CreateDeliveryZoneInput!): DeliveryZone!
    updateDeliveryZone(id: ID!, input: UpdateDeliveryZoneInput!): DeliveryZone!
    deleteDeliveryZone(id: ID!): Boolean!

    # Tracking management
    createDeliveryTracking(input: CreateTrackingInput!): DeliveryTracking!
    updateDeliveryTracking(id: ID!, input: UpdateTrackingInput!): DeliveryTracking!
    addTrackingEvent(id: ID!, event: TrackingEventInput!): DeliveryTracking!

    # Actions
    schedulePickup(orderId: ID!): DeliveryTracking!
    updateDeliveryStatus(trackingNumber: String!, status: DeliveryStatus!): DeliveryTracking!
    markAsDelivered(trackingNumber: String!, deliveredAt: String): DeliveryTracking!
  }
`;