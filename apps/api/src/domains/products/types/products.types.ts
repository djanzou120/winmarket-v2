// GraphQL Type Definitions for Products Domain

export const productsTypeDefs = `#graphql
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

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    parentId: ID
    parent: Category
    children: [Category!]!
    imageUrl: String
    isActive: Boolean!
    sortOrder: Int!
    productCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type ProductVariant {
    id: ID!
    productId: ID!
    name: String!
    value: String!
    price: Float
    stock: Int!
    sku: String
    image: String
    isActive: Boolean!
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    sellerId: ID!
    seller: User
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
    minOrderQuantity: Int
    maxOrderQuantity: Int
    weight: Float
    dimensions: String
    sku: String
    tags: [String!]!
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
    reviews: [Review!]!
    createdAt: String!
    updatedAt: String!
    publishedAt: String
  }

  type ProductsConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  type CategoriesConnection {
    edges: [CategoryEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type CategoryEdge {
    node: Category!
    cursor: String!
  }

  type ProductStats {
    totalProducts: Int!
    activeProducts: Int!
    draftProducts: Int!
    inactiveProducts: Int!
    archivedProducts: Int!
    productsByCategory: [CategoryProductCount!]!
    averagePrice: Float!
    totalViews: Int!
    totalSales: Int!
  }

  type CategoryProductCount {
    category: Category!
    count: Int!
  }

  input ProductFilter {
    categoryId: ID
    sellerId: ID
    status: ProductStatus
    condition: ProductCondition
    priceMin: Float
    priceMax: Float
    inStock: Boolean
    isDigital: Boolean
    search: String
  }

  input CategoryFilter {
    parentId: ID
    isActive: Boolean
    search: String
  }

  input CreateProductInput {
    categoryId: ID!
    title: String!
    description: String!
    shortDescription: String
    price: Float!
    originalPrice: Float
    condition: ProductCondition!
    stock: Int!
    minOrderQuantity: Int
    maxOrderQuantity: Int
    weight: Float
    dimensions: String
    sku: String
    tags: [String!]
    images: [String!]
    isDigital: Boolean
    shippingRequired: Boolean
    allowReviews: Boolean
  }

  input UpdateProductInput {
    categoryId: ID
    title: String
    description: String
    shortDescription: String
    price: Float
    originalPrice: Float
    condition: ProductCondition
    status: ProductStatus
    stock: Int
    minOrderQuantity: Int
    maxOrderQuantity: Int
    weight: Float
    dimensions: String
    sku: String
    tags: [String!]
    images: [String!]
    isDigital: Boolean
    shippingRequired: Boolean
    allowReviews: Boolean
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
    description: String
    parentId: ID
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }

  input UpdateCategoryInput {
    name: String
    slug: String
    description: String
    parentId: ID
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }

  input CreateProductVariantInput {
    productId: ID!
    name: String!
    value: String!
    price: Float
    stock: Int!
    sku: String
    image: String
    isActive: Boolean
    sortOrder: Int
  }

  input UpdateProductVariantInput {
    name: String
    value: String
    price: Float
    stock: Int
    sku: String
    image: String
    isActive: Boolean
    sortOrder: Int
  }

  extend type Query {
    # Products
    product(id: ID!): Product
    productBySlug(slug: String!): Product
    products(
      filter: ProductFilter
      pagination: PaginationInput
    ): ProductsConnection!

    # Categories
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    categories(
      filter: CategoryFilter
      pagination: PaginationInput
    ): CategoriesConnection!

    # Analytics
    productStats: ProductStats!

    # Search
    searchProducts(query: String!, limit: Int): [Product!]!

    # Featured & Popular
    featuredProducts(limit: Int): [Product!]!
    popularProducts(limit: Int): [Product!]!
    relatedProducts(productId: ID!, limit: Int): [Product!]!
  }

  extend type Mutation {
    # Products
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    publishProduct(id: ID!): Product!
    unpublishProduct(id: ID!): Product!
    archiveProduct(id: ID!): Product!
    duplicateProduct(id: ID!): Product!

    # Categories
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Variants
    createProductVariant(input: CreateProductVariantInput!): ProductVariant!
    updateProductVariant(id: ID!, input: UpdateProductVariantInput!): ProductVariant!
    deleteProductVariant(id: ID!): Boolean!

    # Actions
    incrementProductView(id: ID!): Product!
    toggleProductFavorite(id: ID!): Product!
  }
`;