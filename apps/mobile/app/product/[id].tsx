import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { YStack, XStack, Text, Button, Image, Card, Separator, Spinner } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  Shield,
  MessageCircle,
  Camera,
} from '@tamagui/lucide-icons';
import { useProduct } from '../../src/hooks/use-products';
import { useCamera } from '../../src/hooks/use-camera';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, loading, error } = useProduct(id as string);
  const { takePicture, pickImage } = useCamera();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <YStack flex={1} justifyContent=\"center\" alignItems=\"center\">
          <Spinner size=\"large\" />
          <Text marginTop=\"$4\" fontSize=\"$4\" color=\"$color10\">
            Loading product details...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <YStack flex={1} justifyContent=\"center\" alignItems=\"center\" padding=\"$8\">
          <Text fontSize=\"$6\" marginBottom=\"$2\">
            ⚠️
          </Text>
          <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$2\">
            Product Not Found
          </Text>
          <Text fontSize=\"$4\" color=\"$color10\" textAlign=\"center\" marginBottom=\"$4\">
            The product you're looking for doesn't exist or has been removed.
          </Text>
          <Button onPress={() => router.back()}>
            Go Back
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Sharing.shareAsync(
        `Check out this product: ${product.title}\\n\\nPrice: ${formatPrice(product.price)}\\n\\nDownload WinMarket to see more!`,
        {
          dialogTitle: 'Share Product',
        }
      );
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFavorite(!isFavorite);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product.stock || 99)) {
      setQuantity(newQuantity);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Added to Cart',
      `${quantity} x ${product.title} added to your cart`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleContactSeller = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Contact Seller',
      'Would you like to send a message to the seller?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', style: 'default' },
      ]
    );
  };

  const productImages = product.images || [];
  const hasImages = productImages.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack flex={1}>
        {/* Header */}
        <XStack
          padding=\"$4\"
          justifyContent=\"space-between\"
          alignItems=\"center\"
          backgroundColor=\"white\"
        >
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color=\"black\" />
          </TouchableOpacity>

          <XStack space=\"$3\">
            <TouchableOpacity onPress={handleShare}>
              <Share size={24} color=\"black\" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Heart
                size={24}
                color={isFavorite ? \"red\" : \"black\"}
                fill={isFavorite ? \"red\" : \"transparent\"}
              />
            </TouchableOpacity>
          </XStack>
        </XStack>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {/* Product Images */}
          <YStack>
            {hasImages ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setSelectedImageIndex(index);
                }}
              >
                {productImages.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    width={width}
                    height={300}
                    resizeMode=\"cover\"
                  />
                ))}
              </ScrollView>
            ) : (
              <YStack
                width={width}
                height={300}
                backgroundColor=\"$gray4\"
                justifyContent=\"center\"
                alignItems=\"center\"
              >
                <Camera size={48} color=\"$gray8\" />
                <Text marginTop=\"$2\" color=\"$gray10\">
                  No images available
                </Text>
              </YStack>
            )}

            {/* Image Indicators */}
            {hasImages && productImages.length > 1 && (
              <XStack
                position=\"absolute\"
                bottom=\"$3\"
                alignSelf=\"center\"
                space=\"$1\"
              >
                {productImages.map((_, index) => (
                  <YStack
                    key={index}
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={
                      index === selectedImageIndex ? \"white\" : \"rgba(255,255,255,0.5)\"
                    }
                  />
                ))}
              </XStack>
            )}
          </YStack>

          {/* Product Information */}
          <YStack padding=\"$4\" backgroundColor=\"white\" marginTop=\"$2\">
            <Text fontSize=\"$7\" fontWeight=\"bold\" marginBottom=\"$2\">
              {product.title}
            </Text>

            <XStack alignItems=\"center\" marginBottom=\"$3\" space=\"$2\">
              {product.averageRating && (
                <XStack alignItems=\"center\" space=\"$1\">
                  <Star size={16} color=\"orange\" fill=\"orange\" />
                  <Text fontSize=\"$4\" fontWeight=\"600\">
                    {product.averageRating.toFixed(1)}
                  </Text>
                  {product.reviewCount && (
                    <Text fontSize=\"$3\" color=\"$color10\">
                      ({product.reviewCount} reviews)
                    </Text>
                  )}
                </XStack>
              )}

              <Text fontSize=\"$3\" color=\"$color10\">
                •
              </Text>

              {product.soldCount && (
                <Text fontSize=\"$3\" color=\"$color10\">
                  {product.soldCount} sold
                </Text>
              )}
            </XStack>

            {/* Price */}
            <XStack alignItems=\"center\" space=\"$2\" marginBottom=\"$3\">
              <Text fontSize=\"$8\" fontWeight=\"bold\" color=\"$blue11\">
                {formatPrice(product.price)}
              </Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <Text
                  fontSize=\"$4\"
                  color=\"$color10\"
                  textDecorationLine=\"line-through\"
                >
                  {formatPrice(product.originalPrice)}
                </Text>
              )}
            </XStack>

            {/* Quantity and Stock */}
            <XStack justifyContent=\"space-between\" alignItems=\"center\" marginBottom=\"$4\">
              <YStack>
                <Text fontSize=\"$4\" color=\"$color10\" marginBottom=\"$1\">
                  Quantity
                </Text>
                <XStack alignItems=\"center\" space=\"$2\">
                  <TouchableOpacity onPress={() => handleQuantityChange(-1)}>
                    <YStack
                      backgroundColor=\"$gray4\"
                      padding=\"$2\"
                      borderRadius=\"$2\"
                    >
                      <Minus size={16} />
                    </YStack>
                  </TouchableOpacity>
                  <Text fontSize=\"$5\" fontWeight=\"600\" paddingHorizontal=\"$3\">
                    {quantity}
                  </Text>
                  <TouchableOpacity onPress={() => handleQuantityChange(1)}>
                    <YStack
                      backgroundColor=\"$gray4\"
                      padding=\"$2\"
                      borderRadius=\"$2\"
                    >
                      <Plus size={16} />
                    </YStack>
                  </TouchableOpacity>
                </XStack>
              </YStack>

              <YStack alignItems=\"flex-end\">
                <Text fontSize=\"$4\" color=\"$color10\" marginBottom=\"$1\">
                  Stock
                </Text>
                <Text fontSize=\"$4\" fontWeight=\"600\">
                  {product.stock || 0} available
                </Text>
              </YStack>
            </XStack>

            {/* Add to Cart Button */}
            <Button
              size=\"$5\"
              backgroundColor=\"$blue6\"
              onPress={handleAddToCart}
              disabled={!product.stock || product.stock === 0}
            >
              <ShoppingCart size={20} color=\"white\" />
              <Text color=\"white\" marginLeft=\"$2\" fontSize=\"$4\" fontWeight=\"600\">
                Add to Cart • {formatPrice(product.price * quantity)}
              </Text>
            </Button>
          </YStack>

          {/* Product Features */}
          <YStack padding=\"$4\" backgroundColor=\"white\" marginTop=\"$2\">
            <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$3\">
              Product Features
            </Text>

            <XStack space=\"$4\" justifyContent=\"space-around\">
              {product.shippingRequired && (
                <YStack alignItems=\"center\" space=\"$1\">
                  <Truck size={24} color=\"$blue11\" />
                  <Text fontSize=\"$3\" color=\"$color10\" textAlign=\"center\">
                    Free Shipping
                  </Text>
                </YStack>
              )}

              <YStack alignItems=\"center\" space=\"$1\">
                <Shield size={24} color=\"$green11\" />
                <Text fontSize=\"$3\" color=\"$color10\" textAlign=\"center\">
                  Secure Payment
                </Text>
              </YStack>

              <YStack alignItems=\"center\" space=\"$1\">
                <MessageCircle size={24} color=\"$orange11\" />
                <Text fontSize=\"$3\" color=\"$color10\" textAlign=\"center\">
                  24/7 Support
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* Product Description */}
          {product.description && (
            <YStack padding=\"$4\" backgroundColor=\"white\" marginTop=\"$2\">
              <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$3\">
                Description
              </Text>
              <Text fontSize=\"$4\" color=\"$color11\" lineHeight={24}>
                {product.description}
              </Text>
            </YStack>
          )}

          {/* Seller Information */}
          {product.seller && (
            <YStack padding=\"$4\" backgroundColor=\"white\" marginTop=\"$2\">
              <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$3\">
                Seller Information
              </Text>

              <XStack justifyContent=\"space-between\" alignItems=\"center\">
                <XStack alignItems=\"center\" space=\"$3\">
                  <YStack
                    width={50}
                    height={50}
                    borderRadius={25}
                    backgroundColor=\"$gray4\"
                    justifyContent=\"center\"
                    alignItems=\"center\"
                  >
                    {product.seller.avatar ? (
                      <Image
                        source={{ uri: product.seller.avatar }}
                        width={50}
                        height={50}
                        borderRadius={25}
                      />
                    ) : (
                      <Text fontSize=\"$4\">
                        {product.seller.firstName?.[0]}{product.seller.lastName?.[0]}
                      </Text>
                    )}
                  </YStack>

                  <YStack>
                    <Text fontSize=\"$4\" fontWeight=\"600\">
                      {product.seller.firstName} {product.seller.lastName}
                    </Text>
                    {product.seller.profile?.city && (
                      <Text fontSize=\"$3\" color=\"$color10\">
                        {product.seller.profile.city}, {product.seller.profile.country}
                      </Text>
                    )}
                  </YStack>
                </XStack>

                <Button
                  variant=\"outlined\"
                  size=\"$3\"
                  onPress={handleContactSeller}
                >
                  <MessageCircle size={16} />
                  <Text marginLeft=\"$1\">Contact</Text>
                </Button>
              </XStack>
            </YStack>
          )}

          {/* Bottom spacing */}
          <YStack height={100} />
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}