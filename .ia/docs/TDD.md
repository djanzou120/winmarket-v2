# 🧪 TDD - Document Technique Détaillé WinMarket V2

**Version :** 1.0
**Date :** 30 Mai 2026
**Équipe :** Development Team

---

## 📋 Table des Matières

1. [Vue d'Ensemble Architecture](#1-vue-densemble-architecture)
2. [Stack Technologique Détaillée](#2-stack-technologique-détaillée)
3. [Structure Modular Monolith](#3-structure-modular-monolith)
4. [Base de Données Drizzle ORM](#4-base-de-données-drizzle-orm)
5. [API GraphQL Architecture](#5-api-graphql-architecture)
6. [Applications Frontend](#6-applications-frontend)
7. [Stockage de Fichiers MinIO](#7-stockage-de-fichiers-minio)
8. [Authentification & Sécurité](#8-authentification--sécurité)
9. [Déploiement & Infrastructure](#9-déploiement--infrastructure)
10. [Tests & Qualité](#10-tests--qualité)
11. [Performance & Monitoring](#11-performance--monitoring)
12. [Configuration Développement](#12-configuration-développement)

---

## 1. Vue d'Ensemble Architecture

### 1.1 Architecture Cible : Modular Monolith

**Principe :** Un service unique avec modules internes bien séparés, prêt pour une future migration microservices.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend Web  │    │  Mobile Apps    │    │  Admin Panel    │
│   (Next.js)     │    │  (Expo + EAS)   │    │  (Next.js)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │      GraphQL Gateway        │
                    │     (Apollo Server)         │
                    └─────────────┬───────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │     Modular Monolith        │
                    │                             │
                    │  ┌─────┐ ┌─────┐ ┌─────┐    │
                    │  │Auth │ │Users│ │Prod │    │
                    │  │     │ │     │ │ucts│    │
                    │  └─────┘ └─────┘ └─────┘    │
                    │  ┌─────┐ ┌─────┐ ┌─────┐    │
                    │  │Order│ │Wallet│ │Admin│   │
                    │  │     │ │     │ │     │    │
                    │  └─────┘ └─────┘ └─────┘    │
                    └─────────────┬───────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
         ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
         │PostgreSQL │    │   Redis   │    │   MinIO   │
         │(Drizzle)  │    │  (Cache)  │    │  (Files)  │
         └───────────┘    └───────────┘    └───────────┘
```

### 1.2 Avantages Techniques

**Développement :**
- Un seul service à démarrer et déboguer
- Transactions ACID simples
- Pas de latence réseau interne
- Tests d'intégration simplifiés

**Production :**
- Déploiement unique et simple
- Monitoring centralisé
- Performance optimale
- Coûts d'infrastructure réduits

**Évolutivité :**
- Modules prêts pour extraction microservices
- Migration progressive possible
- Architecture non bloquante

---

## 2. Stack Technologique Détaillée

### 2.1 Runtime & Package Manager

**Bun** (Primary Runtime)
```typescript
// bun.lockb au lieu de package-lock.json
// Performance 2-3x supérieure à npm/yarn
// Compatible Node.js mais optimisé

// package.json
{
  "packageManager": "bun@1.1.0",
  "engines": {
    "bun": ">=1.1.0",
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build --target=bun",
    "test": "bun test"
  }
}
```

### 2.2 Backend Core

**GraphQL avec Apollo Server**
```typescript
// apps/api/src/server.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from './graphql/schema';
import { createContext } from './infrastructure/context';

const server = new ApolloServer({
  schema: buildSchema(),
  introspection: process.env.NODE_ENV === 'development',
  csrfPrevention: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) || 4000 },
  context: createContext,
});
```

**Drizzle ORM Configuration**
```typescript
// packages/database/src/connection.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);
export const db = drizzle(sql, {
  schema: import('./schema'),
  logger: process.env.NODE_ENV === 'development'
});
```

### 2.3 Frontend Technologies

**Next.js 14+ Configuration**
```javascript
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@winmarket/database']
  },
  images: {
    domains: ['localhost', process.env.MINIO_ENDPOINT],
    formats: ['image/webp', 'image/avif']
  },
  transpilePackages: ['@winmarket/shared', '@winmarket/ui']
};

module.exports = nextConfig;
```

**Expo + EAS Configuration**
```json
// apps/mobile/app.json
{
  "expo": {
    "name": "WinMarket",
    "slug": "winmarket",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "assetBundlePatterns": ["**/*"],
    "eas": {
      "build": {
        "preview": {
          "distribution": "internal"
        },
        "production": {
          "autoIncrement": true
        }
      },
      "update": {
        "channel": "production"
      }
    }
  }
}
```

---

## 3. Structure Modular Monolith

### 3.1 Architecture des Modules

**Séparation par Domaine Métier**
```typescript
// apps/api/src/modules/
├── auth/                    # Authentication & Authorization
│   ├── auth.service.ts     # Business logic
│   ├── auth.resolver.ts    # GraphQL resolvers
│   ├── auth.types.ts       # TypeScript types
│   └── index.ts            # Module exports
├── users/                   # User Management
├── products/                # Product Catalog
├── orders/                  # Order Processing
├── payments/                # Wallet & Transactions
├── delivery/                # Shipping Management
└── admin/                   # Moderation & Analytics
```

### 3.2 Interface de Module Type

```typescript
// apps/api/src/modules/shared/types.ts
export interface Module {
  name: string;
  resolvers: any;
  typeDefs: string;
  services: Record<string, any>;
}

// Exemple : Module Auth
// apps/api/src/modules/auth/index.ts
import { AuthService } from './auth.service';
import { authResolvers } from './auth.resolver';
import { authTypeDefs } from './auth.types';

export const authModule: Module = {
  name: 'auth',
  resolvers: authResolvers,
  typeDefs: authTypeDefs,
  services: {
    authService: new AuthService()
  }
};
```

### 3.3 Infrastructure Partagée

**Context GraphQL**
```typescript
// apps/api/src/infrastructure/context.ts
export interface GraphQLContext {
  user?: User;
  db: Database;
  redis: Redis;
  minio: MinioClient;
  dataloaders: DataLoaders;
}

export const createContext = async ({ req }): Promise<GraphQLContext> => {
  const user = await authenticateUser(req);

  return {
    user,
    db: getDatabase(),
    redis: getRedisClient(),
    minio: getMinioClient(),
    dataloaders: createDataLoaders()
  };
};
```

**DataLoaders pour Performance**
```typescript
// apps/api/src/infrastructure/dataloaders.ts
import DataLoader from 'dataloader';

export const createDataLoaders = () => ({
  userLoader: new DataLoader(async (ids: string[]) => {
    const users = await db.select().from(usersTable).where(inArray(usersTable.id, ids));
    return ids.map(id => users.find(user => user.id === id));
  }),

  productLoader: new DataLoader(async (ids: string[]) => {
    const products = await db.select().from(productsTable).where(inArray(productsTable.id, ids));
    return ids.map(id => products.find(product => product.id === id));
  })
});
```

---

## 4. Base de Données Drizzle ORM

### 4.1 Schema Principal

**Configuration Drizzle**
```typescript
// packages/database/drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Tables Principales**
```typescript
// packages/database/src/schema/users.ts
import { pgTable, uuid, varchar, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const userRoleEnum = pgEnum('user_role', ['BUYER', 'SELLER', 'ADMIN']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('BUYER').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// packages/database/src/schema/products.ts
export const products = pgTable('products', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  stock: integer('stock').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// packages/database/src/schema/wallets.ts
export const transactionTypeEnum = pgEnum('transaction_type', [
  'DEPOSIT', 'WITHDRAWAL', 'PURCHASE', 'SALE', 'COMMISSION', 'REFUND'
]);

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  userId: uuid('user_id').unique().notNull().references(() => users.id),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 3 }).default('EUR').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 4.2 Relations et Types

**Relations Drizzle**
```typescript
// packages/database/src/schema/relations.ts
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  deliveryOptions: many(deliveryOptions),
  reviews: many(reviews),
  orderItems: many(orderItems),
}));
```

**Types TypeScript Générés**
```typescript
// packages/database/src/types.ts
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

export type WalletTransaction = InferSelectModel<typeof walletTransactions>;
export type NewWalletTransaction = InferInsertModel<typeof walletTransactions>;
```

### 4.3 Migrations et Seed

**Script de Migration**
```typescript
// packages/database/src/migrate.ts
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './connection';

const runMigrations = async () => {
  console.log('Running migrations...');

  await migrate(db, {
    migrationsFolder: './migrations'
  });

  console.log('Migrations complete!');
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

**Données de Test**
```typescript
// packages/database/src/seed.ts
import { db } from './connection';
import { users, userProfiles, categories, products, wallets } from './schema';

const seedDatabase = async () => {
  // Admin user
  const [admin] = await db.insert(users).values({
    email: 'admin@winmarket.com',
    password: await hashPassword('admin123'),
    role: 'ADMIN'
  }).returning();

  // Test seller
  const [seller] = await db.insert(users).values({
    email: 'seller@test.com',
    password: await hashPassword('seller123'),
    role: 'SELLER'
  }).returning();

  // Test buyer
  const [buyer] = await db.insert(users).values({
    email: 'buyer@test.com',
    password: await hashPassword('buyer123'),
    role: 'BUYER'
  }).returning();

  // Categories
  const [electronicsCategory] = await db.insert(categories).values({
    name: 'Électronique',
    description: 'Appareils électroniques et gadgets',
    parentId: null
  }).returning();

  // Sample products
  await db.insert(products).values([
    {
      sellerId: seller.id,
      title: 'iPhone 15 Pro',
      description: 'Dernier modèle Apple avec USB-C',
      price: '1299.00',
      categoryId: electronicsCategory.id,
      images: ['/images/iphone-15-pro.jpg'],
      stock: 10
    },
    {
      sellerId: seller.id,
      title: 'MacBook Air M2',
      description: 'Ultraportable Apple Silicon',
      price: '1499.00',
      categoryId: electronicsCategory.id,
      images: ['/images/macbook-air-m2.jpg'],
      stock: 5
    }
  ]);

  // Create wallets
  await db.insert(wallets).values([
    { userId: seller.id, balance: '0.00' },
    { userId: buyer.id, balance: '500.00' },
    { userId: admin.id, balance: '0.00' }
  ]);

  console.log('Database seeded successfully!');
};

seedDatabase().catch(console.error);
```

---

## 5. API GraphQL Architecture

### 5.1 Schema Organisation

**Schema Builder**
```typescript
// apps/api/src/graphql/schema.ts
import { createSchema } from 'graphql-yoga';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

// Import all modules
import { authModule } from '../modules/auth';
import { usersModule } from '../modules/users';
import { productsModule } from '../modules/products';
import { ordersModule } from '../modules/orders';
import { walletsModule } from '../modules/wallets';
import { adminModule } from '../modules/admin';

const modules = [
  authModule,
  usersModule,
  productsModule,
  ordersModule,
  walletsModule,
  adminModule
];

const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  ...modules.map(module => module.typeDefs)
]);

const resolvers = mergeResolvers([
  ...modules.map(module => module.resolvers)
]);

export const schema = createSchema({
  typeDefs,
  resolvers
});
```

**Types de Base**
```graphql
# apps/api/src/graphql/base.graphql
scalar DateTime
scalar JSON

type Query {
  _empty: String
}

type Mutation {
  _empty: String
}

type Subscription {
  _empty: String
}

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 5.2 Modules GraphQL Détaillés

**Module Auth**
```graphql
# apps/api/src/modules/auth/auth.types.graphql
extend type Query {
  me: User
  verifyToken(token: String!): Boolean!
}

extend type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  refreshToken: AuthPayload!
  forgotPassword(email: String!): Boolean!
  resetPassword(input: ResetPasswordInput!): Boolean!
}

type AuthPayload {
  user: User!
  accessToken: String!
  refreshToken: String!
  expiresAt: DateTime!
}

input RegisterInput {
  email: String!
  password: String!
  confirmPassword: String!
  role: UserRole = BUYER
}

input LoginInput {
  email: String!
  password: String!
}

input ResetPasswordInput {
  token: String!
  password: String!
  confirmPassword: String!
}
```

**Module Products**
```graphql
# apps/api/src/modules/products/products.types.graphql
extend type Query {
  products(input: ProductsInput): ProductsConnection!
  product(id: ID!): Product
  searchProducts(input: SearchProductsInput!): ProductsConnection!
  categories: [Category!]!
  category(id: ID!): Category
}

extend type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}

type Product implements Node {
  id: ID!
  seller: User!
  title: String!
  description: String!
  price: Float!
  images: [String!]!
  category: Category!
  stock: Int!
  isActive: Boolean!
  deliveryOptions: [DeliveryOption!]!
  reviews: ReviewsConnection!
  averageRating: Float
  totalReviews: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
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

input ProductsInput {
  first: Int = 20
  after: String
  categoryId: ID
  sellerId: ID
  isActive: Boolean
  orderBy: ProductOrderBy = CREATED_DESC
}

input SearchProductsInput {
  query: String!
  categoryId: ID
  priceMin: Float
  priceMax: Float
  first: Int = 20
  after: String
}

enum ProductOrderBy {
  CREATED_ASC
  CREATED_DESC
  PRICE_ASC
  PRICE_DESC
  RATING_DESC
  POPULAR
}
```

**Module Wallet**
```graphql
# apps/api/src/modules/wallets/wallets.types.graphql
extend type Query {
  myWallet: Wallet
  wallet(userId: ID!): Wallet
}

extend type Mutation {
  depositWallet(input: DepositInput!): WalletTransaction!
  withdrawWallet(input: WithdrawInput!): WalletTransaction!
  transferWallet(input: TransferInput!): WalletTransaction!
}

type Wallet {
  id: ID!
  user: User!
  balance: Float!
  currency: String!
  transactions(input: TransactionsInput): TransactionsConnection!
  pendingTransactions: [WalletTransaction!]!
  createdAt: DateTime!
}

type WalletTransaction {
  id: ID!
  wallet: Wallet!
  type: TransactionType!
  amount: Float!
  description: String!
  metadata: JSON
  status: TransactionStatus!
  createdAt: DateTime!
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  PURCHASE
  SALE
  COMMISSION
  REFUND
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}
```

### 5.3 Resolvers avec DataLoaders

**Product Resolver Optimisé**
```typescript
// apps/api/src/modules/products/products.resolver.ts
export const productsResolver = {
  Query: {
    products: async (_: any, { input }: { input: ProductsInput }, ctx: GraphQLContext) => {
      const { first = 20, after, categoryId, sellerId, isActive = true, orderBy } = input;

      // Build query with Drizzle
      let query = ctx.db
        .select()
        .from(products)
        .where(eq(products.isActive, isActive));

      if (categoryId) {
        query = query.where(eq(products.categoryId, categoryId));
      }

      if (sellerId) {
        query = query.where(eq(products.sellerId, sellerId));
      }

      // Pagination avec cursor
      if (after) {
        const cursor = decodeCursor(after);
        query = query.where(lt(products.createdAt, cursor.createdAt));
      }

      // Ordering
      switch (orderBy) {
        case 'CREATED_DESC':
          query = query.orderBy(desc(products.createdAt));
          break;
        case 'PRICE_ASC':
          query = query.orderBy(asc(products.price));
          break;
        // ... autres orderings
      }

      const items = await query.limit(first + 1);
      const hasMore = items.length > first;
      const nodes = hasMore ? items.slice(0, -1) : items;

      return {
        edges: nodes.map(node => ({
          node,
          cursor: encodeCursor({ createdAt: node.createdAt, id: node.id })
        })),
        pageInfo: {
          hasNextPage: hasMore,
          hasPreviousPage: !!after,
          startCursor: nodes[0] ? encodeCursor({ createdAt: nodes[0].createdAt, id: nodes[0].id }) : null,
          endCursor: nodes[nodes.length - 1] ? encodeCursor({ createdAt: nodes[nodes.length - 1].createdAt, id: nodes[nodes.length - 1].id }) : null,
        },
        totalCount: await getTotalCount(ctx.db, { categoryId, sellerId, isActive })
      };
    },

    searchProducts: async (_: any, { input }: { input: SearchProductsInput }, ctx: GraphQLContext) => {
      // Utilisation de recherche full-text PostgreSQL
      const { query: searchQuery, categoryId, priceMin, priceMax, first = 20, after } = input;

      const searchVector = sql`to_tsvector('french', ${products.title} || ' ' || ${products.description})`;
      const searchTSQuery = sql`to_tsquery('french', ${searchQuery.split(' ').join(' & ')})`;

      let query = ctx.db
        .select()
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            sql`${searchVector} @@ ${searchTSQuery}`
          )
        )
        .orderBy(sql`ts_rank(${searchVector}, ${searchTSQuery}) DESC`);

      // Filtres additionnels...
      return executeSearchQuery(query, { first, after });
    }
  },

  Product: {
    seller: async (product: Product, _: any, ctx: GraphQLContext) => {
      return ctx.dataloaders.userLoader.load(product.sellerId);
    },

    category: async (product: Product, _: any, ctx: GraphQLContext) => {
      return ctx.dataloaders.categoryLoader.load(product.categoryId);
    },

    reviews: async (product: Product, { input }: any, ctx: GraphQLContext) => {
      // Pagination des reviews avec DataLoader optimisé
      return ctx.dataloaders.productReviewsLoader.load({
        productId: product.id,
        ...input
      });
    },

    averageRating: async (product: Product, _: any, ctx: GraphQLContext) => {
      const stats = await ctx.dataloaders.productStatsLoader.load(product.id);
      return stats.averageRating;
    },

    deliveryOptions: async (product: Product, _: any, ctx: GraphQLContext) => {
      return ctx.dataloaders.deliveryOptionsLoader.load(product.id);
    }
  },

  Mutation: {
    createProduct: async (_: any, { input }: any, ctx: GraphQLContext) => {
      // Validation des permissions
      if (!ctx.user || ctx.user.role !== 'SELLER') {
        throw new Error('Unauthorized: Only sellers can create products');
      }

      // Upload des images vers MinIO si nécessaire
      const processedImages = await Promise.all(
        input.images.map(async (image: any) => {
          if (image.file) {
            return await ctx.minio.uploadFile('products', image.file);
          }
          return image.url;
        })
      );

      const [newProduct] = await ctx.db
        .insert(products)
        .values({
          sellerId: ctx.user.id,
          title: input.title,
          description: input.description,
          price: input.price,
          images: processedImages,
          categoryId: input.categoryId,
          stock: input.stock
        })
        .returning();

      // Invalidate caches
      await ctx.redis.del(`user_products:${ctx.user.id}`);

      return newProduct;
    }
  }
};
```

---

## 6. Applications Frontend

### 6.1 Application Web Next.js

**Structure App Router**
```typescript
// apps/web/src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (marketplace)/
│   ├── page.tsx                    # Home page
│   ├── search/page.tsx             # Search results
│   ├── products/
│   │   ├── [id]/page.tsx          # Product detail
│   │   └── category/[slug]/page.tsx
│   ├── cart/page.tsx
│   └── checkout/page.tsx
├── (dashboard)/
│   ├── account/page.tsx
│   ├── wallet/page.tsx
│   ├── orders/page.tsx
│   └── seller/
│       ├── products/page.tsx
│       ├── orders/page.tsx
│       └── analytics/page.tsx
├── api/
│   ├── auth/route.ts
│   ├── upload/route.ts
│   └── graphql/route.ts
├── globals.css
└── layout.tsx
```

**Configuration Apollo Client**
```typescript
// apps/web/src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ?
    localStorage.getItem('accessToken') : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    // Handle 401 Unauthorized
    if (networkError.statusCode === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['input', ['categoryId', 'sellerId', 'orderBy']],
            merge(existing, incoming, { args }) {
              if (!existing) return incoming;

              // Pagination merge logic
              return {
                ...incoming,
                edges: [...(existing.edges || []), ...incoming.edges],
              };
            }
          }
        }
      },
      Product: {
        fields: {
          reviews: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    }
  }
});
```

**Composants Réutilisables**
```typescript
// apps/web/src/components/ProductCard.tsx
'use client';

