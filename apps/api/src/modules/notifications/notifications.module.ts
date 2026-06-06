import { gql } from 'graphql-tag';

// Type definitions for notifications
export const notificationsTypeDefs = gql`
  type Notification {
    id: ID!
    userId: ID!
    user: User!
    type: NotificationType!
    channel: NotificationChannel!
    title: String!
    message: String!
    data: JSON
    isRead: Boolean!
    readAt: DateTime
    sentAt: DateTime
    failureReason: String
    retryCount: Int!
    priority: NotificationPriority!
    expiresAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type NotificationPreference {
    id: ID!
    userId: ID!
    user: User!
    type: NotificationType!
    inAppEnabled: Boolean!
    emailEnabled: Boolean!
    pushEnabled: Boolean!
    smsEnabled: Boolean!
    frequency: NotificationFrequency!
    quietHoursStart: String
    quietHoursEnd: String
    timezone: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DeviceToken {
    id: ID!
    userId: ID!
    user: User!
    token: String!
    platform: DevicePlatform!
    deviceInfo: JSON
    isActive: Boolean!
    lastUsedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type NotificationStats {
    totalUnread: Int!
    unreadByType: [TypeCount!]!
    recentActivity: [Notification!]!
  }

  type TypeCount {
    type: NotificationType!
    count: Int!
  }

  enum NotificationType {
    ORDER_UPDATE
    PAYMENT_SUCCESS
    PAYMENT_FAILED
    PRODUCT_APPROVED
    PRODUCT_REJECTED
    REVIEW_RECEIVED
    MESSAGE_RECEIVED
    WALLET_DEPOSIT
    WALLET_WITHDRAWAL
    PROMOTION_AVAILABLE
    SYSTEM_ANNOUNCEMENT
  }

  enum NotificationChannel {
    IN_APP
    EMAIL
    PUSH
    SMS
  }

  enum NotificationPriority {
    LOW
    NORMAL
    HIGH
    URGENT
  }

  enum NotificationFrequency {
    IMMEDIATE
    HOURLY
    DAILY
    WEEKLY
    NEVER
  }

  enum DevicePlatform {
    IOS
    ANDROID
    WEB
    DESKTOP
  }

  input CreateNotificationInput {
    userId: ID!
    type: NotificationType!
    channel: NotificationChannel!
    title: String!
    message: String!
    data: JSON
    priority: NotificationPriority = NORMAL
    expiresAt: DateTime
  }

  input UpdateNotificationPreferenceInput {
    type: NotificationType!
    inAppEnabled: Boolean
    emailEnabled: Boolean
    pushEnabled: Boolean
    smsEnabled: Boolean
    frequency: NotificationFrequency
    quietHoursStart: String
    quietHoursEnd: String
    timezone: String
  }

  input RegisterDeviceTokenInput {
    token: String!
    platform: DevicePlatform!
    deviceInfo: JSON
  }

  input NotificationsFilterInput {
    type: NotificationType
    channel: NotificationChannel
    isRead: Boolean
    priority: NotificationPriority
    dateFrom: DateTime
    dateTo: DateTime
  }

  input BulkNotificationInput {
    userIds: [ID!]!
    type: NotificationType!
    channel: NotificationChannel!
    title: String!
    message: String!
    data: JSON
    priority: NotificationPriority = NORMAL
  }

  type NotificationConnection {
    edges: [NotificationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
    unreadCount: Int!
  }

  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  extend type Query {
    notifications(
      filter: NotificationsFilterInput
      pagination: PaginationInput
    ): NotificationConnection!

    notification(id: ID!): Notification

    notificationStats: NotificationStats!

    notificationPreferences: [NotificationPreference!]!

    notificationPreference(type: NotificationType!): NotificationPreference

    deviceTokens: [DeviceToken!]!
  }

  extend type Mutation {
    # User operations
    markNotificationRead(id: ID!): Notification!

    markAllNotificationsRead(
      type: NotificationType
    ): Int!

    deleteNotification(id: ID!): Boolean!

    updateNotificationPreference(
      input: UpdateNotificationPreferenceInput!
    ): NotificationPreference!

    registerDeviceToken(
      input: RegisterDeviceTokenInput!
    ): DeviceToken!

    removeDeviceToken(id: ID!): Boolean!

    # Admin operations
    createNotification(
      input: CreateNotificationInput!
    ): Notification!

    sendBulkNotification(
      input: BulkNotificationInput!
    ): Int!

    deleteExpiredNotifications: Int!
  }

  extend type Subscription {
    notificationAdded(userId: ID!): Notification!

    notificationUpdated(userId: ID!): Notification!
  }
`;

