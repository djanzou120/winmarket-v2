import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, YStack, XStack, Text, Image, Button } from 'tamagui';
import { Star, Heart, ShoppingCart } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface ProductCardProps {
  product: {
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
  };
  onPress?: () => void;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isCompact?: boolean;
}

export function ProductCard({
  product,
  onPress,
  onAddToCart,
  onToggleFavorite,
  isCompact = false,
}: ProductCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart?.();
  };

  const handleToggleFavorite = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite?.();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const productImage = product.images?.[0] || 'https://via.placeholder.com/200x200';

  if (isCompact) {
    return (
      <TouchableOpacity onPress={handlePress} style={{ flex: 1 }}>
        <Card
          backgroundColor=\"$background\"
          borderRadius=\"$4\"
          pressStyle={{ scale: 0.95 }}
          shadowColor=\"$shadowColor\"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevationAndroid={3}
        >
          <YStack>
            <YStack position=\"relative\">
              <Image
                source={{ uri: productImage }}
                width=\"100%\"
                height={120}
                borderTopLeftRadius=\"$4\"
                borderTopRightRadius=\"$4\"
                resizeMode=\"cover\"
              />
              <XStack
                position=\"absolute\"
                top=\"$2\"
                right=\"$2\"
                backgroundColor=\"rgba(0,0,0,0.5)\"
                borderRadius=\"$6\"
                padding=\"$1\"
              >
                <TouchableOpacity onPress={handleToggleFavorite}>
                  <Heart size={16} color=\"white\" />
                </TouchableOpacity>
              </XStack>
            </YStack>

            <YStack padding=\"$2\" space=\"$1\">
              <Text
                fontSize=\"$3\"
                fontWeight=\"600\"
                numberOfLines={1}
                color=\"$color\"
              >
                {product.title}
              </Text>

              <XStack alignItems=\"center\" space=\"$1\">
                {product.averageRating && (
                  <>
                    <Star size={12} color=\"orange\" fill=\"orange\" />
                    <Text fontSize=\"$2\" color=\"$color11\">
                      {product.averageRating.toFixed(1)}
                    </Text>
                  </>
                )}
              </XStack>

              <XStack justifyContent=\"space-between\" alignItems=\"center\">
                <YStack>
                  <Text fontSize=\"$4\" fontWeight=\"bold\" color=\"$blue11\">
                    {formatPrice(product.price)}
                  </Text>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <Text
                      fontSize=\"$2\"
                      color=\"$color10\"
                      textDecorationLine=\"line-through\"
                    >
                      {formatPrice(product.originalPrice)}
                    </Text>
                  )}
                </YStack>
                <Button
                  size=\"$2\"
                  circular
                  backgroundColor=\"$blue6\"
                  onPress={handleAddToCart}
                >
                  <ShoppingCart size={14} color=\"white\" />
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card
        backgroundColor=\"$background\"
        borderRadius=\"$4\"
        pressStyle={{ scale: 0.98 }}
        shadowColor=\"$shadowColor\"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevationAndroid={3}
        marginVertical=\"$2\"
      >
        <YStack>
          <YStack position=\"relative\">
            <Image
              source={{ uri: productImage }}
              width=\"100%\"
              height={200}
              borderTopLeftRadius=\"$4\"
              borderTopRightRadius=\"$4\"
              resizeMode=\"cover\"
            />
            <XStack
              position=\"absolute\"
              top=\"$3\"
              right=\"$3\"
              backgroundColor=\"rgba(0,0,0,0.6)\"
              borderRadius=\"$6\"
              padding=\"$2\"
            >
              <TouchableOpacity onPress={handleToggleFavorite}>
                <Heart size={20} color=\"white\" />
              </TouchableOpacity>
            </XStack>
          </YStack>

          <YStack padding=\"$3\" space=\"$2\">
            <Text
              fontSize=\"$5\"
              fontWeight=\"600\"
              numberOfLines={2}
              color=\"$color\"
            >
              {product.title}
            </Text>

            {product.shortDescription && (
              <Text
                fontSize=\"$3\"
                color=\"$color10\"
                numberOfLines={2}
              >
                {product.shortDescription}
              </Text>
            )}

            <XStack alignItems=\"center\" space=\"$2\">
              {product.averageRating && (
                <>
                  <XStack alignItems=\"center\" space=\"$1\">
                    <Star size={16} color=\"orange\" fill=\"orange\" />
                    <Text fontSize=\"$3\" color=\"$color11\">
                      {product.averageRating.toFixed(1)}
                    </Text>
                  </XStack>
                  {product.reviewCount && (
                    <Text fontSize=\"$3\" color=\"$color10\">
                      ({product.reviewCount} reviews)
                    </Text>
                  )}
                </>
              )}
            </XStack>

            {product.seller && (
              <Text fontSize=\"$3\" color=\"$color10\">
                by {product.seller.firstName} {product.seller.lastName}
              </Text>
            )}

            <XStack justifyContent=\"space-between\" alignItems=\"center\">
              <YStack>
                <Text fontSize=\"$6\" fontWeight=\"bold\" color=\"$blue11\">
                  {formatPrice(product.price)}
                </Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text
                    fontSize=\"$3\"
                    color=\"$color10\"
                    textDecorationLine=\"line-through\"
                  >
                    {formatPrice(product.originalPrice)}
                  </Text>
                )}
              </YStack>

              <Button
                size=\"$4\"
                backgroundColor=\"$blue6\"
                onPress={handleAddToCart}
              >
                <ShoppingCart size={18} color=\"white\" />
                <Text color=\"white\" marginLeft=\"$1\">
                  Add to Cart
                </Text>
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Card>
    </TouchableOpacity>
  );
}