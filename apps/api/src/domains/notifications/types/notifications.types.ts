// GraphQL Type Definitions for Notifications Domain

export const notificationsTypeDefs = `#graphql
  enum NotificationType {
    ORDER_CREATED
    ORDER_CONFIRMED
    ORDER_SHIPPED
    ORDER_DELIVERED
    ORDER_CANCELLED
    PAYMENT_SUCCESS
    PAYMENT_FAILED
    PRODUCT_LOW_STOCK
    PRODUCT_OUT_OF_STOCK
    NEW_REVIEW
    REVIEW_RESPONSE
    ACCOUNT_CREATED
    EMAIL_VERIFIED
    PASSWORD_CHANGED
    PROFILE_UPDATED
    PROMOTION_ALERT
    SYSTEM_MAINTENANCE
    SECURITY_ALERT
    CUSTOM
  }

  enum NotificationChannel {
    IN_APP
    EMAIL
    SMS
    PUSH
  }

  enum NotificationPriority {
    LOW
    NORMAL
    HIGH
    URGENT
  }

  enum DevicePlatform {
    ANDROID
    IOS
    WEB
  }

  type Notification {
    id: ID!
    userId: ID!
    user: User!
    type: NotificationType!
    channel: NotificationChannel!
    priority: NotificationPriority!

    # Content
    title: String!
    message: String!
    actionText: String
    actionUrl: String

    # Metadata
    data: JSON
    relatedEntityType: String
    relatedEntityId: ID
    relatedEntity: NotificationEntity

    # Status
    isRead: Boolean!
    isSent: Boolean!
    isDelivered: Boolean

    # Timing
    scheduledFor: String
    sentAt: String
    readAt: String
    deliveredAt: String
    clickedAt: String
    dismissedAt: String

    createdAt: String!
    updatedAt: String!
  }

  union NotificationEntity = Order | Product | User | Review

  type NotificationPreferences {
    id: ID!
    userId: ID!
    user: User!

    # Email preferences
    emailOrderUpdates: Boolean!
    emailPromotions: Boolean!
    emailSecurity: Boolean!
    emailReviews: Boolean!
    emailNewsletter: Boolean!

    # SMS preferences
    smsOrderUpdates: Boolean!
    smsSecurity: Boolean!
    smsPromotions: Boolean!

    # Push preferences
    pushOrderUpdates: Boolean!
    pushPromotions: Boolean!
    pushSecurity: Boolean!
    pushReviews: Boolean!

    # In-app preferences
    inAppOrderUpdates: Boolean!
    inAppPromotions: Boolean!
    inAppSecurity: Boolean!
    inAppReviews: Boolean!

    # Global settings
    emailFrequency: String!
    quietHoursStart: String!
    quietHoursEnd: String!
    timezone: String!

    createdAt: String!
    updatedAt: String!
  }

  type DeviceToken {
    id: ID!
    userId: ID!
    user: User!
    token: String!
    platform: DevicePlatform!
    deviceName: String
    deviceModel: String
    osVersion: String
    appVersion: String
    isActive: Boolean!
    lastUsed: String!
    createdAt: String!
    updatedAt: String!
  }

  type NotificationTemplate {
    id: ID!
    type: NotificationType!
    channel: NotificationChannel!
    titleTemplate: String!
    messageTemplate: String!
    actionTextTemplate: String
    actionUrlTemplate: String
    emailSubject: String
    emailHtml: String
    variables: JSON
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type NotificationsConnection {
    edges: [NotificationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
    unreadCount: Int!
  }

  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  type NotificationStats {
    totalNotifications: Int!
    unreadNotifications: Int!
    notificationsByType: [NotificationTypeCount!]!
    notificationsByChannel: [NotificationChannelCount!]!
    recentNotifications: [Notification!]!
  }

  type NotificationTypeCount {
    type: NotificationType!
    count: Int!
  }

  type NotificationChannelCount {
    channel: NotificationChannel!
    count: Int!
  }

  input NotificationFilter {
    type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority
    isRead: Boolean
    dateFrom: String
    dateTo: String
  }

  input CreateNotificationInput {
    userId: ID!
    type: NotificationType!
    channel: NotificationChannel!
    priority: NotificationPriority
    title: String!
    message: String!
    actionText: String
    actionUrl: String
    data: JSON
    relatedEntityType: String
    relatedEntityId: ID
    scheduledFor: String
  }

  input BulkNotificationInput {
    userIds: [ID!]!
    type: NotificationType!
    channels: [NotificationChannel!]!
    priority: NotificationPriority
    title: String!
    message: String!
    actionText: String
    actionUrl: String
    data: JSON
    scheduledFor: String
  }

  input UpdateNotificationPreferencesInput {
    emailOrderUpdates: Boolean
    emailPromotions: Boolean
    emailSecurity: Boolean
    emailReviews: Boolean
    emailNewsletter: Boolean
    smsOrderUpdates: Boolean
    smsSecurity: Boolean
    smsPromotions: Boolean
    pushOrderUpdates: Boolean
    pushPromotions: Boolean
    pushSecurity: Boolean
    pushReviews: Boolean
    inAppOrderUpdates: Boolean
    inAppPromotions: Boolean
    inAppSecurity: Boolean
    inAppReviews: Boolean
    emailFrequency: String
    quietHoursStart: String
    quietHoursEnd: String
    timezone: String
  }

  input RegisterDeviceTokenInput {
    token: String!
    platform: DevicePlatform!
    deviceName: String
    deviceModel: String
    osVersion: String
    appVersion: String
  }

  input CreateTemplateInput {
    type: NotificationType!
    channel: NotificationChannel!
    titleTemplate: String!
    messageTemplate: String!
    actionTextTemplate: String
    actionUrlTemplate: String
    emailSubject: String
    emailHtml: String
    variables: JSON
  }

  input UpdateTemplateInput {
    titleTemplate: String
    messageTemplate: String
    actionTextTemplate: String
    actionUrlTemplate: String
    emailSubject: String
    emailHtml: String
    variables: JSON
    isActive: Boolean
  }

  extend type Query {
    # User notifications
    myNotifications(
      filter: NotificationFilter
      pagination: PaginationInput
    ): NotificationsConnection!

    notification(id: ID!): Notification

    # Preferences
    myNotificationPreferences: NotificationPreferences!

    # Device tokens
    myDeviceTokens: [DeviceToken!]!

    # Admin queries
    notificationStats: NotificationStats!
    notificationTemplates: [NotificationTemplate!]!
    notificationTemplate(id: ID!): NotificationTemplate

    # Unread count
    unreadNotificationCount: Int!
  }

  extend type Mutation {
    # Notification actions
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Int!
    dismissNotification(id: ID!): Notification!
    clickNotification(id: ID!): Notification!

    # Preferences management
    updateNotificationPreferences(input: UpdateNotificationPreferencesInput!): NotificationPreferences!

    # Device token management
    registerDeviceToken(input: RegisterDeviceTokenInput!): DeviceToken!
    unregisterDeviceToken(token: String!): Boolean!
    refreshDeviceToken(oldToken: String!, newToken: String!): DeviceToken!

    # Notification creation (admin/system)
    createNotification(input: CreateNotificationInput!): Notification!
    sendBulkNotification(input: BulkNotificationInput!): [Notification!]!

    # Template management (admin only)
    createNotificationTemplate(input: CreateTemplateInput!): NotificationTemplate!
    updateNotificationTemplate(id: ID!, input: UpdateTemplateInput!): NotificationTemplate!
    deleteNotificationTemplate(id: ID!): Boolean!

    # Testing (admin only)
    sendTestNotification(userId: ID!, type: NotificationType!, channels: [NotificationChannel!]!): [Notification!]!

    # Email management
    unsubscribeFromEmails(token: String!): Boolean!
    resubscribeToEmails(email: String!): Boolean!
  }

  extend type Subscription {
    # Real-time notifications
    notificationReceived(userId: ID!): Notification!
    notificationUpdated(userId: ID!): Notification!
  }
`;