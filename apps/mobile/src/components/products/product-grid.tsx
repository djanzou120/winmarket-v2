import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import { ProductCard } from './product-card';

interface Product {
  id: string;
  title: string;
  slug?: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  seller?: {
    firstName: string;
    lastName: string;
  };
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  numColumns?: number;
  isCompact?: boolean;
  emptyMessage?: string;
  onProductPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.1,
  numColumns = 2,
  isCompact = true,
  emptyMessage = \"No products found\",
  onProductPress,
  onAddToCart,
  onToggleFavorite,
}: ProductGridProps) {
  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const isLastInRow = numColumns > 1 && (index + 1) % numColumns === 0;
    const isOdd = numColumns > 1 && index % numColumns === 1;

    return (
      <YStack
        flex={1}
        marginRight={isLastInRow ? 0 : \"$2\"}
        marginLeft={isOdd ? \"$1\" : 0}
        marginBottom=\"$3\"
      >
        <ProductCard
          product={item}
          isCompact={isCompact}
          onPress={() => onProductPress?.(item)}
          onAddToCart={() => onAddToCart?.(item)}
          onToggleFavorite={() => onToggleFavorite?.(item)}
        />
      </YStack>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <YStack
          flex={1}
          justifyContent=\"center\"
          alignItems=\"center\"
          padding=\"$8\"
        >
          <Spinner size=\"large\" />
          <Text marginTop=\"$4\" fontSize=\"$4\" color=\"$color10\">
            Loading products...
          </Text>
        </YStack>
      );
    }

    return (
      <YStack
        flex={1}
        justifyContent=\"center\"
        alignItems=\"center\"
        padding=\"$8\"
      >
        <Text fontSize=\"$6\" fontWeight=\"600\" marginBottom=\"$2\">
          📦
        </Text>
        <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$2\">
          No Products
        </Text>
        <Text fontSize=\"$4\" color=\"$color10\" textAlign=\"center\">
          {emptyMessage}
        </Text>
      </YStack>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <YStack padding=\"$4\" alignItems=\"center\">
        <Spinner />
      </YStack>
    );
  };

  if (products.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100, // Extra space for tab bar
      }}
    />
  );
}