import { Product } from '@winmarket/shared';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const mainImage = product.images[0] || '/placeholder-product.jpg';
  const averageRating = product.averageRating || 0;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Stock épuisé</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.title}
          </h3>

          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({product.totalReviews})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              €{product.price}
            </span>

            <span className="text-sm text-gray-500">
              Par {product.seller.profile.firstName}
            </span>
          </div>

          {product.deliveryOptions.some(opt => opt.type === 'PICKUP') && (
            <div className="mt-2">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Retrait gratuit
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
```

### 6.2 Application Mobile Expo

**Configuration EAS**
```json
// apps/mobile/eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@winmarket.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "production"
      }
    }
  },
  "update": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

**Navigation avec Expo Router**
```typescript
// apps/mobile/src/app/_layout.tsx
import { Stack } from 'expo-router';
import { ApolloProvider } from '@apollo/client';
import { TamaguiProvider } from '@tamagui/core';
import { ToastProvider } from '@tamagui/toast';
import { apolloClient } from '../lib/apollo';
import { tamaguiConfig } from '../lib/tamagui';
import { AuthProvider } from '../contexts/auth';

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ToastProvider>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/[id]"
                options={{
                  title: 'Produit',
                  headerBackTitle: 'Retour'
                }}
              />
            </Stack>
          </AuthProvider>
        </ApolloProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}

// apps/mobile/src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, User } from '@tamagui/lucide-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
```

