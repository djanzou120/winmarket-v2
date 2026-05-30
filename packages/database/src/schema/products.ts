import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const productStatusEnum = pgEnum('product_status', ['ACTIVE', 'DRAFT', 'SUSPENDED', 'DELETED']);
export const deliveryTypeEnum = pgEnum('delivery_type', ['PICKUP', 'DELIVERY']);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  parentId: uuid('parent_id').references(() => categories.id), // Self-reference for hierarchy
  image: text('image'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 4 }).default('0.0500').notNull(), // 5% default
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'restrict' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).unique().notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }), // Original price for discounts
  stock: integer('stock').default(0).notNull(),
  sku: varchar('sku', { length: 100 }),
  weight: decimal('weight', { precision: 8, scale: 3 }), // in kg
  dimensions: text('dimensions'), // JSON: {length, width, height}
  images: text('images').notNull(), // JSON array of image URLs
  tags: text('tags'), // JSON array of tags
  status: productStatusEnum('status').default('ACTIVE').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  allowsPickup: boolean('allows_pickup').default(true).notNull(),
  searchVector: text('search_vector'), // For full-text search
  viewCount: integer('view_count').default(0).notNull(),
  salesCount: integer('sales_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const deliveryProviders = pgTable('delivery_providers', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  contactInfo: text('contact_info'), // Phone, email, etc.
  serviceZones: text('service_zones'), // JSON array of postal codes or areas
  basePrice: decimal('base_price', { precision: 8, scale: 2 }).notNull(),
  pricePerKm: decimal('price_per_km', { precision: 8, scale: 2 }).default('0.00').notNull(),
  estimatedDays: integer('estimated_days').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const deliveryOptions = pgTable('delivery_options', {
  id: uuid('id').primaryKey().notNull().$defaultFn(() => createId()),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  type: deliveryTypeEnum('type').notNull(),
  deliveryProviderId: uuid('delivery_provider_id').references(() => deliveryProviders.id, { onDelete: 'cascade' }), // null for PICKUP
  price: decimal('price', { precision: 8, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days').notNull(),
  description: varchar('description', { length: 200 }),
  isAvailable: boolean('is_available').default(true).notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
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

export const deliveryProvidersRelations = relations(deliveryProviders, ({ one, many }) => ({
  seller: one(users, {
    fields: [deliveryProviders.sellerId],
    references: [users.id],
  }),
  deliveryOptions: many(deliveryOptions),
}));

export const deliveryOptionsRelations = relations(deliveryOptions, ({ one }) => ({
  product: one(products, {
    fields: [deliveryOptions.productId],
    references: [products.id],
  }),
  deliveryProvider: one(deliveryProviders, {
    fields: [deliveryOptions.deliveryProviderId],
    references: [deliveryProviders.id],
  }),
}));

// Import other tables for relations
import { reviews } from './reviews';
import { orderItems } from './orders';