import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth, requireAdmin } from '../../../infrastructure/context';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';

export const notificationsResolvers: Resolvers = {
  Query: {
    myNotifications: async (_parent, args, context) => {
      const user = requireAuth(context);
      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      const whereConditions = [];
      whereConditions.push(['userId', user.id]);

      if (filter.type) whereConditions.push(['type', filter.type]);
      if (filter.channel) whereConditions.push(['channel', filter.channel]);
      if (filter.priority) whereConditions.push(['priority', filter.priority]);
      if (filter.isRead !== undefined) whereConditions.push(['isRead', filter.isRead]);

      const notifications = await context.db.query.notifications.findMany({
        where: (notifications: any, { eq, and, gte, lte }: any) => {
          const conditions = whereConditions.map(([field, value]) => eq(notifications[field], value));

          if (filter.dateFrom) conditions.push(gte(notifications.createdAt, new Date(filter.dateFrom)));
          if (filter.dateTo) conditions.push(lte(notifications.createdAt, new Date(filter.dateTo)));

          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (notifications: any, { desc }: any) => desc(notifications.createdAt),
      });

      // Get unread count
      const unreadNotifications = await context.db.query.notifications.findMany({
        where: (notifications: any, { eq, and }: any) => and(
          eq(notifications.userId, user.id),
          eq(notifications.isRead, false)
        ),
      });

      return {
        edges: notifications.map((notification: any, index: number) => ({
          node: notification,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: notifications.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: notifications.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: notifications.length > 0 ? Buffer.from(`${pagination.offset + notifications.length - 1}`).toString('base64') : null,
        },
        totalCount: notifications.length,
        unreadCount: unreadNotifications.length,
      };
    },

    notification: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const notification = await context.db.query.notifications.findFirst({
        where: (notifications: any, { eq }: any) => eq(notifications.id, id),
      });

      if (!notification) throw new Error('Notification not found');

      if (notification.userId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to view this notification');
      }

      return notification;
    },

    myNotificationPreferences: async (_parent, _args, context) => {
      const user = requireAuth(context);

      let preferences = await context.db.query.notificationPreferences.findFirst({
        where: (prefs: any, { eq }: any) => eq(prefs.userId, user.id),
      });

      if (!preferences) {
        // Create default preferences
        const { randomUUID } = await import('crypto');
        const [newPreferences] = await context.db
          .insert(context.schema.notificationPreferences)
          .values({
            id: randomUUID(),
            userId: user.id,
          })
          .returning();

        preferences = newPreferences;
      }

      return preferences;
    },

    myDeviceTokens: async (_parent, _args, context) => {
      const user = requireAuth(context);

      return await context.db.query.deviceTokens.findMany({
        where: (tokens: any, { eq }: any) => eq(tokens.userId, user.id),
        orderBy: (tokens: any, { desc }: any) => desc(tokens.lastUsed),
      });
    },

    unreadNotificationCount: async (_parent, _args, context) => {
      const user = requireAuth(context);

      const unreadNotifications = await context.db.query.notifications.findMany({
        where: (notifications: any, { eq, and }: any) => and(
          eq(notifications.userId, user.id),
          eq(notifications.isRead, false)
        ),
      });

      return unreadNotifications.length;
    },

    notificationStats: async (_parent, _args, context) => {
      requireAdmin(context);

      const allNotifications = await context.db.query.notifications.findMany();

      const totalNotifications = allNotifications.length;
      const unreadNotifications = allNotifications.filter(n => !n.isRead).length;

      // Group by type
      const notificationsByType = Object.entries(
        allNotifications.reduce((acc: any, notification) => {
          acc[notification.type] = (acc[notification.type] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({ type, count }));

      // Group by channel
      const notificationsByChannel = Object.entries(
        allNotifications.reduce((acc: any, notification) => {
          acc[notification.channel] = (acc[notification.channel] || 0) + 1;
          return acc;
        }, {})
      ).map(([channel, count]) => ({ channel, count }));

      // Recent notifications (last 10)
      const recentNotifications = allNotifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      return {
        totalNotifications,
        unreadNotifications,
        notificationsByType,
        notificationsByChannel,
        recentNotifications,
      };
    },

    notificationTemplates: async (_parent, _args, context) => {
      requireAdmin(context);

      return await context.db.query.notificationTemplates.findMany({
        orderBy: (templates: any, { asc }: any) => [asc(templates.type), asc(templates.channel)],
      });
    },
  },

  Mutation: {
    markNotificationAsRead: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const notification = await context.db.query.notifications.findFirst({
        where: (notifications: any, { eq }: any) => eq(notifications.id, id),
      });

      if (!notification) throw new Error('Notification not found');

      if (notification.userId !== user.id) {
        throw new Error('Unauthorized to update this notification');
      }

      const [updatedNotification] = await context.db
        .update(context.schema.notifications)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(context.schema.notifications.id, id))
        .returning();

      return updatedNotification;
    },

    markAllNotificationsAsRead: async (_parent, _args, context) => {
      const user = requireAuth(context);

      const updatedRows = await context.db
        .update(context.schema.notifications)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(context.schema.notifications.userId, user.id),
          eq(context.schema.notifications.isRead, false)
        ))
        .returning();

      return updatedRows.length;
    },

    dismissNotification: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const [updatedNotification] = await context.db
        .update(context.schema.notifications)
        .set({
          dismissedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(context.schema.notifications.id, id),
          eq(context.schema.notifications.userId, user.id)
        ))
        .returning();

      return updatedNotification;
    },

    clickNotification: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const [updatedNotification] = await context.db
        .update(context.schema.notifications)
        .set({
          clickedAt: new Date(),
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(context.schema.notifications.id, id),
          eq(context.schema.notifications.userId, user.id)
        ))
        .returning();

      return updatedNotification;
    },

    updateNotificationPreferences: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Check if preferences exist
      const existingPreferences = await context.db.query.notificationPreferences.findFirst({
        where: (prefs: any, { eq }: any) => eq(prefs.userId, user.id),
      });

      if (existingPreferences) {
        const [updatedPreferences] = await context.db
          .update(context.schema.notificationPreferences)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(context.schema.notificationPreferences.id, existingPreferences.id))
          .returning();

        return updatedPreferences;
      } else {
        // Create new preferences
        const { randomUUID } = await import('crypto');
        const [newPreferences] = await context.db
          .insert(context.schema.notificationPreferences)
          .values({
            id: randomUUID(),
            userId: user.id,
            ...input,
          })
          .returning();

        return newPreferences;
      }
    },

    registerDeviceToken: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Check if token already exists
      const existingToken = await context.db.query.deviceTokens.findFirst({
        where: (tokens: any, { eq }: any) => eq(tokens.token, input.token),
      });

      if (existingToken) {
        // Update existing token
        const [updatedToken] = await context.db
          .update(context.schema.deviceTokens)
          .set({
            userId: user.id,
            platform: input.platform,
            deviceName: input.deviceName,
            deviceModel: input.deviceModel,
            osVersion: input.osVersion,
            appVersion: input.appVersion,
            isActive: true,
            lastUsed: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(context.schema.deviceTokens.id, existingToken.id))
          .returning();

        return updatedToken;
      } else {
        // Create new token
        const { randomUUID } = await import('crypto');
        const [newToken] = await context.db
          .insert(context.schema.deviceTokens)
          .values({
            id: randomUUID(),
            userId: user.id,
            ...input,
          })
          .returning();

        return newToken;
      }
    },

    unregisterDeviceToken: async (_parent, { token }, context) => {
      const user = requireAuth(context);

      await context.db
        .update(context.schema.deviceTokens)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(and(
          eq(context.schema.deviceTokens.token, token),
          eq(context.schema.deviceTokens.userId, user.id)
        ));

      return true;
    },

    createNotification: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const [newNotification] = await context.db
        .insert(context.schema.notifications)
        .values({
          id: randomUUID(),
          ...input,
          data: input.data ? JSON.stringify(input.data) : null,
          isSent: !input.scheduledFor, // Mark as sent if not scheduled
          sentAt: !input.scheduledFor ? new Date() : null,
        })
        .returning();

      // TODO: Trigger actual sending based on channel
      return newNotification;
    },

    sendBulkNotification: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const notifications = [];

      for (const userId of input.userIds) {
        for (const channel of input.channels) {
          const [notification] = await context.db
            .insert(context.schema.notifications)
            .values({
              id: randomUUID(),
              userId,
              type: input.type,
              channel,
              priority: input.priority || 'NORMAL',
              title: input.title,
              message: input.message,
              actionText: input.actionText,
              actionUrl: input.actionUrl,
              data: input.data ? JSON.stringify(input.data) : null,
              scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
              isSent: !input.scheduledFor,
              sentAt: !input.scheduledFor ? new Date() : null,
            })
            .returning();

          notifications.push(notification);
        }
      }

      return notifications;
    },

    createNotificationTemplate: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const [newTemplate] = await context.db
        .insert(context.schema.notificationTemplates)
        .values({
          id: randomUUID(),
          ...input,
          variables: input.variables ? JSON.stringify(input.variables) : null,
        })
        .returning();

      return newTemplate;
    },

    updateNotificationTemplate: async (_parent, { id, input }, context) => {
      requireAdmin(context);

      const [updatedTemplate] = await context.db
        .update(context.schema.notificationTemplates)
        .set({
          ...input,
          variables: input.variables ? JSON.stringify(input.variables) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.notificationTemplates.id, id))
        .returning();

      return updatedTemplate;
    },

    sendTestNotification: async (_parent, { userId, type, channels }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const notifications = [];

      for (const channel of channels) {
        const [notification] = await context.db
          .insert(context.schema.notifications)
          .values({
            id: randomUUID(),
            userId,
            type,
            channel,
            priority: 'NORMAL',
            title: `Test ${type} Notification`,
            message: `This is a test ${channel} notification for ${type}`,
            isSent: true,
            sentAt: new Date(),
          })
          .returning();

        notifications.push(notification);
      }

      return notifications;
    },
  },

  // Type resolvers
  Notification: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },

    data: (parent: any) => {
      try {
        return parent.data ? JSON.parse(parent.data) : null;
      } catch {
        return null;
      }
    },

    relatedEntity: async (parent: any, _args: any, context: any) => {
      if (!parent.relatedEntityType || !parent.relatedEntityId) return null;

      switch (parent.relatedEntityType) {
        case 'ORDER':
          return context.db.query.orders.findFirst({
            where: (orders: any, { eq }: any) => eq(orders.id, parent.relatedEntityId),
          });
        case 'PRODUCT':
          return context.db.query.products.findFirst({
            where: (products: any, { eq }: any) => eq(products.id, parent.relatedEntityId),
          });
        case 'USER':
          return context.db.query.users.findFirst({
            where: (users: any, { eq }: any) => eq(users.id, parent.relatedEntityId),
          });
        case 'REVIEW':
          return context.db.query.reviews.findFirst({
            where: (reviews: any, { eq }: any) => eq(reviews.id, parent.relatedEntityId),
          });
        default:
          return null;
      }
    },
  },

  NotificationPreferences: {
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

  NotificationTemplate: {
    variables: (parent: any) => {
      try {
        return parent.variables ? JSON.parse(parent.variables) : null;
      } catch {
        return null;
      }
    },
  },
};