**Composants Tamagui**
```typescript
// apps/mobile/src/components/ProductCard.tsx
import { Card, Image, Text, XStack, YStack, Badge } from '@tamagui/core';
import { Star } from '@tamagui/lucide-icons';
import { Product } from '@winmarket/shared';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const mainImage = product.images[0] || 'https://via.placeholder.com/300';

  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      hoverStyle={{ scale: 0.98 }}
      pressStyle={{ scale: 0.95 }}
      onPress={onPress}
      marginBottom="$3"
    >
      <Card.Header paddingBottom="$0">
        <Image
          source={{ uri: mainImage }}
          width="100%"
          height={200}
          borderRadius="$4"
          backgroundColor="$gray2"
        />
      </Card.Header>

      <YStack padding="$3" space="$2">
        <Text fontSize="$5" fontWeight="600" numberOfLines={2}>
          {product.title}
        </Text>

        <XStack alignItems="center" space="$2">
          <XStack alignItems="center" space="$1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size="$1"
                color={i < Math.floor(product.averageRating || 0) ? '$yellow10' : '$gray7'}
                fill={i < Math.floor(product.averageRating || 0) ? '$yellow10' : 'transparent'}
              />
            ))}
          </XStack>

          <Text fontSize="$3" color="$gray10">
            ({product.totalReviews})
          </Text>
        </XStack>

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="700" color="$blue10">
            €{product.price}
          </Text>

          {product.deliveryOptions.some(opt => opt.type === 'PICKUP') && (
            <Badge variant="outline" backgroundColor="$green2" borderColor="$green8">
              <Text fontSize="$2" color="$green11">Retrait gratuit</Text>
            </Badge>
          )}
        </XStack>

        <Text fontSize="$3" color="$gray10">
          Par {product.seller.profile.firstName}
        </Text>
      </YStack>
    </Card>
  );
}
```

