import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { users } from "./users";
import { products } from "./products";

export const deliveryProviderStatusEnum = pgEnum("delivery_provider_status", ["ACTIVE", "INACTIVE", "SUSPENDED"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP"]);

export const deliveryProviders = pgTable("delivery_providers", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logo: text("logo"), // URL to logo image

  // Contact information
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  website: varchar("website", { length: 255 }),

  // API configuration (for tracking integration)
  apiUrl: text("api_url"),
  apiKey: varchar("api_key", { length: 255 }),
  trackingUrlTemplate: text("tracking_url_template"), // Template with {tracking_number}

  // Coverage and capabilities
  coverageAreas: text("coverage_areas"), // JSON array of areas/cities
  supportedServices: text("supported_services"), // JSON array of delivery types

  // Business information
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default("0.0000"), // Platform commission

  // Status and metadata
  status: deliveryProviderStatusEnum("status").notNull().default("ACTIVE"),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalDeliveries: integer("total_deliveries").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryOptions = pgTable("delivery_options", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  providerId: uuid("provider_id").notNull().references(() => deliveryProviders.id),
  sellerId: uuid("seller_id").references(() => users.id), // null = available to all sellers
  productId: uuid("product_id").references(() => products.id), // null = available for all products

  // Delivery configuration
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Standard Delivery", "Express Delivery"
  type: deliveryTypeEnum("type").notNull(),
  description: text("description"),

  // Pricing
  baseCost: decimal("base_cost", { precision: 8, scale: 2 }).notNull(),
  costPerKm: decimal("cost_per_km", { precision: 6, scale: 4 }).default("0.0000"),
  costPerKg: decimal("cost_per_kg", { precision: 6, scale: 2 }).default("0.00"),
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),

  // Time estimates
  estimatedMinHours: integer("estimated_min_hours"), // Minimum delivery time in hours
  estimatedMaxHours: integer("estimated_max_hours"), // Maximum delivery time in hours

  // Restrictions
  maxWeight: decimal("max_weight", { precision: 8, scale: 3 }), // in kg
  maxDimensions: text("max_dimensions"), // JSON object with length, width, height
  restrictedAreas: text("restricted_areas"), // JSON array of areas where not available

  // Configuration
  requiresPickupTime: boolean("requires_pickup_time").default(false),
  allowWeekendDelivery: boolean("allow_weekend_delivery").default(true),
  allowEveningDelivery: boolean("allow_evening_delivery").default(false),
  requiresSignature: boolean("requires_signature").default(false),

  // Status
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryZones = pgTable("delivery_zones", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  providerId: uuid("provider_id").notNull().references(() => deliveryProviders.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),

  // Geographic boundaries (simplified - in production would use PostGIS)
  areas: text("areas"), // JSON array of area names, postal codes, etc.
  coordinates: text("coordinates"), // JSON polygon coordinates for map integration

  // Delivery configuration for this zone
  baseCost: decimal("base_cost", { precision: 8, scale: 2 }).notNull(),
  costMultiplier: decimal("cost_multiplier", { precision: 4, scale: 2 }).default("1.00"),
  estimatedHours: integer("estimated_hours").notNull(),

  // Restrictions
  maxWeight: decimal("max_weight", { precision: 8, scale: 3 }),
  restrictedDays: text("restricted_days"), // JSON array of days when delivery is not available

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});