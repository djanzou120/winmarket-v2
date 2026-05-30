import { eq, and, like, gte, lte, desc, asc, count } from 'drizzle-orm';
import type { Database } from 'database/types';
import { products, categories, deliveryProviders, deliveryOptions } from 'database/schema';
import { logger } from '../../infrastructure/logger';

export interface CreateProductInput {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags?: string[];
  allowsPickup?: boolean;
}

export interface UpdateProductInput {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  tags?: string[];
  status?: 'ACTIVE' | 'DRAFT' | 'SUSPENDED' | 'DELETED';
  isFeatured?: boolean;
  allowsPickup?: boolean;
}

export interface SearchProductsInput {
  query?: string;
  categoryId?: string;
  sellerId?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateDeliveryProviderInput {
  name: string;
  description?: string;
  contactInfo?: string;
  serviceZones: string[];
  basePrice: number;
  pricePerKm?: number;
  estimatedDays?: number;
}

export interface CreateDeliveryOptionInput {
  productId: string;
  type: 'PICKUP' | 'DELIVERY';
  deliveryProviderId?: string;
  price: number;
  estimatedDays: number;
  description?: string;
}

export class ProductsService {
  constructor(private db: Database) {}

  // Product methods
  async createProduct(sellerId: string, input: CreateProductInput) {
    try {
      const slug = this.generateSlug(input.title);

      const [product] = await this.db
        .insert(products)
        .values({
          sellerId,
          categoryId: input.categoryId,
          title: input.title,
          slug,
          description: input.description,
          price: input.price.toString(),
          compareAtPrice: input.compareAtPrice?.toString(),
          stock: input.stock,
          sku: input.sku,
          weight: input.weight?.toString(),
          dimensions: input.dimensions ? JSON.stringify(input.dimensions) : null,
          images: JSON.stringify(input.images),
          tags: input.tags ? JSON.stringify(input.tags) : null,
          allowsPickup: input.allowsPickup ?? true,
        })
        .returning();

      // Create default pickup option
      await this.db.insert(deliveryOptions).values({
        productId: product.id,
        type: 'PICKUP',
        price: '0.00',
        estimatedDays: 0,
        description: 'Pickup from seller location',
      });

      logger.info('Product created', { productId: product.id, sellerId });
      return product;
    } catch (error) {
      logger.error('Failed to create product', { sellerId, input, error });
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(productId: string, sellerId: string, input: UpdateProductInput) {
    try {
      // Verify ownership
      const product = await this.db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        throw new Error('Product not found or access denied');
      }

      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.price) updateData.price = input.price.toString();
      if (input.compareAtPrice !== undefined) updateData.compareAtPrice = input.compareAtPrice?.toString();
      if (input.stock !== undefined) updateData.stock = input.stock;
      if (input.sku) updateData.sku = input.sku;
      if (input.weight !== undefined) updateData.weight = input.weight?.toString();
      if (input.dimensions) updateData.dimensions = JSON.stringify(input.dimensions);
      if (input.images) updateData.images = JSON.stringify(input.images);
      if (input.tags) updateData.tags = JSON.stringify(input.tags);
      if (input.status) updateData.status = input.status;
      if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
      if (input.allowsPickup !== undefined) updateData.allowsPickup = input.allowsPickup;

      updateData.updatedAt = new Date();

      const [updatedProduct] = await this.db
        .update(products)
        .set(updateData)
        .where(eq(products.id, productId))
        .returning();

      logger.info('Product updated', { productId, sellerId });
      return updatedProduct;
    } catch (error) {
      logger.error('Failed to update product', { productId, sellerId, input, error });
      throw error;
    }
  }

  async deleteProduct(productId: string, sellerId: string) {
    try {
      const result = await this.db
        .update(products)
        .set({ status: 'DELETED', updatedAt: new Date() })
        .where(and(eq(products.id, productId), eq(products.sellerId, sellerId)))
        .returning();

      if (result.length === 0) {
        throw new Error('Product not found or access denied');
      }

      logger.info('Product deleted', { productId, sellerId });
      return true;
    } catch (error) {
      logger.error('Failed to delete product', { productId, sellerId, error });
      throw error;
    }
  }

