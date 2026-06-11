'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

// GraphQL queries and mutations
const SELLER_NOTIFICATIONS_QUERY = gql`
  query SellerNotifications($pagination: PaginationInput, $filter: NotificationFilter) {
    myNotifications(pagination: $pagination, filter: $filter) {
      edges {
        node {
          id
          title
          message
          type
          priority
          isRead
          actionUrl
          actionText
          data
          createdAt
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

const MARK_ALL_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

interface NotificationItemProps {
  notification: any;
  onMarkRead: (id: string) => void;
  onAction: (actionUrl: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onAction }) => {
  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'order':
        return ShoppingBagIcon;
      case 'product':
        return ArchiveBoxIcon;
      case 'payment':
        return CurrencyDollarIcon;
      case 'review':
        return UserIcon;
      case 'analytics':
        return ChartBarIcon;
      case 'shipping':
        return TruckIcon;
      case 'alert':
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const Icon = getNotificationIcon(notification.type);
  const priorityColor = getPriorityColor(notification.priority);

  return (
    <div className={`p-4 border-l-4 ${priorityColor} ${notification.isRead ? 'opacity-75' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${notification.priority === 'HIGH' ? 'text-red-500' : 'text-gray-400'}`} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                {notification.title}
              </p>
              <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                {notification.message}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                  title="Mark as read"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              )}
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          {notification.actionUrl && notification.actionText && (
            <div className="mt-3">
              <button
                onClick={() => onAction(notification.actionUrl)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                {notification.actionText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SellerNotificationsProps {
  compact?: boolean;
  showHeader?: boolean;
  maxItems?: number;
}

export function SellerNotifications({
  compact = false,
  showHeader = true,
  maxItems
}: SellerNotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(SELLER_NOTIFICATIONS_QUERY, {
    variables: {
      pagination: maxItems ? { limit: maxItems, offset: 0 } : { limit: 50, offset: 0 },
      filter: filter === 'unread' ? { isRead: false } : filter === 'high' ? { priority: 'HIGH' } : {}
    },
    pollInterval: 30000, // Poll every 30 seconds for new notifications
    errorPolicy: 'all'
  });

  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    onCompleted: () => refetch(),
    onError: (error) => toast.error(`Failed to mark notification as read: ${error.message}`)
  });

  const [markAllRead] = useMutation(MARK_ALL_READ_MUTATION, {
    onCompleted: () => {
      toast.success('All notifications marked as read');
      refetch();
    },
    onError: (error) => toast.error(`Failed to mark all as read: ${error.message}`)
  });

  const notifications = data?.myNotifications?.edges?.map((edge: any) => edge.node) || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const totalCount = data?.myNotifications?.totalCount || 0;

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead({ variables: { id: notificationId } });
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleAction = (actionUrl: string) => {
    // Navigate to the action URL
    window.location.href = actionUrl;
  };

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.notifications-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <div className="animate-pulse">
        {showHeader && (
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact view for navbar/header
    return (
      <div className="relative notifications-dropdown">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Notifications"
        >
          {unreadCount > 0 ? (
            <BellIconSolid className="h-6 w-6 text-blue-600" />
          ) : (
            <BellIcon className="h-6 w-6" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 5).map((notification: any) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <a
                  href="/dashboard/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  View all {totalCount} notifications →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full page view
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your seller activity
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Filter buttons */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All', count: totalCount },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'high', label: 'Important', count: notifications.filter((n: any) => n.priority === 'HIGH').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filter === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label} {count > 0 && `(${count})`}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread'
                ? 'All caught up! No unread notifications.'
                : filter === 'high'
                ? 'No important notifications at the moment.'
                : 'You don\'t have any notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification: any) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="flex-shrink-0 h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading notifications
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load your notifications. Please refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}