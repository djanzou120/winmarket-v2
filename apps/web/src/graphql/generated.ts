/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSON: { input: any; output: any; }
}

export interface AddToCartInput {
  productId: Scalars['ID']['input'];
  productVariantId?: InputMaybe<Scalars['ID']['input']>;
  quantity: Scalars['Int']['input'];
}

export interface Address {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street: Scalars['String']['output'];
}

export interface AddressInput {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street: Scalars['String']['input'];
}

export interface AuthPayload {
  __typename?: 'AuthPayload';
  session?: Maybe<Session>;
  token?: Maybe<Scalars['String']['output']>;
  user: User;
}

export interface BulkNotificationInput {
  actionText?: InputMaybe<Scalars['String']['input']>;
  actionUrl?: InputMaybe<Scalars['String']['input']>;
  channels: Array<NotificationChannel>;
  data?: InputMaybe<Scalars['JSON']['input']>;
  message: Scalars['String']['input'];
  priority?: InputMaybe<NotificationPriority>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type: NotificationType;
  userIds: Array<Scalars['ID']['input']>;
}

export interface Cart {
  __typename?: 'Cart';
  currency: Scalars['String']['output'];
  itemCount: Scalars['Int']['output'];
  items: Array<CartItem>;
  subtotal: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
}

export interface CartItem {
  __typename?: 'CartItem';
  addedAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  product: Product;
  productId: Scalars['ID']['output'];
  productVariant?: Maybe<ProductVariant>;
  productVariantId?: Maybe<Scalars['ID']['output']>;
  quantity: Scalars['Int']['output'];
  totalPrice: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
}

