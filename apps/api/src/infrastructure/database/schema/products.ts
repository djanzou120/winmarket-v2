import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

export const productStatusEnum = pgEnum("product_status", ["DRAFT", "ACTIVE", "INACTIVE", "SUSPENDED"]);
export const productConditionEnum = pgEnum("product_condition", ["NEW", "USED_LIKE_NEW", "USED_GOOD", "USED_FAIR"]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"), // Self reference will be added with relations
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 250 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  condition: productConditionEnum("condition").notNull().default("NEW"),
  status: productStatusEnum("status").notNull().default("DRAFT"),
  stock: integer("stock").notNull().default(0),
  minOrderQuantity: integer("min_order_quantity").default(1),
  maxOrderQuantity: integer("max_order_quantity"),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: text("dimensions"), // JSON string for length, width, height
  sku: varchar("sku", { length: 100 }).unique(),
  tags: text("tags"), // JSON array of strings
  images: text("images"), // JSON array of image URLs
  isDigital: boolean("is_digital").default(false),
  shippingRequired: boolean("shipping_required").default(true),
  allowReviews: boolean("allow_reviews").default(true),
  viewCount: integer("view_count").default(0),
  favoriteCount: integer("favorite_count").default(0),
  soldCount: integer("sold_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().$defaultFn(() => createId()),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  attributes: text("attributes"), // JSON object for variant attributes
  images: text("images"), // JSON array of image URLs
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});