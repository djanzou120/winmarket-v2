import React, { useState } from 'react';
import { FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card, Image, Separator } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Plus, Minus, Trash2, Heart, Lock } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Mock cart data - in real app this would come from context/state management
const initialCartItems = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    quantity: 1,
    stock: 10,
    image: 'https://via.placeholder.com/100x100',
    seller: 'TechStore Pro',
    isDigital: false,
    shippingRequired: true,
  },
  {
    id: '2',
    title: 'Ergonomic Office Chair',
    price: 199.99,
    quantity: 1,
    stock: 5,
    image: 'https://via.placeholder.com/100x100',
    seller: 'Office Solutions',
    isDigital: false,
    shippingRequired: true,
  },
];

interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  image: string;
  seller: string;
  isDigital: boolean;
  shippingRequired: boolean;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(item => item.id === itemId);
    if (!item || newQuantity > item.stock) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCartItems(prev => prev.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const moveToWishlist = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Moved to Wishlist',
      'Item has been moved to your wishlist',
      [{ text: 'OK', style: 'default' }]
    );
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false);
      router.push('/checkout');
    }, 1000);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce((total, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  };

  const shippingCost = 9.99;
  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const total = subtotal + shippingCost;

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card marginVertical=\"$2\" backgroundColor=\"white\">
      <XStack padding=\"$3\" space=\"$3\" alignItems=\"flex-start\">
        {/* Product Image */}
        <TouchableOpacity onPress={() => router.push(`/product/${item.id}`)}>
          <Image
            source={{ uri: item.image }}
            width={80}
            height={80}
            borderRadius=\"$3\"
            resizeMode=\"cover\"
          />
        </TouchableOpacity>

        {/* Product Info */}
        <YStack flex={1} space=\"$2\">
          <TouchableOpacity onPress={() => router.push(`/product/${item.id}`)}>
            <Text fontSize=\"$4\" fontWeight=\"600\" numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>

          <Text fontSize=\"$3\" color=\"$color10\">
            by {item.seller}
          </Text>

          <XStack alignItems=\"center\" space=\"$2\">
            <Text fontSize=\"$4\" fontWeight=\"bold\" color=\"$blue11\">
              {formatPrice(item.price)}
            </Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text
                fontSize=\"$3\"
                color=\"$color10\"
                textDecorationLine=\"line-through\"
              >
                {formatPrice(item.originalPrice)}
              </Text>
            )}
          </XStack>

          {/* Quantity Controls */}
          <XStack justifyContent=\"space-between\" alignItems=\"center\">
            <XStack alignItems=\"center\" space=\"$2\">
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <YStack
                  backgroundColor={item.quantity <= 1 ? \"$gray4\" : \"$blue6\"}
                  padding=\"$1\"
                  borderRadius=\"$2\"
                  width={28}
                  height={28}
                  justifyContent=\"center\"
                  alignItems=\"center\"
                >
                  <Minus size={14} color={item.quantity <= 1 ? \"$gray8\" : \"white\"} />
                </YStack>
              </TouchableOpacity>

              <Text fontSize=\"$4\" fontWeight=\"600\" minWidth={30} textAlign=\"center\">
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <YStack
                  backgroundColor={item.quantity >= item.stock ? \"$gray4\" : \"$blue6\"}
                  padding=\"$1\"
                  borderRadius=\"$2\"
                  width={28}
                  height={28}
                  justifyContent=\"center\"
                  alignItems=\"center\"
                >
                  <Plus size={14} color={item.quantity >= item.stock ? \"$gray8\" : \"white\"} />
                </YStack>
              </TouchableOpacity>
            </XStack>

            {/* Action Buttons */}
            <XStack space=\"$2\">
              <TouchableOpacity onPress={() => moveToWishlist(item.id)}>
                <Heart size={20} color=\"$color10\" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Trash2 size={20} color=\"$red10\" />
              </TouchableOpacity>
            </XStack>
          </XStack>

          {item.quantity === item.stock && (
            <Text fontSize=\"$2\" color=\"$orange10\">
              Only {item.stock} left in stock
            </Text>
          )}
        </YStack>
      </XStack>
    </Card>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <YStack padding=\"$4\" space=\"$4\" flex={1} justifyContent=\"center\" alignItems=\"center\">
          <ShoppingCart size={80} color=\"$gray8\" />
          <Text fontSize=\"$8\" fontWeight=\"bold\" textAlign=\"center\">
            Your Cart is Empty
          </Text>
          <Text fontSize=\"$4\" color=\"$gray10\" textAlign=\"center\">
            Add some products to get started
          </Text>
          <Button
            backgroundColor=\"$blue6\"
            size=\"$4\"
            onPress={() => router.push('/search')}
          >
            Continue Shopping
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <YStack flex={1}>
        {/* Header */}
        <YStack padding=\"$4\" backgroundColor=\"white\">
          <XStack justifyContent=\"space-between\" alignItems=\"center\">
            <Text fontSize=\"$7\" fontWeight=\"bold\">
              Shopping Cart
            </Text>
            <Text fontSize=\"$4\" color=\"$color10\">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Text>
          </XStack>
        </YStack>

        {/* Cart Items */}
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <YStack space=\"$4\" marginTop=\"$4\">
              {/* Order Summary */}
              <Card backgroundColor=\"white\" padding=\"$4\">
                <Text fontSize=\"$5\" fontWeight=\"600\" marginBottom=\"$3\">
                  Order Summary
                </Text>

                <YStack space=\"$2\">
                  <XStack justifyContent=\"space-between\">
                    <Text fontSize=\"$4\">Subtotal ({cartItems.length} items)</Text>
                    <Text fontSize=\"$4\" fontWeight=\"600\">
                      {formatPrice(subtotal)}
                    </Text>
                  </XStack>

                  {savings > 0 && (
                    <XStack justifyContent=\"space-between\">
                      <Text fontSize=\"$4\" color=\"$green11\">
                        Total Savings
                      </Text>
                      <Text fontSize=\"$4\" fontWeight=\"600\" color=\"$green11\">
                        -{formatPrice(savings)}
                      </Text>
                    </XStack>
                  )}

                  <XStack justifyContent=\"space-between\">
                    <Text fontSize=\"$4\">Shipping</Text>
                    <Text fontSize=\"$4\" fontWeight=\"600\">
                      {formatPrice(shippingCost)}
                    </Text>
                  </XStack>

                  <Separator marginVertical=\"$2\" />

                  <XStack justifyContent=\"space-between\" alignItems=\"center\">
                    <Text fontSize=\"$5\" fontWeight=\"bold\">
                      Total
                    </Text>
                    <Text fontSize=\"$6\" fontWeight=\"bold\" color=\"$blue11\">
                      {formatPrice(total)}
                    </Text>
                  </XStack>
                </YStack>
              </Card>

              {/* Security Notice */}
              <Card backgroundColor=\"$blue2\" padding=\"$3\">
                <XStack alignItems=\"center\" space=\"$2\">
                  <Lock size={16} color=\"$blue11\" />
                  <Text fontSize=\"$3\" color=\"$blue11\" flex={1}>
                    Your payment information is secure and encrypted
                  </Text>
                </XStack>
              </Card>

              {/* Checkout Button */}
              <Button
                size=\"$5\"
                backgroundColor=\"$blue6\"
                onPress={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text color=\"white\" fontSize=\"$4\" fontWeight=\"600\">
                    Processing...
                  </Text>
                ) : (
                  <>
                    <Lock size={20} color=\"white\" />
                    <Text color=\"white\" marginLeft=\"$2\" fontSize=\"$4\" fontWeight=\"600\">
                      Proceed to Checkout • {formatPrice(total)}
                    </Text>
                  </>
                )}
              </Button>

              {/* Continue Shopping */}
              <Button
                variant=\"outlined\"
                size=\"$4\"
                onPress={() => router.push('/search')}
              >
                Continue Shopping
              </Button>

              {/* Bottom spacing */}
              <YStack height={50} />
            </YStack>
          }
        />
      </YStack>
    </SafeAreaView>
  );
}