// Resolvers for notifications
export const notificationsResolvers = {
  Subscription: {
    notificationAdded: {
      // TODO: Implement real-time subscriptions
      subscribe: async (parent: any, args: any, context: any) => {
        throw new Error('Subscriptions not yet implemented');
      },
    },
    notificationUpdated: {
      // TODO: Implement real-time subscriptions
      subscribe: async (parent: any, args: any, context: any) => {
        throw new Error('Subscriptions not yet implemented');
      },
    },
  },
  Query: {
    notifications: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      const whereConditions = [
        ['userId', context.user.id]
      ];

      if (filter.type) whereConditions.push(['type', filter.type]);
      if (filter.channel) whereConditions.push(['channel', filter.channel]);
      if (filter.isRead !== undefined) whereConditions.push(['isRead', filter.isRead]);
      if (filter.priority) whereConditions.push(['priority', filter.priority]);

      const notifications = await context.db.query.notifications.findMany({
        where: (notifications: any, { eq, and }: any) => {
          return and(...whereConditions.map(([field, value]) => eq(notifications[field], value)));
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (notifications: any, { desc }: any) => desc(notifications.createdAt),
      });

      const totalCount = notifications.length;
      const unreadCount = notifications.filter(n => !n.isRead).length;
      const hasNextPage = notifications.length === pagination.limit;

      return {
        edges: notifications.map((notification: any, index: number) => ({
          node: notification,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: pagination.offset > 0,
          startCursor: notifications.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: notifications.length > 0 ? Buffer.from(`${pagination.offset + notifications.length - 1}`).toString('base64') : null,
        },
        totalCount,
        unreadCount,
      };
    },

    notification: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      return await context.db.query.notifications.findFirst({
        where: (notifications: any, { eq, and }: any) => and(
          eq(notifications.id, args.id),
          eq(notifications.userId, context.user.id)
        ),
      });
    },

    notificationStats: async (parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const notifications = await context.db.query.notifications.findMany({
        where: (notifications: any, { eq }: any) => eq(notifications.userId, context.user.id),
        orderBy: (notifications: any, { desc }: any) => desc(notifications.createdAt),
      });

      const unreadNotifications = notifications.filter(n => !n.isRead);
      const totalUnread = unreadNotifications.length;

      // Count unread by type
      const unreadByType = Object.values(NotificationType).map(type => ({
        type,
        count: unreadNotifications.filter(n => n.type === type).length,
      })).filter(item => item.count > 0);

      // Recent activity (last 10 notifications)
      const recentActivity = notifications.slice(0, 10);

      return {
        totalUnread,
        unreadByType,
        recentActivity,
      };
    },

    notificationPreferences: async (parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      return await context.db.query.notificationPreferences.findMany({
        where: (preferences: any, { eq }: any) => eq(preferences.userId, context.user.id),
        orderBy: (preferences: any, { asc }: any) => asc(preferences.type),
      });
    },

    notificationPreference: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      return await context.db.query.notificationPreferences.findFirst({
        where: (preferences: any, { eq, and }: any) => and(
          eq(preferences.userId, context.user.id),
          eq(preferences.type, args.type)
        ),
      });
    },

    deviceTokens: async (parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      return await context.db.query.deviceTokens.findMany({
        where: (tokens: any, { eq }: any) => eq(tokens.userId, context.user.id),
        orderBy: (tokens: any, { desc }: any) => desc(tokens.lastUsedAt),
      });
    },
  },

  Mutation: {
    markNotificationRead: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const [notification] = await context.db
        .update(context.schema.notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(context.schema.notifications.id, args.id),
            eq(context.schema.notifications.userId, context.user.id)
          )
        )
        .returning();

      return notification;
    },

    markAllNotificationsRead: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const whereConditions = [
        eq(context.schema.notifications.userId, context.user.id),
        eq(context.schema.notifications.isRead, false)
      ];

      if (args.type) {
        whereConditions.push(eq(context.schema.notifications.type, args.type));
      }

      const result = await context.db
        .update(context.schema.notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(and(...whereConditions));

      return result.changes || 0;
    },

    updateNotificationPreference: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { randomUUID } = await import('crypto');

      const existingPreference = await context.db.query.notificationPreferences.findFirst({
        where: (preferences: any, { eq, and }: any) => and(
          eq(preferences.userId, context.user.id),
          eq(preferences.type, args.input.type)
        ),
      });

      if (existingPreference) {
        const [updated] = await context.db
          .update(context.schema.notificationPreferences)
          .set(args.input)
          .where(eq(context.schema.notificationPreferences.id, existingPreference.id))
          .returning();

        return updated;
      } else {
        const newPreference = {
          id: randomUUID(),
          userId: context.user.id,
          inAppEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          frequency: 'IMMEDIATE',
          ...args.input,
        };

        const [preference] = await context.db
          .insert(context.schema.notificationPreferences)
          .values(newPreference)
          .returning();

        return preference;
      }
    },

    registerDeviceToken: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { randomUUID } = await import('crypto');

      // Deactivate existing tokens for this user and platform
      await context.db
        .update(context.schema.deviceTokens)
        .set({ isActive: false })
        .where(
          and(
            eq(context.schema.deviceTokens.userId, context.user.id),
            eq(context.schema.deviceTokens.platform, args.input.platform)
          )
        );

      const newToken = {
        id: randomUUID(),
        userId: context.user.id,
        isActive: true,
        lastUsedAt: new Date(),
        ...args.input,
      };

      const [token] = await context.db
        .insert(context.schema.deviceTokens)
        .values(newToken)
        .returning();

      return token;
    },

    createNotification: async (parent: any, args: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const { randomUUID } = await import('crypto');

      const newNotification = {
        id: randomUUID(),
        isRead: false,
        retryCount: 0,
        ...args.input,
      };

      const [notification] = await context.db
        .insert(context.schema.notifications)
        .values(newNotification)
        .returning();

      // TODO: Send notification via appropriate channel
      // This would integrate with email, push notification, and SMS services

      return notification;
    },

    sendBulkNotification: async (parent: any, args: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }

      const { randomUUID } = await import('crypto');
      const { userIds, ...notificationData } = args.input;

      const notifications = userIds.map((userId: string) => ({
        id: randomUUID(),
        userId,
        isRead: false,
        retryCount: 0,
        ...notificationData,
      }));

      await context.db
        .insert(context.schema.notifications)
        .values(notifications);

      // TODO: Send notifications via appropriate channels

      return notifications.length;
    },
  },

  Notification: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },
  },

  NotificationPreference: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },
  },

  DeviceToken: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },
  },
};