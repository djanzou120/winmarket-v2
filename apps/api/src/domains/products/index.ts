// Products domain exports
export * from './schema/products.schema';
export * from './types/products.types';
export * from './resolvers/products.resolvers';

// Combined exports for easy import
export { productsTypeDefs } from './types/products.types';
export { productsResolvers } from './resolvers/products.resolvers';
export {
  categories,
  products,
  productVariants,
  type Category,
  type Product,
  type ProductVariant,
} from './schema/products.schema';