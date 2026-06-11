import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Keyboard } from 'react-native';
import { YStack, XStack, Text, Input, Button, Sheet, Separator } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, X, Grid, List } from '@tamagui/lucide-icons';
import { useSearchProducts, useCategories } from '../../src/hooks/use-products';
import { ProductGrid } from '../../src/components/products/product-grid';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

type ViewMode = 'grid' | 'list';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const { search, data: searchResults, loading: searchLoading } = useSearchProducts();
  const { data: categoriesData } = useCategories();

  const categories = categoriesData?.categories?.edges?.map(edge => edge.node) || [];

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    }
  }, [params.category]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      search(searchQuery);
      Keyboard.dismiss();
    }
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(true);
  };

  const toggleViewMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleProductPress = (product: any) => {
    router.push(`/product/${product.id}`);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack flex={1}>
        {/* Header */}
        <YStack padding=\"$4\" backgroundColor=\"white\">
          <Text fontSize=\"$7\" fontWeight=\"bold\" marginBottom=\"$3\">
            Search Products
          </Text>

          {/* Search Bar */}
          <XStack space=\"$2\" alignItems=\"center\">
            <YStack flex={1}>
              <Input
                placeholder=\"Search for products...\"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                size=\"$4\"
                borderRadius=\"$4\"
              />
            </YStack>
            <Button
              icon={Search}
              backgroundColor=\"$blue6\"
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            />
          </XStack>

          {/* Filter and View Controls */}
          <XStack justifyContent=\"space-between\" alignItems=\"center\" marginTop=\"$3\">
            <XStack space=\"$2\" alignItems=\"center\">
              <TouchableOpacity onPress={handleFilterPress}>
                <XStack
                  backgroundColor=\"$gray4\"
                  paddingHorizontal=\"$3\"
                  paddingVertical=\"$2\"
                  borderRadius=\"$3\"
                  alignItems=\"center\"
                  space=\"$2\"
                >
                  <Filter size={16} />
                  <Text fontSize=\"$3\">Filter</Text>
                  {selectedCategory && (
                    <YStack
                      backgroundColor=\"$blue6\"
                      width={8}
                      height={8}
                      borderRadius={4}
                    />
                  )}
                </XStack>
              </TouchableOpacity>

              {(selectedCategory || searchQuery) && (
                <TouchableOpacity onPress={clearFilters}>
                  <XStack
                    backgroundColor=\"$red4\"
                    paddingHorizontal=\"$3\"
                    paddingVertical=\"$2\"
                    borderRadius=\"$3\"
                    alignItems=\"center\"
                    space=\"$1\"
                  >
                    <X size={14} color=\"red\" />
                    <Text fontSize=\"$3\" color=\"red\">Clear</Text>
                  </XStack>
                </TouchableOpacity>
              )}
            </XStack>

            <TouchableOpacity onPress={toggleViewMode}>
              <XStack
                backgroundColor=\"$gray4\"
                paddingHorizontal=\"$3\"
                paddingVertical=\"$2\"
                borderRadius=\"$3\"
                alignItems=\"center\"
                space=\"$2\"
              >
                {viewMode === 'grid' ? <Grid size={16} /> : <List size={16} />}
                <Text fontSize=\"$3\">{viewMode === 'grid' ? 'Grid' : 'List'}</Text>
              </XStack>
            </TouchableOpacity>
          </XStack>
        </YStack>

        {/* Search Results */}
        <YStack flex={1}>
          {searchResults && searchResults.length > 0 ? (
            <ProductGrid
              products={searchResults}
              loading={searchLoading}
              numColumns={viewMode === 'grid' ? 2 : 1}
              isCompact={viewMode === 'grid'}
              onProductPress={handleProductPress}
              emptyMessage=\"No products found for your search\"
            />
          ) : searchQuery ? (
            <YStack
              flex={1}
              justifyContent=\"center\"
              alignItems=\"center\"
              padding=\"$8\"
            >
              <Text fontSize=\"$6\" marginBottom=\"$2\">
                🔍
              </Text>
              <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$2\">
                No Results Found
              </Text>
              <Text fontSize=\"$4\" color=\"$color10\" textAlign=\"center\">
                Try searching with different keywords or check your spelling
              </Text>
            </YStack>
          ) : (
            <YStack
              flex={1}
              justifyContent=\"center\"
              alignItems=\"center\"
              padding=\"$8\"
            >
              <Text fontSize=\"$6\" marginBottom=\"$2\">
                🔍
              </Text>
              <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$2\">
                Search for Products
              </Text>
              <Text fontSize=\"$4\" color=\"$color10\" textAlign=\"center\">
                Enter a search term above to find products
              </Text>
            </YStack>
          )}
        </YStack>

        {/* Filter Sheet */}
        <Sheet
          modal
          open={showFilters}
          onOpenChange={setShowFilters}
          snapPoints={[60]}
          dismissOnSnapToBottom
        >
          <Sheet.Overlay backgroundColor=\"rgba(0,0,0,0.5)\" />
          <Sheet.Frame backgroundColor=\"white\" borderTopLeftRadius=\"$4\" borderTopRightRadius=\"$4\">
            <Sheet.Handle />
            <YStack padding=\"$4\" space=\"$4\">
              <XStack justifyContent=\"space-between\" alignItems=\"center\">
                <Text fontSize=\"$6\" fontWeight=\"bold\">
                  Filters
                </Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <X size={24} />
                </TouchableOpacity>
              </XStack>

              <Separator />

              {/* Categories */}
              <YStack space=\"$3\">
                <Text fontSize=\"$5\" fontWeight=\"600\">
                  Categories
                </Text>
                <XStack space=\"$2\" flexWrap=\"wrap\">
                  <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                    <XStack
                      backgroundColor={selectedCategory === null ? '$blue6' : '$gray4'}
                      paddingHorizontal=\"$3\"
                      paddingVertical=\"$2\"
                      borderRadius=\"$3\"
                      marginBottom=\"$2\"
                    >
                      <Text
                        color={selectedCategory === null ? 'white' : '$color'}
                        fontSize=\"$3\"
                      >
                        All
                      </Text>
                    </XStack>
                  </TouchableOpacity>

                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.slug)}
                    >
                      <XStack
                        backgroundColor={
                          selectedCategory === category.slug ? '$blue6' : '$gray4'
                        }
                        paddingHorizontal=\"$3\"
                        paddingVertical=\"$2\"
                        borderRadius=\"$3\"
                        marginBottom=\"$2\"
                      >
                        <Text
                          color={
                            selectedCategory === category.slug ? 'white' : '$color'
                          }
                          fontSize=\"$3\"
                        >
                          {category.name}
                        </Text>
                      </XStack>
                    </TouchableOpacity>
                  ))}
                </XStack>
              </YStack>

              <XStack justifyContent=\"space-between\" space=\"$3\">
                <Button
                  flex={1}
                  variant=\"outlined\"
                  onPress={clearFilters}
                >
                  Clear All
                </Button>
                <Button
                  flex={1}
                  backgroundColor=\"$blue6\"
                  onPress={() => {
                    setShowFilters(false);
                    if (searchQuery) handleSearch();
                  }}
                >
                  Apply Filters
                </Button>
              </XStack>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </SafeAreaView>
  );
}