---

## 7. Stockage de Fichiers MinIO

### 7.1 Configuration MinIO

**Docker Compose Setup**
```yaml
# docker-compose.yml (extrait MinIO)
services:
  minio:
    image: minio/minio:latest
    container_name: winmarket_minio
    ports:
      - "9000:9000"    # API
      - "9001:9001"    # Console
    environment:
      MINIO_ROOT_USER: winmarket
      MINIO_ROOT_PASSWORD: winmarket123
      MINIO_BROWSER_REDIRECT_URL: http://localhost:9001
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - winmarket

  # Service pour créer les buckets automatiquement
  minio-init:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      sleep 5;
      /usr/bin/mc alias set myminio http://minio:9000 winmarket winmarket123;
      /usr/bin/mc mb myminio/products --ignore-existing;
      /usr/bin/mc mb myminio/avatars --ignore-existing;
      /usr/bin/mc mb myminio/documents --ignore-existing;
      /usr/bin/mc policy set public myminio/products;
      /usr/bin/mc policy set public myminio/avatars;
      exit 0;
      "
    networks:
      - winmarket

volumes:
  minio_data:
```

**Client MinIO Configuration**
```typescript
// apps/api/src/infrastructure/minio.ts
import { Client } from 'minio';
import { Readable } from 'stream';

export class MinIOService {
  private client: Client;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'winmarket',
      secretKey: process.env.MINIO_SECRET_KEY || 'winmarket123'
    });
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileData: Buffer | Readable,
    contentType?: string
  ): Promise<string> {
    try {
      // Ensure bucket exists
      const bucketExists = await this.client.bucketExists(bucketName);
      if (!bucketExists) {
        await this.client.makeBucket(bucketName);
      }

      // Generate unique filename
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;

      // Upload file
      await this.client.putObject(
        bucketName,
        uniqueFileName,
        fileData,
        undefined,
        contentType ? { 'Content-Type': contentType } : undefined
      );

      // Return URL
      return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${bucketName}/${uniqueFileName}`;
    } catch (error) {
      console.error('MinIO upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    try {
      await this.client.removeObject(bucketName, fileName);
    } catch (error) {
      console.error('MinIO delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileUrl(bucketName: string, fileName: string, expiry = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await this.client.presignedGetObject(bucketName, fileName, expiry);
    } catch (error) {
      console.error('MinIO URL generation error:', error);
      throw new Error(`Failed to generate file URL: ${error.message}`);
    }
  }

  async listFiles(bucketName: string, prefix?: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const stream = this.client.listObjects(bucketName, prefix);

      for await (const obj of stream) {
        files.push(obj.name!);
      }

      return files;
    } catch (error) {
      console.error('MinIO list error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}
```

### 7.2 Upload API Route

**Next.js Upload Handler**
```typescript
// apps/web/src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MinIOService } from '@winmarket/infrastructure/minio';
import { authenticateRequest } from '@winmarket/auth';

const minioService = new MinIOService();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Determine bucket based on type
    const bucketMap = {
      'product': 'products',
      'avatar': 'avatars',
      'document': 'documents'
    };

    const bucket = bucketMap[type as keyof typeof bucketMap] || 'general';

    // Upload to MinIO
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await minioService.uploadFile(
      bucket,
      file.name,
      buffer,
      file.type
    );

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 7.3 Image Optimization & CDN

**Image Processing avec Sharp**
```typescript
// apps/api/src/infrastructure/image-processor.ts
import sharp from 'sharp';
import { MinIOService } from './minio';

export class ImageProcessor {
  private minioService: MinIOService;

  constructor(minioService: MinIOService) {
    this.minioService = minioService;
  }

  async processProductImage(
    originalBuffer: Buffer,
    fileName: string
  ): Promise<{ original: string; thumbnail: string; optimized: string }> {
    try {
      // Create thumbnail (300x300)
      const thumbnailBuffer = await sharp(originalBuffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Create optimized version (800x800)
      const optimizedBuffer = await sharp(originalBuffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload all versions
      const [originalUrl, thumbnailUrl, optimizedUrl] = await Promise.all([
        this.minioService.uploadFile('products', `original-${fileName}`, originalBuffer),
        this.minioService.uploadFile('products', `thumb-${fileName}`, thumbnailBuffer, 'image/jpeg'),
        this.minioService.uploadFile('products', `opt-${fileName}`, optimizedBuffer, 'image/jpeg')
      ]);

      return {
        original: originalUrl,
        thumbnail: thumbnailUrl,
        optimized: optimizedUrl
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }
}
```

---

## 8. Authentification & Sécurité

### 8.1 Better Auth Configuration

**Configuration Better Auth**
```typescript
// packages/auth/src/config.ts
import { BetterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@winmarket/database";

export const auth = new BetterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token, url }) => {
      // Send password reset email
      await sendEmail({
        to: user.email,
        subject: "Réinitialiser votre mot de passe",
        html: `Cliquez <a href="${url}">ici</a> pour réinitialiser votre mot de passe.`
      });
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "BUYER",
        required: false,
      }
    }
  },
  plugins: [
    // Rate limiting
    {
      id: "rate-limit",
      endpoints: {
        signIn: {
          rateLimit: {
            window: 60, // 1 minute
            max: 5 // 5 attempts
          }
        },
        signUp: {
          rateLimit: {
            window: 60,
            max: 3
          }
        }
      }
    }
  ]
});
```

### 8.2 Middleware de Sécurité

**GraphQL Security Middleware**
```typescript
// apps/api/src/middleware/security.ts
import { shield, rule, and, or, not } from 'graphql-shield';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ForbiddenError, AuthenticationError } from 'apollo-server-errors';

// Rate limiters
const loginLimiter = new RateLimiterMemory({
  keyGenerator: (parent, args, context) => context.req.ip,
  points: 5, // Number of attempts
  duration: 60, // Per 60 seconds
});

const generalLimiter = new RateLimiterMemory({
  keyGenerator: (parent, args, context) => context.user?.id || context.req.ip,
  points: 1000, // Number of requests
  duration: 60, // Per 60 seconds
});

// Rules
const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => {
    return ctx.user !== null;
  }
);

const isSeller = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => {
    return ctx.user && ['SELLER', 'ADMIN'].includes(ctx.user.role);
  }
);

const isAdmin = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => {
    return ctx.user && ctx.user.role === 'ADMIN';
  }
);

const isOwner = rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (!ctx.user) return false;

    // Check if user owns the resource
    if (args.userId && args.userId !== ctx.user.id) return false;
    if (parent && parent.userId && parent.userId !== ctx.user.id) return false;

    return true;
  }
);

const rateLimitRule = rule({ cache: 'no-cache' })(
  async (parent, args, ctx) => {
    try {
      await generalLimiter.consume(ctx.user?.id || ctx.req.ip);
      return true;
    } catch (error) {
      throw new ForbiddenError('Rate limit exceeded');
    }
  }
);

// Shield configuration
export const permissions = shield({
  Query: {
    '*': rateLimitRule,
    me: isAuthenticated,
    myWallet: isAuthenticated,
    myOrders: isAuthenticated,
  },
  Mutation: {
    '*': and(rateLimitRule),
    login: rule({ cache: 'no-cache' })(async (parent, args, ctx) => {
      try {
        await loginLimiter.consume(ctx.req.ip);
        return true;
      } catch (error) {
        throw new ForbiddenError('Too many login attempts');
      }
    }),
    createProduct: and(isAuthenticated, isSeller),
    updateProduct: and(isAuthenticated, isSeller, isOwner),
    deleteProduct: and(isAuthenticated, isSeller, isOwner),
    createOrder: isAuthenticated,
    depositWallet: isAuthenticated,
    withdrawWallet: isAuthenticated,
    // Admin only
    suspendUser: isAdmin,
    deleteUser: isAdmin,
    updateCommissionRate: isAdmin,
  },
  User: {
    wallet: or(isOwner, isAdmin),
    orders: or(isOwner, isAdmin),
  },
  Product: {
    '*': true, // Public access for product data
  },
  Order: {
    '*': or(isOwner, isAdmin),
  }
}, {
  allowExternalErrors: true,
  debug: process.env.NODE_ENV === 'development',
});
```

### 8.3 Data Sanitization & Validation

**Input Validation avec Zod**
```typescript
// packages/shared/src/validation/schemas.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit faire au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .refine(val => !val.includes('<script'), 'Contenu non autorisé'),

  description: z.string()
    .min(10, 'La description doit faire au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .refine(val => !/<script|javascript:|data:/i.test(val), 'Contenu non autorisé'),

  price: z.number()
    .min(0.01, 'Le prix doit être supérieur à 0')
    .max(999999.99, 'Prix trop élevé')
    .transform(val => Math.round(val * 100) / 100), // Round to 2 decimals

  categoryId: z.string().uuid('ID de catégorie invalide'),

  stock: z.number()
    .int('Le stock doit être un nombre entier')
    .min(0, 'Le stock ne peut pas être négatif')
    .max(999999, 'Stock trop élevé'),

  images: z.array(z.string().url('URL d\'image invalide'))
    .min(1, 'Au moins une image est requise')
    .max(10, 'Maximum 10 images par produit')
});

export const searchProductsSchema = z.object({
  query: z.string()
    .min(1, 'La recherche doit contenir au moins 1 caractère')
    .max(100, 'La recherche ne peut pas dépasser 100 caractères')
    .refine(val => !/[<>{}|\\^`\[\]]/.test(val), 'Caractères non autorisés'),

  categoryId: z.string().uuid().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  first: z.number().min(1).max(100).default(20),
});