export interface CategoriesConnection {
  __typename?: 'CategoriesConnection';
  edges: Array<CategoryEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface Category {
  __typename?: 'Category';
  children: Array<Category>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  parent?: Maybe<Category>;
  parentId?: Maybe<Scalars['ID']['output']>;
  productCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
}

export interface CategoryEdge {
  __typename?: 'CategoryEdge';
  cursor: Scalars['String']['output'];
  node: Category;
}

export interface CategoryFilter {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}

export interface CategoryProductCount {
  __typename?: 'CategoryProductCount';
  category: Category;
  count: Scalars['Int']['output'];
}

export interface ChangePasswordInput {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}

export interface CreateCategoryInput {
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['ID']['input']>;
  slug: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
}

export interface CreateDeliveryOptionInput {
  basePrice: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDays: Scalars['Int']['input'];
  freeShippingThreshold?: InputMaybe<Scalars['Float']['input']>;
  maxDays?: InputMaybe<Scalars['Int']['input']>;
  maxDimensions?: InputMaybe<Scalars['String']['input']>;
  maxWeight?: InputMaybe<Scalars['Float']['input']>;
  method: DeliveryMethod;
  name: Scalars['String']['input'];
  pricePerKg?: InputMaybe<Scalars['Float']['input']>;
  providerId: Scalars['ID']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
}

export interface CreateDeliveryProviderInput {
  apiBaseUrl?: InputMaybe<Scalars['String']['input']>;
  apiKey?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  coverageAreas?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  supportsCOD?: InputMaybe<Scalars['Boolean']['input']>;
  supportsTracking?: InputMaybe<Scalars['Boolean']['input']>;
  trackingUrlPattern?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateDeliveryZoneInput {
  coordinates?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
  value: Scalars['String']['input'];
}

export interface CreateNotificationInput {
  actionText?: InputMaybe<Scalars['String']['input']>;
  actionUrl?: InputMaybe<Scalars['String']['input']>;
  channel: NotificationChannel;
  data?: InputMaybe<Scalars['JSON']['input']>;
  message: Scalars['String']['input'];
  priority?: InputMaybe<NotificationPriority>;
  relatedEntityId?: InputMaybe<Scalars['ID']['input']>;
  relatedEntityType?: InputMaybe<Scalars['String']['input']>;
  scheduledFor?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type: NotificationType;
  userId: Scalars['ID']['input'];
}

export interface CreateOrderInput {
  billingAddress?: InputMaybe<AddressInput>;
  couponCode?: InputMaybe<Scalars['String']['input']>;
  items: Array<OrderItemInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: PaymentMethod;
  shippingAddress: AddressInput;
  shippingMethod?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateProductInput {
  allowReviews?: InputMaybe<Scalars['Boolean']['input']>;
  categoryId: Scalars['ID']['input'];
  condition: ProductCondition;
  description: Scalars['String']['input'];
  dimensions?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isDigital?: InputMaybe<Scalars['Boolean']['input']>;
  maxOrderQuantity?: InputMaybe<Scalars['Int']['input']>;
  minOrderQuantity?: InputMaybe<Scalars['Int']['input']>;
  originalPrice?: InputMaybe<Scalars['Float']['input']>;
  price: Scalars['Float']['input'];
  shippingRequired?: InputMaybe<Scalars['Boolean']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stock: Scalars['Int']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
}

export interface CreateProductVariantInput {
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Float']['input']>;
  productId: Scalars['ID']['input'];
  sku?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  stock: Scalars['Int']['input'];
  value: Scalars['String']['input'];
}

export interface CreateReviewInput {
  content?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isAnonymous?: InputMaybe<Scalars['Boolean']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  orderItemId?: InputMaybe<Scalars['ID']['input']>;
  productId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateTemplateInput {
  actionTextTemplate?: InputMaybe<Scalars['String']['input']>;
  actionUrlTemplate?: InputMaybe<Scalars['String']['input']>;
  channel: NotificationChannel;
  emailHtml?: InputMaybe<Scalars['String']['input']>;
  emailSubject?: InputMaybe<Scalars['String']['input']>;
  messageTemplate: Scalars['String']['input'];
  titleTemplate: Scalars['String']['input'];
  type: NotificationType;
  variables?: InputMaybe<Scalars['JSON']['input']>;
}

export interface CreateTrackingInput {
  deliveryAddress: AddressInput;
  dimensions?: InputMaybe<Scalars['String']['input']>;
  estimatedDelivery?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['ID']['input'];
  pickupAddress?: InputMaybe<AddressInput>;
  providerId: Scalars['ID']['input'];
  trackingNumber: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
}

export interface DeliveryCalculationInput {
  codAmount?: InputMaybe<Scalars['Float']['input']>;
  dimensions?: InputMaybe<Scalars['String']['input']>;
  fromAddress?: InputMaybe<AddressInput>;
  toAddress: AddressInput;
  value?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
}

export enum DeliveryMethod {
  Express = 'EXPRESS',
  Pickup = 'PICKUP',
  SameDay = 'SAME_DAY',
  Standard = 'STANDARD'
}

export interface DeliveryOption {
  __typename?: 'DeliveryOption';
  basePrice: Scalars['Float']['output'];
  calculatedPrice?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedDays: Scalars['Int']['output'];
  freeShippingThreshold?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isAvailable: Scalars['Boolean']['output'];
  maxDays?: Maybe<Scalars['Int']['output']>;
  maxDimensions?: Maybe<Scalars['String']['output']>;
  maxWeight?: Maybe<Scalars['Float']['output']>;
  method: DeliveryMethod;
  name: Scalars['String']['output'];
  pricePerKg?: Maybe<Scalars['Float']['output']>;
  provider: DeliveryProvider;
  providerId: Scalars['ID']['output'];
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
}

export interface DeliveryProvider {
  __typename?: 'DeliveryProvider';
  apiBaseUrl?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  coverageAreas: Array<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  options: Array<DeliveryOption>;
  slug: Scalars['String']['output'];
  status: DeliveryProviderStatus;
  supportsCOD: Scalars['Boolean']['output'];
  supportsTracking: Scalars['Boolean']['output'];
  trackingUrlPattern?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
  zones: Array<ProviderZone>;
}

export enum DeliveryProviderStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED'
}

export interface DeliveryQuote {
  __typename?: 'DeliveryQuote';
  estimatedDays: Scalars['Int']['output'];
  isAvailable: Scalars['Boolean']['output'];
  option: DeliveryOption;
  price: Scalars['Float']['output'];
  restrictions: Array<Scalars['String']['output']>;
}

export interface DeliveryRate {
  __typename?: 'DeliveryRate';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxVolume?: Maybe<Scalars['Float']['output']>;
  maxWeight?: Maybe<Scalars['Float']['output']>;
  minVolume?: Maybe<Scalars['Float']['output']>;
  minWeight: Scalars['Float']['output'];
  option: DeliveryOption;
  optionId: Scalars['ID']['output'];
  rate: Scalars['Float']['output'];
  zone: DeliveryZone;
  zoneId: Scalars['ID']['output'];
}

export interface DeliveryStats {
  __typename?: 'DeliveryStats';
  averageDeliveryTime: Scalars['Float']['output'];
  deliveredToday: Scalars['Int']['output'];
  failedDeliveries: Scalars['Int']['output'];
  inTransitDeliveries: Scalars['Int']['output'];
  onTimeDeliveryRate: Scalars['Float']['output'];
  pendingDeliveries: Scalars['Int']['output'];
  totalDeliveries: Scalars['Int']['output'];
}

export enum DeliveryStatus {
  Confirmed = 'CONFIRMED',
  Delivered = 'DELIVERED',
  Failed = 'FAILED',
  InTransit = 'IN_TRANSIT',
  OutForDelivery = 'OUT_FOR_DELIVERY',
  Pending = 'PENDING',
  PickedUp = 'PICKED_UP',
  Returned = 'RETURNED'
}

export interface DeliveryTracking {
  __typename?: 'DeliveryTracking';
  actualDelivery?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  deliveryAddress?: Maybe<Address>;
  dimensions?: Maybe<Scalars['String']['output']>;
  driverName?: Maybe<Scalars['String']['output']>;
  driverPhone?: Maybe<Scalars['String']['output']>;
  estimatedDelivery?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
  orderId: Scalars['ID']['output'];
  pickupAddress?: Maybe<Address>;
  pickupDate?: Maybe<Scalars['String']['output']>;
  provider: DeliveryProvider;
  providerId: Scalars['ID']['output'];
  status: DeliveryStatus;
  trackingEvents: Array<TrackingEvent>;
  trackingNumber: Scalars['String']['output'];
  trackingUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
}

export interface DeliveryZone {
  __typename?: 'DeliveryZone';
  coordinates?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  providers: Array<ProviderZone>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export enum DevicePlatform {
  Android = 'ANDROID',
  Ios = 'IOS',
  Web = 'WEB'
}

export interface DeviceToken {
  __typename?: 'DeviceToken';
  appVersion?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  deviceModel?: Maybe<Scalars['String']['output']>;
  deviceName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastUsed: Scalars['String']['output'];
  osVersion?: Maybe<Scalars['String']['output']>;
  platform: DevicePlatform;
  token: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
}

export interface EmailVerification {
  __typename?: 'EmailVerification';
  email: Scalars['String']['output'];
  sent: Scalars['Boolean']['output'];
}

export interface Enable2FaInput {
  code: Scalars['String']['input'];
}

export interface ForgotPasswordInput {
  email: Scalars['String']['input'];
}

export interface LoginInput {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  rememberMe?: InputMaybe<Scalars['Boolean']['input']>;
  twoFactorCode?: InputMaybe<Scalars['String']['input']>;
}

export interface ModerateReviewInput {
  reason?: InputMaybe<Scalars['String']['input']>;
  status: ReviewStatus;
}

export interface Mutation {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  addToCart: CartItem;
  addTrackingEvent: DeliveryTracking;
  approveReview: Review;
  archiveProduct: Product;
  bulkModerateReviews: Array<Review>;
  buyNow: Order;
  cancelOrder: Order;
  changePassword: Scalars['Boolean']['output'];
  changeUserRole: User;
  clearCart: Scalars['Boolean']['output'];
  clickNotification: Notification;
  confirmOrder: Order;
  createCategory: Category;
  createDeliveryOption: DeliveryOption;
  createDeliveryProvider: DeliveryProvider;
  createDeliveryTracking: DeliveryTracking;
  createDeliveryZone: DeliveryZone;
  createNotification: Notification;
  createNotificationTemplate: NotificationTemplate;
  createOrder: Order;
  createProduct: Product;
  createProductVariant: ProductVariant;
  createReview: Review;
  deleteCategory: Scalars['Boolean']['output'];
  deleteDeliveryOption: Scalars['Boolean']['output'];
  deleteDeliveryProvider: Scalars['Boolean']['output'];
  deleteDeliveryZone: Scalars['Boolean']['output'];
  deleteNotificationTemplate: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteProductVariant: Scalars['Boolean']['output'];
  deleteReview: Scalars['Boolean']['output'];
  deleteReviewResponse: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deliverOrder: Order;
  disableTwoFactor: Scalars['Boolean']['output'];
  dismissNotification: Notification;
  duplicateProduct: Product;
  enableTwoFactor: Scalars['Boolean']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  generateBackupCodes: Array<Scalars['String']['output']>;
  hideReview: Review;
  incrementProductView: Product;
  linkSocialAccount: Scalars['Boolean']['output'];
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  logoutAllDevices: Scalars['Boolean']['output'];
  markAllNotificationsAsRead: Scalars['Int']['output'];
  markAsDelivered: DeliveryTracking;
  markNotificationAsRead: Notification;
  moderateReview: Review;
  processRefund: Order;
  publishProduct: Product;
  refreshDeviceToken: DeviceToken;
  refreshSession: AuthPayload;
  register: AuthPayload;
  registerDeviceToken: DeviceToken;
  rejectReview: Review;
  removeFromCart: Scalars['Boolean']['output'];
  removeVote: Review;
  reportReview: ReviewReport;
  requestRefund: Order;
  resendVerificationEmail: EmailVerification;
  resetPassword: Scalars['Boolean']['output'];
  respondToReview: ReviewResponse;
  resubscribeToEmails: Scalars['Boolean']['output'];
  revokeSession: Scalars['Boolean']['output'];
  schedulePickup: DeliveryTracking;
  sendBulkNotification: Array<Notification>;
  sendTestNotification: Array<Notification>;
  sendVerificationEmail: EmailVerification;
  setupTwoFactor: TwoFactorSetup;
  shipOrder: Order;
  socialSignIn: AuthPayload;
  suspendUser: User;
  toggleProductFavorite: Product;
  unlinkSocialAccount: Scalars['Boolean']['output'];
  unpublishProduct: Product;
  unregisterDeviceToken: Scalars['Boolean']['output'];
  unsubscribeFromEmails: Scalars['Boolean']['output'];
  unsuspendUser: User;
  updateCartItem: CartItem;
  updateCategory: Category;
  updateDeliveryOption: DeliveryOption;
  updateDeliveryProvider: DeliveryProvider;
  updateDeliveryStatus: DeliveryTracking;
  updateDeliveryTracking: DeliveryTracking;
  updateDeliveryZone: DeliveryZone;
  updateNotificationPreferences: NotificationPreferences;
  updateNotificationTemplate: NotificationTemplate;
  updateOrder: Order;
  updateProduct: Product;
  updateProductVariant: ProductVariant;
  updateReview: Review;
  updateReviewResponse: ReviewResponse;
  updateUser: User;
  updateUserProfile: UserProfile;
  verifyEmail: Scalars['Boolean']['output'];
  verifyUserEmail: User;
  voteOnReview: Review;
}


export interface MutationAddToCartArgs {
  input: AddToCartInput;
}


export interface MutationAddTrackingEventArgs {
  event: TrackingEventInput;
  id: Scalars['ID']['input'];
}


export interface MutationApproveReviewArgs {
  id: Scalars['ID']['input'];
}


export interface MutationArchiveProductArgs {
  id: Scalars['ID']['input'];
}


export interface MutationBulkModerateReviewsArgs {
  ids: Array<Scalars['ID']['input']>;
  input: ModerateReviewInput;
}


export interface MutationBuyNowArgs {
  input: CreateOrderInput;
}


export interface MutationCancelOrderArgs {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}


export interface MutationChangePasswordArgs {
  input: ChangePasswordInput;
}


export interface MutationChangeUserRoleArgs {
  id: Scalars['ID']['input'];
  role: UserRole;
}


export interface MutationClickNotificationArgs {
  id: Scalars['ID']['input'];
}


export interface MutationConfirmOrderArgs {
  id: Scalars['ID']['input'];
}


export interface MutationCreateCategoryArgs {
  input: CreateCategoryInput;
}


export interface MutationCreateDeliveryOptionArgs {
  input: CreateDeliveryOptionInput;
}


export interface MutationCreateDeliveryProviderArgs {
  input: CreateDeliveryProviderInput;
}


export interface MutationCreateDeliveryTrackingArgs {
  input: CreateTrackingInput;
}


export interface MutationCreateDeliveryZoneArgs {
  input: CreateDeliveryZoneInput;
}


export interface MutationCreateNotificationArgs {
  input: CreateNotificationInput;
}


export interface MutationCreateNotificationTemplateArgs {
  input: CreateTemplateInput;
}


export interface MutationCreateOrderArgs {
  input: CreateOrderInput;
}


export interface MutationCreateProductArgs {
  input: CreateProductInput;
}


export interface MutationCreateProductVariantArgs {
  input: CreateProductVariantInput;
}


export interface MutationCreateReviewArgs {
  input: CreateReviewInput;
}


export interface MutationDeleteCategoryArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteDeliveryOptionArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteDeliveryProviderArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteDeliveryZoneArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteNotificationTemplateArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteProductArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteProductVariantArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteReviewArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteReviewResponseArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeleteUserArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDeliverOrderArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDismissNotificationArgs {
  id: Scalars['ID']['input'];
}


export interface MutationDuplicateProductArgs {
  id: Scalars['ID']['input'];
}


export interface MutationEnableTwoFactorArgs {
  input: Enable2FaInput;
}


export interface MutationForgotPasswordArgs {
  input: ForgotPasswordInput;
}


export interface MutationHideReviewArgs {
  id: Scalars['ID']['input'];
}


export interface MutationIncrementProductViewArgs {
  id: Scalars['ID']['input'];
}


export interface MutationLinkSocialAccountArgs {
  input: SocialSignInInput;
}


export interface MutationLoginArgs {
  input: LoginInput;
}


export interface MutationMarkAsDeliveredArgs {
  deliveredAt?: InputMaybe<Scalars['String']['input']>;
  trackingNumber: Scalars['String']['input'];
}


export interface MutationMarkNotificationAsReadArgs {
  id: Scalars['ID']['input'];
}


export interface MutationModerateReviewArgs {
  id: Scalars['ID']['input'];
  input: ModerateReviewInput;
}


export interface MutationProcessRefundArgs {
  amount?: InputMaybe<Scalars['Float']['input']>;
  orderId: Scalars['ID']['input'];
}


export interface MutationPublishProductArgs {
  id: Scalars['ID']['input'];
}


export interface MutationRefreshDeviceTokenArgs {
  newToken: Scalars['String']['input'];
  oldToken: Scalars['String']['input'];
}


export interface MutationRegisterArgs {
  input: RegisterInput;
}


export interface MutationRegisterDeviceTokenArgs {
  input: RegisterDeviceTokenInput;
}


export interface MutationRejectReviewArgs {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}


export interface MutationRemoveFromCartArgs {
  id: Scalars['ID']['input'];
}


export interface MutationRemoveVoteArgs {
  reviewId: Scalars['ID']['input'];
}


export interface MutationReportReviewArgs {
  input: ReportReviewInput;
}


export interface MutationRequestRefundArgs {
  orderId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}


export interface MutationResetPasswordArgs {
  input: ResetPasswordInput;
}


export interface MutationRespondToReviewArgs {
  input: RespondToReviewInput;
}


export interface MutationResubscribeToEmailsArgs {
  email: Scalars['String']['input'];
}


export interface MutationRevokeSessionArgs {
  sessionId: Scalars['String']['input'];
}


export interface MutationSchedulePickupArgs {
  orderId: Scalars['ID']['input'];
}


export interface MutationSendBulkNotificationArgs {
  input: BulkNotificationInput;
}


export interface MutationSendTestNotificationArgs {
  channels: Array<NotificationChannel>;
  type: NotificationType;
  userId: Scalars['ID']['input'];
}


export interface MutationShipOrderArgs {
  estimatedDelivery?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
}


export interface MutationSocialSignInArgs {
  input: SocialSignInInput;
}


export interface MutationSuspendUserArgs {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}


export interface MutationToggleProductFavoriteArgs {
  id: Scalars['ID']['input'];
}


export interface MutationUnlinkSocialAccountArgs {
  provider: SocialProvider;
}


export interface MutationUnpublishProductArgs {
  id: Scalars['ID']['input'];
}


export interface MutationUnregisterDeviceTokenArgs {
  token: Scalars['String']['input'];
}


export interface MutationUnsubscribeFromEmailsArgs {
  token: Scalars['String']['input'];
}


export interface MutationUnsuspendUserArgs {
  id: Scalars['ID']['input'];
}


export interface MutationUpdateCartItemArgs {
  id: Scalars['ID']['input'];
  input: UpdateCartItemInput;
}


export interface MutationUpdateCategoryArgs {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
}


export interface MutationUpdateDeliveryOptionArgs {
  id: Scalars['ID']['input'];
  input: UpdateDeliveryOptionInput;
}


export interface MutationUpdateDeliveryProviderArgs {
  id: Scalars['ID']['input'];
  input: UpdateDeliveryProviderInput;
}


export interface MutationUpdateDeliveryStatusArgs {
  status: DeliveryStatus;
  trackingNumber: Scalars['String']['input'];
}


export interface MutationUpdateDeliveryTrackingArgs {
  id: Scalars['ID']['input'];
  input: UpdateTrackingInput;
}


export interface MutationUpdateDeliveryZoneArgs {
  id: Scalars['ID']['input'];
  input: UpdateDeliveryZoneInput;
}


export interface MutationUpdateNotificationPreferencesArgs {
  input: UpdateNotificationPreferencesInput;
}


export interface MutationUpdateNotificationTemplateArgs {
  id: Scalars['ID']['input'];
  input: UpdateTemplateInput;
}


export interface MutationUpdateOrderArgs {
  id: Scalars['ID']['input'];
  input: UpdateOrderInput;
}


export interface MutationUpdateProductArgs {
  id: Scalars['ID']['input'];
  input: UpdateProductInput;
}


export interface MutationUpdateProductVariantArgs {
  id: Scalars['ID']['input'];
  input: UpdateProductVariantInput;
}


export interface MutationUpdateReviewArgs {
  id: Scalars['ID']['input'];
  input: UpdateReviewInput;
}


export interface MutationUpdateReviewResponseArgs {
  content: Scalars['String']['input'];
  id: Scalars['ID']['input'];
}


export interface MutationUpdateUserArgs {
  input: UpdateUserInput;
}


export interface MutationUpdateUserProfileArgs {
  input: UpdateUserProfileInput;
}


export interface MutationVerifyEmailArgs {
  input: VerifyEmailInput;
}


export interface MutationVerifyUserEmailArgs {
  id: Scalars['ID']['input'];
}


export interface MutationVoteOnReviewArgs {
  input: VoteOnReviewInput;
}

export interface Notification {
  __typename?: 'Notification';
  actionText?: Maybe<Scalars['String']['output']>;
  actionUrl?: Maybe<Scalars['String']['output']>;
  channel: NotificationChannel;
  clickedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  data?: Maybe<Scalars['JSON']['output']>;
  deliveredAt?: Maybe<Scalars['String']['output']>;
  dismissedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDelivered?: Maybe<Scalars['Boolean']['output']>;
  isRead: Scalars['Boolean']['output'];
  isSent: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  priority: NotificationPriority;
  readAt?: Maybe<Scalars['String']['output']>;
  relatedEntity?: Maybe<NotificationEntity>;
  relatedEntityId?: Maybe<Scalars['ID']['output']>;
  relatedEntityType?: Maybe<Scalars['String']['output']>;
  scheduledFor?: Maybe<Scalars['String']['output']>;
  sentAt?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: NotificationType;
  updatedAt: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
}

export enum NotificationChannel {
  Email = 'EMAIL',
  InApp = 'IN_APP',
  Push = 'PUSH',
  Sms = 'SMS'
}

export interface NotificationChannelCount {
  __typename?: 'NotificationChannelCount';
  channel: NotificationChannel;
  count: Scalars['Int']['output'];
}

export interface NotificationEdge {
  __typename?: 'NotificationEdge';
  cursor: Scalars['String']['output'];
  node: Notification;
}

export type NotificationEntity = Order | Product | Review | User;

export interface NotificationFilter {
  channel?: InputMaybe<NotificationChannel>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<NotificationPriority>;
  type?: InputMaybe<NotificationType>;
}

export interface NotificationPreferences {
  __typename?: 'NotificationPreferences';
  createdAt: Scalars['String']['output'];
  emailFrequency: Scalars['String']['output'];
  emailNewsletter: Scalars['Boolean']['output'];
  emailOrderUpdates: Scalars['Boolean']['output'];
  emailPromotions: Scalars['Boolean']['output'];
  emailReviews: Scalars['Boolean']['output'];
  emailSecurity: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  inAppOrderUpdates: Scalars['Boolean']['output'];
  inAppPromotions: Scalars['Boolean']['output'];
  inAppReviews: Scalars['Boolean']['output'];
  inAppSecurity: Scalars['Boolean']['output'];
  pushOrderUpdates: Scalars['Boolean']['output'];
  pushPromotions: Scalars['Boolean']['output'];
  pushReviews: Scalars['Boolean']['output'];
  pushSecurity: Scalars['Boolean']['output'];
  quietHoursEnd: Scalars['String']['output'];
  quietHoursStart: Scalars['String']['output'];
  smsOrderUpdates: Scalars['Boolean']['output'];
  smsPromotions: Scalars['Boolean']['output'];
  smsSecurity: Scalars['Boolean']['output'];
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
}

export enum NotificationPriority {
  High = 'HIGH',
  Low = 'LOW',
  Normal = 'NORMAL',
  Urgent = 'URGENT'
}

export interface NotificationStats {
  __typename?: 'NotificationStats';
  notificationsByChannel: Array<NotificationChannelCount>;
  notificationsByType: Array<NotificationTypeCount>;
  recentNotifications: Array<Notification>;
  totalNotifications: Scalars['Int']['output'];
  unreadNotifications: Scalars['Int']['output'];
}

export interface NotificationTemplate {
  __typename?: 'NotificationTemplate';
  actionTextTemplate?: Maybe<Scalars['String']['output']>;
  actionUrlTemplate?: Maybe<Scalars['String']['output']>;
  channel: NotificationChannel;
  createdAt: Scalars['String']['output'];
  emailHtml?: Maybe<Scalars['String']['output']>;
  emailSubject?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  messageTemplate: Scalars['String']['output'];
  titleTemplate: Scalars['String']['output'];
  type: NotificationType;
  updatedAt: Scalars['String']['output'];
  variables?: Maybe<Scalars['JSON']['output']>;
}

export enum NotificationType {
  AccountCreated = 'ACCOUNT_CREATED',
  Custom = 'CUSTOM',
  EmailVerified = 'EMAIL_VERIFIED',
  NewReview = 'NEW_REVIEW',
  OrderCancelled = 'ORDER_CANCELLED',
  OrderConfirmed = 'ORDER_CONFIRMED',
  OrderCreated = 'ORDER_CREATED',
  OrderDelivered = 'ORDER_DELIVERED',
  OrderShipped = 'ORDER_SHIPPED',
  PasswordChanged = 'PASSWORD_CHANGED',
  PaymentFailed = 'PAYMENT_FAILED',
  PaymentSuccess = 'PAYMENT_SUCCESS',
  ProductLowStock = 'PRODUCT_LOW_STOCK',
  ProductOutOfStock = 'PRODUCT_OUT_OF_STOCK',
  ProfileUpdated = 'PROFILE_UPDATED',
  PromotionAlert = 'PROMOTION_ALERT',
  ReviewResponse = 'REVIEW_RESPONSE',
  SecurityAlert = 'SECURITY_ALERT',
  SystemMaintenance = 'SYSTEM_MAINTENANCE'
}

export interface NotificationTypeCount {
  __typename?: 'NotificationTypeCount';
  count: Scalars['Int']['output'];
  type: NotificationType;
}

export interface NotificationsConnection {
  __typename?: 'NotificationsConnection';
  edges: Array<NotificationEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
}

export interface Order {
  __typename?: 'Order';
  actualDelivery?: Maybe<Scalars['String']['output']>;
  billingAddress?: Maybe<Address>;
  buyer: User;
  buyerId: Scalars['ID']['output'];
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  confirmedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  deliveredAt?: Maybe<Scalars['String']['output']>;
  discountAmount: Scalars['Float']['output'];
  estimatedDelivery?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  itemCount: Scalars['Int']['output'];
  items: Array<OrderItem>;
  notes?: Maybe<Scalars['String']['output']>;
  orderNumber: Scalars['String']['output'];
  paymentMethod?: Maybe<PaymentMethod>;
  paymentStatus: PaymentStatus;
  refundReason?: Maybe<Scalars['String']['output']>;
  seller: User;
  sellerId: Scalars['ID']['output'];
  shippedAt?: Maybe<Scalars['String']['output']>;
  shippingAddress?: Maybe<Address>;
  shippingAmount: Scalars['Float']['output'];
  shippingMethod?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  subtotal: Scalars['Float']['output'];
  taxAmount: Scalars['Float']['output'];
  totalAmount: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
}

export interface OrderEdge {
  __typename?: 'OrderEdge';
  cursor: Scalars['String']['output'];
  node: Order;
}

export interface OrderFilter {
  buyerId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  maxAmount?: InputMaybe<Scalars['Float']['input']>;
  minAmount?: InputMaybe<Scalars['Float']['input']>;
  paymentMethod?: InputMaybe<PaymentMethod>;
  paymentStatus?: InputMaybe<PaymentStatus>;
  sellerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<OrderStatus>;
}

export interface OrderItem {
  __typename?: 'OrderItem';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  orderId: Scalars['ID']['output'];
  product?: Maybe<Product>;
  productId: Scalars['ID']['output'];
  productImage?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSku?: Maybe<Scalars['String']['output']>;
  productVariant?: Maybe<ProductVariant>;
  productVariantId?: Maybe<Scalars['ID']['output']>;
  quantity: Scalars['Int']['output'];
  totalPrice: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
  variantName?: Maybe<Scalars['String']['output']>;
  variantValue?: Maybe<Scalars['String']['output']>;
}

export interface OrderItemInput {
  productId: Scalars['ID']['input'];
  productVariantId?: InputMaybe<Scalars['ID']['input']>;
  quantity: Scalars['Int']['input'];
}

export interface OrderStats {
  __typename?: 'OrderStats';
  averageOrderValue: Scalars['Float']['output'];
  cancelledOrders: Scalars['Int']['output'];
  confirmedOrders: Scalars['Int']['output'];
  deliveredOrders: Scalars['Int']['output'];
  ordersByStatus: Array<OrderStatusCount>;
  pendingOrders: Scalars['Int']['output'];
  recentOrders: Array<Order>;
  shippedOrders: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
}

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Delivered = 'DELIVERED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED',
  Shipped = 'SHIPPED'
}

export interface OrderStatusCount {
  __typename?: 'OrderStatusCount';
  count: Scalars['Int']['output'];
  status: OrderStatus;
}

export interface OrdersConnection {
  __typename?: 'OrdersConnection';
  edges: Array<OrderEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface PageInfo {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
}

export interface PaginatedResponse {
  __typename?: 'PaginatedResponse';
  hasMore: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
}

export interface PaginationInput {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}

export enum PaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  Card = 'CARD',
  CashOnDelivery = 'CASH_ON_DELIVERY',
  MobileMoney = 'MOBILE_MONEY',
  Wallet = 'WALLET'
}

export enum PaymentStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED'
}

export interface Product {
  __typename?: 'Product';
  allowReviews: Scalars['Boolean']['output'];
  averageRating: Scalars['Float']['output'];
  category: Category;
  categoryId: Scalars['ID']['output'];
  condition: ProductCondition;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dimensions?: Maybe<Scalars['String']['output']>;
  favoriteCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  images: Array<Scalars['String']['output']>;
  isDigital: Scalars['Boolean']['output'];
  maxOrderQuantity?: Maybe<Scalars['Int']['output']>;
  minOrderQuantity?: Maybe<Scalars['Int']['output']>;
  originalPrice?: Maybe<Scalars['Float']['output']>;
  price: Scalars['Float']['output'];
  publishedAt?: Maybe<Scalars['String']['output']>;
  reviewCount: Scalars['Int']['output'];
  reviews: Array<Review>;
  seller?: Maybe<User>;
  sellerId: Scalars['ID']['output'];
  shippingRequired: Scalars['Boolean']['output'];
  shortDescription?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  soldCount: Scalars['Int']['output'];
  status: ProductStatus;
  stock: Scalars['Int']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  variants: Array<ProductVariant>;
  viewCount: Scalars['Int']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
}

export enum ProductCondition {
  Fair = 'FAIR',
  Good = 'GOOD',
  LikeNew = 'LIKE_NEW',
  New = 'NEW',
  Poor = 'POOR'
}

export interface ProductEdge {
  __typename?: 'ProductEdge';
  cursor: Scalars['String']['output'];
  node: Product;
}

export interface ProductFilter {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  condition?: InputMaybe<ProductCondition>;
  inStock?: InputMaybe<Scalars['Boolean']['input']>;
  isDigital?: InputMaybe<Scalars['Boolean']['input']>;
  priceMax?: InputMaybe<Scalars['Float']['input']>;
  priceMin?: InputMaybe<Scalars['Float']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sellerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<ProductStatus>;
}

export interface ProductReviewSummary {
  __typename?: 'ProductReviewSummary';
  averageRating: Scalars['Float']['output'];
  productId: Scalars['ID']['output'];
  ratingDistribution: Array<RatingCount>;
  recentReviews: Array<Review>;
  topReviews: Array<Review>;
  totalReviews: Scalars['Int']['output'];
}

export interface ProductStats {
  __typename?: 'ProductStats';
  activeProducts: Scalars['Int']['output'];
  archivedProducts: Scalars['Int']['output'];
  averagePrice: Scalars['Float']['output'];
  draftProducts: Scalars['Int']['output'];
  inactiveProducts: Scalars['Int']['output'];
  productsByCategory: Array<CategoryProductCount>;
  totalProducts: Scalars['Int']['output'];
  totalSales: Scalars['Int']['output'];
  totalViews: Scalars['Int']['output'];
}

export enum ProductStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Inactive = 'INACTIVE'
}

export interface ProductVariant {
  __typename?: 'ProductVariant';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  productId: Scalars['ID']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  stock: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  value: Scalars['String']['output'];
}

export interface ProductsConnection {
  __typename?: 'ProductsConnection';
  edges: Array<ProductEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface ProviderZone {
  __typename?: 'ProviderZone';
  additionalCost: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  deliveryDaysModifier: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  provider: DeliveryProvider;
  providerId: Scalars['ID']['output'];
  zone: DeliveryZone;
  zoneId: Scalars['ID']['output'];
}

export interface Query {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  availableDeliveryOptions: Array<DeliveryQuote>;
  calculateShipping: Array<DeliveryQuote>;
  canReviewProduct: Scalars['Boolean']['output'];
  categories: CategoriesConnection;
  category?: Maybe<Category>;
  categoryBySlug?: Maybe<Category>;
  deliveryOption?: Maybe<DeliveryOption>;
  deliveryOptions: Array<DeliveryOption>;
  deliveryProvider?: Maybe<DeliveryProvider>;
  deliveryProviders: Array<DeliveryProvider>;
  deliveryStats: DeliveryStats;
  deliveryTracking?: Maybe<DeliveryTracking>;
  deliveryZone?: Maybe<DeliveryZone>;
  deliveryZones: Array<DeliveryZone>;
  featuredProducts: Array<Product>;
  me?: Maybe<User>;
  myCart: Cart;
  myDeviceTokens: Array<DeviceToken>;
  myNotificationPreferences: NotificationPreferences;
  myNotifications: NotificationsConnection;
  myOrders: OrdersConnection;
  myPurchases: OrdersConnection;
  myReviews: ReviewsConnection;
  mySales: OrdersConnection;
  myTransactions: Array<WalletTransaction>;
  notification?: Maybe<Notification>;
  notificationStats: NotificationStats;
  notificationTemplate?: Maybe<NotificationTemplate>;
  notificationTemplates: Array<NotificationTemplate>;
  order?: Maybe<Order>;
  orderByNumber?: Maybe<Order>;
  orderStats: OrderStats;
  orderTracking?: Maybe<DeliveryTracking>;
  orders: OrdersConnection;
  pendingReviews: ReviewsConnection;
  popularProducts: Array<Product>;
  product?: Maybe<Product>;
  productBySlug?: Maybe<Product>;
  productReviewSummary: ProductReviewSummary;
  productReviews: ReviewsConnection;
  productStats: ProductStats;
  products: ProductsConnection;
  relatedProducts: Array<Product>;
  reportedReviews: ReviewsConnection;
  review?: Maybe<Review>;
  reviewStats: ReviewStats;
  reviews: ReviewsConnection;
  searchProducts: Array<Product>;
  sessions: Array<Session>;
  trackDelivery?: Maybe<DeliveryTracking>;
  twoFactorStatus: Scalars['Boolean']['output'];
  unreadNotificationCount: Scalars['Int']['output'];
  user?: Maybe<User>;
  userReviews: ReviewsConnection;
  userStats: UserStats;
  users: UserConnection;
}


export interface QueryAvailableDeliveryOptionsArgs {
  input: DeliveryCalculationInput;
}


export interface QueryCalculateShippingArgs {
  input: DeliveryCalculationInput;
}


export interface QueryCanReviewProductArgs {
  productId: Scalars['ID']['input'];
}


export interface QueryCategoriesArgs {
  filter?: InputMaybe<CategoryFilter>;
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryCategoryArgs {
  id: Scalars['ID']['input'];
}


export interface QueryCategoryBySlugArgs {
  slug: Scalars['String']['input'];
}


export interface QueryDeliveryOptionArgs {
  id: Scalars['ID']['input'];
}


export interface QueryDeliveryOptionsArgs {
  providerId?: InputMaybe<Scalars['ID']['input']>;
}


export interface QueryDeliveryProviderArgs {
  id: Scalars['ID']['input'];
}


export interface QueryDeliveryTrackingArgs {
  id: Scalars['ID']['input'];
}


export interface QueryDeliveryZoneArgs {
  id: Scalars['ID']['input'];
}


export interface QueryFeaturedProductsArgs {
  limit?: InputMaybe<Scalars['Int']['input']>;
}


export interface QueryMyNotificationsArgs {
  filter?: InputMaybe<NotificationFilter>;
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryMyOrdersArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryMyPurchasesArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryMyReviewsArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryMySalesArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryMyTransactionsArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryNotificationArgs {
  id: Scalars['ID']['input'];
}


export interface QueryNotificationTemplateArgs {
  id: Scalars['ID']['input'];
}


export interface QueryOrderArgs {
  id: Scalars['ID']['input'];
}


export interface QueryOrderByNumberArgs {
  orderNumber: Scalars['String']['input'];
}


export interface QueryOrderTrackingArgs {
  orderId: Scalars['ID']['input'];
}


export interface QueryOrdersArgs {
  filter?: InputMaybe<OrderFilter>;
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryPendingReviewsArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryPopularProductsArgs {
  limit?: InputMaybe<Scalars['Int']['input']>;
}


export interface QueryProductArgs {
  id: Scalars['ID']['input'];
}


export interface QueryProductBySlugArgs {
  slug: Scalars['String']['input'];
}


export interface QueryProductReviewSummaryArgs {
  productId: Scalars['ID']['input'];
}


export interface QueryProductReviewsArgs {
  pagination?: InputMaybe<PaginationInput>;
  productId: Scalars['ID']['input'];
}


export interface QueryProductsArgs {
  filter?: InputMaybe<ProductFilter>;
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryRelatedProductsArgs {
  limit?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['ID']['input'];
}


export interface QueryReportedReviewsArgs {
  pagination?: InputMaybe<PaginationInput>;
}


export interface QueryReviewArgs {
  id: Scalars['ID']['input'];
}


export interface QueryReviewsArgs {
  filter?: InputMaybe<ReviewFilter>;
  pagination?: InputMaybe<PaginationInput>;
}


export interface QuerySearchProductsArgs {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
}


export interface QueryTrackDeliveryArgs {
  trackingNumber: Scalars['String']['input'];
}


export interface QueryUserArgs {
  id: Scalars['ID']['input'];
}


export interface QueryUserReviewsArgs {
  pagination?: InputMaybe<PaginationInput>;
  userId: Scalars['ID']['input'];
}


export interface QueryUsersArgs {
  filter?: InputMaybe<UsersFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
}

export interface RatingCount {
  __typename?: 'RatingCount';
  count: Scalars['Int']['output'];
  percentage: Scalars['Float']['output'];
  rating: Scalars['Int']['output'];
}

export interface RegisterDeviceTokenInput {
  appVersion?: InputMaybe<Scalars['String']['input']>;
  deviceModel?: InputMaybe<Scalars['String']['input']>;
  deviceName?: InputMaybe<Scalars['String']['input']>;
  osVersion?: InputMaybe<Scalars['String']['input']>;
  platform: DevicePlatform;
  token: Scalars['String']['input'];
}

export interface RegisterInput {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  inviteCode?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  userType?: InputMaybe<UserRole>;
}

export enum ReportReason {
  CopyrightViolation = 'COPYRIGHT_VIOLATION',
  FakeReview = 'FAKE_REVIEW',
  InappropriateContent = 'INAPPROPRIATE_CONTENT',
  OffensiveLanguage = 'OFFENSIVE_LANGUAGE',
  Other = 'OTHER',
  Spam = 'SPAM'
}

export interface ReportReviewInput {
  description?: InputMaybe<Scalars['String']['input']>;
  reason: ReportReason;
  reviewId: Scalars['ID']['input'];
}

export interface ResetPasswordInput {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
}

export interface RespondToReviewInput {
  content: Scalars['String']['input'];
  reviewId: Scalars['ID']['input'];
}

export interface Review {
  __typename?: 'Review';
  canDelete: Scalars['Boolean']['output'];
  canEdit: Scalars['Boolean']['output'];
  content?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  helpfulVotes: Scalars['Int']['output'];
  helpfulnessRatio: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  images: Array<Scalars['String']['output']>;
  isAnonymous: Scalars['Boolean']['output'];
  isVerifiedPurchase: Scalars['Boolean']['output'];
  moderatedAt?: Maybe<Scalars['String']['output']>;
  moderatedBy?: Maybe<Scalars['ID']['output']>;
  moderationReason?: Maybe<Scalars['String']['output']>;
  moderator?: Maybe<User>;
  order?: Maybe<Order>;
  orderId?: Maybe<Scalars['ID']['output']>;
  orderItem?: Maybe<OrderItem>;
  orderItemId?: Maybe<Scalars['ID']['output']>;
  product: Product;
  productId: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  reports: Array<ReviewReport>;
  responses: Array<ReviewResponse>;
  status: ReviewStatus;
  title?: Maybe<Scalars['String']['output']>;
  totalVotes: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
  userVote?: Maybe<VoteType>;
  votes: Array<ReviewVote>;
}

export interface ReviewEdge {
  __typename?: 'ReviewEdge';
  cursor: Scalars['String']['output'];
  node: Review;
}

export interface ReviewFilter {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  hasImages?: InputMaybe<Scalars['Boolean']['input']>;
  isVerifiedPurchase?: InputMaybe<Scalars['Boolean']['input']>;
  productId?: InputMaybe<Scalars['ID']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ReviewStatus>;
  userId?: InputMaybe<Scalars['ID']['input']>;
}

export interface ReviewReport {
  __typename?: 'ReviewReport';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  reason: ReportReason;
  reporter: User;
  reporterId: Scalars['ID']['output'];
  resolution?: Maybe<Scalars['String']['output']>;
  reviewId: Scalars['ID']['output'];
  reviewedAt?: Maybe<Scalars['String']['output']>;
  reviewedBy?: Maybe<Scalars['ID']['output']>;
  reviewer?: Maybe<User>;
  status: Scalars['String']['output'];
}

export interface ReviewResponse {
  __typename?: 'ReviewResponse';
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reviewId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
}

export interface ReviewStats {
  __typename?: 'ReviewStats';
  averageRating: Scalars['Float']['output'];
  pendingReviews: Scalars['Int']['output'];
  ratingDistribution: Array<RatingCount>;
  reportedReviews: Scalars['Int']['output'];
  totalReviews: Scalars['Int']['output'];
  verifiedPurchaseReviews: Scalars['Int']['output'];
}

export enum ReviewStatus {
  Approved = 'APPROVED',
  Hidden = 'HIDDEN',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export interface ReviewVote {
  __typename?: 'ReviewVote';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reviewId: Scalars['ID']['output'];
  user: User;
  userId: Scalars['ID']['output'];
  voteType: VoteType;
}

export interface ReviewsConnection {
  __typename?: 'ReviewsConnection';
  edges: Array<ReviewEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface Session {
  __typename?: 'Session';
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
}

export enum SocialProvider {
  Apple = 'APPLE',
  Facebook = 'FACEBOOK',
  Github = 'GITHUB',
  Google = 'GOOGLE'
}

export interface SocialSignInInput {
  code: Scalars['String']['input'];
  provider: SocialProvider;
  redirectUri?: InputMaybe<Scalars['String']['input']>;
}

export interface Subscription {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
  notificationReceived: Notification;
  notificationUpdated: Notification;
}


export interface SubscriptionNotificationReceivedArgs {
  userId: Scalars['ID']['input'];
}


export interface SubscriptionNotificationUpdatedArgs {
  userId: Scalars['ID']['input'];
}

export interface TrackingEvent {
  __typename?: 'TrackingEvent';
  description: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
}

export interface TrackingEventInput {
  description: Scalars['String']['input'];
  details?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  timestamp: Scalars['String']['input'];
}

export enum TransactionType {
  Bonus = 'BONUS',
  Commission = 'COMMISSION',
  Deposit = 'DEPOSIT',
  Payment = 'PAYMENT',
  Refund = 'REFUND',
  Withdrawal = 'WITHDRAWAL'
}

export interface TwoFactorSetup {
  __typename?: 'TwoFactorSetup';
  backupCodes: Array<Scalars['String']['output']>;
  qrCode: Scalars['String']['output'];
  secret: Scalars['String']['output'];
}

export interface UpdateCartItemInput {
  quantity: Scalars['Int']['input'];
}

export interface UpdateCategoryInput {
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
}

export interface UpdateDeliveryOptionInput {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
  freeShippingThreshold?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDays?: InputMaybe<Scalars['Int']['input']>;
  maxDimensions?: InputMaybe<Scalars['String']['input']>;
  maxWeight?: InputMaybe<Scalars['Float']['input']>;
  method?: InputMaybe<DeliveryMethod>;
  name?: InputMaybe<Scalars['String']['input']>;
  pricePerKg?: InputMaybe<Scalars['Float']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
}

export interface UpdateDeliveryProviderInput {
  apiBaseUrl?: InputMaybe<Scalars['String']['input']>;
  apiKey?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  coverageAreas?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<DeliveryProviderStatus>;
  supportsCOD?: InputMaybe<Scalars['Boolean']['input']>;
  supportsTracking?: InputMaybe<Scalars['Boolean']['input']>;
  trackingUrlPattern?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateDeliveryZoneInput {
  coordinates?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateNotificationPreferencesInput {
  emailFrequency?: InputMaybe<Scalars['String']['input']>;
  emailNewsletter?: InputMaybe<Scalars['Boolean']['input']>;
  emailOrderUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  emailPromotions?: InputMaybe<Scalars['Boolean']['input']>;
  emailReviews?: InputMaybe<Scalars['Boolean']['input']>;
  emailSecurity?: InputMaybe<Scalars['Boolean']['input']>;
  inAppOrderUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  inAppPromotions?: InputMaybe<Scalars['Boolean']['input']>;
  inAppReviews?: InputMaybe<Scalars['Boolean']['input']>;
  inAppSecurity?: InputMaybe<Scalars['Boolean']['input']>;
  pushOrderUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  pushPromotions?: InputMaybe<Scalars['Boolean']['input']>;
  pushReviews?: InputMaybe<Scalars['Boolean']['input']>;
  pushSecurity?: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursEnd?: InputMaybe<Scalars['String']['input']>;
  quietHoursStart?: InputMaybe<Scalars['String']['input']>;
  smsOrderUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  smsPromotions?: InputMaybe<Scalars['Boolean']['input']>;
  smsSecurity?: InputMaybe<Scalars['Boolean']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateOrderInput {
  estimatedDelivery?: InputMaybe<Scalars['String']['input']>;
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentStatus?: InputMaybe<PaymentStatus>;
  shippingMethod?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrderStatus>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateProductInput {
  allowReviews?: InputMaybe<Scalars['Boolean']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  condition?: InputMaybe<ProductCondition>;
  description?: InputMaybe<Scalars['String']['input']>;
  dimensions?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isDigital?: InputMaybe<Scalars['Boolean']['input']>;
  maxOrderQuantity?: InputMaybe<Scalars['Int']['input']>;
  minOrderQuantity?: InputMaybe<Scalars['Int']['input']>;
  originalPrice?: InputMaybe<Scalars['Float']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  shippingRequired?: InputMaybe<Scalars['Boolean']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ProductStatus>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
}

export interface UpdateProductVariantInput {
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateReviewInput {
  content?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isAnonymous?: InputMaybe<Scalars['Boolean']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateTemplateInput {
  actionTextTemplate?: InputMaybe<Scalars['String']['input']>;
  actionUrlTemplate?: InputMaybe<Scalars['String']['input']>;
  emailHtml?: InputMaybe<Scalars['String']['input']>;
  emailSubject?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  messageTemplate?: InputMaybe<Scalars['String']['input']>;
  titleTemplate?: InputMaybe<Scalars['String']['input']>;
  variables?: InputMaybe<Scalars['JSON']['input']>;
}

export interface UpdateTrackingInput {
  actualDelivery?: InputMaybe<Scalars['String']['input']>;
  driverName?: InputMaybe<Scalars['String']['input']>;
  driverPhone?: InputMaybe<Scalars['String']['input']>;
  estimatedDelivery?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  pickupDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<DeliveryStatus>;
}

export interface UpdateUserInput {
  avatar?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
}

export interface UpdateUserProfileInput {
  address?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  marketingEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  notificationsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
}

export interface User {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  phoneVerified: Scalars['Boolean']['output'];
  profile?: Maybe<UserProfile>;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
  userType: UserRole;
  wallet?: Maybe<Wallet>;
}

export interface UserConnection {
  __typename?: 'UserConnection';
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
}

export interface UserEdge {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
}

export interface UserProfile {
  __typename?: 'UserProfile';
  address?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  language: Scalars['String']['output'];
  marketingEnabled: Scalars['Boolean']['output'];
  notificationsEnabled: Scalars['Boolean']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
  zipCode?: Maybe<Scalars['String']['output']>;
}

export enum UserRole {
  Admin = 'ADMIN',
  Buyer = 'BUYER',
  Seller = 'SELLER'
}

export interface UserStats {
  __typename?: 'UserStats';
  activeUsers: Scalars['Int']['output'];
  recentRegistrations: Array<User>;
  suspendedUsers: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
  usersByType: Array<UserTypeCount>;
}

export enum UserStatus {
  Active = 'ACTIVE',
  PendingVerification = 'PENDING_VERIFICATION',
  Suspended = 'SUSPENDED'
}

export interface UserTypeCount {
  __typename?: 'UserTypeCount';
  count: Scalars['Int']['output'];
  type: UserRole;
}

export interface UsersFilterInput {
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  emailVerified?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UserStatus>;
  userType?: InputMaybe<UserRole>;
}

export interface VerifyEmailInput {
  token: Scalars['String']['input'];
}

export interface VoteOnReviewInput {
  reviewId: Scalars['ID']['input'];
  voteType: VoteType;
}

export enum VoteType {
  Helpful = 'HELPFUL',
  NotHelpful = 'NOT_HELPFUL'
}

export interface Wallet {
  __typename?: 'Wallet';
  balance: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  frozenBalance: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  totalEarnings: Scalars['Float']['output'];
  totalSpent: Scalars['Float']['output'];
  transactions: Array<WalletTransaction>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
}

export interface WalletTransaction {
  __typename?: 'WalletTransaction';
  amount: Scalars['Float']['output'];
  balanceAfter: Scalars['Float']['output'];
  balanceBefore: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  order?: Maybe<Order>;
  orderId?: Maybe<Scalars['ID']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  type: TransactionType;
  walletId: Scalars['ID']['output'];
}

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export interface RegisterMutation { register: { token: string | null | undefined, user: { id: string, email: string, firstName: string, lastName: string, userType: UserRole, status: UserStatus, emailVerified: boolean, phoneVerified: boolean } } }

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export interface LoginMutation { login: { token: string | null | undefined, user: { id: string, email: string, firstName: string, lastName: string, avatar: string | null | undefined, userType: UserRole, status: UserStatus, emailVerified: boolean, phoneVerified: boolean, lastLoginAt: string | null | undefined, wallet: { id: string, balance: number, frozenBalance: number, totalEarnings: number, totalSpent: number } | null | undefined, profile: { id: string, bio: string | null | undefined, address: string | null | undefined, city: string | null | undefined, zipCode: string | null | undefined, country: string | null | undefined, language: string, notificationsEnabled: boolean, marketingEnabled: boolean } | null | undefined } } }

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export interface LogoutMutation { logout: boolean }

export type LogoutAllDevicesMutationVariables = Exact<{ [key: string]: never; }>;


export interface LogoutAllDevicesMutation { logoutAllDevices: boolean }

export type ForgotPasswordMutationVariables = Exact<{
  input: ForgotPasswordInput;
}>;


export interface ForgotPasswordMutation { forgotPassword: boolean }

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export interface ResetPasswordMutation { resetPassword: boolean }

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export interface ChangePasswordMutation { changePassword: boolean }

export type SendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export interface SendVerificationEmailMutation { sendVerificationEmail: { sent: boolean, email: string } }

export type VerifyEmailMutationVariables = Exact<{
  input: VerifyEmailInput;
}>;


export interface VerifyEmailMutation { verifyEmail: boolean }

export type ResendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export interface ResendVerificationEmailMutation { resendVerificationEmail: { sent: boolean, email: string } }

export type SetupTwoFactorMutationVariables = Exact<{ [key: string]: never; }>;


export interface SetupTwoFactorMutation { setupTwoFactor: { secret: string, qrCode: string, backupCodes: Array<string> } }

export type EnableTwoFactorMutationVariables = Exact<{
  input: Enable2FaInput;
}>;


export interface EnableTwoFactorMutation { enableTwoFactor: boolean }

export type DisableTwoFactorMutationVariables = Exact<{ [key: string]: never; }>;


export interface DisableTwoFactorMutation { disableTwoFactor: boolean }

export type GenerateBackupCodesMutationVariables = Exact<{ [key: string]: never; }>;


export interface GenerateBackupCodesMutation { generateBackupCodes: Array<string> }

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export interface UpdateUserProfileMutation { updateUserProfile: { id: string, bio: string | null | undefined, address: string | null | undefined, city: string | null | undefined, zipCode: string | null | undefined, country: string | null | undefined, language: string, notificationsEnabled: boolean, marketingEnabled: boolean, updatedAt: string } }

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export interface MeQuery { me: { id: string, email: string, phone: string | null | undefined, firstName: string, lastName: string, avatar: string | null | undefined, userType: UserRole, status: UserStatus, emailVerified: boolean, phoneVerified: boolean, lastLoginAt: string | null | undefined, createdAt: string, updatedAt: string, profile: { id: string, bio: string | null | undefined, address: string | null | undefined, city: string | null | undefined, zipCode: string | null | undefined, country: string | null | undefined, language: string, notificationsEnabled: boolean, marketingEnabled: boolean } | null | undefined, wallet: { id: string, balance: number, frozenBalance: number, totalEarnings: number, totalSpent: number } | null | undefined } | null | undefined }

export type MyOrdersQueryVariables = Exact<{
  pagination?: PaginationInput | null | undefined;
}>;


export interface MyOrdersQuery { myOrders: { totalCount: number, edges: Array<{ node: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod: PaymentMethod | null | undefined, subtotal: number, taxAmount: number, shippingAmount: number, discountAmount: number, totalAmount: number, currency: string, itemCount: number, trackingNumber: string | null | undefined, estimatedDelivery: string | null | undefined, actualDelivery: string | null | undefined, createdAt: string, updatedAt: string, confirmedAt: string | null | undefined, shippedAt: string | null | undefined, deliveredAt: string | null | undefined, seller: { id: string, firstName: string, lastName: string, avatar: string | null | undefined }, items: Array<{ id: string, productName: string, productImage: string | null | undefined, productSku: string | null | undefined, unitPrice: number, quantity: number, totalPrice: number, variantName: string | null | undefined, variantValue: string | null | undefined }>, shippingAddress: { street: string, city: string, state: string | null | undefined, postalCode: string | null | undefined, country: string, phone: string | null | undefined, name: string | null | undefined } | null | undefined } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null | undefined, endCursor: string | null | undefined } } }

export type MyPurchasesQueryVariables = Exact<{
  pagination?: PaginationInput | null | undefined;
}>;


export interface MyPurchasesQuery { myPurchases: { totalCount: number, edges: Array<{ node: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, totalAmount: number, currency: string, itemCount: number, createdAt: string, deliveredAt: string | null | undefined, seller: { id: string, firstName: string, lastName: string, avatar: string | null | undefined }, items: Array<{ id: string, productName: string, productImage: string | null | undefined, quantity: number, unitPrice: number, totalPrice: number }> } }> } }

export type MySalesQueryVariables = Exact<{
  pagination?: PaginationInput | null | undefined;
}>;


export interface MySalesQuery { mySales: { totalCount: number, edges: Array<{ node: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, totalAmount: number, currency: string, itemCount: number, createdAt: string, confirmedAt: string | null | undefined, shippedAt: string | null | undefined, buyer: { id: string, firstName: string, lastName: string, avatar: string | null | undefined }, items: Array<{ id: string, productName: string, productImage: string | null | undefined, quantity: number, unitPrice: number, totalPrice: number }>, shippingAddress: { street: string, city: string, state: string | null | undefined, postalCode: string | null | undefined, country: string, phone: string | null | undefined, name: string | null | undefined } | null | undefined } }> } }

export type OrderQueryVariables = Exact<{
  id: string | number;
}>;


export interface OrderQuery { order: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, paymentMethod: PaymentMethod | null | undefined, subtotal: number, taxAmount: number, shippingAmount: number, discountAmount: number, totalAmount: number, currency: string, shippingMethod: string | null | undefined, trackingNumber: string | null | undefined, estimatedDelivery: string | null | undefined, actualDelivery: string | null | undefined, notes: string | null | undefined, cancelReason: string | null | undefined, refundReason: string | null | undefined, createdAt: string, updatedAt: string, confirmedAt: string | null | undefined, shippedAt: string | null | undefined, deliveredAt: string | null | undefined, cancelledAt: string | null | undefined, buyer: { id: string, firstName: string, lastName: string, email: string, phone: string | null | undefined, avatar: string | null | undefined }, seller: { id: string, firstName: string, lastName: string, email: string, phone: string | null | undefined, avatar: string | null | undefined }, items: Array<{ id: string, productId: string, productVariantId: string | null | undefined, productName: string, productImage: string | null | undefined, productSku: string | null | undefined, unitPrice: number, quantity: number, totalPrice: number, variantName: string | null | undefined, variantValue: string | null | undefined, product: { id: string, title: string, slug: string, images: Array<string> } | null | undefined, productVariant: { id: string, name: string, value: string } | null | undefined }>, shippingAddress: { street: string, city: string, state: string | null | undefined, postalCode: string | null | undefined, country: string, phone: string | null | undefined, name: string | null | undefined } | null | undefined, billingAddress: { street: string, city: string, state: string | null | undefined, postalCode: string | null | undefined, country: string, phone: string | null | undefined, name: string | null | undefined } | null | undefined } | null | undefined }

export type MyCartQueryVariables = Exact<{ [key: string]: never; }>;


export interface MyCartQuery { myCart: { itemCount: number, subtotal: number, currency: string, updatedAt: string, items: Array<{ id: string, productId: string, productVariantId: string | null | undefined, quantity: number, unitPrice: number, totalPrice: number, addedAt: string, updatedAt: string, product: { id: string, title: string, slug: string, price: number, originalPrice: number | null | undefined, stock: number, images: Array<string>, isDigital: boolean, shippingRequired: boolean, seller: { id: string, firstName: string, lastName: string } | null | undefined, category: { id: string, name: string } }, productVariant: { id: string, name: string, value: string, price: number | null | undefined, stock: number, image: string | null | undefined } | null | undefined }> } }

export type MyTransactionsQueryVariables = Exact<{
  pagination?: PaginationInput | null | undefined;
}>;


export interface MyTransactionsQuery { myTransactions: Array<{ id: string, type: TransactionType, amount: number, currency: string, balanceBefore: number, balanceAfter: number, description: string | null | undefined, reference: string | null | undefined, status: string, createdAt: string, order: { id: string, orderNumber: string } | null | undefined }> }

export type CreateOrderMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export interface CreateOrderMutation { createOrder: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, totalAmount: number, currency: string, createdAt: string, seller: { id: string, firstName: string, lastName: string }, items: Array<{ id: string, productName: string, quantity: number, unitPrice: number, totalPrice: number }> } }

export type UpdateOrderMutationVariables = Exact<{
  id: string | number;
  input: UpdateOrderInput;
}>;


export interface UpdateOrderMutation { updateOrder: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, trackingNumber: string | null | undefined, estimatedDelivery: string | null | undefined, updatedAt: string } }

export type CancelOrderMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export interface CancelOrderMutation { cancelOrder: { id: string, status: OrderStatus, cancelReason: string | null | undefined, cancelledAt: string | null | undefined } }

export type ConfirmOrderMutationVariables = Exact<{
  id: string | number;
}>;


export interface ConfirmOrderMutation { confirmOrder: { id: string, status: OrderStatus, paymentStatus: PaymentStatus, confirmedAt: string | null | undefined } }

export type ShipOrderMutationVariables = Exact<{
  id: string | number;
  trackingNumber?: string | null | undefined;
  estimatedDelivery?: string | null | undefined;
}>;


export interface ShipOrderMutation { shipOrder: { id: string, status: OrderStatus, trackingNumber: string | null | undefined, estimatedDelivery: string | null | undefined, shippedAt: string | null | undefined } }

export type DeliverOrderMutationVariables = Exact<{
  id: string | number;
}>;


export interface DeliverOrderMutation { deliverOrder: { id: string, status: OrderStatus, actualDelivery: string | null | undefined, deliveredAt: string | null | undefined } }

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export interface AddToCartMutation { addToCart: { id: string, productId: string, productVariantId: string | null | undefined, quantity: number, unitPrice: number, totalPrice: number, addedAt: string, product: { id: string, title: string, images: Array<string>, stock: number }, productVariant: { id: string, name: string, value: string, stock: number } | null | undefined } }

export type UpdateCartItemMutationVariables = Exact<{
  id: string | number;
  input: UpdateCartItemInput;
}>;


export interface UpdateCartItemMutation { updateCartItem: { id: string, quantity: number, totalPrice: number, updatedAt: string } }

export type RemoveFromCartMutationVariables = Exact<{
  id: string | number;
}>;


export interface RemoveFromCartMutation { removeFromCart: boolean }

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export interface ClearCartMutation { clearCart: boolean }

export type BuyNowMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export interface BuyNowMutation { buyNow: { id: string, orderNumber: string, status: OrderStatus, paymentStatus: PaymentStatus, totalAmount: number, currency: string, createdAt: string } }

export type ProductsQueryVariables = Exact<{
  filter?: ProductFilter | null | undefined;
  pagination?: PaginationInput | null | undefined;
}>;


export interface ProductsQuery { products: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, title: string, slug: string, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, condition: ProductCondition, status: ProductStatus, stock: number, images: Array<string>, isDigital: boolean, shippingRequired: boolean, averageRating: number, reviewCount: number, soldCount: number, favoriteCount: number, viewCount: number, createdAt: string, publishedAt: string | null | undefined, seller: { id: string, firstName: string, lastName: string, avatar: string | null | undefined } | null | undefined, category: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null | undefined, endCursor: string | null | undefined } } }

export type ProductQueryVariables = Exact<{
  id: string | number;
}>;


export interface ProductQuery { product: { id: string, title: string, slug: string, description: string | null | undefined, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, condition: ProductCondition, status: ProductStatus, stock: number, minOrderQuantity: number | null | undefined, maxOrderQuantity: number | null | undefined, weight: number | null | undefined, dimensions: string | null | undefined, sku: string | null | undefined, tags: Array<string>, images: Array<string>, isDigital: boolean, shippingRequired: boolean, allowReviews: boolean, averageRating: number, reviewCount: number, soldCount: number, favoriteCount: number, viewCount: number, createdAt: string, updatedAt: string, publishedAt: string | null | undefined, seller: { id: string, firstName: string, lastName: string, avatar: string | null | undefined, profile: { bio: string | null | undefined, address: string | null | undefined, city: string | null | undefined, country: string | null | undefined } | null | undefined } | null | undefined, category: { id: string, name: string, slug: string, parent: { id: string, name: string, slug: string } | null | undefined }, variants: Array<{ id: string, name: string, value: string, price: number | null | undefined, stock: number, sku: string | null | undefined, image: string | null | undefined, isActive: boolean }> } | null | undefined }

export type ProductBySlugQueryVariables = Exact<{
  slug: string;
}>;


export interface ProductBySlugQuery { productBySlug: { id: string, title: string, slug: string, description: string | null | undefined, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, condition: ProductCondition, status: ProductStatus, stock: number, minOrderQuantity: number | null | undefined, maxOrderQuantity: number | null | undefined, weight: number | null | undefined, dimensions: string | null | undefined, sku: string | null | undefined, tags: Array<string>, images: Array<string>, isDigital: boolean, shippingRequired: boolean, allowReviews: boolean, averageRating: number, reviewCount: number, soldCount: number, favoriteCount: number, viewCount: number, createdAt: string, updatedAt: string, publishedAt: string | null | undefined, seller: { id: string, firstName: string, lastName: string, avatar: string | null | undefined, profile: { bio: string | null | undefined, address: string | null | undefined, city: string | null | undefined, country: string | null | undefined } | null | undefined } | null | undefined, category: { id: string, name: string, slug: string, parent: { id: string, name: string, slug: string } | null | undefined }, variants: Array<{ id: string, name: string, value: string, price: number | null | undefined, stock: number, sku: string | null | undefined, image: string | null | undefined, isActive: boolean }> } | null | undefined }

export type CategoriesQueryVariables = Exact<{
  filter?: CategoryFilter | null | undefined;
  pagination?: PaginationInput | null | undefined;
}>;


export interface CategoriesQuery { categories: { totalCount: number, edges: Array<{ node: { id: string, name: string, slug: string, description: string | null | undefined, imageUrl: string | null | undefined, isActive: boolean, productCount: number, parent: { id: string, name: string, slug: string } | null | undefined, children: Array<{ id: string, name: string, slug: string, productCount: number }> } }> } }

export type FeaturedProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export interface FeaturedProductsQuery { featuredProducts: Array<{ id: string, title: string, slug: string, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, images: Array<string>, averageRating: number, reviewCount: number, seller: { id: string, firstName: string, lastName: string } | null | undefined, category: { id: string, name: string } }> }

export type PopularProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export interface PopularProductsQuery { popularProducts: Array<{ id: string, title: string, slug: string, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, images: Array<string>, averageRating: number, reviewCount: number, soldCount: number, seller: { id: string, firstName: string, lastName: string } | null | undefined, category: { id: string, name: string } }> }

export type SearchProductsQueryVariables = Exact<{
  query: string;
  limit?: number | null | undefined;
}>;


export interface SearchProductsQuery { searchProducts: Array<{ id: string, title: string, slug: string, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, images: Array<string>, averageRating: number, reviewCount: number, seller: { id: string, firstName: string, lastName: string } | null | undefined, category: { id: string, name: string } }> }

export type RelatedProductsQueryVariables = Exact<{
  productId: string | number;
  limit?: number | null | undefined;
}>;


export interface RelatedProductsQuery { relatedProducts: Array<{ id: string, title: string, slug: string, shortDescription: string | null | undefined, price: number, originalPrice: number | null | undefined, images: Array<string>, averageRating: number, reviewCount: number, seller: { id: string, firstName: string, lastName: string } | null | undefined, category: { id: string, name: string } }> }

export type CreateProductMutationVariables = Exact<{
  input: CreateProductInput;
}>;


export interface CreateProductMutation { createProduct: { id: string, title: string, slug: string, status: ProductStatus, price: number, stock: number, images: Array<string> } }

export type UpdateProductMutationVariables = Exact<{
  id: string | number;
  input: UpdateProductInput;
}>;


export interface UpdateProductMutation { updateProduct: { id: string, title: string, slug: string, status: ProductStatus, price: number, stock: number, images: Array<string> } }

export type DeleteProductMutationVariables = Exact<{
  id: string | number;
}>;


export interface DeleteProductMutation { deleteProduct: boolean }

export type PublishProductMutationVariables = Exact<{
  id: string | number;
}>;


export interface PublishProductMutation { publishProduct: { id: string, status: ProductStatus, publishedAt: string | null | undefined } }

export type UnpublishProductMutationVariables = Exact<{
  id: string | number;
}>;


export interface UnpublishProductMutation { unpublishProduct: { id: string, status: ProductStatus } }

export type IncrementProductViewMutationVariables = Exact<{
  id: string | number;
}>;


export interface IncrementProductViewMutation { incrementProductView: { id: string, viewCount: number } }

export type ToggleProductFavoriteMutationVariables = Exact<{
  id: string | number;
}>;


export interface ToggleProductFavoriteMutation { toggleProductFavorite: { id: string, favoriteCount: number } }

export type MyWalletQueryVariables = Exact<{ [key: string]: never; }>;


export interface MyWalletQuery { me: { wallet: { id: string, balance: number, frozenBalance: number, totalEarnings: number, totalSpent: number } | null | undefined } | null | undefined }

export type WalletTransactionsQueryVariables = Exact<{
  pagination?: PaginationInput | null | undefined;
}>;


export interface WalletTransactionsQuery { myTransactions: Array<{ id: string, type: TransactionType, amount: number, currency: string, balanceBefore: number, balanceAfter: number, description: string | null | undefined, reference: string | null | undefined, status: string, createdAt: string, order: { id: string, orderNumber: string, items: Array<{ productName: string, quantity: number }> } | null | undefined }> }


export const RegisterDocument = gql`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      userType
      status
      emailVerified
      phoneVerified
    }
  }
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
      avatar
      userType
      status
      emailVerified
      phoneVerified
      lastLoginAt
      wallet {
        id
        balance
        frozenBalance
        totalEarnings
        totalSpent
      }
      profile {
        id
        bio
        address
        city
        zipCode
        country
        language
        notificationsEnabled
        marketingEnabled
      }
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const LogoutAllDevicesDocument = gql`
    mutation LogoutAllDevices {
  logoutAllDevices
}
    `;
export type LogoutAllDevicesMutationFn = Apollo.MutationFunction<LogoutAllDevicesMutation, LogoutAllDevicesMutationVariables>;

/**
 * __useLogoutAllDevicesMutation__
 *
 * To run a mutation, you first call `useLogoutAllDevicesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutAllDevicesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutAllDevicesMutation, { data, loading, error }] = useLogoutAllDevicesMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutAllDevicesMutation(baseOptions?: Apollo.MutationHookOptions<LogoutAllDevicesMutation, LogoutAllDevicesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutAllDevicesMutation, LogoutAllDevicesMutationVariables>(LogoutAllDevicesDocument, options);
      }
export type LogoutAllDevicesMutationHookResult = ReturnType<typeof useLogoutAllDevicesMutation>;
export type LogoutAllDevicesMutationResult = Apollo.MutationResult<LogoutAllDevicesMutation>;
export type LogoutAllDevicesMutationOptions = Apollo.BaseMutationOptions<LogoutAllDevicesMutation, LogoutAllDevicesMutationVariables>;
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input)
}
    `;
export type ForgotPasswordMutationFn = Apollo.MutationFunction<ForgotPasswordMutation, ForgotPasswordMutationVariables>;

/**
 * __useForgotPasswordMutation__
 *
 * To run a mutation, you first call `useForgotPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forgotPasswordMutation, { data, loading, error }] = useForgotPasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useForgotPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument, options);
      }
