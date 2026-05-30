import React from 'react';
import { YStack, Text, Input, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from '@tamagui/lucide-icons';

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack padding="$4" space="$4">
        <Text fontSize="$8" fontWeight="bold">
          Search Products
        </Text>
        
        <YStack space="$3">
          <Input
            placeholder="Search for products..."
            size="$4"
            borderRadius="$4"
          />
          <Button icon={Search} backgroundColor="$blue6">
            Search
          </Button>
        </YStack>
        
        <Text fontSize="$4" color="$gray10" textAlign="center">
          Search functionality coming soon...
        </Text>
      </YStack>
    </SafeAreaView>
  );
}