// Validation middleware pour GraphQL
export const validateInput = (schema: z.ZodSchema) =>
  (resolver: any) =>
    async (parent: any, args: any, context: any, info: any) => {
      try {
        const validatedArgs = schema.parse(args.input || args);
        return await resolver(parent, { ...args, input: validatedArgs }, context, info);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
        }
        throw error;
      }
    };
```

---

## 9. Déploiement & Infrastructure

### 9.1 Docker Configuration

**API Dockerfile**
```dockerfile
# apps/api/Dockerfile
FROM oven/bun:1.1-slim as base
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/business/package.json ./packages/business/

# Install dependencies
RUN bun install --frozen-lockfile

# Build stage
FROM base as build
COPY . .
RUN bun run build

# Production stage
FROM base as production

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S api -u 1001

USER api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["bun", "run", "dist/index.js"]
```

**Web App Dockerfile**
```dockerfile
# apps/web/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 9.2 Kubernetes Deployment

**API Deployment**
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: winmarket-api
  labels:
    app: winmarket-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: winmarket-api
  template:
    metadata:
      labels:
        app: winmarket-api
    spec:
      containers:
      - name: api
        image: winmarket/api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: winmarket-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: winmarket-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: winmarket-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: winmarket-api-service
spec:
  selector:
    app: winmarket-api
  ports:
  - protocol: TCP
    port: 4000
    targetPort: 4000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: winmarket-api-ingress
  annotations:
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  rules:
  - host: api.winmarket.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: winmarket-api-service
            port:
              number: 4000
  tls:
  - hosts:
    - api.winmarket.com
    secretName: winmarket-tls