export type ForgotPasswordMutationHookResult = ReturnType<typeof useForgotPasswordMutation>;
export type ForgotPasswordMutationResult = Apollo.MutationResult<ForgotPasswordMutation>;
export type ForgotPasswordMutationOptions = Apollo.BaseMutationOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input)
}
    `;
export type ResetPasswordMutationFn = Apollo.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, options);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input)
}
    `;
export type ChangePasswordMutationFn = Apollo.MutationFunction<ChangePasswordMutation, ChangePasswordMutationVariables>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, options);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const SendVerificationEmailDocument = gql`
    mutation SendVerificationEmail {
  sendVerificationEmail {
    sent
    email
  }
}
    `;
export type SendVerificationEmailMutationFn = Apollo.MutationFunction<SendVerificationEmailMutation, SendVerificationEmailMutationVariables>;

/**
 * __useSendVerificationEmailMutation__
 *
 * To run a mutation, you first call `useSendVerificationEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendVerificationEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendVerificationEmailMutation, { data, loading, error }] = useSendVerificationEmailMutation({
 *   variables: {
 *   },
 * });
 */
export function useSendVerificationEmailMutation(baseOptions?: Apollo.MutationHookOptions<SendVerificationEmailMutation, SendVerificationEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendVerificationEmailMutation, SendVerificationEmailMutationVariables>(SendVerificationEmailDocument, options);
      }
