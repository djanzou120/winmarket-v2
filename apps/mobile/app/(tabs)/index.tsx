import React from 'react';
import { ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { YStack, Text, Button, Card, XStack, Image, Spinner } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, ShoppingBag, Truck, Wallet, Grid3x3, User } from '@tamagui/lucide-icons';
import { useFeaturedProducts, usePopularProducts, useCategories } from '../../src/hooks/use-products';
import { ProductCard } from '../../src/components/products/product-card';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { data: featuredProducts, loading: featuredLoading } = useFeaturedProducts(6);
  const { data: popularProducts, loading: popularLoading } = usePopularProducts(6);
  const { data: categoriesData, loading: categoriesLoading } = useCategories({}, { limit: 6 });

  const categories = categoriesData?.categories?.edges?.map(edge => edge.node) || [];

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (action) {
      case 'shop':
        router.push('/search');
        break;
      case 'wallet':
        router.push('/wallet');
        break;
      case 'track':
        router.push('/profile');
        break;
      case 'categories':
        router.push('/search');
        break;
    }
  };

  const handleCategoryPress = (categorySlug: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/search?category=${categorySlug}`);
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Electronics': '📱',
      'Fashion': '👕',
      'Home': '🏠',
      'Books': '📚',
      'Sports': '⚽',
      'Beauty': '💄',
      'Automotive': '🚗',
      'Garden': '🌱',
    };
    return iconMap[categoryName] || '📦';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding=\"$4\" space=\"$4\">
          {/* Header */}
          <XStack justifyContent=\"space-between\" alignItems=\"center\">
            <YStack>
              <Text fontSize=\"$8\" fontWeight=\"bold\" color=\"$gray12\">
                WinMarket
              </Text>
              <Text fontSize=\"$4\" color=\"$gray10\">
                Your marketplace for everything
              </Text>
            </YStack>
            <Button
              size=\"$4\"
              circular
              backgroundColor=\"$blue6\"
              onPress={() => handleQuickAction('shop')}
            >
              <Search size={20} color=\"white\" />
            </Button>
          </XStack>

          {/* Quick Actions */}
          <Card padding=\"$4\" backgroundColor=\"$blue2\">
            <Text fontSize=\"$6\" fontWeight=\"bold\" marginBottom=\"$3\">
              Quick Actions
            </Text>
            <XStack space=\"$3\" justifyContent=\"space-around\">
              <TouchableOpacity onPress={() => handleQuickAction('shop')}>
                <YStack alignItems=\"center\" space=\"$2\">
                  <Button circular size=\"$5\" backgroundColor=\"$blue6\">
                    <ShoppingBag size={24} color=\"white\" />
                  </Button>
                  <Text fontSize=\"$3\">Shop</Text>
                </YStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleQuickAction('categories')}>
                <YStack alignItems=\"center\" space=\"$2\">
                  <Button circular size=\"$5\" backgroundColor=\"$purple6\">
                    <Grid3x3 size={24} color=\"white\" />
                  </Button>
                  <Text fontSize=\"$3\">Categories</Text>
                </YStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleQuickAction('wallet')}>
                <YStack alignItems=\"center\" space=\"$2\">
                  <Button circular size=\"$5\" backgroundColor=\"$green6\">
                    <Wallet size={24} color=\"white\" />
                  </Button>
                  <Text fontSize=\"$3\">Wallet</Text>
                </YStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleQuickAction('track')}>
                <YStack alignItems=\"center\" space=\"$2\">
                  <Button circular size=\"$5\" backgroundColor=\"$orange6\">
                    <Truck size={24} color=\"white\" />
                  </Button>
                  <Text fontSize=\"$3\">Track</Text>
                </YStack>
              </TouchableOpacity>
            </XStack>
          </Card>

          {/* Categories */}
          <YStack space=\"$3\">
            <XStack justifyContent=\"space-between\" alignItems=\"center\">
              <Text fontSize=\"$6\" fontWeight=\"bold\">
                Shop by Category
              </Text>
              <Button
                variant=\"outlined\"
                size=\"$3\"
                onPress={() => handleQuickAction('categories')}
              >
                View All
              </Button>
            </XStack>

            {categoriesLoading ? (
              <YStack alignItems=\"center\" padding=\"$4\">
                <Spinner />
              </YStack>
            ) : (
              <XStack space=\"$3\" flexWrap=\"wrap\">
                {categories.slice(0, 4).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryPress(category.slug)}
                    style={{ flex: 1, minWidth: '45%' }}
                  >
                    <Card
                      flex={1}
                      padding=\"$3\"
                      backgroundColor=\"white\"
                      pressStyle={{ scale: 0.95 }}
                      marginBottom=\"$3\"
                    >
                      <YStack alignItems=\"center\" space=\"$2\">
                        <YStack
                          width={60}
                          height={60}
                          backgroundColor=\"$gray4\"
                          borderRadius=\"$4\"
                          justifyContent=\"center\"
                          alignItems=\"center\"
                        >
                          <Text fontSize=\"$6\">{getCategoryIcon(category.name)}</Text>
                        </YStack>
                        <Text fontSize=\"$4\" fontWeight=\"600\" textAlign=\"center\">
                          {category.name}
                        </Text>
                        <Text fontSize=\"$2\" color=\"$gray10\" textAlign=\"center\">
                          {category.productCount} items
                        </Text>
                      </YStack>
                    </Card>
                  </TouchableOpacity>
                ))}
              </XStack>
            )}
          </YStack>

          {/* Featured Products */}
          <YStack space=\"$3\">
            <XStack justifyContent=\"space-between\" alignItems=\"center\">
              <Text fontSize=\"$6\" fontWeight=\"bold\">
                Featured Products
              </Text>
              <Button variant=\"outlined\" size=\"$3\">
                View All
              </Button>
            </XStack>

            {featuredLoading ? (
              <YStack alignItems=\"center\" padding=\"$4\">
                <Spinner />
              </YStack>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack space=\"$3\" paddingRight=\"$4\">
                  {featuredProducts.map((product) => (
                    <YStack key={product.id} width={180}>
                      <ProductCard product={product} isCompact />
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            ) : (
              <Card padding=\"$4\" backgroundColor=\"$gray3\">
                <Text textAlign=\"center\" color=\"$gray10\">
                  No featured products available
                </Text>
              </Card>
            )}
          </YStack>

          {/* Popular Products */}
          <YStack space=\"$3\">
            <XStack justifyContent=\"space-between\" alignItems=\"center\">
              <Text fontSize=\"$6\" fontWeight=\"bold\">
                Popular Products
              </Text>
              <Button variant=\"outlined\" size=\"$3\">
                View All
              </Button>
            </XStack>

            {popularLoading ? (
              <YStack alignItems=\"center\" padding=\"$4\">
                <Spinner />
              </YStack>
            ) : popularProducts && popularProducts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack space=\"$3\" paddingRight=\"$4\">
                  {popularProducts.map((product) => (
                    <YStack key={product.id} width={180}>
                      <ProductCard product={product} isCompact />
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            ) : (
              <Card padding=\"$4\" backgroundColor=\"$gray3\">
                <Text textAlign=\"center\" color=\"$gray10\">
                  No popular products available
                </Text>
              </Card>
            )}
          </YStack>

          {/* Bottom spacing for tab bar */}
          <YStack height={100} />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}