```

**Database StatefulSet**
```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: "winmarket"
        - name: POSTGRES_USER
          value: "winmarket"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### 9.3 CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest

    - name: Install dependencies
      run: bun install

    - name: Run type check
      run: bun run type-check

    - name: Run linting
      run: bun run lint

    - name: Run tests
      run: bun run test
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/test

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push API image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./apps/api/Dockerfile
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}

    - name: Build and push Web image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./apps/web/Dockerfile
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/web:${{ github.sha }}

    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        namespace: production
        manifests: |
          k8s/api-deployment.yaml
          k8s/web-deployment.yaml
        images: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}
          ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/web:${{ github.sha }}
        kubectl-version: 'latest'
      env:
        KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
```

---

## 10. Tests & Qualité

### 10.1 Tests Unitaires

**Configuration Jest avec Bun**
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
```

**Test Setup**
```typescript
// apps/api/src/__tests__/setup.ts
import { db } from '@winmarket/database';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

beforeAll(async () => {
  // Run migrations on test database
  await migrate(db, { migrationsFolder: './migrations' });
});

afterAll(async () => {
  // Cleanup
  await db.execute('DROP SCHEMA IF EXISTS public CASCADE');
  await db.execute('CREATE SCHEMA public');
});

afterEach(async () => {
  // Clean data between tests
  const tables = ['wallet_transactions', 'orders', 'products', 'wallets', 'users'];

  for (const table of tables) {
    await db.execute(`DELETE FROM ${table}`);
  }
});
```

**Service Tests**
```typescript
// apps/api/src/modules/products/__tests__/products.service.test.ts
import { ProductsService } from '../products.service';
import { db } from '@winmarket/database';
import { users, products, categories } from '@winmarket/database/schema';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let testUser: any;
  let testCategory: any;

  beforeEach(async () => {
    productsService = new ProductsService(db);

    // Create test user
    [testUser] = await db.insert(users).values({
      email: 'test@test.com',
      password: 'hashedpassword',
      role: 'SELLER'
    }).returning();

    // Create test category
    [testCategory] = await db.insert(categories).values({
      name: 'Test Category',
      description: 'Test description'
    }).returning();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 99.99,
        categoryId: testCategory.id,
        images: ['image1.jpg'],
        stock: 10
      };

      const product = await productsService.createProduct(testUser.id, productData);

      expect(product).toMatchObject({
        title: productData.title,
        description: productData.description,
        price: '99.99',
        sellerId: testUser.id,
        categoryId: testCategory.id,
        isActive: true
      });
    });

    it('should throw error for invalid seller', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 99.99,
        categoryId: testCategory.id,
        images: ['image1.jpg'],
        stock: 10
      };

      await expect(
        productsService.createProduct('invalid-id', productData)
      ).rejects.toThrow('Seller not found');
    });
  });

  describe('searchProducts', () => {
    beforeEach(async () => {
      // Create test products
      await db.insert(products).values([
        {
          sellerId: testUser.id,
          title: 'iPhone 15',
          description: 'Apple smartphone',
          price: '999.99',
          categoryId: testCategory.id,
          images: ['iphone.jpg'],
          stock: 5
        },
        {
          sellerId: testUser.id,
          title: 'Samsung Galaxy',
          description: 'Android smartphone',
          price: '799.99',
          categoryId: testCategory.id,
          images: ['samsung.jpg'],
          stock: 3
        }
      ]);
    });

    it('should find products by title', async () => {
      const results = await productsService.searchProducts({
        query: 'iPhone',
        first: 10
      });

      expect(results.edges).toHaveLength(1);
      expect(results.edges[0].node.title).toBe('iPhone 15');
    });

    it('should find products by description', async () => {
      const results = await productsService.searchProducts({
        query: 'smartphone',
        first: 10
      });

      expect(results.edges).toHaveLength(2);
    });
  });
});
```

### 10.2 Tests d'Intégration GraphQL

**GraphQL Testing Setup**
```typescript
// apps/api/src/__tests__/graphql-helper.ts
import { ApolloServer } from '@apollo/server';
import { buildSchema } from '../graphql/schema';
import { createTestContext } from './test-context';

export async function createTestServer() {
  const server = new ApolloServer({
    schema: buildSchema(),
    introspection: true,
  });

  return server;
}

export async function executeQuery(
  query: string,
  variables?: any,
  user?: any
) {
  const server = await createTestServer();
  const context = await createTestContext(user);

  const response = await server.executeOperation(
    { query, variables },
    { contextValue: context }
  );

  return response;
}
```

**Integration Tests**
```typescript
// apps/api/src/modules/products/__tests__/products.integration.test.ts
import { executeQuery } from '../../__tests__/graphql-helper';
import { createTestUser, createTestCategory } from '../../__tests__/test-helpers';

describe('Products GraphQL Integration', () => {
  let testSeller: any;
  let testCategory: any;

  beforeEach(async () => {
    testSeller = await createTestUser({ role: 'SELLER' });
    testCategory = await createTestCategory();
  });

  describe('createProduct mutation', () => {
    const CREATE_PRODUCT_MUTATION = `
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          id
          title
          price
          seller {
            id
            email
          }
        }
      }
    `;

    it('should create product for authenticated seller', async () => {
      const response = await executeQuery(
        CREATE_PRODUCT_MUTATION,
        {
          input: {
            title: 'Test Product',
            description: 'Test description',
            price: 99.99,
            categoryId: testCategory.id,
            images: ['test.jpg'],
            stock: 10
          }
        },
        testSeller
      );

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.createProduct).toMatchObject({
          title: 'Test Product',
          price: 99.99,
          seller: {
            id: testSeller.id,
            email: testSeller.email
          }
        });
      }
    });

    it('should reject creation for unauthenticated user', async () => {
      const response = await executeQuery(CREATE_PRODUCT_MUTATION, {
        input: {
          title: 'Test Product',
          description: 'Test description',
          price: 99.99,
          categoryId: testCategory.id,
          images: ['test.jpg'],
          stock: 10
        }
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0]?.message).toContain('Unauthorized');
      }
    });
  });
});
```

### 10.3 Tests End-to-End avec Playwright