export type SendVerificationEmailMutationHookResult = ReturnType<typeof useSendVerificationEmailMutation>;
export type SendVerificationEmailMutationResult = Apollo.MutationResult<SendVerificationEmailMutation>;
export type SendVerificationEmailMutationOptions = Apollo.BaseMutationOptions<SendVerificationEmailMutation, SendVerificationEmailMutationVariables>;
export const VerifyEmailDocument = gql`
    mutation VerifyEmail($input: VerifyEmailInput!) {
  verifyEmail(input: $input)
}
    `;
export type VerifyEmailMutationFn = Apollo.MutationFunction<VerifyEmailMutation, VerifyEmailMutationVariables>;

/**
 * __useVerifyEmailMutation__
 *
 * To run a mutation, you first call `useVerifyEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyEmailMutation, { data, loading, error }] = useVerifyEmailMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useVerifyEmailMutation(baseOptions?: Apollo.MutationHookOptions<VerifyEmailMutation, VerifyEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(VerifyEmailDocument, options);
      }
export type VerifyEmailMutationHookResult = ReturnType<typeof useVerifyEmailMutation>;
export type VerifyEmailMutationResult = Apollo.MutationResult<VerifyEmailMutation>;
export type VerifyEmailMutationOptions = Apollo.BaseMutationOptions<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationEmailDocument = gql`
    mutation ResendVerificationEmail {
  resendVerificationEmail {
    sent
    email
  }
}
    `;
export type ResendVerificationEmailMutationFn = Apollo.MutationFunction<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>;

/**
 * __useResendVerificationEmailMutation__
 *
 * To run a mutation, you first call `useResendVerificationEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendVerificationEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendVerificationEmailMutation, { data, loading, error }] = useResendVerificationEmailMutation({
 *   variables: {
 *   },
 * });
 */
