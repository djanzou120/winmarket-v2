import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  decimal,
  json,
  varchar,
  index,
  unique,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===== ENUMS =====

export const userRole = pgEnum('user_role', ['BUYER', 'SELLER', 'ADMIN']);
export const userStatus = pgEnum('user_status', ['ACTIVE', 'SUSPENDED', 'DEACTIVATED']);
export const transactionType = pgEnum('transaction_type', [
  'DEPOSIT',
  'WITHDRAWAL',
  'PURCHASE',
  'SALE',
  'COMMISSION',
  'REFUND',
  'PROMOTION_PAYMENT'
]);
export const transactionStatus = pgEnum('transaction_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);
export const paymentProvider = pgEnum('payment_provider', [
  'STRIPE',
  'PAYPAL',
  'BANK_TRANSFER',
  'CRYPTO'
]);
export const productStatus = pgEnum('product_status', [
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED'
]);
export const deliveryType = pgEnum('delivery_type', ['PICKUP', 'DELIVERY']);
export const orderStatus = pgEnum('order_status', [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);
export const promotionType = pgEnum('promotion_type', [
  'FEATURED_PRODUCT',
  'CATEGORY_BOOST',
  'SEARCH_HIGHLIGHT',
  'BANNER_AD'
]);
export const promotionStatus = pgEnum('promotion_status', [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
]);
export const notificationType = pgEnum('notification_type', [
  'ORDER_UPDATE',
  'PAYMENT_RECEIVED',
  'PRODUCT_APPROVED',
  'PRODUCT_REJECTED',
  'MESSAGE_RECEIVED',
  'REVIEW_RECEIVED',
  'PROMOTION_UPDATE',
  'SYSTEM_ANNOUNCEMENT'
]);
export const reportType = pgEnum('report_type', [
  'INAPPROPRIATE_PRODUCT',
  'FAKE_LISTING',
  'SCAM_ATTEMPT',
  'INAPPROPRIATE_BEHAVIOR',
  'COPYRIGHT_VIOLATION',
  'OTHER'
]);
export const reportStatus = pgEnum('report_status', [
  'PENDING',
  'UNDER_REVIEW',
  'RESOLVED',
  'DISMISSED'
]);

// ===== USER MANAGEMENT =====

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: userRole('role').default('BUYER').notNull(),
  status: userStatus('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const addresses = pgTable('addresses', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // HOME, WORK, OTHER
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state'),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ===== WALLET & TRANSACTIONS =====

export const wallets = pgTable('wallets', {
  id: text('id').primaryKey(),
  userId: text('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0').notNull(),
  currency: text('currency').default('USD').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
  type: transactionType('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  status: transactionStatus('status').default('PENDING').notNull(),
  provider: paymentProvider('provider'),
  providerTxId: text('provider_tx_id').unique(),
  metadata: json('metadata'),
  orderId: text('order_id'),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  walletCreatedAtIdx: index('wallet_transactions_wallet_id_created_at_idx').on(table.walletId, table.createdAt),
  typeStatusIdx: index('wallet_transactions_type_status_idx').on(table.type, table.status),
  providerTxIdIdx: index('wallet_transactions_provider_tx_id_idx').on(table.providerTxId),
}));

// ===== PRODUCT CATALOG =====

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  parentId: text('parent_id'),
  image: text('image'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
}));

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  sellerId: text('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  sku: text('sku').unique(),
  images: text('images').array().default([]).notNull(),
  status: productStatus('status').default('ACTIVE').notNull(),
  weight: decimal('weight', { precision: 8, scale: 3 }),
  dimensions: json('dimensions'),
  metadata: json('metadata'),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sellerIdx: index('products_seller_id_idx').on(table.sellerId),
  categoryIdx: index('products_category_id_idx').on(table.categoryId),
  statusCreatedIdx: index('products_status_created_at_idx').on(table.status, table.createdAt),
  titleIdx: index('products_title_idx').on(table.title),
  priceIdx: index('products_price_idx').on(table.price),
}));

// ===== DELIVERY SYSTEM =====

export const deliveryProviders = pgTable('delivery_providers', {
  id: text('id').primaryKey(),
  sellerId: text('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  contactInfo: text('contact_info').notNull(),
  serviceZones: text('service_zones').array().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  pricePerKm: decimal('price_per_km', { precision: 8, scale: 2 }),
  basePrice: decimal('base_price', { precision: 8, scale: 2 }).notNull(),
  description: text('description'),
  estimatedDays: integer('estimated_days').default(3).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sellerIdx: index('delivery_providers_seller_id_idx').on(table.sellerId),
}));

export const deliveryOptions = pgTable('delivery_options', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: deliveryType('type').notNull(),
  providerId: text('provider_id').references(() => deliveryProviders.id),
  price: decimal('price', { precision: 8, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productIdx: index('delivery_options_product_id_idx').on(table.productId),
}));

