import { pgTable, varchar, text, uuid, decimal, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

// Enums for delivery domain
export const deliveryProviderStatusEnum = pgEnum("delivery_provider_status", ["ACTIVE", "INACTIVE", "SUSPENDED"]);
export const deliveryMethodEnum = pgEnum("delivery_method", ["STANDARD", "EXPRESS", "SAME_DAY", "PICKUP"]);
export const deliveryStatusEnum = pgEnum("delivery_status", [
  "PENDING",
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED"
]);

// Delivery providers table (courier companies, postal services, etc.)
export const deliveryProviders = pgTable("delivery_providers", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: varchar("logo", { length: 500 }),
  website: varchar("website", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),

  // API configuration for tracking
  apiBaseUrl: varchar("api_base_url", { length: 500 }),
  apiKey: varchar("api_key", { length: 255 }),
  trackingUrlPattern: varchar("tracking_url_pattern", { length: 500 }),

  // Business settings
  isActive: boolean("is_active").notNull().default(true),
  status: deliveryProviderStatusEnum("status").notNull().default("ACTIVE"),
  supportsCOD: boolean("supports_cod").default(false),
  supportsTracking: boolean("supports_tracking").default(true),

  // Coverage areas (JSON array of zones/cities)
  coverageAreas: text("coverage_areas"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Delivery options (available shipping methods)
export const deliveryOptions = pgTable("delivery_options", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  providerId: uuid("provider_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  method: deliveryMethodEnum("method").notNull(),

  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }),
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),

  // Delivery timeframes
  estimatedDays: integer("estimated_days").notNull(), // minimum delivery days
  maxDays: integer("max_days"), // maximum delivery days

  // Constraints
  maxWeight: decimal("max_weight", { precision: 8, scale: 3 }), // kg
  maxDimensions: varchar("max_dimensions", { length: 100 }), // "L x W x H cm"

  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Delivery zones (geographic coverage areas)
export const deliveryZones = pgTable("delivery_zones", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // CITY, REGION, COUNTRY, POSTAL_CODE
  value: varchar("value", { length: 100 }).notNull(), // Abidjan, Côte d'Ivoire, 225xxx

  // Geographic boundaries (optional, for precise mapping)
  coordinates: text("coordinates"), // JSON polygon or bounds

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Provider-zone mapping
export const providerZones = pgTable("provider_zones", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  providerId: uuid("provider_id").notNull(),
  zoneId: uuid("zone_id").notNull(),
  additionalCost: decimal("additional_cost", { precision: 10, scale: 2 }).default("0.00"),
  deliveryDaysModifier: integer("delivery_days_modifier").default(0), // +/- days
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Delivery tracking records
export const deliveryTracking = pgTable("delivery_tracking", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: uuid("order_id").notNull(),
  providerId: uuid("provider_id").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull().unique(),

  status: deliveryStatusEnum("status").notNull().default("PENDING"),

  // Pickup information
  pickupAddress: text("pickup_address"), // JSON object
  pickupDate: timestamp("pickup_date"),

  // Delivery information
  deliveryAddress: text("delivery_address"), // JSON object
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),

  // Package details
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: varchar("dimensions", { length: 100 }),

  // Delivery agent info
  driverName: varchar("driver_name", { length: 100 }),
  driverPhone: varchar("driver_phone", { length: 50 }),

  // Tracking events (JSON array)
  trackingEvents: text("tracking_events"),

  // Notes and metadata
  notes: text("notes"),
  metadata: text("metadata"), // JSON for provider-specific data

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Delivery rates based on zones and weight
export const deliveryRates = pgTable("delivery_rates", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUID()),
  optionId: uuid("option_id").notNull(),
  zoneId: uuid("zone_id").notNull(),

  // Weight-based pricing
  minWeight: decimal("min_weight", { precision: 8, scale: 3 }).default("0.000"),
  maxWeight: decimal("max_weight", { precision: 8, scale: 3 }),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),

  // Optional volume-based pricing
  minVolume: decimal("min_volume", { precision: 10, scale: 3 }),
  maxVolume: decimal("max_volume", { precision: 10, scale: 3 }),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const deliveryProvidersRelations = relations(deliveryProviders, ({ many }) => ({
  options: many(deliveryOptions),
  zones: many(providerZones),
  trackingRecords: many(deliveryTracking),
}));

export const deliveryOptionsRelations = relations(deliveryOptions, ({ one, many }) => ({
  provider: one(deliveryProviders, {
    fields: [deliveryOptions.providerId],
    references: [deliveryProviders.id],
  }),
  rates: many(deliveryRates),
}));

export const deliveryZonesRelations = relations(deliveryZones, ({ many }) => ({
  providers: many(providerZones),
  rates: many(deliveryRates),
}));

export const providerZonesRelations = relations(providerZones, ({ one }) => ({
  provider: one(deliveryProviders, {
    fields: [providerZones.providerId],
    references: [deliveryProviders.id],
  }),
  zone: one(deliveryZones, {
    fields: [providerZones.zoneId],
    references: [deliveryZones.id],
  }),
}));

export const deliveryTrackingRelations = relations(deliveryTracking, ({ one }) => ({
  provider: one(deliveryProviders, {
    fields: [deliveryTracking.providerId],
    references: [deliveryProviders.id],
  }),
}));

export const deliveryRatesRelations = relations(deliveryRates, ({ one }) => ({
  option: one(deliveryOptions, {
    fields: [deliveryRates.optionId],
    references: [deliveryOptions.id],
  }),
  zone: one(deliveryZones, {
    fields: [deliveryRates.zoneId],
    references: [deliveryZones.id],
  }),
}));

export const deliverySchema = {
  deliveryProviders,
  deliveryOptions,
  deliveryZones,
  providerZones,
  deliveryTracking,
  deliveryRates,
};

// Type exports
export type DeliveryProvider = typeof deliveryProviders.$inferSelect;
export type NewDeliveryProvider = typeof deliveryProviders.$inferInsert;

export type DeliveryOption = typeof deliveryOptions.$inferSelect;
export type NewDeliveryOption = typeof deliveryOptions.$inferInsert;

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type NewDeliveryZone = typeof deliveryZones.$inferInsert;

export type DeliveryTracking = typeof deliveryTracking.$inferSelect;
export type NewDeliveryTracking = typeof deliveryTracking.$inferInsert;