export function useResendVerificationEmailMutation(baseOptions?: Apollo.MutationHookOptions<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>(ResendVerificationEmailDocument, options);
      }
export type ResendVerificationEmailMutationHookResult = ReturnType<typeof useResendVerificationEmailMutation>;
export type ResendVerificationEmailMutationResult = Apollo.MutationResult<ResendVerificationEmailMutation>;
export type ResendVerificationEmailMutationOptions = Apollo.BaseMutationOptions<ResendVerificationEmailMutation, ResendVerificationEmailMutationVariables>;
export const SetupTwoFactorDocument = gql`
    mutation SetupTwoFactor {
  setupTwoFactor {
    secret
    qrCode
    backupCodes
  }
}
    `;
export type SetupTwoFactorMutationFn = Apollo.MutationFunction<SetupTwoFactorMutation, SetupTwoFactorMutationVariables>;

/**
 * __useSetupTwoFactorMutation__
 *
 * To run a mutation, you first call `useSetupTwoFactorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupTwoFactorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupTwoFactorMutation, { data, loading, error }] = useSetupTwoFactorMutation({
 *   variables: {
 *   },
 * });
 */
export function useSetupTwoFactorMutation(baseOptions?: Apollo.MutationHookOptions<SetupTwoFactorMutation, SetupTwoFactorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetupTwoFactorMutation, SetupTwoFactorMutationVariables>(SetupTwoFactorDocument, options);
      }
export type SetupTwoFactorMutationHookResult = ReturnType<typeof useSetupTwoFactorMutation>;
export type SetupTwoFactorMutationResult = Apollo.MutationResult<SetupTwoFactorMutation>;
export type SetupTwoFactorMutationOptions = Apollo.BaseMutationOptions<SetupTwoFactorMutation, SetupTwoFactorMutationVariables>;
export const EnableTwoFactorDocument = gql`
    mutation EnableTwoFactor($input: Enable2FAInput!) {
  enableTwoFactor(input: $input)
}
    `;
export type EnableTwoFactorMutationFn = Apollo.MutationFunction<EnableTwoFactorMutation, EnableTwoFactorMutationVariables>;

/**
 * __useEnableTwoFactorMutation__
 *
 * To run a mutation, you first call `useEnableTwoFactorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEnableTwoFactorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [enableTwoFactorMutation, { data, loading, error }] = useEnableTwoFactorMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEnableTwoFactorMutation(baseOptions?: Apollo.MutationHookOptions<EnableTwoFactorMutation, EnableTwoFactorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EnableTwoFactorMutation, EnableTwoFactorMutationVariables>(EnableTwoFactorDocument, options);
      }
export type EnableTwoFactorMutationHookResult = ReturnType<typeof useEnableTwoFactorMutation>;
export type EnableTwoFactorMutationResult = Apollo.MutationResult<EnableTwoFactorMutation>;
export type EnableTwoFactorMutationOptions = Apollo.BaseMutationOptions<EnableTwoFactorMutation, EnableTwoFactorMutationVariables>;
export const DisableTwoFactorDocument = gql`
    mutation DisableTwoFactor {
  disableTwoFactor
}
    `;
export type DisableTwoFactorMutationFn = Apollo.MutationFunction<DisableTwoFactorMutation, DisableTwoFactorMutationVariables>;

/**
 * __useDisableTwoFactorMutation__
 *
 * To run a mutation, you first call `useDisableTwoFactorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDisableTwoFactorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [disableTwoFactorMutation, { data, loading, error }] = useDisableTwoFactorMutation({
 *   variables: {
 *   },
 * });
 */
export function useDisableTwoFactorMutation(baseOptions?: Apollo.MutationHookOptions<DisableTwoFactorMutation, DisableTwoFactorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DisableTwoFactorMutation, DisableTwoFactorMutationVariables>(DisableTwoFactorDocument, options);
      }
export type DisableTwoFactorMutationHookResult = ReturnType<typeof useDisableTwoFactorMutation>;
export type DisableTwoFactorMutationResult = Apollo.MutationResult<DisableTwoFactorMutation>;
export type DisableTwoFactorMutationOptions = Apollo.BaseMutationOptions<DisableTwoFactorMutation, DisableTwoFactorMutationVariables>;
export const GenerateBackupCodesDocument = gql`
    mutation GenerateBackupCodes {
  generateBackupCodes
}
    `;
export type GenerateBackupCodesMutationFn = Apollo.MutationFunction<GenerateBackupCodesMutation, GenerateBackupCodesMutationVariables>;

/**
 * __useGenerateBackupCodesMutation__
 *
 * To run a mutation, you first call `useGenerateBackupCodesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateBackupCodesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateBackupCodesMutation, { data, loading, error }] = useGenerateBackupCodesMutation({
 *   variables: {
 *   },
 * });
 */
export function useGenerateBackupCodesMutation(baseOptions?: Apollo.MutationHookOptions<GenerateBackupCodesMutation, GenerateBackupCodesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateBackupCodesMutation, GenerateBackupCodesMutationVariables>(GenerateBackupCodesDocument, options);
      }
