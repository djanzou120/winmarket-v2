import { gql } from 'graphql-tag';

// Type definitions for delivery
export const deliveryTypeDefs = gql`
  type DeliveryProvider {
    id: ID!
    name: String!
    slug: String!
    description: String
    logo: String
    contactEmail: String!
    contactPhone: String
    website: String
    apiUrl: String
    trackingUrlTemplate: String!
    coverageAreas: [String!]!
    supportedServices: [DeliveryType!]!
    commissionRate: Float!
    status: DeliveryProviderStatus!
    isVerified: Boolean!
    rating: Float
    totalDeliveries: Int!
    deliveryOptions: [DeliveryOption!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DeliveryOption {
    id: ID!
    providerId: ID!
    provider: DeliveryProvider!
    sellerId: ID
    seller: User
    productId: ID
    product: Product
    name: String!
    type: DeliveryType!
    description: String
    baseCost: Float!
    costPerKm: Float!
    costPerKg: Float!
    freeShippingThreshold: Float
    estimatedMinHours: Int!
    estimatedMaxHours: Int!
    maxWeight: Float
    maxDimensions: String
    restrictedAreas: [String!]
    requiresPickupTime: Boolean!
    allowWeekendDelivery: Boolean!
    allowEveningDelivery: Boolean!
    requiresSignature: Boolean!
    isActive: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DeliveryZone {
    id: ID!
    providerId: ID!
    provider: DeliveryProvider!
    name: String!
    description: String
    zipCodes: [String!]!
    cities: [String!]!
    regions: [String!]!
    countries: [String!]!
    deliveryTypes: [DeliveryType!]!
    baseCost: Float!
    costPerKm: Float!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DeliveryCostEstimate {
    providerId: ID!
    provider: DeliveryProvider!
    optionId: ID!
    option: DeliveryOption!
    estimatedCost: Float!
    estimatedMinHours: Int!
    estimatedMaxHours: Int!
    isAvailable: Boolean!
    reason: String
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

  input DeliveryEstimateInput {
    sellerId: ID
    productId: ID
    weight: Float
    dimensions: String
    destinationZipCode: String!
    destinationCity: String!
    totalValue: Float!
  }

  input DeliveryProvidersFilterInput {
    status: DeliveryProviderStatus
    isVerified: Boolean
    supportedServices: [DeliveryType!]
    coverageArea: String
  }

  input DeliveryOptionsFilterInput {
    providerId: ID
    sellerId: ID
    productId: ID
    type: DeliveryType
    maxCost: Float
    isActive: Boolean
  }

  extend type Query {
    deliveryProviders(
      filter: DeliveryProvidersFilterInput
      pagination: PaginationInput
    ): [DeliveryProvider!]!

    deliveryProvider(id: ID!): DeliveryProvider

    deliveryProviderBySlug(slug: String!): DeliveryProvider

    deliveryOptions(
      filter: DeliveryOptionsFilterInput
      pagination: PaginationInput
    ): [DeliveryOption!]!

    deliveryOption(id: ID!): DeliveryOption

    estimateDeliveryCosts(
      input: DeliveryEstimateInput!
    ): [DeliveryCostEstimate!]!

    deliveryZones(
      providerId: ID
      zipCode: String
      city: String
      pagination: PaginationInput
    ): [DeliveryZone!]!
  }

  extend type Mutation {
    createDeliveryProvider(
      input: CreateDeliveryProviderInput!
    ): DeliveryProvider!

    updateDeliveryProvider(
      id: ID!
      input: UpdateDeliveryProviderInput!
    ): DeliveryProvider!

    createDeliveryOption(
      input: CreateDeliveryOptionInput!
    ): DeliveryOption!

    updateDeliveryOption(
      id: ID!
      input: UpdateDeliveryOptionInput!
    ): DeliveryOption!

    deleteDeliveryOption(id: ID!): Boolean!

    createDeliveryZone(
      input: CreateDeliveryZoneInput!
    ): DeliveryZone!

    updateDeliveryZone(
      id: ID!
      input: UpdateDeliveryZoneInput!
    ): DeliveryZone!

    deleteDeliveryZone(id: ID!): Boolean!
  }

  input CreateDeliveryProviderInput {
    name: String!
    slug: String!
    description: String
    contactEmail: String!
    contactPhone: String
    website: String
    trackingUrlTemplate: String!
    coverageAreas: [String!]!
    supportedServices: [DeliveryType!]!
    commissionRate: Float!
  }

  input UpdateDeliveryProviderInput {
    name: String
    description: String
    contactEmail: String
    contactPhone: String
    website: String
    trackingUrlTemplate: String
    coverageAreas: [String!]
    supportedServices: [DeliveryType!]
    commissionRate: Float
    status: DeliveryProviderStatus
  }

  input CreateDeliveryOptionInput {
    providerId: ID!
    sellerId: ID
    productId: ID
    name: String!
    type: DeliveryType!
    description: String
    baseCost: Float!
    costPerKm: Float!
    costPerKg: Float!
    freeShippingThreshold: Float
    estimatedMinHours: Int!
    estimatedMaxHours: Int!
    maxWeight: Float
    maxDimensions: String
    restrictedAreas: [String!]
    requiresPickupTime: Boolean
    allowWeekendDelivery: Boolean
    allowEveningDelivery: Boolean
    requiresSignature: Boolean
  }

  input UpdateDeliveryOptionInput {
    name: String
    description: String
    baseCost: Float
    costPerKm: Float
    costPerKg: Float
    freeShippingThreshold: Float
    estimatedMinHours: Int
    estimatedMaxHours: Int
    maxWeight: Float
    maxDimensions: String
    restrictedAreas: [String!]
    requiresPickupTime: Boolean
    allowWeekendDelivery: Boolean
    allowEveningDelivery: Boolean
    requiresSignature: Boolean
    isActive: Boolean
  }

  input CreateDeliveryZoneInput {
    providerId: ID!
    name: String!
    description: String
    zipCodes: [String!]!
    cities: [String!]!
    regions: [String!]!
    countries: [String!]!
    deliveryTypes: [DeliveryType!]!
    baseCost: Float!
    costPerKm: Float!
  }

  input UpdateDeliveryZoneInput {
    name: String
    description: String
    zipCodes: [String!]
    cities: [String!]
    regions: [String!]
    countries: [String!]
    deliveryTypes: [DeliveryType!]
    baseCost: Float
    costPerKm: Float
    isActive: Boolean
  }
`;