**Playwright Configuration**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: [
    {
      command: 'bun run dev:api',
      port: 4000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'bun run dev:web',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
```

**E2E Test Example**
```typescript
// e2e/marketplace.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow user to browse and purchase product', async ({ page }) => {
    // Search for product
    await page.fill('[data-testid=search-input]', 'iPhone');
    await page.click('[data-testid=search-button]');

    // Wait for results
    await page.waitForSelector('[data-testid=product-card]');

    // Click on first product
    await page.click('[data-testid=product-card]:first-child');

    // Check product details page
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9-]+/);
    await expect(page.locator('h1')).toContainText('iPhone');

    // Add to cart
    await page.click('[data-testid=add-to-cart]');

    // Go to cart
    await page.click('[data-testid=cart-icon]');

    // Proceed to checkout
    await page.click('[data-testid=checkout-button]');

    // Login if needed
    if (await page.locator('[data-testid=login-form]').isVisible()) {
      await page.fill('[data-testid=email-input]', 'buyer@test.com');
      await page.fill('[data-testid=password-input]', 'buyer123');
      await page.click('[data-testid=login-button]');
    }

    // Select delivery option
    await page.click('[data-testid=delivery-option-pickup]');

    // Complete purchase
    await page.click('[data-testid=complete-purchase]');

    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page).toHaveURL('/orders');
  });

  test('seller should be able to create product', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'seller@test.com');
    await page.fill('[data-testid=password-input]', 'seller123');
    await page.click('[data-testid=login-button]');

    // Navigate to seller dashboard
    await page.goto('/seller/products');

    // Create new product
    await page.click('[data-testid=create-product-button]');

    // Fill product form
    await page.fill('[data-testid=product-title]', 'Test Product E2E');
    await page.fill('[data-testid=product-description]', 'This is a test product created via E2E test');
    await page.fill('[data-testid=product-price]', '99.99');
    await page.selectOption('[data-testid=product-category]', { label: 'Electronics' });
    await page.fill('[data-testid=product-stock]', '10');

    // Upload image (mock)
    await page.setInputFiles('[data-testid=product-images]', 'e2e/fixtures/test-product.jpg');

    // Save product
    await page.click('[data-testid=save-product]');

    // Verify product created
    await expect(page.locator('[data-testid=success-message]')).toContainText('Produit créé avec succès');
    await expect(page.locator('[data-testid=product-title]')).toContainText('Test Product E2E');
  });
});
```

---

## 11. Performance & Monitoring

### 11.1 Performance Monitoring

**APM Setup with DataDog**
```typescript
// apps/api/src/infrastructure/monitoring.ts
import tracer from 'dd-trace';

// Initialize DataDog tracer
tracer.init({
  service: 'winmarket-api',
  env: process.env.NODE_ENV || 'development',
  version: process.env.APP_VERSION || '1.0.0',
  logInjection: true,
  runtimeMetrics: true,
});

// Custom metrics
import StatsD from 'node-statsd';

export const metrics = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: parseInt(process.env.STATSD_PORT || '8125'),
  prefix: 'winmarket.api.',
});

// Performance middleware
export const performanceMiddleware = {
  requestStartTime: (req: any, res: any, next: any) => {
    req.startTime = Date.now();
    next();
  },

  responseTime: (req: any, res: any, next: any) => {
    res.on('finish', () => {
      const responseTime = Date.now() - req.startTime;

      metrics.timing('response_time', responseTime, [
        `method:${req.method}`,
        `status:${res.statusCode}`,
        `endpoint:${req.route?.path || req.url}`
      ]);

      if (responseTime > 1000) {
        console.warn(`Slow request detected: ${req.method} ${req.url} - ${responseTime}ms`);
      }
    });
    next();
  }
};

// GraphQL performance tracking
export const graphqlPerformancePlugin = {
  requestDidStart() {
    return {
      didResolveOperation(requestContext: any) {
        const operationName = requestContext.request.operationName || 'unknown';
        metrics.increment('graphql.operations', 1, [`operation:${operationName}`]);
      },

      didEncounterErrors(requestContext: any) {
        const errors = requestContext.errors;
        errors.forEach((error: any) => {
          metrics.increment('graphql.errors', 1, [
            `type:${error.constructor.name}`,
            `operation:${requestContext.request.operationName || 'unknown'}`
          ]);
        });
      },

      willSendResponse(requestContext: any) {
        const responseTime = Date.now() - requestContext.request.http?.startTime;
        if (responseTime) {
          metrics.timing('graphql.response_time', responseTime, [
            `operation:${requestContext.request.operationName || 'unknown'}`
          ]);
        }
      }
    };
  }
};
```

### 11.2 Caching Strategy

**Redis Caching Implementation**
```typescript
// apps/api/src/infrastructure/cache.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache pattern invalidation error for ${pattern}:`, error);
    }
  }

  // Specific caching strategies
  async cacheUser(userId: string, userData: any, ttl: number = 1800): Promise<void> {
    await this.set(`user:${userId}`, userData, ttl);
  }

  async getCachedUser(userId: string): Promise<any | null> {
    return this.get(`user:${userId}`);
  }

  async cacheProductList(cacheKey: string, products: any[], ttl: number = 600): Promise<void> {
    await this.set(`products:${cacheKey}`, products, ttl);
  }

  async getCachedProductList(cacheKey: string): Promise<any[] | null> {
    return this.get(`products:${cacheKey}`);
  }

  // Search results caching
  async cacheSearchResults(query: string, filters: any, results: any, ttl: number = 300): Promise<void> {
    const searchKey = this.generateSearchKey(query, filters);
    await this.set(`search:${searchKey}`, results, ttl);
  }

  async getCachedSearchResults(query: string, filters: any): Promise<any | null> {
    const searchKey = this.generateSearchKey(query, filters);
    return this.get(`search:${searchKey}`);
  }

  private generateSearchKey(query: string, filters: any): string {
    const filtersString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');

    return btoa(`${query}|${filtersString}`).replace(/[^a-zA-Z0-9]/g, '');
  }
}

