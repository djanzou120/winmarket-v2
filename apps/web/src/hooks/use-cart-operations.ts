import { useMutation, useQuery } from '@apollo/client';
import { useCart } from '@/stores/cart-store';
import {
  AddToCartDocument,
  UpdateCartItemDocument,
  RemoveFromCartDocument,
  ClearCartDocument,
  MyCartDocument,
  type AddToCartInput,
  type UpdateCartItemInput,
  type CartItem,
} from '@/graphql/generated';
import toast from 'react-hot-toast';
import { useCallback, useEffect } from 'react';

export const useCartOperations = () => {
  const {
    setItems,
    addItemOptimistic,
    removeItemOptimistic,
    updateQuantityOptimistic,
    clearCartOptimistic,
    setError,
    setLoading,
  } = useCart();

  // Query to load cart from server
  const { data: cartData, loading: loadingCart, error: cartError, refetch } = useQuery(MyCartDocument, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  // Mutations
  const [addToCartMutation, { loading: addingToCart }] = useMutation(AddToCartDocument);
  const [updateCartItemMutation, { loading: updatingCartItem }] = useMutation(UpdateCartItemDocument);
  const [removeFromCartMutation, { loading: removingFromCart }] = useMutation(RemoveFromCartDocument);
  const [clearCartMutation, { loading: clearingCart }] = useMutation(ClearCartDocument);

  // Update loading state
  useEffect(() => {
    const isLoading = loadingCart || addingToCart || updatingCartItem || removingFromCart || clearingCart;
    setLoading(isLoading);
  }, [loadingCart, addingToCart, updatingCartItem, removingFromCart, clearingCart, setLoading]);

  // Update error state
  useEffect(() => {
    if (cartError) {
      setError(cartError.message);
    }
  }, [cartError, setError]);

  // Load cart data into store
  useEffect(() => {
    if (cartData?.myCart) {
      const cart = cartData.myCart;
      setItems(cart.items);
    }
  }, [cartData, setItems]);

  // Add item to cart
  const addItem = useCallback(async (input: AddToCartInput) => {
    try {
      setError(null);

      const { data } = await addToCartMutation({
        variables: { input },
        update: (cache, { data }) => {
          if (data?.addToCart) {
            // Update cache optimistically
            const existingCart = cache.readQuery({ query: MyCartDocument }) as any;
            if (existingCart?.myCart) {
              cache.writeQuery({
                query: MyCartDocument,
                data: {
                  myCart: {
                    ...existingCart.myCart,
                    items: [...existingCart.myCart.items, data.addToCart],
                  },
                },
              });
            }
          }
        },
      });

      if (data?.addToCart) {
        addItemOptimistic(data.addToCart);
        toast.success('Item added to cart');
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [addToCartMutation, addItemOptimistic, setError]);

  // Remove item from cart
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setError(null);

      // Optimistic update first
      removeItemOptimistic(itemId);

      await removeFromCartMutation({
        variables: { id: itemId },
        update: (cache) => {
          // Update cache
          const existingCart = cache.readQuery({ query: MyCartDocument }) as any;
          if (existingCart?.myCart) {
            cache.writeQuery({
              query: MyCartDocument,
              data: {
                myCart: {
                  ...existingCart.myCart,
                  items: existingCart.myCart.items.filter((item: CartItem) => item.id !== itemId),
                },
              },
            });
          }
        },
      });

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      setError(errorMessage);
      toast.error(errorMessage);

      // Revert optimistic update on error
      await refetch();
    }
  }, [removeFromCartMutation, removeItemOptimistic, setError, refetch]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    try {
      setError(null);

      // Optimistic update first
      updateQuantityOptimistic(itemId, quantity);

      const input: UpdateCartItemInput = { quantity };

      await updateCartItemMutation({
        variables: { id: itemId, input },
        update: (cache, { data }) => {
          if (data?.updateCartItem) {
            // Update cache
            const existingCart = cache.readQuery({ query: MyCartDocument }) as any;
            if (existingCart?.myCart) {
              cache.writeQuery({
                query: MyCartDocument,
                data: {
                  myCart: {
                    ...existingCart.myCart,
                    items: existingCart.myCart.items.map((item: CartItem) =>
                      item.id === itemId ? { ...item, ...data.updateCartItem } : item
                    ),
                  },
                },
              });
            }
          }
        },
      });

    } catch (error) {
      console.error('Failed to update item quantity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item quantity';
      setError(errorMessage);
      toast.error(errorMessage);

      // Revert optimistic update on error
      await refetch();
    }
  }, [updateCartItemMutation, updateQuantityOptimistic, removeItem, setError, refetch]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);

      // Optimistic update first
      clearCartOptimistic();

      await clearCartMutation({
        update: (cache) => {
          // Clear cache
          cache.writeQuery({
            query: MyCartDocument,
            data: {
              myCart: {
                __typename: 'Cart',
                items: [],
                subtotal: 0,
                itemCount: 0,
                currency: 'USD',
                updatedAt: new Date().toISOString(),
              },
            },
          });
        },
      });

      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      setError(errorMessage);
      toast.error(errorMessage);

      // Revert optimistic update on error
      await refetch();
    }
  }, [clearCartMutation, clearCartOptimistic, setError, refetch]);

  // Reload cart from server
  const reloadCart = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to reload cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reload cart';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [refetch, setError]);

  return {
    // Operations
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    reloadCart,

    // State
    isLoading: loadingCart || addingToCart || updatingCartItem || removingFromCart || clearingCart,
    error: cartError?.message || null,

    // Individual loading states for UI feedback
    loadingStates: {
      loadingCart,
      addingToCart,
      updatingCartItem,
      removingFromCart,
      clearingCart,
    },
  };
};

export default useCartOperations;