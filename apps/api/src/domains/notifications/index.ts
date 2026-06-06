// Notifications domain exports
export * from './schema/notifications.schema';
export * from './types/notifications.types';
export * from './resolvers/notifications.resolvers';

// Combined exports for easy import
export { notificationsTypeDefs } from './types/notifications.types';
export { notificationsResolvers } from './resolvers/notifications.resolvers';
export {
  notifications,
  notificationPreferences,
  deviceTokens,
  notificationTemplates,
  type Notification,
  type NotificationPreferences,
  type DeviceToken,
  type NotificationTemplate,
} from './schema/notifications.schema';