  async getProductById(productId: string) {
    try {
      return await this.db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.status, 'ACTIVE')),
        with: {
          seller: {
            with: {
              profile: true,
            },
          },
          category: true,
          deliveryOptions: {
            with: {
              deliveryProvider: true,
            },
          },
          reviews: {
            where: (reviews, { eq }) => eq(reviews.status, 'APPROVED'),
            limit: 5,
            orderBy: (reviews, { desc }) => desc(reviews.createdAt),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get product', { productId, error });
      return null;
    }
  }

  async searchProducts(input: SearchProductsInput = {}) {
    try {
      const {
        query,
        categoryId,
        sellerId,
        priceMin,
        priceMax,
        inStock,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = input;

      let whereConditions = [eq(products.status, 'ACTIVE')];

      if (query) {
        whereConditions.push(like(products.title, `%${query}%`));
      }

      if (categoryId) {
        whereConditions.push(eq(products.categoryId, categoryId));
      }

      if (sellerId) {
        whereConditions.push(eq(products.sellerId, sellerId));
      }

      if (priceMin !== undefined) {
        whereConditions.push(gte(products.price, priceMin.toString()));
      }

      if (priceMax !== undefined) {
        whereConditions.push(lte(products.price, priceMax.toString()));
      }

      if (inStock) {
        whereConditions.push(gte(products.stock, 1));
      }

      // Build order by clause
      let orderBy;
      const orderDirection = sortOrder === 'desc' ? desc : asc;

      switch (sortBy) {
        case 'price':
          orderBy = orderDirection(products.price);
          break;
        case 'salesCount':
          orderBy = orderDirection(products.salesCount);
          break;
        case 'viewCount':
          orderBy = orderDirection(products.viewCount);
          break;
        default:
          orderBy = orderDirection(products.createdAt);
      }

      const [productsResult, totalResult] = await Promise.all([
        this.db.query.products.findMany({
          where: and(...whereConditions),
          with: {
            seller: {
              columns: { id: true, email: true },
              with: { profile: true },
            },
            category: true,
          },
          orderBy,
          limit,
          offset,
        }),
        this.db.select({ count: count() }).from(products).where(and(...whereConditions)),
      ]);

      const total = totalResult[0]?.count || 0;

      return {
        products: productsResult,
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      logger.error('Failed to search products', { input, error });
      throw error;
    }
  }

  async getProductsBySeller(sellerId: string) {
    try {
      return await this.db.query.products.findMany({
        where: and(eq(products.sellerId, sellerId), eq(products.status, 'ACTIVE')),
        with: {
          category: true,
          deliveryOptions: true,
        },
        orderBy: desc(products.createdAt),
      });
    } catch (error) {
      logger.error('Failed to get seller products', { sellerId, error });
      throw error;
    }
  }

  // Category methods
  async getCategories() {
    try {
      return await this.db.query.categories.findMany({
        where: eq(categories.isActive, true),
        orderBy: [asc(categories.sortOrder), asc(categories.name)],
      });
    } catch (error) {
      logger.error('Failed to get categories', { error });
      throw error;
    }
  }

  async getCategoryById(categoryId: string) {
    try {
      return await this.db.query.categories.findFirst({
        where: and(eq(categories.id, categoryId), eq(categories.isActive, true)),
        with: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      logger.error('Failed to get category', { categoryId, error });
      return null;
    }
  }

  // Delivery provider methods
  async createDeliveryProvider(sellerId: string, input: CreateDeliveryProviderInput) {
    try {
      const [provider] = await this.db
        .insert(deliveryProviders)
        .values({
          sellerId,
          name: input.name,
          description: input.description,
          contactInfo: input.contactInfo,
          serviceZones: JSON.stringify(input.serviceZones),
          basePrice: input.basePrice.toString(),
          pricePerKm: (input.pricePerKm || 0).toString(),
          estimatedDays: input.estimatedDays || 1,
        })
        .returning();

      logger.info('Delivery provider created', { providerId: provider.id, sellerId });
      return provider;
    } catch (error) {
      logger.error('Failed to create delivery provider', { sellerId, input, error });
      throw new Error('Failed to create delivery provider');
    }
  }

  async updateDeliveryProvider(providerId: string, sellerId: string, input: Partial<CreateDeliveryProviderInput>) {
    try {
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.contactInfo !== undefined) updateData.contactInfo = input.contactInfo;
      if (input.serviceZones) updateData.serviceZones = JSON.stringify(input.serviceZones);
      if (input.basePrice !== undefined) updateData.basePrice = input.basePrice.toString();
      if (input.pricePerKm !== undefined) updateData.pricePerKm = input.pricePerKm.toString();
      if (input.estimatedDays !== undefined) updateData.estimatedDays = input.estimatedDays;

      const [provider] = await this.db
        .update(deliveryProviders)
        .set(updateData)
        .where(and(eq(deliveryProviders.id, providerId), eq(deliveryProviders.sellerId, sellerId)))
        .returning();

      if (!provider) {
        throw new Error('Delivery provider not found or access denied');
      }

      logger.info('Delivery provider updated', { providerId, sellerId });
      return provider;
    } catch (error) {
      logger.error('Failed to update delivery provider', { providerId, sellerId, error });
      throw error;
    }
  }

  async deleteDeliveryProvider(providerId: string, sellerId: string) {
    try {
      const result = await this.db
        .update(deliveryProviders)
        .set({ isActive: false })
        .where(and(eq(deliveryProviders.id, providerId), eq(deliveryProviders.sellerId, sellerId)))
        .returning();

      if (result.length === 0) {
        throw new Error('Delivery provider not found or access denied');
      }

      logger.info('Delivery provider deleted', { providerId, sellerId });
      return true;
    } catch (error) {
      logger.error('Failed to delete delivery provider', { providerId, sellerId, error });
      throw error;
    }
  }

  async getDeliveryProvidersBySeller(sellerId: string) {
    try {
      return await this.db.query.deliveryProviders.findMany({
        where: and(eq(deliveryProviders.sellerId, sellerId), eq(deliveryProviders.isActive, true)),
        orderBy: asc(deliveryProviders.name),
      });
    } catch (error) {
      logger.error('Failed to get delivery providers', { sellerId, error });
      throw error;
    }
  }

  // Delivery option methods
  async createDeliveryOption(sellerId: string, input: CreateDeliveryOptionInput) {
    try {
      // Verify product ownership
      const product = await this.db.query.products.findFirst({
        where: and(eq(products.id, input.productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        throw new Error('Product not found or access denied');
      }

      const [option] = await this.db
        .insert(deliveryOptions)
        .values({
          productId: input.productId,
          type: input.type,
          deliveryProviderId: input.deliveryProviderId,
          price: input.price.toString(),
          estimatedDays: input.estimatedDays,
          description: input.description,
        })
        .returning();

      logger.info('Delivery option created', { optionId: option.id, sellerId });
      return option;
    } catch (error) {
      logger.error('Failed to create delivery option', { sellerId, input, error });
      throw error;
    }
  }

  async updateDeliveryOption(optionId: string, sellerId: string, input: Partial<CreateDeliveryOptionInput>) {
    try {
      // Verify ownership through product
      const option = await this.db.query.deliveryOptions.findFirst({
        where: eq(deliveryOptions.id, optionId),
        with: {
          product: true,
        },
      });

      if (!option || option.product.sellerId !== sellerId) {
        throw new Error('Delivery option not found or access denied');
      }

      const updateData: any = {};
      if (input.type) updateData.type = input.type;
      if (input.deliveryProviderId !== undefined) updateData.deliveryProviderId = input.deliveryProviderId;
      if (input.price !== undefined) updateData.price = input.price.toString();
      if (input.estimatedDays !== undefined) updateData.estimatedDays = input.estimatedDays;
      if (input.description !== undefined) updateData.description = input.description;

      const [updatedOption] = await this.db
        .update(deliveryOptions)
        .set(updateData)
        .where(eq(deliveryOptions.id, optionId))
        .returning();

      logger.info('Delivery option updated', { optionId, sellerId });
      return updatedOption;
    } catch (error) {
      logger.error('Failed to update delivery option', { optionId, sellerId, error });
      throw error;
    }
  }

  async deleteDeliveryOption(optionId: string, sellerId: string) {
    try {
      // Verify ownership through product
      const option = await this.db.query.deliveryOptions.findFirst({
        where: eq(deliveryOptions.id, optionId),
        with: {
          product: true,
        },
      });

      if (!option || option.product.sellerId !== sellerId) {
        throw new Error('Delivery option not found or access denied');
      }

      // Don't allow deleting pickup option
      if (option.type === 'PICKUP') {
        throw new Error('Cannot delete pickup option');
      }

      await this.db.delete(deliveryOptions).where(eq(deliveryOptions.id, optionId));

      logger.info('Delivery option deleted', { optionId, sellerId });
      return true;
    } catch (error) {
      logger.error('Failed to delete delivery option', { optionId, sellerId, error });
      throw error;
    }
  }

  // Helper methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}