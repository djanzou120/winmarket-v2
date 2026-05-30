import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from './schema';

// ===== SELECT TYPES (for reading data) =====

export type User = InferSelectModel<typeof schema.users>;
export type UserProfile = InferSelectModel<typeof schema.userProfiles>;
export type Address = InferSelectModel<typeof schema.addresses>;
export type Wallet = InferSelectModel<typeof schema.wallets>;
export type WalletTransaction = InferSelectModel<typeof schema.walletTransactions>;
export type Category = InferSelectModel<typeof schema.categories>;
export type Product = InferSelectModel<typeof schema.products>;
export type DeliveryProvider = InferSelectModel<typeof schema.deliveryProviders>;
export type DeliveryOption = InferSelectModel<typeof schema.deliveryOptions>;
export type Order = InferSelectModel<typeof schema.orders>;
export type OrderItem = InferSelectModel<typeof schema.orderItems>;
export type OrderStatusHistory = InferSelectModel<typeof schema.orderStatusHistory>;
export type Review = InferSelectModel<typeof schema.reviews>;
export type ProductPromotion = InferSelectModel<typeof schema.productPromotions>;
export type Notification = InferSelectModel<typeof schema.notifications>;
export type ChatMessage = InferSelectModel<typeof schema.chatMessages>;
export type Report = InferSelectModel<typeof schema.reports>;
export type SystemConfig = InferSelectModel<typeof schema.systemConfig>;
export type AuditLog = InferSelectModel<typeof schema.auditLogs>;

// ===== INSERT TYPES (for creating data) =====

export type InsertUser = InferInsertModel<typeof schema.users>;
export type InsertUserProfile = InferInsertModel<typeof schema.userProfiles>;
export type InsertAddress = InferInsertModel<typeof schema.addresses>;
export type InsertWallet = InferInsertModel<typeof schema.wallets>;
export type InsertWalletTransaction = InferInsertModel<typeof schema.walletTransactions>;
export type InsertCategory = InferInsertModel<typeof schema.categories>;
export type InsertProduct = InferInsertModel<typeof schema.products>;
export type InsertDeliveryProvider = InferInsertModel<typeof schema.deliveryProviders>;
export type InsertDeliveryOption = InferInsertModel<typeof schema.deliveryOptions>;
export type InsertOrder = InferInsertModel<typeof schema.orders>;
export type InsertOrderItem = InferInsertModel<typeof schema.orderItems>;
export type InsertOrderStatusHistory = InferInsertModel<typeof schema.orderStatusHistory>;
export type InsertReview = InferInsertModel<typeof schema.reviews>;
export type InsertProductPromotion = InferInsertModel<typeof schema.productPromotions>;
export type InsertNotification = InferInsertModel<typeof schema.notifications>;
export type InsertChatMessage = InferInsertModel<typeof schema.chatMessages>;
export type InsertReport = InferInsertModel<typeof schema.reports>;
export type InsertSystemConfig = InferInsertModel<typeof schema.systemConfig>;
export type InsertAuditLog = InferInsertModel<typeof schema.auditLogs>;

// ===== ENUM TYPES =====

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'SALE' | 'COMMISSION' | 'REFUND' | 'PROMOTION_PAYMENT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type DeliveryType = 'PICKUP' | 'DELIVERY';
export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PromotionType = 'FEATURED_PRODUCT' | 'CATEGORY_BOOST' | 'SEARCH_HIGHLIGHT' | 'BANNER_AD';
export type PromotionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type NotificationType = 'ORDER_UPDATE' | 'PAYMENT_RECEIVED' | 'PRODUCT_APPROVED' | 'PRODUCT_REJECTED' | 'MESSAGE_RECEIVED' | 'REVIEW_RECEIVED' | 'PROMOTION_UPDATE' | 'SYSTEM_ANNOUNCEMENT';
export type ReportType = 'INAPPROPRIATE_PRODUCT' | 'FAKE_LISTING' | 'SCAM_ATTEMPT' | 'INAPPROPRIATE_BEHAVIOR' | 'COPYRIGHT_VIOLATION' | 'OTHER';
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

// ===== EXTENDED TYPES WITH RELATIONS =====

export type UserWithProfile = User & {
  profile?: UserProfile | null;
  wallet?: Wallet | null;
};

export type ProductWithDetails = Product & {
  category: Category;
  seller: User;
  deliveryOptions: DeliveryOption[];
  reviews: Review[];
};

export type OrderWithDetails = Order & {
  buyer: User;
  items: (OrderItem & {
    product: Product;
  })[];
  deliveryOption?: DeliveryOption | null;
  deliveryProvider?: DeliveryProvider | null;
  deliveryAddress?: Address | null;
  statusHistory: OrderStatusHistory[];
};

export type WalletWithTransactions = Wallet & {
  transactions: WalletTransaction[];
};

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ===== SERVICE-SPECIFIC TYPES =====

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface ProductSearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  status?: ProductStatus;
  search?: string;
}

export interface WalletTransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderFilters {
  buyerId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}