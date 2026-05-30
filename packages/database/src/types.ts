import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  users,
  userProfiles,
  addresses,
  wallets,
  walletTransactions,
  commissions,
  categories,
  products,
  deliveryProviders,
  deliveryOptions,
  orders,
  orderItems,
  orderStatusHistory,
  reviews,
  reviewHelpfulness,
  chatRooms,
  chatMessages,
  reports,
  auditLogs,
  notifications,
  systemConfig,
  analyticsEvents,
  dailyStats,
} from './schema';

// User types
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type InsertUserProfile = InferInsertModel<typeof userProfiles>;
export type Address = InferSelectModel<typeof addresses>;
export type InsertAddress = InferInsertModel<typeof addresses>;

// Wallet types
export type Wallet = InferSelectModel<typeof wallets>;
export type InsertWallet = InferInsertModel<typeof wallets>;
export type WalletTransaction = InferSelectModel<typeof walletTransactions>;
export type InsertWalletTransaction = InferInsertModel<typeof walletTransactions>;
export type Commission = InferSelectModel<typeof commissions>;
export type InsertCommission = InferInsertModel<typeof commissions>;

// Product types
export type Category = InferSelectModel<typeof categories>;
export type InsertCategory = InferInsertModel<typeof categories>;
export type Product = InferSelectModel<typeof products>;
export type InsertProduct = InferInsertModel<typeof products>;
export type DeliveryProvider = InferSelectModel<typeof deliveryProviders>;
export type InsertDeliveryProvider = InferInsertModel<typeof deliveryProviders>;
export type DeliveryOption = InferSelectModel<typeof deliveryOptions>;
export type InsertDeliveryOption = InferInsertModel<typeof deliveryOptions>;

// Order types
export type Order = InferSelectModel<typeof orders>;
export type InsertOrder = InferInsertModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type InsertOrderItem = InferInsertModel<typeof orderItems>;
export type OrderStatusHistory = InferSelectModel<typeof orderStatusHistory>;
export type InsertOrderStatusHistory = InferInsertModel<typeof orderStatusHistory>;

// Review types
export type Review = InferSelectModel<typeof reviews>;
export type InsertReview = InferInsertModel<typeof reviews>;
export type ReviewHelpfulness = InferSelectModel<typeof reviewHelpfulness>;
export type InsertReviewHelpfulness = InferInsertModel<typeof reviewHelpfulness>;

// Chat types
export type ChatRoom = InferSelectModel<typeof chatRooms>;
export type InsertChatRoom = InferInsertModel<typeof chatRooms>;
export type ChatMessage = InferSelectModel<typeof chatMessages>;
export type InsertChatMessage = InferInsertModel<typeof chatMessages>;

// Admin types
export type Report = InferSelectModel<typeof reports>;
export type InsertReport = InferInsertModel<typeof reports>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type InsertAuditLog = InferInsertModel<typeof auditLogs>;
export type Notification = InferSelectModel<typeof notifications>;
export type InsertNotification = InferInsertModel<typeof notifications>;
export type SystemConfig = InferSelectModel<typeof systemConfig>;
export type InsertSystemConfig = InferInsertModel<typeof systemConfig>;
export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;
export type InsertAnalyticsEvent = InferInsertModel<typeof analyticsEvents>;
export type DailyStats = InferSelectModel<typeof dailyStats>;
export type InsertDailyStats = InferInsertModel<typeof dailyStats>;

// Enum types
export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'SALE' | 'COMMISSION' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'SUSPENDED' | 'DELETED';
export type DeliveryType = 'PICKUP' | 'DELIVERY';
export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReportType = 'PRODUCT' | 'USER' | 'REVIEW' | 'MESSAGE';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type ReportReason = 'INAPPROPRIATE_CONTENT' | 'SPAM' | 'HARASSMENT' | 'FAKE_PRODUCT' | 'INTELLECTUAL_PROPERTY' | 'OTHER';

// Extended types with relations
export type UserWithProfile = User & {
  profile: UserProfile | null;
  addresses: Address[];
  wallet: Wallet | null;
};

export type ProductWithDetails = Product & {
  seller: User;
  category: Category;
  deliveryOptions: DeliveryOption[];
  reviews: Review[];
};

export type OrderWithDetails = Order & {
  buyer: User;
  items: (OrderItem & {
    product: Product;
    seller: User;
  })[];
  statusHistory: OrderStatusHistory[];
};

export type WalletWithTransactions = Wallet & {
  user: User;
  transactions: WalletTransaction[];
};

// Business logic types
export interface CreateOrderInput {
  buyerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryOptionId?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface ProcessPaymentInput {
  orderId: string;
  paymentMethod: 'WALLET';
}

export interface AddWalletFundsInput {
  walletId: string;
  amount: number;
  type: TransactionType;
  description: string;
  provider?: string;
  externalId?: string;
}

export interface CreateProductInput {
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface SearchProductsInput {
  query?: string;
  categoryId?: string;
  sellerId?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'created_at' | 'sales_count' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}