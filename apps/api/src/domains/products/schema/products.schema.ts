import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const productStatusEnum = pgEnum("product_status", ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]);
export const productConditionEnum = pgEnum("product_condition", ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id").references(() => categories.id),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  sellerId: uuid("seller_id").notNull(), // Reference to users table
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  condition: productConditionEnum("condition").notNull().default("NEW"),
  status: productStatusEnum("status").notNull().default("DRAFT"),
  stock: integer("stock").notNull().default(0),
  minOrderQuantity: integer("min_order_quantity").default(1),
  maxOrderQuantity: integer("max_order_quantity"),
  weight: decimal("weight", { precision: 8, scale: 3 }), // in kg
  dimensions: varchar("dimensions", { length: 100 }), // "L x W x H cm"
  sku: varchar("sku", { length: 100 }),
  tags: text("tags").array(),
  images: text("images").array(),
  isDigital: boolean("is_digital").notNull().default(false),
  shippingRequired: boolean("shipping_required").notNull().default(true),
  allowReviews: boolean("allow_reviews").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  favoriteCount: integer("favorite_count").notNull().default(0),
  soldCount: integer("sold_count").notNull().default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at")
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Couleur", "Taille"
  value: varchar("value", { length: 255 }).notNull(), // e.g., "Rouge", "XL"
  price: decimal("price", { precision: 10, scale: 2 }), // Price modification for this variant
  stock: integer("stock").notNull().default(0),
  sku: varchar("sku", { length: 100 }),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;