// Cache decorator for resolvers
export function cached(ttl: number = 3600, keyGenerator?: (args: any) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService || new CacheService();
      const cacheKey = keyGenerator
        ? keyGenerator(args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}
```

### 11.3 Database Optimization

**Query Optimization avec Drizzle**
```typescript
// packages/database/src/queries/optimized.ts
import { db } from '../connection';
import { products, users, categories, reviews } from '../schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export class OptimizedQueries {

  // Optimized product listing with preloaded relations
  static async getProductsWithDetails(filters: {
    categoryId?: string;
    sellerId?: string;
    limit: number;
    offset: number;
  }) {
    const { categoryId, sellerId, limit, offset } = filters;

    // Single query with joins instead of N+1
    const query = db
      .select({
        product: products,
        seller: {
          id: users.id,
          email: users.email,
          profile: users.profile
        },
        category: {
          id: categories.id,
          name: categories.name
        },
        reviewStats: {
          averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
          totalReviews: count(reviews.id)
        }
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(
        and(
          eq(products.isActive, true),
          categoryId ? eq(products.categoryId, categoryId) : undefined,
          sellerId ? eq(products.sellerId, sellerId) : undefined
        )
      )
      .groupBy(products.id, users.id, categories.id)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return query;
  }

  // Search with full-text search
  static async searchProducts(searchQuery: string, filters: any = {}) {
    const searchVector = sql`to_tsvector('french', ${products.title} || ' ' || ${products.description})`;
    const searchTSQuery = sql`to_tsquery('french', ${searchQuery.split(' ').join(' & ')})`;

    return db
      .select({
        product: products,
        seller: {
          id: users.id,
          email: users.email,
          profile: users.profile
        },
        category: categories,
        rank: sql<number>`ts_rank(${searchVector}, ${searchTSQuery})`
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          sql`${searchVector} @@ ${searchTSQuery}`,
          filters.categoryId ? eq(products.categoryId, filters.categoryId) : undefined,
          filters.priceMin ? sql`${products.price} >= ${filters.priceMin}` : undefined,
          filters.priceMax ? sql`${products.price} <= ${filters.priceMax}` : undefined
        )
      )
      .orderBy(sql`ts_rank(${searchVector}, ${searchTSQuery}) DESC`)
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);
  }

  // Optimized wallet balance calculation
  static async getUserWalletBalance(userId: string) {
    const result = await db
      .select({
        balance: sql<number>`
          COALESCE(SUM(
            CASE
              WHEN type IN ('DEPOSIT', 'SALE') THEN amount
              WHEN type IN ('WITHDRAWAL', 'PURCHASE', 'COMMISSION') THEN -amount
              ELSE 0
            END
          ), 0)
        `
      })
      .from(walletTransactions)
      .innerJoin(wallets, eq(walletTransactions.walletId, wallets.id))
      .where(eq(wallets.userId, userId))
      .groupBy(wallets.id);

    return result[0]?.balance || 0;
  }

  // Popular products with caching hints
  static async getPopularProducts(limit: number = 10) {
    return db
      .select({
        product: products,
        seller: {
          id: users.id,
          profile: users.profile
        },
        orderCount: count(orderItems.id),
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(eq(products.isActive, true))
      .groupBy(products.id, users.id)
      .orderBy(count(orderItems.id), sql`AVG(${reviews.rating})`)
      .limit(limit);
  }
}

// Database indexes for performance
export const createIndexes = async () => {
  await db.execute(sql`
    -- Full-text search index
    CREATE INDEX IF NOT EXISTS idx_products_search
    ON products USING gin(to_tsvector('french', title || ' ' || description));

    -- Composite indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_products_category_active
    ON products(category_id, is_active, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_products_seller_active
    ON products(seller_id, is_active, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_products_price_active
    ON products(price, is_active) WHERE is_active = true;

    -- Wallet transactions for balance calculation
    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_type
    ON wallet_transactions(wallet_id, type, created_at DESC);

    -- Orders and items for analytics
    CREATE INDEX IF NOT EXISTS idx_order_items_product
    ON order_items(product_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_reviews_product_rating
    ON reviews(product_id, rating);
  `);
};
```

---

## 12. Configuration Développement

### 12.1 Scripts de Développement

**Package.json Scripts**
```json
{
  "scripts": {
    "dev": "concurrently \"bun run dev:api\" \"bun run dev:web\" \"bun run dev:admin\"",
    "dev:api": "cd apps/api && bun run dev",
    "dev:web": "cd apps/web && bun run dev",
    "dev:admin": "cd apps/admin && bun run dev",
    "dev:mobile": "cd apps/mobile && expo start",

    "build": "bun run build:packages && bun run build:apps",
    "build:packages": "turbo run build --filter='./packages/*'",
    "build:apps": "turbo run build --filter='./apps/*'",

    "test": "turbo run test",
    "test:unit": "turbo run test --filter='./packages/*'",
    "test:integration": "turbo run test:integration --filter='./apps/*'",
    "test:e2e": "playwright test",

    "lint": "turbo run lint",
    "lint:fix": "turbo run lint --fix",
    "type-check": "turbo run type-check",

    "db:generate": "cd packages/database && drizzle-kit generate:pg",
    "db:migrate": "cd packages/database && bun run migrate",
    "db:seed": "cd packages/database && bun run seed",
    "db:studio": "cd packages/database && drizzle-kit studio",
    "db:reset": "bun run db:migrate && bun run db:seed",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",

    "k8s:deploy": "kubectl apply -f k8s/",
    "k8s:delete": "kubectl delete -f k8s/",

    "clean": "turbo run clean && rm -rf node_modules",
    "reset": "bun run clean && bun install && bun run db:reset"
  }
}
```

**Environment Setup**
```bash
# scripts/setup-dev.sh
#!/bin/bash

echo "🚀 Setting up WinMarket V2 development environment..."

# Check prerequisites
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is required. Install it from https://bun.sh"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required. Install it from https://docker.com"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Setup environment files
echo "🔧 Setting up environment files..."
if [ ! -f apps/api/.env ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created apps/api/.env"
fi

if [ ! -f apps/web/.env.local ]; then
    cp apps/web/.env.example apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
bun run db:migrate

# Seed database
echo "🌱 Seeding database..."
bun run db:seed

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Available commands:"
echo "  bun run dev          - Start all services"
echo "  bun run dev:api      - Start API only"
echo "  bun run dev:web      - Start web app only"
echo "  bun run dev:mobile   - Start mobile app"
echo "  bun run db:studio    - Open database GUI"
echo ""
echo "Access points:"
echo "  Web App:      http://localhost:3000"
echo "  API GraphQL:  http://localhost:4000/graphql"
echo "  MinIO Console: http://localhost:9001"
echo "  DB Studio:    bun run db:studio"
echo ""
echo "Test accounts:"
echo "  Admin:  admin@winmarket.com / admin123"
echo "  Seller: seller@test.com / seller123"
echo "  Buyer:  buyer@test.com / buyer123"
```

### 12.2 Development Tools Configuration

**VS Code Settings**
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true
  }
}
```

**ESLint Configuration**
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always'
      }
    ]
  },
  ignorePatterns: ['dist/', 'build/', '.next/', 'node_modules/']
};
```

**Prettier Configuration**
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    }
  ]
};
```

### 12.3 Debugging Configuration

**VS Code Debug Configuration**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/index.ts",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["--inspect"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Web App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev", "-p", "3000"],
      "cwd": "${workspaceFolder}/apps/web",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "env": {
        "NODE_ENV": "test"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

**Documentation maintenue et générée par l'IA - Mise à jour le 30 Mai 2026**

🎯 Cette documentation technique détaillée couvre tous les aspects de l'architecture WinMarket V2, prête pour le développement et la production.