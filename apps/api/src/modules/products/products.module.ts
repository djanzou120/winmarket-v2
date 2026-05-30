import { gql } from 'graphql-tag';
import type { Resolvers } from '../../generated/graphql';
import { ProductsService } from './products.service';
import { requireAuth, requireSeller } from '../../infrastructure/context';

export const productsTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    parentId: ID
    parent: Category
    children: [Category!]!
    image: String
    isActive: Boolean!
    commissionRate: Float!
    createdAt: DateTime!
  }

  type DeliveryProvider {
    id: ID!
    sellerId: ID!
    seller: User!
    name: String!
    description: String
    contactInfo: String
    serviceZones: [String!]!
    basePrice: Float!
    pricePerKm: Float!
    estimatedDays: Int!
    isActive: Boolean!
    createdAt: DateTime!
  }

  type DeliveryOption {
    id: ID!
    productId: ID!
    type: DeliveryType!
    deliveryProviderId: ID
    deliveryProvider: DeliveryProvider
    price: Float!
    estimatedDays: Int!
    description: String
    isAvailable: Boolean!
  }

  type Product {
    id: ID!
    sellerId: ID!
    seller: User!
    categoryId: ID!
    category: Category!
    title: String!
    slug: String!
    description: String!
    price: Float!
    compareAtPrice: Float
    stock: Int!
    sku: String
    weight: Float
    dimensions: ProductDimensions
    images: [String!]!
    tags: [String!]
    status: ProductStatus!
    isFeatured: Boolean!
    allowsPickup: Boolean!
    viewCount: Int!
    salesCount: Int!
    averageRating: Float
    reviewCount: Int!
    deliveryOptions: [DeliveryOption!]!
    reviews: [Review!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductDimensions {
    length: Float!
    width: Float!
    height: Float!
  }

  enum ProductStatus {
    ACTIVE
    DRAFT
    SUSPENDED
    DELETED
  }

  enum DeliveryType {
    PICKUP
    DELIVERY
  }

  input CreateProductInput {
    categoryId: ID!
    title: String!
    description: String!
    price: Float!
    compareAtPrice: Float
    stock: Int!
    sku: String
    weight: Float
    dimensions: ProductDimensionsInput
    images: [String!]!
    tags: [String!]
    allowsPickup: Boolean = true
  }

  input UpdateProductInput {
    categoryId: ID
    title: String
    description: String
    price: Float
    compareAtPrice: Float
    stock: Int
    sku: String
    weight: Float
    dimensions: ProductDimensionsInput
    images: [String!]
    tags: [String!]
    status: ProductStatus
    isFeatured: Boolean
    allowsPickup: Boolean
  }

  input ProductDimensionsInput {
    length: Float!
    width: Float!
    height: Float!
  }

  input CreateDeliveryProviderInput {
    name: String!
    description: String
    contactInfo: String
    serviceZones: [String!]!
    basePrice: Float!
    pricePerKm: Float = 0
    estimatedDays: Int = 1
  }

  input CreateDeliveryOptionInput {
    productId: ID!
    type: DeliveryType!
    deliveryProviderId: ID
    price: Float!
    estimatedDays: Int!
    description: String
  }

  input SearchProductsInput {
    query: String
    categoryId: ID
    sellerId: ID
    priceMin: Float
    priceMax: Float
    inStock: Boolean
    limit: Int = 20
    offset: Int = 0
    sortBy: String = "createdAt"
    sortOrder: String = "desc"
  }

  type ProductSearchResult {
    products: [Product!]!
    total: Int!
    hasMore: Boolean!
  }

  extend type Query {
    product(id: ID!): Product
    products(input: SearchProductsInput): ProductSearchResult!
    categories: [Category!]!
    category(id: ID!): Category
    myProducts: [Product!]!
    myDeliveryProviders: [DeliveryProvider!]!
  }

  extend type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    createDeliveryProvider(input: CreateDeliveryProviderInput!): DeliveryProvider!
    updateDeliveryProvider(id: ID!, input: UpdateDeliveryProviderInput!): DeliveryProvider!
    deleteDeliveryProvider(id: ID!): Boolean!

    createDeliveryOption(input: CreateDeliveryOptionInput!): DeliveryOption!
    updateDeliveryOption(id: ID!, input: UpdateDeliveryOptionInput!): DeliveryOption!
    deleteDeliveryOption(id: ID!): Boolean!
  }

  input UpdateDeliveryProviderInput {
    name: String
    description: String
    contactInfo: String
    serviceZones: [String!]
    basePrice: Float
    pricePerKm: Float
    estimatedDays: Int
    isActive: Boolean
  }

  input UpdateDeliveryOptionInput {
    type: DeliveryType
    deliveryProviderId: ID
    price: Float
    estimatedDays: Int
    description: String
    isAvailable: Boolean
  }
`;

export const productsResolvers: Resolvers = {
  Query: {
    product: async (_parent, { id }, context) => {
      const service = new ProductsService(context.db);
      return service.getProductById(id);
    },

    products: async (_parent, { input }, context) => {
      const service = new ProductsService(context.db);
      return service.searchProducts(input);
    },

    categories: async (_parent, _args, context) => {
      const service = new ProductsService(context.db);
      return service.getCategories();
    },

    category: async (_parent, { id }, context) => {
      const service = new ProductsService(context.db);
      return service.getCategoryById(id);
    },

    myProducts: async (_parent, _args, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.getProductsBySeller(user.id);
    },

    myDeliveryProviders: async (_parent, _args, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.getDeliveryProvidersBySeller(user.id);
    },
  },

  Mutation: {
    createProduct: async (_parent, { input }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.createProduct(user.id, input);
    },

    updateProduct: async (_parent, { id, input }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.updateProduct(id, user.id, input);
    },

    deleteProduct: async (_parent, { id }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.deleteProduct(id, user.id);
    },

    createDeliveryProvider: async (_parent, { input }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.createDeliveryProvider(user.id, input);
    },

    updateDeliveryProvider: async (_parent, { id, input }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.updateDeliveryProvider(id, user.id, input);
    },

    deleteDeliveryProvider: async (_parent, { id }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.deleteDeliveryProvider(id, user.id);
    },

    createDeliveryOption: async (_parent, { input }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.createDeliveryOption(user.id, input);
    },

    updateDeliveryOption: async (_parent, { id, input }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.updateDeliveryOption(id, user.id, input);
    },

    deleteDeliveryOption: async (_parent, { id }, context) => {
      const user = requireSeller(context);
      const service = new ProductsService(context.db);
      return service.deleteDeliveryOption(id, user.id);
    },
  },

  Product: {
    seller: async (parent, _args, context) => {
      return context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, parent.sellerId),
      });
    },

    category: async (parent, _args, context) => {
      return context.db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.id, parent.categoryId),
      });
    },

    deliveryOptions: async (parent, _args, context) => {
      return context.db.query.deliveryOptions.findMany({
        where: (deliveryOptions, { eq }) => eq(deliveryOptions.productId, parent.id),
      });
    },
  },

  DeliveryOption: {
    deliveryProvider: async (parent, _args, context) => {
      if (!parent.deliveryProviderId) return null;
      return context.db.query.deliveryProviders.findFirst({
        where: (providers, { eq }) => eq(providers.id, parent.deliveryProviderId!),
      });
    },
  },

  Category: {
    parent: async (parent, _args, context) => {
      if (!parent.parentId) return null;
      return context.db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.id, parent.parentId!),
      });
    },

    children: async (parent, _args, context) => {
      return context.db.query.categories.findMany({
        where: (categories, { eq }) => eq(categories.parentId, parent.id),
      });
    },
  },
};