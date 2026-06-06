// Orders domain exports
export * from './schema/orders.schema';
export * from './types/orders.types';
export * from './resolvers/orders.resolvers';

// Combined exports for easy import
export { ordersTypeDefs } from './types/orders.types';
export { ordersResolvers } from './resolvers/orders.resolvers';
export {
  orders,
  orderItems,
  walletTransactions,
  cartItems,
  type Order,
  type OrderItem,
  type WalletTransaction,
  type CartItem,
} from './schema/orders.schema';