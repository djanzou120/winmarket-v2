import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text, Button, Card, Avatar, Separator, Badge } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Settings,
  Package,
  LogOut,
  Heart,
  Bell,
  HelpCircle,
  Shield,
  CreditCard,
  MapPin,
  Edit3,
  ChevronRight,
  Star,
  Truck,
  MessageCircle,
} from '@tamagui/lucide-icons';
import { useAuth } from '../../src/providers/auth-provider';
import { useNotifications } from '../../src/hooks/use-notifications';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { scheduleLocalNotification } = useNotifications();
  const [orders] = useState([
    { id: '1', status: 'delivered', count: 12 },
    { id: '2', status: 'in_transit', count: 2 },
    { id: '3', status: 'pending', count: 1 },
  ]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (item) {
      case 'orders':
        router.push('/orders');
        break;
      case 'favorites':
        router.push('/favorites');
        break;
      case 'addresses':
        router.push('/addresses');
        break;
      case 'payments':
        router.push('/payments');
        break;
      case 'notifications':
        router.push('/settings/notifications');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'help':
        router.push('/help');
        break;
      case 'security':
        router.push('/security');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is coming soon!');
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { color: '$green6', text: 'Delivered' },
      in_transit: { color: '$blue6', text: 'In Transit' },
      pending: { color: '$orange6', text: 'Pending' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const menuItems = [
    {
      id: 'orders',
      icon: Package,
      title: 'My Orders',
      subtitle: `${orders.reduce((total, order) => total + order.count, 0)} total orders`,
      color: '$blue11',
      hasChevron: true,
    },
    {
      id: 'favorites',
      icon: Heart,
      title: 'Wishlist',
      subtitle: 'Save items for later',
      color: '$red11',
      hasChevron: true,
    },
    {
      id: 'addresses',
      icon: MapPin,
      title: 'Delivery Addresses',
      subtitle: 'Manage shipping locations',
      color: '$green11',
      hasChevron: true,
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Payment Methods',
      subtitle: 'Cards and digital wallets',
      color: '$purple11',
      hasChevron: true,
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Push notifications and alerts',
      color: '$orange11',
      hasChevron: true,
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security',
      subtitle: 'Password and privacy',
      color: '$blue11',
      hasChevron: true,
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      color: '$green11',
      hasChevron: true,
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'App Settings',
      subtitle: 'Language, theme, and more',
      color: '$gray11',
      hasChevron: true,
    },
  ];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <YStack padding=\"$4\" space=\"$4\" flex={1} justifyContent=\"center\" alignItems=\"center\">
          <YStack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor=\"$gray4\"
            justifyContent=\"center\"
            alignItems=\"center\"
            marginBottom=\"$4\"
          >
            <User size={48} color=\"$gray8\" />
          </YStack>

          <Text fontSize=\"$8\" fontWeight=\"bold\" textAlign=\"center\">
            Welcome to WinMarket
          </Text>
          <Text fontSize=\"$4\" color=\"$gray10\" textAlign=\"center\">
            Sign in to access your profile, orders, and personalized experience
          </Text>

          <YStack space=\"$3\" width=\"100%\" marginTop=\"$6\">
            <Button
              size=\"$5\"
              backgroundColor=\"$blue6\"
              onPress={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
            <Button
              variant=\"outlined\"
              size=\"$5\"
              onPress={() => router.push('/auth/register')}
            >
              Create Account
            </Button>
          </YStack>

          <Text fontSize=\"$3\" color=\"$gray10\" textAlign=\"center\" marginTop=\"$4\">
            Browse as guest or sign in for a better experience
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding=\"$4\" space=\"$4\">
          {/* Profile Header */}
          <Card padding=\"$4\" backgroundColor=\"white\">
            <XStack space=\"$4\" alignItems=\"center\" marginBottom=\"$3\">
              <Avatar circular size=\"$8\">
                {user?.avatar ? (
                  <Avatar.Image src={user.avatar} />
                ) : (
                  <Avatar.Fallback backgroundColor=\"$blue6\">
                    <Text color=\"white\" fontSize=\"$6\" fontWeight=\"bold\">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Text>
                  </Avatar.Fallback>
                )}
              </Avatar>

              <YStack flex={1}>
                <Text fontSize=\"$6\" fontWeight=\"bold\">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text fontSize=\"$4\" color=\"$gray10\" marginBottom=\"$2\">
                  {user?.email}
                </Text>
                {user?.profile?.city && (
                  <XStack alignItems=\"center\" space=\"$1\">
                    <MapPin size={14} color=\"$gray10\" />
                    <Text fontSize=\"$3\" color=\"$gray10\">
                      {user.profile.city}, {user.profile.country}
                    </Text>
                  </XStack>
                )}
              </YStack>

              <TouchableOpacity onPress={() => handleMenuPress('edit-profile')}>
                <YStack
                  backgroundColor=\"$blue6\"
                  padding=\"$2\"
                  borderRadius=\"$3\"
                >
                  <Edit3 size={16} color=\"white\" />
                </YStack>
              </TouchableOpacity>
            </XStack>

            {/* Quick Stats */}
            <XStack space=\"$3\" justifyContent=\"space-around\" paddingTop=\"$3\">
              <YStack alignItems=\"center\">
                <Text fontSize=\"$6\" fontWeight=\"bold\" color=\"$blue11\">
                  {orders.reduce((total, order) => total + order.count, 0)}
                </Text>
                <Text fontSize=\"$2\" color=\"$gray10\">
                  Orders
                </Text>
              </YStack>
              <YStack alignItems=\"center\">
                <Text fontSize=\"$6\" fontWeight=\"bold\" color=\"$green11\">
                  4.8
                </Text>
                <Text fontSize=\"$2\" color=\"$gray10\">
                  Rating
                </Text>
              </YStack>
              <YStack alignItems=\"center\">
                <Text fontSize=\"$6\" fontWeight=\"bold\" color=\"$purple11\">
                  ${(user?.wallet?.balance || 0).toFixed(2)}
                </Text>
                <Text fontSize=\"$2\" color=\"$gray10\">
                  Wallet
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Order Status Overview */}
          <Card padding=\"$4\" backgroundColor=\"white\">
            <XStack justifyContent=\"space-between\" alignItems=\"center\" marginBottom=\"$3\">
              <Text fontSize=\"$5\" fontWeight=\"600\">
                Recent Orders
              </Text>
              <TouchableOpacity onPress={() => handleMenuPress('orders')}>
                <XStack alignItems=\"center\" space=\"$1\">
                  <Text fontSize=\"$3\" color=\"$blue11\">
                    View All
                  </Text>
                  <ChevronRight size={14} color=\"$blue11\" />
                </XStack>
              </TouchableOpacity>
            </XStack>

            <XStack space=\"$3\" justifyContent=\"space-around\">
              {orders.map((order) => {
                const statusInfo = getOrderStatusBadge(order.status);
                return (
                  <YStack key={order.id} alignItems=\"center\" space=\"$2\" flex={1}>
                    <YStack
                      backgroundColor={statusInfo.color}
                      padding=\"$2\"
                      borderRadius=\"$6\"
                    >
                      {order.status === 'delivered' && <Package size={20} color=\"white\" />}
                      {order.status === 'in_transit' && <Truck size={20} color=\"white\" />}
                      {order.status === 'pending' && <Package size={20} color=\"white\" />}
                    </YStack>
                    <Text fontSize=\"$4\" fontWeight=\"600\">
                      {order.count}
                    </Text>
                    <Text fontSize=\"$2\" color=\"$gray10\" textAlign=\"center\">
                      {statusInfo.text}
                    </Text>
                  </YStack>
                );
              })}
            </XStack>
          </Card>

          {/* Account Menu */}
          <YStack space=\"$2\">
            <Text fontSize=\"$5\" fontWeight=\"600\" paddingHorizontal=\"$2\" marginBottom=\"$2\">
              Account
            </Text>

            {menuItems.map((item, index) => (
              <TouchableOpacity key={item.id} onPress={() => handleMenuPress(item.id)}>
                <Card padding=\"$4\" backgroundColor=\"white\" pressStyle={{ scale: 0.98 }}>
                  <XStack space=\"$3\" alignItems=\"center\">
                    <YStack
                      backgroundColor=\"rgba(37, 99, 235, 0.1)\"
                      padding=\"$2\"
                      borderRadius=\"$3\"
                    >
                      <item.icon size={20} color={item.color} />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize=\"$4\" fontWeight=\"600\">
                        {item.title}
                      </Text>
                      <Text fontSize=\"$3\" color=\"$gray10\">
                        {item.subtitle}
                      </Text>
                    </YStack>
                    {item.hasChevron && <ChevronRight size={16} color=\"$gray8\" />}
                  </XStack>
                </Card>
              </TouchableOpacity>
            ))}
          </YStack>

          {/* Settings Menu */}
          <YStack space=\"$2\">
            <Text fontSize=\"$5\" fontWeight=\"600\" paddingHorizontal=\"$2\" marginBottom=\"$2\">
              Settings
            </Text>

            {settingsItems.map((item, index) => (
              <TouchableOpacity key={item.id} onPress={() => handleMenuPress(item.id)}>
                <Card padding=\"$4\" backgroundColor=\"white\" pressStyle={{ scale: 0.98 }}>
                  <XStack space=\"$3\" alignItems=\"center\">
                    <YStack
                      backgroundColor=\"rgba(37, 99, 235, 0.1)\"
                      padding=\"$2\"
                      borderRadius=\"$3\"
                    >
                      <item.icon size={20} color={item.color} />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize=\"$4\" fontWeight=\"600\">
                        {item.title}
                      </Text>
                      <Text fontSize=\"$3\" color=\"$gray10\">
                        {item.subtitle}
                      </Text>
                    </YStack>
                    {item.hasChevron && <ChevronRight size={16} color=\"$gray8\" />}
                  </XStack>
                </Card>
              </TouchableOpacity>
            ))}
          </YStack>

          {/* Sign Out */}
          <TouchableOpacity onPress={handleSignOut}>
            <Card padding=\"$4\" backgroundColor=\"white\" pressStyle={{ scale: 0.98 }}>
              <XStack space=\"$3\" alignItems=\"center\">
                <YStack
                  backgroundColor=\"rgba(239, 68, 68, 0.1)\"
                  padding=\"$2\"
                  borderRadius=\"$3\"
                >
                  <LogOut size={20} color=\"$red11\" />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize=\"$4\" fontWeight=\"600\" color=\"$red11\">
                    Sign Out
                  </Text>
                  <Text fontSize=\"$3\" color=\"$gray10\">
                    Sign out of your account
                  </Text>
                </YStack>
              </XStack>
            </Card>
          </TouchableOpacity>

          {/* App Info */}
          <Card padding=\"$4\" backgroundColor=\"$gray2\" marginTop=\"$4\">
            <YStack space=\"$2\" alignItems=\"center\">
              <Text fontSize=\"$3\" color=\"$gray10\">
                WinMarket Mobile v1.0.0
              </Text>
              <Text fontSize=\"$3\" color=\"$gray10\" textAlign=\"center\">
                Your trusted marketplace for buying and selling
              </Text>
            </YStack>
          </Card>

          {/* Bottom spacing */}
          <YStack height={100} />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}