import React from 'react';
import { YStack, Text, Button, Card } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart } from '@tamagui/lucide-icons';

export default function CartScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack padding="$4" space="$4" flex={1} justifyContent="center" alignItems="center">
        <ShoppingCart size={80} color="$gray8" />
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Your Cart is Empty
        </Text>
        <Text fontSize="$4" color="$gray10" textAlign="center">
          Add some products to get started
        </Text>
        <Button backgroundColor="$blue6" size="$4">
          Continue Shopping
        </Button>
      </YStack>
    </SafeAreaView>
  );
}