export type GenerateBackupCodesMutationHookResult = ReturnType<typeof useGenerateBackupCodesMutation>;
export type GenerateBackupCodesMutationResult = Apollo.MutationResult<GenerateBackupCodesMutation>;
export type GenerateBackupCodesMutationOptions = Apollo.BaseMutationOptions<GenerateBackupCodesMutation, GenerateBackupCodesMutationVariables>;
export const UpdateUserProfileDocument = gql`
    mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
    id
    bio
    address
    city
    zipCode
    country
    language
    notificationsEnabled
    marketingEnabled
    updatedAt
  }
}
    `;
export type UpdateUserProfileMutationFn = Apollo.MutationFunction<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;

/**
 * __useUpdateUserProfileMutation__
 *
 * To run a mutation, you first call `useUpdateUserProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserProfileMutation, { data, loading, error }] = useUpdateUserProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>(UpdateUserProfileDocument, options);
      }
export type UpdateUserProfileMutationHookResult = ReturnType<typeof useUpdateUserProfileMutation>;
export type UpdateUserProfileMutationResult = Apollo.MutationResult<UpdateUserProfileMutation>;
export type UpdateUserProfileMutationOptions = Apollo.BaseMutationOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    phone
    firstName
    lastName
    avatar
    userType
    status
    emailVerified
    phoneVerified
    lastLoginAt
    createdAt
    updatedAt
    profile {
      id
      bio
      address
      city
      zipCode
      country
      language
      notificationsEnabled
      marketingEnabled
    }
    wallet {
      id
      balance
      frozenBalance
      totalEarnings
      totalSpent
    }
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
// @ts-ignore
export function useMeSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>): Apollo.UseSuspenseQueryResult<MeQuery | undefined, MeQueryVariables>;
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const MyOrdersDocument = gql`
    query MyOrders($pagination: PaginationInput) {
  myOrders(pagination: $pagination) {
    edges {
      node {
        id
        orderNumber
        status
        paymentStatus
        paymentMethod
        subtotal
        taxAmount
        shippingAmount
        discountAmount
        totalAmount
        currency
        itemCount
        seller {
          id
          firstName
          lastName
          avatar
        }
        items {
          id
          productName
          productImage
          productSku
          unitPrice
          quantity
          totalPrice
          variantName
          variantValue
        }
        shippingAddress {
          street
          city
          state
          postalCode
          country
          phone
          name
        }
        trackingNumber
        estimatedDelivery
        actualDelivery
        createdAt
        updatedAt
        confirmedAt
        shippedAt
        deliveredAt
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

/**
 * __useMyOrdersQuery__
 *
 * To run a query within a React component, call `useMyOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyOrdersQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useMyOrdersQuery(baseOptions?: Apollo.QueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyOrdersQuery, MyOrdersQueryVariables>(MyOrdersDocument, options);
      }
export function useMyOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyOrdersQuery, MyOrdersQueryVariables>(MyOrdersDocument, options);
        }
// @ts-ignore
export function useMyOrdersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<MyOrdersQuery, MyOrdersQueryVariables>;
export function useMyOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>): Apollo.UseSuspenseQueryResult<MyOrdersQuery | undefined, MyOrdersQueryVariables>;
export function useMyOrdersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyOrdersQuery, MyOrdersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyOrdersQuery, MyOrdersQueryVariables>(MyOrdersDocument, options);
        }
export type MyOrdersQueryHookResult = ReturnType<typeof useMyOrdersQuery>;
export type MyOrdersLazyQueryHookResult = ReturnType<typeof useMyOrdersLazyQuery>;
export type MyOrdersSuspenseQueryHookResult = ReturnType<typeof useMyOrdersSuspenseQuery>;
export type MyOrdersQueryResult = Apollo.QueryResult<MyOrdersQuery, MyOrdersQueryVariables>;
export const MyPurchasesDocument = gql`
    query MyPurchases($pagination: PaginationInput) {
  myPurchases(pagination: $pagination) {
    edges {
      node {
        id
        orderNumber
        status
        paymentStatus
        totalAmount
        currency
        itemCount
        seller {
          id
          firstName
          lastName
          avatar
        }
        items {
          id
          productName
          productImage
          quantity
          unitPrice
          totalPrice
        }
        createdAt
        deliveredAt
      }
    }
    totalCount
  }
}
    `;

/**
 * __useMyPurchasesQuery__
 *
 * To run a query within a React component, call `useMyPurchasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyPurchasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyPurchasesQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useMyPurchasesQuery(baseOptions?: Apollo.QueryHookOptions<MyPurchasesQuery, MyPurchasesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyPurchasesQuery, MyPurchasesQueryVariables>(MyPurchasesDocument, options);
      }
export function useMyPurchasesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyPurchasesQuery, MyPurchasesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyPurchasesQuery, MyPurchasesQueryVariables>(MyPurchasesDocument, options);
        }
// @ts-ignore
export function useMyPurchasesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyPurchasesQuery, MyPurchasesQueryVariables>): Apollo.UseSuspenseQueryResult<MyPurchasesQuery, MyPurchasesQueryVariables>;
export function useMyPurchasesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyPurchasesQuery, MyPurchasesQueryVariables>): Apollo.UseSuspenseQueryResult<MyPurchasesQuery | undefined, MyPurchasesQueryVariables>;
export function useMyPurchasesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyPurchasesQuery, MyPurchasesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyPurchasesQuery, MyPurchasesQueryVariables>(MyPurchasesDocument, options);
        }
export type MyPurchasesQueryHookResult = ReturnType<typeof useMyPurchasesQuery>;
export type MyPurchasesLazyQueryHookResult = ReturnType<typeof useMyPurchasesLazyQuery>;
export type MyPurchasesSuspenseQueryHookResult = ReturnType<typeof useMyPurchasesSuspenseQuery>;
export type MyPurchasesQueryResult = Apollo.QueryResult<MyPurchasesQuery, MyPurchasesQueryVariables>;
export const MySalesDocument = gql`
    query MySales($pagination: PaginationInput) {
  mySales(pagination: $pagination) {
    edges {
      node {
        id
        orderNumber
        status
        paymentStatus
        totalAmount
        currency
        itemCount
        buyer {
          id
          firstName
          lastName
          avatar
        }
        items {
          id
          productName
          productImage
          quantity
          unitPrice
          totalPrice
        }
        shippingAddress {
          street
          city
          state
          postalCode
          country
          phone
          name
        }
        createdAt
        confirmedAt
        shippedAt
      }
    }
    totalCount
  }
}
    `;

/**
 * __useMySalesQuery__
 *
 * To run a query within a React component, call `useMySalesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMySalesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMySalesQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useMySalesQuery(baseOptions?: Apollo.QueryHookOptions<MySalesQuery, MySalesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MySalesQuery, MySalesQueryVariables>(MySalesDocument, options);
      }
export function useMySalesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MySalesQuery, MySalesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MySalesQuery, MySalesQueryVariables>(MySalesDocument, options);
        }
// @ts-ignore
export function useMySalesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MySalesQuery, MySalesQueryVariables>): Apollo.UseSuspenseQueryResult<MySalesQuery, MySalesQueryVariables>;
export function useMySalesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MySalesQuery, MySalesQueryVariables>): Apollo.UseSuspenseQueryResult<MySalesQuery | undefined, MySalesQueryVariables>;
export function useMySalesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MySalesQuery, MySalesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MySalesQuery, MySalesQueryVariables>(MySalesDocument, options);
        }
export type MySalesQueryHookResult = ReturnType<typeof useMySalesQuery>;
export type MySalesLazyQueryHookResult = ReturnType<typeof useMySalesLazyQuery>;
export type MySalesSuspenseQueryHookResult = ReturnType<typeof useMySalesSuspenseQuery>;
export type MySalesQueryResult = Apollo.QueryResult<MySalesQuery, MySalesQueryVariables>;
export const OrderDocument = gql`
    query Order($id: ID!) {
  order(id: $id) {
    id
    orderNumber
    status
    paymentStatus
    paymentMethod
    subtotal
    taxAmount
    shippingAmount
    discountAmount
    totalAmount
    currency
    buyer {
      id
      firstName
      lastName
      email
      phone
      avatar
    }
    seller {
      id
      firstName
      lastName
      email
      phone
      avatar
    }
    items {
      id
      productId
      productVariantId
      product {
        id
        title
        slug
        images
      }
      productVariant {
        id
        name
        value
      }
      productName
      productImage
      productSku
      unitPrice
      quantity
      totalPrice
      variantName
      variantValue
    }
    shippingAddress {
      street
      city
      state
      postalCode
      country
      phone
      name
    }
    billingAddress {
      street
      city
      state
      postalCode
      country
      phone
      name
    }
    shippingMethod
    trackingNumber
    estimatedDelivery
    actualDelivery
    notes
    cancelReason
    refundReason
    createdAt
    updatedAt
    confirmedAt
    shippedAt
    deliveredAt
    cancelledAt
  }
}
    `;

/**
 * __useOrderQuery__
 *
 * To run a query within a React component, call `useOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrderQuery(baseOptions: Apollo.QueryHookOptions<OrderQuery, OrderQueryVariables> & ({ variables: OrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
      }
export function useOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrderQuery, OrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
        }
// @ts-ignore
export function useOrderSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<OrderQuery, OrderQueryVariables>): Apollo.UseSuspenseQueryResult<OrderQuery, OrderQueryVariables>;
export function useOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OrderQuery, OrderQueryVariables>): Apollo.UseSuspenseQueryResult<OrderQuery | undefined, OrderQueryVariables>;
export function useOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OrderQuery, OrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
        }
export type OrderQueryHookResult = ReturnType<typeof useOrderQuery>;
export type OrderLazyQueryHookResult = ReturnType<typeof useOrderLazyQuery>;
export type OrderSuspenseQueryHookResult = ReturnType<typeof useOrderSuspenseQuery>;
export type OrderQueryResult = Apollo.QueryResult<OrderQuery, OrderQueryVariables>;
export const MyCartDocument = gql`
    query MyCart {
  myCart {
    items {
      id
      productId
      productVariantId
      product {
        id
        title
        slug
        price
        originalPrice
        stock
        images
        isDigital
        shippingRequired
        seller {
          id
          firstName
          lastName
        }
        category {
          id
          name
        }
      }
      productVariant {
        id
        name
        value
        price
        stock
        image
      }
      quantity
      unitPrice
      totalPrice
      addedAt
      updatedAt
    }
    itemCount
    subtotal
    currency
    updatedAt
  }
}
    `;

/**
 * __useMyCartQuery__
 *
 * To run a query within a React component, call `useMyCartQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyCartQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyCartQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyCartQuery(baseOptions?: Apollo.QueryHookOptions<MyCartQuery, MyCartQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyCartQuery, MyCartQueryVariables>(MyCartDocument, options);
      }
export function useMyCartLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyCartQuery, MyCartQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyCartQuery, MyCartQueryVariables>(MyCartDocument, options);
        }
// @ts-ignore
export function useMyCartSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyCartQuery, MyCartQueryVariables>): Apollo.UseSuspenseQueryResult<MyCartQuery, MyCartQueryVariables>;
export function useMyCartSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCartQuery, MyCartQueryVariables>): Apollo.UseSuspenseQueryResult<MyCartQuery | undefined, MyCartQueryVariables>;
export function useMyCartSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCartQuery, MyCartQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyCartQuery, MyCartQueryVariables>(MyCartDocument, options);
        }
export type MyCartQueryHookResult = ReturnType<typeof useMyCartQuery>;
export type MyCartLazyQueryHookResult = ReturnType<typeof useMyCartLazyQuery>;
export type MyCartSuspenseQueryHookResult = ReturnType<typeof useMyCartSuspenseQuery>;
export type MyCartQueryResult = Apollo.QueryResult<MyCartQuery, MyCartQueryVariables>;
export const MyTransactionsDocument = gql`
    query MyTransactions($pagination: PaginationInput) {
  myTransactions(pagination: $pagination) {
    id
    type
    amount
    currency
    balanceBefore
    balanceAfter
    description
    reference
    status
    order {
      id
      orderNumber
    }
    createdAt
  }
}
    `;

/**
 * __useMyTransactionsQuery__
 *
 * To run a query within a React component, call `useMyTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyTransactionsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useMyTransactionsQuery(baseOptions?: Apollo.QueryHookOptions<MyTransactionsQuery, MyTransactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyTransactionsQuery, MyTransactionsQueryVariables>(MyTransactionsDocument, options);
      }
export function useMyTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyTransactionsQuery, MyTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyTransactionsQuery, MyTransactionsQueryVariables>(MyTransactionsDocument, options);
        }
// @ts-ignore
export function useMyTransactionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyTransactionsQuery, MyTransactionsQueryVariables>): Apollo.UseSuspenseQueryResult<MyTransactionsQuery, MyTransactionsQueryVariables>;
export function useMyTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyTransactionsQuery, MyTransactionsQueryVariables>): Apollo.UseSuspenseQueryResult<MyTransactionsQuery | undefined, MyTransactionsQueryVariables>;
export function useMyTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyTransactionsQuery, MyTransactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyTransactionsQuery, MyTransactionsQueryVariables>(MyTransactionsDocument, options);
        }
export type MyTransactionsQueryHookResult = ReturnType<typeof useMyTransactionsQuery>;
export type MyTransactionsLazyQueryHookResult = ReturnType<typeof useMyTransactionsLazyQuery>;
export type MyTransactionsSuspenseQueryHookResult = ReturnType<typeof useMyTransactionsSuspenseQuery>;
export type MyTransactionsQueryResult = Apollo.QueryResult<MyTransactionsQuery, MyTransactionsQueryVariables>;
export const CreateOrderDocument = gql`
    mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    status
    paymentStatus
    totalAmount
    currency
    seller {
      id
      firstName
      lastName
    }
    items {
      id
      productName
      quantity
      unitPrice
      totalPrice
    }
    createdAt
  }
}
    `;
export type CreateOrderMutationFn = Apollo.MutationFunction<CreateOrderMutation, CreateOrderMutationVariables>;

/**
 * __useCreateOrderMutation__
 *
 * To run a mutation, you first call `useCreateOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrderMutation, { data, loading, error }] = useCreateOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrderMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrderMutation, CreateOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrderMutation, CreateOrderMutationVariables>(CreateOrderDocument, options);
      }
export type CreateOrderMutationHookResult = ReturnType<typeof useCreateOrderMutation>;
export type CreateOrderMutationResult = Apollo.MutationResult<CreateOrderMutation>;
export type CreateOrderMutationOptions = Apollo.BaseMutationOptions<CreateOrderMutation, CreateOrderMutationVariables>;
export const UpdateOrderDocument = gql`
    mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
  updateOrder(id: $id, input: $input) {
    id
    orderNumber
    status
    paymentStatus
    trackingNumber
    estimatedDelivery
    updatedAt
  }
}
    `;
export type UpdateOrderMutationFn = Apollo.MutationFunction<UpdateOrderMutation, UpdateOrderMutationVariables>;

/**
 * __useUpdateOrderMutation__
 *
 * To run a mutation, you first call `useUpdateOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrderMutation, { data, loading, error }] = useUpdateOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOrderMutation, UpdateOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateOrderMutation, UpdateOrderMutationVariables>(UpdateOrderDocument, options);
      }
export type UpdateOrderMutationHookResult = ReturnType<typeof useUpdateOrderMutation>;
export type UpdateOrderMutationResult = Apollo.MutationResult<UpdateOrderMutation>;
export type UpdateOrderMutationOptions = Apollo.BaseMutationOptions<UpdateOrderMutation, UpdateOrderMutationVariables>;
export const CancelOrderDocument = gql`
    mutation CancelOrder($id: ID!, $reason: String!) {
  cancelOrder(id: $id, reason: $reason) {
    id
    status
    cancelReason
    cancelledAt
  }
}
    `;
export type CancelOrderMutationFn = Apollo.MutationFunction<CancelOrderMutation, CancelOrderMutationVariables>;

/**
 * __useCancelOrderMutation__
 *
 * To run a mutation, you first call `useCancelOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelOrderMutation, { data, loading, error }] = useCancelOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useCancelOrderMutation(baseOptions?: Apollo.MutationHookOptions<CancelOrderMutation, CancelOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CancelOrderMutation, CancelOrderMutationVariables>(CancelOrderDocument, options);
      }
export type CancelOrderMutationHookResult = ReturnType<typeof useCancelOrderMutation>;
export type CancelOrderMutationResult = Apollo.MutationResult<CancelOrderMutation>;
export type CancelOrderMutationOptions = Apollo.BaseMutationOptions<CancelOrderMutation, CancelOrderMutationVariables>;
export const ConfirmOrderDocument = gql`
    mutation ConfirmOrder($id: ID!) {
  confirmOrder(id: $id) {
    id
    status
    paymentStatus
    confirmedAt
  }
}
    `;
export type ConfirmOrderMutationFn = Apollo.MutationFunction<ConfirmOrderMutation, ConfirmOrderMutationVariables>;

/**
 * __useConfirmOrderMutation__
 *
 * To run a mutation, you first call `useConfirmOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmOrderMutation, { data, loading, error }] = useConfirmOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useConfirmOrderMutation(baseOptions?: Apollo.MutationHookOptions<ConfirmOrderMutation, ConfirmOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfirmOrderMutation, ConfirmOrderMutationVariables>(ConfirmOrderDocument, options);
      }
export type ConfirmOrderMutationHookResult = ReturnType<typeof useConfirmOrderMutation>;
export type ConfirmOrderMutationResult = Apollo.MutationResult<ConfirmOrderMutation>;
export type ConfirmOrderMutationOptions = Apollo.BaseMutationOptions<ConfirmOrderMutation, ConfirmOrderMutationVariables>;
export const ShipOrderDocument = gql`
    mutation ShipOrder($id: ID!, $trackingNumber: String, $estimatedDelivery: String) {
  shipOrder(
    id: $id
    trackingNumber: $trackingNumber
    estimatedDelivery: $estimatedDelivery
  ) {
    id
    status
    trackingNumber
    estimatedDelivery
    shippedAt
  }
}
    `;
export type ShipOrderMutationFn = Apollo.MutationFunction<ShipOrderMutation, ShipOrderMutationVariables>;

/**
 * __useShipOrderMutation__
 *
 * To run a mutation, you first call `useShipOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShipOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shipOrderMutation, { data, loading, error }] = useShipOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      trackingNumber: // value for 'trackingNumber'
 *      estimatedDelivery: // value for 'estimatedDelivery'
 *   },
 * });
 */
