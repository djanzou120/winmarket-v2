import React from 'react';
import { YStack, Text, Button, Card, XStack, Avatar } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Package, LogOut } from '@tamagui/lucide-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack padding="$4" space="$4">
        {/* Profile Header */}
        <Card padding="$4">
          <XStack space="$3" alignItems="center">
            <Avatar circular size="$6">
              <Avatar.Image src="https://via.placeholder.com/100" />
              <Avatar.Fallback>
                <User size={24} />
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontSize="$6" fontWeight="bold">
                Guest User
              </Text>
              <Text fontSize="$4" color="$gray10">
                guest@example.com
              </Text>
            </YStack>
          </XStack>
        </Card>
        
        {/* Menu Items */}
        <YStack space="$2">
          <Card padding="$4" pressStyle={{ scale: 0.98 }}>
            <XStack space="$3" alignItems="center">
              <Package size={20} color="$gray11" />
              <Text fontSize="$5" flex={1}>My Orders</Text>
            </XStack>
          </Card>
          
          <Card padding="$4" pressStyle={{ scale: 0.98 }}>
            <XStack space="$3" alignItems="center">
              <Settings size={20} color="$gray11" />
              <Text fontSize="$5" flex={1}>Settings</Text>
            </XStack>
          </Card>
          
          <Card padding="$4" pressStyle={{ scale: 0.98 }}>
            <XStack space="$3" alignItems="center">
              <LogOut size={20} color="$red11" />
              <Text fontSize="$5" flex={1} color="$red11">Sign Out</Text>
            </XStack>
          </Card>
        </YStack>
        
        <Button backgroundColor="$blue6" marginTop="$6">
          Sign In / Register
        </Button>
      </YStack>
    </SafeAreaView>
  );
}