// Resolvers for delivery
export const deliveryResolvers = {
  Query: {
    deliveryProviders: async (parent: any, args: any, context: any) => {
      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      return await context.db.query.deliveryProviders.findMany({
        where: (providers: any, { eq, and }: any) => {
          const conditions = [];
          if (filter.status) conditions.push(eq(providers.status, filter.status));
          if (filter.isVerified !== undefined) conditions.push(eq(providers.isVerified, filter.isVerified));

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (providers: any, { asc }: any) => asc(providers.name),
      });
    },

    deliveryProvider: async (parent: any, args: any, context: any) => {
      return await context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, args.id),
      });
    },

    deliveryProviderBySlug: async (parent: any, args: any, context: any) => {
      return await context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.slug, args.slug),
      });
    },

    deliveryOptions: async (parent: any, args: any, context: any) => {
      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      return await context.db.query.deliveryOptions.findMany({
        where: (options: any, { eq, and }: any) => {
          const conditions = [];
          if (filter.providerId) conditions.push(eq(options.providerId, filter.providerId));
          if (filter.sellerId) conditions.push(eq(options.sellerId, filter.sellerId));
          if (filter.productId) conditions.push(eq(options.productId, filter.productId));
          if (filter.type) conditions.push(eq(options.type, filter.type));
          if (filter.isActive !== undefined) conditions.push(eq(options.isActive, filter.isActive));

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (options: any, { asc }: any) => [asc(options.sortOrder), asc(options.name)],
      });
    },

    deliveryOption: async (parent: any, args: any, context: any) => {
      return await context.db.query.deliveryOptions.findFirst({
        where: (options: any, { eq }: any) => eq(options.id, args.id),
      });
    },

    estimateDeliveryCosts: async (parent: any, args: any, context: any) => {
      // TODO: Implement delivery cost estimation logic
      // This would integrate with delivery provider APIs
      return [];
    },

    deliveryZones: async (parent: any, args: any, context: any) => {
      const { providerId, zipCode, city, pagination = { limit: 20, offset: 0 } } = args;

      return await context.db.query.deliveryZones.findMany({
        where: (zones: any, { eq, and }: any) => {
          const conditions = [];
          if (providerId) conditions.push(eq(zones.providerId, providerId));
          // TODO: Add array contains logic for zipCode and city filtering

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (zones: any, { asc }: any) => asc(zones.name),
      });
    },
  },

  Mutation: {
    createDeliveryProvider: async (parent: any, args: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const { randomUUID } = await import('crypto');

      const newProvider = {
        id: randomUUID(),
        status: 'PENDING_VERIFICATION',
        isVerified: false,
        rating: 0,
        totalDeliveries: 0,
        ...args.input,
      };

      const [provider] = await context.db.insert(context.schema.deliveryProviders).values(newProvider).returning();
      return provider;
    },

    createDeliveryOption: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { randomUUID } = await import('crypto');

      const newOption = {
        id: randomUUID(),
        isActive: true,
        sortOrder: 0,
        requiresPickupTime: false,
        allowWeekendDelivery: true,
        allowEveningDelivery: false,
        requiresSignature: false,
        ...args.input,
      };

      const [option] = await context.db.insert(context.schema.deliveryOptions).values(newOption).returning();
      return option;
    },

    createDeliveryZone: async (parent: any, args: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const { randomUUID } = await import('crypto');

      const newZone = {
        id: randomUUID(),
        isActive: true,
        ...args.input,
      };

      const [zone] = await context.db.insert(context.schema.deliveryZones).values(newZone).returning();
      return zone;
    },
  },

  DeliveryProvider: {
    deliveryOptions: async (parent: any, _args: any, context: any) => {
      return context.db.query.deliveryOptions.findMany({
        where: (options: any, { eq }: any) => eq(options.providerId, parent.id),
        orderBy: (options: any, { asc }: any) => asc(options.sortOrder),
      });
    },
  },

  DeliveryOption: {
    provider: async (parent: any, _args: any, context: any) => {
      return context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, parent.providerId),
      });
    },

    seller: async (parent: any, _args: any, context: any) => {
      if (!parent.sellerId) return null;
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.sellerId),
      });
    },

    product: async (parent: any, _args: any, context: any) => {
      if (!parent.productId) return null;
      return context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, parent.productId),
      });
    },
  },

  DeliveryZone: {
    provider: async (parent: any, _args: any, context: any) => {
      return context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, parent.providerId),
      });
    },
  },
};