// ===== ORDERS & COMMERCE =====

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  buyerId: text('buyer_id').notNull().references(() => users.id),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 8, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  commission: decimal('commission', { precision: 8, scale: 2 }).notNull(),
  deliveryOptionId: text('delivery_option_id').references(() => deliveryOptions.id),
  deliveryProviderId: text('delivery_provider_id').references(() => deliveryProviders.id),
  deliveryAddressId: text('delivery_address_id').references(() => addresses.id),
  status: orderStatus('status').default('PENDING').notNull(),
  trackingInfo: text('tracking_info'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  buyerIdx: index('orders_buyer_id_idx').on(table.buyerId),
  statusCreatedIdx: index('orders_status_created_at_idx').on(table.status, table.createdAt),
}));

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('order_items_order_id_idx').on(table.orderId),
}));

export const orderStatusHistory = pgTable('order_status_history', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: orderStatus('status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderCreatedIdx: index('order_status_history_order_id_created_at_idx').on(table.orderId, table.createdAt),
}));

// ===== REVIEWS & RATINGS =====

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  orderId: text('order_id'),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  images: text('images').array().default([]).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userProductUnique: unique('reviews_user_id_product_id_unique').on(table.userId, table.productId),
  productRatingIdx: index('reviews_product_id_rating_idx').on(table.productId, table.rating),
}));

// ===== PROMOTIONS & MARKETING =====

export const productPromotions = pgTable('product_promotions', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: promotionType('type').notNull(),
  status: promotionStatus('status').default('ACTIVE').notNull(),
  budget: decimal('budget', { precision: 10, scale: 2 }).notNull(),
  spent: decimal('spent', { precision: 10, scale: 2 }).default('0').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  typeStatusIdx: index('product_promotions_type_status_idx').on(table.type, table.status),
  dateRangeIdx: index('product_promotions_start_date_end_date_idx').on(table.startDate, table.endDate),
}));

// ===== NOTIFICATIONS =====

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationType('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: json('data'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userReadIdx: index('notifications_user_id_is_read_idx').on(table.userId, table.isRead),
  createdIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// ===== CHAT & COMMUNICATION =====

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: text('receiver_id').notNull(),
  message: text('message').notNull(),
  attachments: text('attachments').array().default([]).notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  senderReceiverIdx: index('chat_messages_sender_id_receiver_id_idx').on(table.senderId, table.receiverId),
  createdIdx: index('chat_messages_created_at_idx').on(table.createdAt),
}));

// ===== MODERATION & REPORTS =====

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  reportedId: text('reported_id').notNull().references(() => users.id),
  type: reportType('type').notNull(),
  reason: text('reason').notNull(),
  description: text('description'),
  evidence: text('evidence').array().default([]).notNull(),
  status: reportStatus('status').default('PENDING').notNull(),
  adminNotes: text('admin_notes'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusCreatedIdx: index('reports_status_created_at_idx').on(table.status, table.createdAt),
  reportedIdx: index('reports_reported_id_idx').on(table.reportedId),
}));

// ===== ADMIN & CONFIGURATION =====

export const systemConfig = pgTable('system_config', {
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id'),
  oldValues: json('old_values'),
  newValues: json('new_values'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index('audit_logs_user_id_created_at_idx').on(table.userId, table.createdAt),
  entityIdx: index('audit_logs_entity_entity_id_idx').on(table.entity, table.entityId),
  actionCreatedIdx: index('audit_logs_action_created_at_idx').on(table.action, table.createdAt),
}));

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  wallet: one(wallets),
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  deliveryProviders: many(deliveryProviders),
  notifications: many(notifications),
  reportsMade: many(reports, { relationName: 'reportsMade' }),
  reportsReceived: many(reports, { relationName: 'reportsReceived' }),
  chatMessages: many(chatMessages),
  auditLogs: many(auditLogs),
}));

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [addresses.profileId],
    references: [userProfiles.id],
  }),
  orders: many(orders),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
  order: one(orders, {
    fields: [walletTransactions.orderId],
    references: [orders.id],
  }),
}));

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
  orderItems: many(orderItems),
  reviews: many(reviews),
  promotions: many(productPromotions),
}));

export const deliveryProvidersRelations = relations(deliveryProviders, ({ one, many }) => ({
  seller: one(users, {
    fields: [deliveryProviders.sellerId],
    references: [users.id],
  }),
  deliveryOptions: many(deliveryOptions),
  orders: many(orders),
}));

export const deliveryOptionsRelations = relations(deliveryOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [deliveryOptions.productId],
    references: [products.id],
  }),
  provider: one(deliveryProviders, {
    fields: [deliveryOptions.providerId],
    references: [deliveryProviders.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  deliveryOption: one(deliveryOptions, {
    fields: [orders.deliveryOptionId],
    references: [deliveryOptions.id],
  }),
  deliveryProvider: one(deliveryProviders, {
    fields: [orders.deliveryProviderId],
    references: [deliveryProviders.id],
  }),
  deliveryAddress: one(addresses, {
    fields: [orders.deliveryAddressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
  transactions: many(walletTransactions),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const productPromotionsRelations = relations(productPromotions, ({ one }) => ({
  product: one(products, {
    fields: [productPromotions.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  reported: one(users, {
    fields: [reports.reportedId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));