export function useShipOrderMutation(baseOptions?: Apollo.MutationHookOptions<ShipOrderMutation, ShipOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ShipOrderMutation, ShipOrderMutationVariables>(ShipOrderDocument, options);
      }
export type ShipOrderMutationHookResult = ReturnType<typeof useShipOrderMutation>;
export type ShipOrderMutationResult = Apollo.MutationResult<ShipOrderMutation>;
export type ShipOrderMutationOptions = Apollo.BaseMutationOptions<ShipOrderMutation, ShipOrderMutationVariables>;
export const DeliverOrderDocument = gql`
    mutation DeliverOrder($id: ID!) {
  deliverOrder(id: $id) {
    id
    status
    actualDelivery
    deliveredAt
  }
}
    `;
export type DeliverOrderMutationFn = Apollo.MutationFunction<DeliverOrderMutation, DeliverOrderMutationVariables>;

/**
 * __useDeliverOrderMutation__
 *
 * To run a mutation, you first call `useDeliverOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeliverOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deliverOrderMutation, { data, loading, error }] = useDeliverOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeliverOrderMutation(baseOptions?: Apollo.MutationHookOptions<DeliverOrderMutation, DeliverOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeliverOrderMutation, DeliverOrderMutationVariables>(DeliverOrderDocument, options);
      }
export type DeliverOrderMutationHookResult = ReturnType<typeof useDeliverOrderMutation>;
export type DeliverOrderMutationResult = Apollo.MutationResult<DeliverOrderMutation>;
export type DeliverOrderMutationOptions = Apollo.BaseMutationOptions<DeliverOrderMutation, DeliverOrderMutationVariables>;
export const AddToCartDocument = gql`
    mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    id
    productId
    productVariantId
    quantity
    unitPrice
    totalPrice
    product {
      id
      title
      images
      stock
    }
    productVariant {
      id
      name
      value
      stock
    }
    addedAt
  }
}
    `;
export type AddToCartMutationFn = Apollo.MutationFunction<AddToCartMutation, AddToCartMutationVariables>;

/**
 * __useAddToCartMutation__
 *
 * To run a mutation, you first call `useAddToCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToCartMutation, { data, loading, error }] = useAddToCartMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddToCartMutation(baseOptions?: Apollo.MutationHookOptions<AddToCartMutation, AddToCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddToCartMutation, AddToCartMutationVariables>(AddToCartDocument, options);
      }
export type AddToCartMutationHookResult = ReturnType<typeof useAddToCartMutation>;
export type AddToCartMutationResult = Apollo.MutationResult<AddToCartMutation>;
export type AddToCartMutationOptions = Apollo.BaseMutationOptions<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = gql`
    mutation UpdateCartItem($id: ID!, $input: UpdateCartItemInput!) {
  updateCartItem(id: $id, input: $input) {
    id
    quantity
    totalPrice
    updatedAt
  }
}
    `;
export type UpdateCartItemMutationFn = Apollo.MutationFunction<UpdateCartItemMutation, UpdateCartItemMutationVariables>;

/**
 * __useUpdateCartItemMutation__
 *
 * To run a mutation, you first call `useUpdateCartItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCartItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCartItemMutation, { data, loading, error }] = useUpdateCartItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCartItemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCartItemMutation, UpdateCartItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCartItemMutation, UpdateCartItemMutationVariables>(UpdateCartItemDocument, options);
      }
export type UpdateCartItemMutationHookResult = ReturnType<typeof useUpdateCartItemMutation>;
export type UpdateCartItemMutationResult = Apollo.MutationResult<UpdateCartItemMutation>;
export type UpdateCartItemMutationOptions = Apollo.BaseMutationOptions<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveFromCartDocument = gql`
    mutation RemoveFromCart($id: ID!) {
  removeFromCart(id: $id)
}
    `;
export type RemoveFromCartMutationFn = Apollo.MutationFunction<RemoveFromCartMutation, RemoveFromCartMutationVariables>;

/**
 * __useRemoveFromCartMutation__
 *
 * To run a mutation, you first call `useRemoveFromCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFromCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFromCartMutation, { data, loading, error }] = useRemoveFromCartMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveFromCartMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFromCartMutation, RemoveFromCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFromCartMutation, RemoveFromCartMutationVariables>(RemoveFromCartDocument, options);
      }
export type RemoveFromCartMutationHookResult = ReturnType<typeof useRemoveFromCartMutation>;
export type RemoveFromCartMutationResult = Apollo.MutationResult<RemoveFromCartMutation>;
export type RemoveFromCartMutationOptions = Apollo.BaseMutationOptions<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const ClearCartDocument = gql`
    mutation ClearCart {
  clearCart
}
    `;
export type ClearCartMutationFn = Apollo.MutationFunction<ClearCartMutation, ClearCartMutationVariables>;

/**
 * __useClearCartMutation__
 *
 * To run a mutation, you first call `useClearCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearCartMutation, { data, loading, error }] = useClearCartMutation({
 *   variables: {
 *   },
 * });
 */
export function useClearCartMutation(baseOptions?: Apollo.MutationHookOptions<ClearCartMutation, ClearCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ClearCartMutation, ClearCartMutationVariables>(ClearCartDocument, options);
      }
export type ClearCartMutationHookResult = ReturnType<typeof useClearCartMutation>;
export type ClearCartMutationResult = Apollo.MutationResult<ClearCartMutation>;
export type ClearCartMutationOptions = Apollo.BaseMutationOptions<ClearCartMutation, ClearCartMutationVariables>;
export const BuyNowDocument = gql`
    mutation BuyNow($input: CreateOrderInput!) {
  buyNow(input: $input) {
    id
    orderNumber
    status
    paymentStatus
    totalAmount
    currency
    createdAt
  }
}
    `;
export type BuyNowMutationFn = Apollo.MutationFunction<BuyNowMutation, BuyNowMutationVariables>;

