import React from 'react';
import { YStack, Text, Button, Card, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, Plus, Minus } from '@tamagui/lucide-icons';

export default function WalletScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack padding="$4" space="$4">
        <Text fontSize="$8" fontWeight="bold">
          My Wallet
        </Text>
        
        {/* Balance Card */}
        <Card padding="$4" backgroundColor="$blue6">
          <YStack space="$2" alignItems="center">
            <Wallet size={40} color="white" />
            <Text fontSize="$2" color="white" opacity={0.8}>
              Current Balance
            </Text>
            <Text fontSize="$10" fontWeight="bold" color="white">
              $0.00
            </Text>
          </YStack>
        </Card>
        
        {/* Quick Actions */}
        <XStack space="$3">
          <Button flex={1} backgroundColor="$green6" icon={Plus}>
            Add Money
          </Button>
          <Button flex={1} backgroundColor="$orange6" icon={Minus}>
            Withdraw
          </Button>
        </XStack>
        
        {/* Recent Transactions */}
        <YStack space="$3">
          <Text fontSize="$6" fontWeight="bold">
            Recent Transactions
          </Text>
          <Card padding="$4">
            <Text fontSize="$4" color="$gray10" textAlign="center">
              No transactions yet
            </Text>
          </Card>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}