/**
 * __useBuyNowMutation__
 *
 * To run a mutation, you first call `useBuyNowMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBuyNowMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [buyNowMutation, { data, loading, error }] = useBuyNowMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBuyNowMutation(baseOptions?: Apollo.MutationHookOptions<BuyNowMutation, BuyNowMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BuyNowMutation, BuyNowMutationVariables>(BuyNowDocument, options);
      }
export type BuyNowMutationHookResult = ReturnType<typeof useBuyNowMutation>;
export type BuyNowMutationResult = Apollo.MutationResult<BuyNowMutation>;
export type BuyNowMutationOptions = Apollo.BaseMutationOptions<BuyNowMutation, BuyNowMutationVariables>;
export const ProductsDocument = gql`
    query Products($filter: ProductFilter, $pagination: PaginationInput) {
  products(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        title
        slug
        shortDescription
        price
        originalPrice
        condition
        status
        stock
        images
        isDigital
        shippingRequired
        averageRating
        reviewCount
        soldCount
        favoriteCount
        viewCount
        seller {
          id
          firstName
          lastName
          avatar
        }
        category {
          id
          name
          slug
        }
        createdAt
        publishedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

/**
 * __useProductsQuery__
 *
 * To run a query within a React component, call `useProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useProductsQuery(baseOptions?: Apollo.QueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
      }
export function useProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
// @ts-ignore
export function useProductsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ProductsQuery, ProductsQueryVariables>): Apollo.UseSuspenseQueryResult<ProductsQuery, ProductsQueryVariables>;
export function useProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductsQuery, ProductsQueryVariables>): Apollo.UseSuspenseQueryResult<ProductsQuery | undefined, ProductsQueryVariables>;
export function useProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
export type ProductsQueryHookResult = ReturnType<typeof useProductsQuery>;
export type ProductsLazyQueryHookResult = ReturnType<typeof useProductsLazyQuery>;
export type ProductsSuspenseQueryHookResult = ReturnType<typeof useProductsSuspenseQuery>;
export type ProductsQueryResult = Apollo.QueryResult<ProductsQuery, ProductsQueryVariables>;
export const ProductDocument = gql`
    query Product($id: ID!) {
  product(id: $id) {
    id
    title
    slug
    description
    shortDescription
    price
    originalPrice
    condition
    status
    stock
    minOrderQuantity
    maxOrderQuantity
    weight
    dimensions
    sku
    tags
    images
    isDigital
    shippingRequired
    allowReviews
    averageRating
    reviewCount
    soldCount
    favoriteCount
    viewCount
    seller {
      id
      firstName
      lastName
      avatar
      profile {
        bio
        address
        city
        country
      }
    }
    category {
      id
      name
      slug
      parent {
        id
        name
        slug
      }
    }
    variants {
      id
      name
      value
      price
      stock
      sku
      image
      isActive
    }
    createdAt
    updatedAt
    publishedAt
  }
}
    `;

/**
 * __useProductQuery__
 *
 * To run a query within a React component, call `useProductQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProductQuery(baseOptions: Apollo.QueryHookOptions<ProductQuery, ProductQueryVariables> & ({ variables: ProductQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
      }
export function useProductLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductQuery, ProductQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
        }
// @ts-ignore
export function useProductSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ProductQuery, ProductQueryVariables>): Apollo.UseSuspenseQueryResult<ProductQuery, ProductQueryVariables>;
export function useProductSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductQuery, ProductQueryVariables>): Apollo.UseSuspenseQueryResult<ProductQuery | undefined, ProductQueryVariables>;
export function useProductSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductQuery, ProductQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
        }
export type ProductQueryHookResult = ReturnType<typeof useProductQuery>;
export type ProductLazyQueryHookResult = ReturnType<typeof useProductLazyQuery>;
export type ProductSuspenseQueryHookResult = ReturnType<typeof useProductSuspenseQuery>;
export type ProductQueryResult = Apollo.QueryResult<ProductQuery, ProductQueryVariables>;
export const ProductBySlugDocument = gql`
    query ProductBySlug($slug: String!) {
  productBySlug(slug: $slug) {
    id
    title
    slug
    description
    shortDescription
    price
    originalPrice
    condition
    status
    stock
    minOrderQuantity
    maxOrderQuantity
    weight
    dimensions
    sku
    tags
    images
    isDigital
    shippingRequired
    allowReviews
    averageRating
    reviewCount
    soldCount
    favoriteCount
    viewCount
    seller {
      id
      firstName
      lastName
      avatar
      profile {
        bio
        address
        city
        country
      }
    }
    category {
      id
      name
      slug
      parent {
        id
        name
        slug
      }
    }
    variants {
      id
      name
      value
      price
      stock
      sku
      image
      isActive
    }
    createdAt
    updatedAt
    publishedAt
  }
}
    `;

/**
 * __useProductBySlugQuery__
 *
 * To run a query within a React component, call `useProductBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useProductBySlugQuery(baseOptions: Apollo.QueryHookOptions<ProductBySlugQuery, ProductBySlugQueryVariables> & ({ variables: ProductBySlugQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductBySlugQuery, ProductBySlugQueryVariables>(ProductBySlugDocument, options);
      }
export function useProductBySlugLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductBySlugQuery, ProductBySlugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductBySlugQuery, ProductBySlugQueryVariables>(ProductBySlugDocument, options);
        }
// @ts-ignore
export function useProductBySlugSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ProductBySlugQuery, ProductBySlugQueryVariables>): Apollo.UseSuspenseQueryResult<ProductBySlugQuery, ProductBySlugQueryVariables>;
export function useProductBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductBySlugQuery, ProductBySlugQueryVariables>): Apollo.UseSuspenseQueryResult<ProductBySlugQuery | undefined, ProductBySlugQueryVariables>;
export function useProductBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductBySlugQuery, ProductBySlugQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductBySlugQuery, ProductBySlugQueryVariables>(ProductBySlugDocument, options);
        }
export type ProductBySlugQueryHookResult = ReturnType<typeof useProductBySlugQuery>;
export type ProductBySlugLazyQueryHookResult = ReturnType<typeof useProductBySlugLazyQuery>;
export type ProductBySlugSuspenseQueryHookResult = ReturnType<typeof useProductBySlugSuspenseQuery>;
export type ProductBySlugQueryResult = Apollo.QueryResult<ProductBySlugQuery, ProductBySlugQueryVariables>;
export const CategoriesDocument = gql`
    query Categories($filter: CategoryFilter, $pagination: PaginationInput) {
  categories(filter: $filter, pagination: $pagination) {
    edges {
      node {
        id
        name
        slug
        description
        imageUrl
        isActive
        productCount
        parent {
          id
          name
          slug
        }
        children {
          id
          name
          slug
          productCount
        }
      }
    }
    totalCount
  }
}
    `;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useCategoriesQuery(baseOptions?: Apollo.QueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
      }
export function useCategoriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
// @ts-ignore
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<CategoriesQuery, CategoriesQueryVariables>;
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>): Apollo.UseSuspenseQueryResult<CategoriesQuery | undefined, CategoriesQueryVariables>;
export function useCategoriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesSuspenseQueryHookResult = ReturnType<typeof useCategoriesSuspenseQuery>;
export type CategoriesQueryResult = Apollo.QueryResult<CategoriesQuery, CategoriesQueryVariables>;
export const FeaturedProductsDocument = gql`
    query FeaturedProducts($limit: Int) {
  featuredProducts(limit: $limit) {
    id
    title
    slug
    shortDescription
    price
    originalPrice
    images
    averageRating
    reviewCount
    seller {
      id
      firstName
      lastName
    }
    category {
      id
      name
    }
  }
}
    `;

/**
 * __useFeaturedProductsQuery__
 *
 * To run a query within a React component, call `useFeaturedProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeaturedProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeaturedProductsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useFeaturedProductsQuery(baseOptions?: Apollo.QueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FeaturedProductsQuery, FeaturedProductsQueryVariables>(FeaturedProductsDocument, options);
      }
export function useFeaturedProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FeaturedProductsQuery, FeaturedProductsQueryVariables>(FeaturedProductsDocument, options);
        }
// @ts-ignore
export function useFeaturedProductsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>): Apollo.UseSuspenseQueryResult<FeaturedProductsQuery, FeaturedProductsQueryVariables>;
export function useFeaturedProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>): Apollo.UseSuspenseQueryResult<FeaturedProductsQuery | undefined, FeaturedProductsQueryVariables>;
export function useFeaturedProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FeaturedProductsQuery, FeaturedProductsQueryVariables>(FeaturedProductsDocument, options);
        }
export type FeaturedProductsQueryHookResult = ReturnType<typeof useFeaturedProductsQuery>;
export type FeaturedProductsLazyQueryHookResult = ReturnType<typeof useFeaturedProductsLazyQuery>;
export type FeaturedProductsSuspenseQueryHookResult = ReturnType<typeof useFeaturedProductsSuspenseQuery>;
export type FeaturedProductsQueryResult = Apollo.QueryResult<FeaturedProductsQuery, FeaturedProductsQueryVariables>;
export const PopularProductsDocument = gql`
    query PopularProducts($limit: Int) {
  popularProducts(limit: $limit) {
    id
    title
    slug
    shortDescription
    price
    originalPrice
    images
    averageRating
    reviewCount
    soldCount
    seller {
      id
      firstName
      lastName
    }
    category {
      id
      name
    }
  }
}
    `;

/**
 * __usePopularProductsQuery__
 *
 * To run a query within a React component, call `usePopularProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePopularProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePopularProductsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function usePopularProductsQuery(baseOptions?: Apollo.QueryHookOptions<PopularProductsQuery, PopularProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PopularProductsQuery, PopularProductsQueryVariables>(PopularProductsDocument, options);
      }
export function usePopularProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PopularProductsQuery, PopularProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PopularProductsQuery, PopularProductsQueryVariables>(PopularProductsDocument, options);
        }
// @ts-ignore
export function usePopularProductsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<PopularProductsQuery, PopularProductsQueryVariables>): Apollo.UseSuspenseQueryResult<PopularProductsQuery, PopularProductsQueryVariables>;
export function usePopularProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PopularProductsQuery, PopularProductsQueryVariables>): Apollo.UseSuspenseQueryResult<PopularProductsQuery | undefined, PopularProductsQueryVariables>;
export function usePopularProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PopularProductsQuery, PopularProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PopularProductsQuery, PopularProductsQueryVariables>(PopularProductsDocument, options);
        }
export type PopularProductsQueryHookResult = ReturnType<typeof usePopularProductsQuery>;
export type PopularProductsLazyQueryHookResult = ReturnType<typeof usePopularProductsLazyQuery>;
export type PopularProductsSuspenseQueryHookResult = ReturnType<typeof usePopularProductsSuspenseQuery>;
export type PopularProductsQueryResult = Apollo.QueryResult<PopularProductsQuery, PopularProductsQueryVariables>;
export const SearchProductsDocument = gql`
    query SearchProducts($query: String!, $limit: Int) {
  searchProducts(query: $query, limit: $limit) {
    id
    title
    slug
    shortDescription
    price
    originalPrice
    images
    averageRating
    reviewCount
    seller {
      id
      firstName
      lastName
    }
    category {
      id
      name
    }
  }
}
    `;

/**
 * __useSearchProductsQuery__
 *
 * To run a query within a React component, call `useSearchProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchProductsQuery({
 *   variables: {
 *      query: // value for 'query'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useSearchProductsQuery(baseOptions: Apollo.QueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables> & ({ variables: SearchProductsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchProductsQuery, SearchProductsQueryVariables>(SearchProductsDocument, options);
      }
export function useSearchProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchProductsQuery, SearchProductsQueryVariables>(SearchProductsDocument, options);
        }
// @ts-ignore
export function useSearchProductsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>): Apollo.UseSuspenseQueryResult<SearchProductsQuery, SearchProductsQueryVariables>;
export function useSearchProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>): Apollo.UseSuspenseQueryResult<SearchProductsQuery | undefined, SearchProductsQueryVariables>;
export function useSearchProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchProductsQuery, SearchProductsQueryVariables>(SearchProductsDocument, options);
        }
export type SearchProductsQueryHookResult = ReturnType<typeof useSearchProductsQuery>;
export type SearchProductsLazyQueryHookResult = ReturnType<typeof useSearchProductsLazyQuery>;
export type SearchProductsSuspenseQueryHookResult = ReturnType<typeof useSearchProductsSuspenseQuery>;
export type SearchProductsQueryResult = Apollo.QueryResult<SearchProductsQuery, SearchProductsQueryVariables>;
export const RelatedProductsDocument = gql`
    query RelatedProducts($productId: ID!, $limit: Int) {
  relatedProducts(productId: $productId, limit: $limit) {
    id
    title
    slug
    shortDescription
    price
    originalPrice
    images
    averageRating
    reviewCount
    seller {
      id
      firstName
      lastName
    }
    category {
      id
      name
    }
  }
}
    `;

/**
 * __useRelatedProductsQuery__
 *
 * To run a query within a React component, call `useRelatedProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRelatedProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRelatedProductsQuery({
 *   variables: {
 *      productId: // value for 'productId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRelatedProductsQuery(baseOptions: Apollo.QueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables> & ({ variables: RelatedProductsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RelatedProductsQuery, RelatedProductsQueryVariables>(RelatedProductsDocument, options);
      }
export function useRelatedProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RelatedProductsQuery, RelatedProductsQueryVariables>(RelatedProductsDocument, options);
        }
// @ts-ignore
export function useRelatedProductsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables>): Apollo.UseSuspenseQueryResult<RelatedProductsQuery, RelatedProductsQueryVariables>;
export function useRelatedProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables>): Apollo.UseSuspenseQueryResult<RelatedProductsQuery | undefined, RelatedProductsQueryVariables>;
export function useRelatedProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<RelatedProductsQuery, RelatedProductsQueryVariables>(RelatedProductsDocument, options);
        }
export type RelatedProductsQueryHookResult = ReturnType<typeof useRelatedProductsQuery>;
export type RelatedProductsLazyQueryHookResult = ReturnType<typeof useRelatedProductsLazyQuery>;
export type RelatedProductsSuspenseQueryHookResult = ReturnType<typeof useRelatedProductsSuspenseQuery>;
export type RelatedProductsQueryResult = Apollo.QueryResult<RelatedProductsQuery, RelatedProductsQueryVariables>;
export const CreateProductDocument = gql`
    mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    title
    slug
    status
    price
    stock
    images
  }
}
    `;
export type CreateProductMutationFn = Apollo.MutationFunction<CreateProductMutation, CreateProductMutationVariables>;

/**
 * __useCreateProductMutation__
 *
 * To run a mutation, you first call `useCreateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProductMutation, { data, loading, error }] = useCreateProductMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateProductMutation(baseOptions?: Apollo.MutationHookOptions<CreateProductMutation, CreateProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProductMutation, CreateProductMutationVariables>(CreateProductDocument, options);
      }
export type CreateProductMutationHookResult = ReturnType<typeof useCreateProductMutation>;
export type CreateProductMutationResult = Apollo.MutationResult<CreateProductMutation>;
export type CreateProductMutationOptions = Apollo.BaseMutationOptions<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = gql`
    mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    title
    slug
    status
    price
    stock
    images
  }
}
    `;
export type UpdateProductMutationFn = Apollo.MutationFunction<UpdateProductMutation, UpdateProductMutationVariables>;

/**
 * __useUpdateProductMutation__
 *
 * To run a mutation, you first call `useUpdateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProductMutation, { data, loading, error }] = useUpdateProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProductMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProductMutation, UpdateProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProductMutation, UpdateProductMutationVariables>(UpdateProductDocument, options);
      }
export type UpdateProductMutationHookResult = ReturnType<typeof useUpdateProductMutation>;
export type UpdateProductMutationResult = Apollo.MutationResult<UpdateProductMutation>;
export type UpdateProductMutationOptions = Apollo.BaseMutationOptions<UpdateProductMutation, UpdateProductMutationVariables>;
export const DeleteProductDocument = gql`
    mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id)
}
    `;
export type DeleteProductMutationFn = Apollo.MutationFunction<DeleteProductMutation, DeleteProductMutationVariables>;

/**
 * __useDeleteProductMutation__
 *
 * To run a mutation, you first call `useDeleteProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProductMutation, { data, loading, error }] = useDeleteProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProductMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProductMutation, DeleteProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProductMutation, DeleteProductMutationVariables>(DeleteProductDocument, options);
      }
export type DeleteProductMutationHookResult = ReturnType<typeof useDeleteProductMutation>;
export type DeleteProductMutationResult = Apollo.MutationResult<DeleteProductMutation>;
export type DeleteProductMutationOptions = Apollo.BaseMutationOptions<DeleteProductMutation, DeleteProductMutationVariables>;
export const PublishProductDocument = gql`
    mutation PublishProduct($id: ID!) {
  publishProduct(id: $id) {
    id
    status
    publishedAt
  }
}
    `;
export type PublishProductMutationFn = Apollo.MutationFunction<PublishProductMutation, PublishProductMutationVariables>;

/**
 * __usePublishProductMutation__
 *
 * To run a mutation, you first call `usePublishProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishProductMutation, { data, loading, error }] = usePublishProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePublishProductMutation(baseOptions?: Apollo.MutationHookOptions<PublishProductMutation, PublishProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishProductMutation, PublishProductMutationVariables>(PublishProductDocument, options);
      }
export type PublishProductMutationHookResult = ReturnType<typeof usePublishProductMutation>;
export type PublishProductMutationResult = Apollo.MutationResult<PublishProductMutation>;
export type PublishProductMutationOptions = Apollo.BaseMutationOptions<PublishProductMutation, PublishProductMutationVariables>;
export const UnpublishProductDocument = gql`
    mutation UnpublishProduct($id: ID!) {
  unpublishProduct(id: $id) {
    id
    status
  }
}
    `;
export type UnpublishProductMutationFn = Apollo.MutationFunction<UnpublishProductMutation, UnpublishProductMutationVariables>;

/**
 * __useUnpublishProductMutation__
 *
 * To run a mutation, you first call `useUnpublishProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnpublishProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unpublishProductMutation, { data, loading, error }] = useUnpublishProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUnpublishProductMutation(baseOptions?: Apollo.MutationHookOptions<UnpublishProductMutation, UnpublishProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnpublishProductMutation, UnpublishProductMutationVariables>(UnpublishProductDocument, options);
      }
export type UnpublishProductMutationHookResult = ReturnType<typeof useUnpublishProductMutation>;
export type UnpublishProductMutationResult = Apollo.MutationResult<UnpublishProductMutation>;
export type UnpublishProductMutationOptions = Apollo.BaseMutationOptions<UnpublishProductMutation, UnpublishProductMutationVariables>;
export const IncrementProductViewDocument = gql`
    mutation IncrementProductView($id: ID!) {
  incrementProductView(id: $id) {
    id
    viewCount
  }
}
    `;
export type IncrementProductViewMutationFn = Apollo.MutationFunction<IncrementProductViewMutation, IncrementProductViewMutationVariables>;

/**
 * __useIncrementProductViewMutation__
 *
 * To run a mutation, you first call `useIncrementProductViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useIncrementProductViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [incrementProductViewMutation, { data, loading, error }] = useIncrementProductViewMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useIncrementProductViewMutation(baseOptions?: Apollo.MutationHookOptions<IncrementProductViewMutation, IncrementProductViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<IncrementProductViewMutation, IncrementProductViewMutationVariables>(IncrementProductViewDocument, options);
      }
export type IncrementProductViewMutationHookResult = ReturnType<typeof useIncrementProductViewMutation>;
export type IncrementProductViewMutationResult = Apollo.MutationResult<IncrementProductViewMutation>;
export type IncrementProductViewMutationOptions = Apollo.BaseMutationOptions<IncrementProductViewMutation, IncrementProductViewMutationVariables>;
export const ToggleProductFavoriteDocument = gql`
    mutation ToggleProductFavorite($id: ID!) {
  toggleProductFavorite(id: $id) {
    id
    favoriteCount
  }
}
    `;
export type ToggleProductFavoriteMutationFn = Apollo.MutationFunction<ToggleProductFavoriteMutation, ToggleProductFavoriteMutationVariables>;

/**
 * __useToggleProductFavoriteMutation__
 *
 * To run a mutation, you first call `useToggleProductFavoriteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleProductFavoriteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleProductFavoriteMutation, { data, loading, error }] = useToggleProductFavoriteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useToggleProductFavoriteMutation(baseOptions?: Apollo.MutationHookOptions<ToggleProductFavoriteMutation, ToggleProductFavoriteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ToggleProductFavoriteMutation, ToggleProductFavoriteMutationVariables>(ToggleProductFavoriteDocument, options);
      }
export type ToggleProductFavoriteMutationHookResult = ReturnType<typeof useToggleProductFavoriteMutation>;
export type ToggleProductFavoriteMutationResult = Apollo.MutationResult<ToggleProductFavoriteMutation>;
export type ToggleProductFavoriteMutationOptions = Apollo.BaseMutationOptions<ToggleProductFavoriteMutation, ToggleProductFavoriteMutationVariables>;
export const MyWalletDocument = gql`
    query MyWallet {
  me {
    wallet {
      id
      balance
      frozenBalance
      totalEarnings
      totalSpent
    }
  }
}
    `;

/**
 * __useMyWalletQuery__
 *
 * To run a query within a React component, call `useMyWalletQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyWalletQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyWalletQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyWalletQuery(baseOptions?: Apollo.QueryHookOptions<MyWalletQuery, MyWalletQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyWalletQuery, MyWalletQueryVariables>(MyWalletDocument, options);
      }
export function useMyWalletLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyWalletQuery, MyWalletQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyWalletQuery, MyWalletQueryVariables>(MyWalletDocument, options);
        }
// @ts-ignore
export function useMyWalletSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MyWalletQuery, MyWalletQueryVariables>): Apollo.UseSuspenseQueryResult<MyWalletQuery, MyWalletQueryVariables>;
export function useMyWalletSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyWalletQuery, MyWalletQueryVariables>): Apollo.UseSuspenseQueryResult<MyWalletQuery | undefined, MyWalletQueryVariables>;
export function useMyWalletSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyWalletQuery, MyWalletQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyWalletQuery, MyWalletQueryVariables>(MyWalletDocument, options);
        }
export type MyWalletQueryHookResult = ReturnType<typeof useMyWalletQuery>;
export type MyWalletLazyQueryHookResult = ReturnType<typeof useMyWalletLazyQuery>;
export type MyWalletSuspenseQueryHookResult = ReturnType<typeof useMyWalletSuspenseQuery>;
export type MyWalletQueryResult = Apollo.QueryResult<MyWalletQuery, MyWalletQueryVariables>;
export const WalletTransactionsDocument = gql`
    query WalletTransactions($pagination: PaginationInput) {
  myTransactions(pagination: $pagination) {
    id
    type
    amount
    currency
    balanceBefore
    balanceAfter
    description
    reference
    status
    order {
      id
      orderNumber
      items {
        productName
        quantity
      }
    }
    createdAt
  }
}
    `;

/**
 * __useWalletTransactionsQuery__
 *
 * To run a query within a React component, call `useWalletTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWalletTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWalletTransactionsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useWalletTransactionsQuery(baseOptions?: Apollo.QueryHookOptions<WalletTransactionsQuery, WalletTransactionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WalletTransactionsQuery, WalletTransactionsQueryVariables>(WalletTransactionsDocument, options);
      }
export function useWalletTransactionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WalletTransactionsQuery, WalletTransactionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WalletTransactionsQuery, WalletTransactionsQueryVariables>(WalletTransactionsDocument, options);
        }
// @ts-ignore
export function useWalletTransactionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<WalletTransactionsQuery, WalletTransactionsQueryVariables>): Apollo.UseSuspenseQueryResult<WalletTransactionsQuery, WalletTransactionsQueryVariables>;
export function useWalletTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WalletTransactionsQuery, WalletTransactionsQueryVariables>): Apollo.UseSuspenseQueryResult<WalletTransactionsQuery | undefined, WalletTransactionsQueryVariables>;
export function useWalletTransactionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<WalletTransactionsQuery, WalletTransactionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<WalletTransactionsQuery, WalletTransactionsQueryVariables>(WalletTransactionsDocument, options);
        }
export type WalletTransactionsQueryHookResult = ReturnType<typeof useWalletTransactionsQuery>;
export type WalletTransactionsLazyQueryHookResult = ReturnType<typeof useWalletTransactionsLazyQuery>;
export type WalletTransactionsSuspenseQueryHookResult = ReturnType<typeof useWalletTransactionsSuspenseQuery>;
export type WalletTransactionsQueryResult = Apollo.QueryResult<WalletTransactionsQuery, WalletTransactionsQueryVariables>;