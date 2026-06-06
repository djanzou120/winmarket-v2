import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth, requireSeller, requireAdmin } from '../../../infrastructure/context';
import { eq, and, like, gte, lte, desc, asc, count } from 'drizzle-orm';

export const productsResolvers: Resolvers = {
  Query: {
    product: async (_parent, { id }, context) => {
      return await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, id),
      });
    },

    productBySlug: async (_parent, { slug }, context) => {
      return await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.slug, slug),
      });
    },

    products: async (_parent, args, context) => {
      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      const whereConditions = [];

      if (filter.categoryId) whereConditions.push(['categoryId', filter.categoryId]);
      if (filter.sellerId) whereConditions.push(['sellerId', filter.sellerId]);
      if (filter.status) whereConditions.push(['status', filter.status]);
      if (filter.condition) whereConditions.push(['condition', filter.condition]);
      if (filter.inStock) whereConditions.push(['stock', '>', 0]);
      if (filter.isDigital !== undefined) whereConditions.push(['isDigital', filter.isDigital]);

      const products = await context.db.query.products.findMany({
        where: (products: any, { eq, and, like, gte, lte, gt }: any) => {
          const conditions = whereConditions.map(([field, operator, value]) => {
            if (operator === '>') return gt(products[field], value);
            return eq(products[field], operator === '>' ? value : field === 'status' ? value : operator);
          });

          if (filter.priceMin) conditions.push(gte(products.price, filter.priceMin));
          if (filter.priceMax) conditions.push(lte(products.price, filter.priceMax));

          if (filter.search) {
            conditions.push(
              like(products.title, `%${filter.search}%`)
            );
          }

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (products: any, { desc }: any) => desc(products.createdAt),
      });

      const totalCount = products.length;
      const hasNextPage = products.length === pagination.limit;

      return {
        edges: products.map((product: any, index: number) => ({
          node: product,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: pagination.offset > 0,
          startCursor: products.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: products.length > 0 ? Buffer.from(`${pagination.offset + products.length - 1}`).toString('base64') : null,
        },
        totalCount,
      };
    },

    category: async (_parent, { id }, context) => {
      return await context.db.query.categories.findFirst({
        where: (categories: any, { eq }: any) => eq(categories.id, id),
      });
    },

    categoryBySlug: async (_parent, { slug }, context) => {
      return await context.db.query.categories.findFirst({
        where: (categories: any, { eq }: any) => eq(categories.slug, slug),
      });
    },

    categories: async (_parent, args, context) => {
      const { filter = {}, pagination = { limit: 50, offset: 0 } } = args;

      const whereConditions = [];

      if (filter.parentId !== undefined) {
        whereConditions.push(['parentId', filter.parentId]);
      }
      if (filter.isActive !== undefined) {
        whereConditions.push(['isActive', filter.isActive]);
      }

      const categories = await context.db.query.categories.findMany({
        where: (categories: any, { eq, and, like }: any) => {
          const conditions = whereConditions.map(([field, value]) =>
            value === null ? eq(categories[field], null) : eq(categories[field], value)
          );

          if (filter.search) {
            conditions.push(like(categories.name, `%${filter.search}%`));
          }

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (categories: any, { asc }: any) => [asc(categories.sortOrder), asc(categories.name)],
      });

      return {
        edges: categories.map((category: any, index: number) => ({
          node: category,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: categories.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: categories.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: categories.length > 0 ? Buffer.from(`${pagination.offset + categories.length - 1}`).toString('base64') : null,
        },
        totalCount: categories.length,
      };
    },

    productStats: async (_parent, _args, context) => {
      requireAdmin(context);

      const allProducts = await context.db.query.products.findMany();

      const stats = {
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter(p => p.status === 'ACTIVE').length,
        draftProducts: allProducts.filter(p => p.status === 'DRAFT').length,
        inactiveProducts: allProducts.filter(p => p.status === 'INACTIVE').length,
        archivedProducts: allProducts.filter(p => p.status === 'ARCHIVED').length,
        averagePrice: allProducts.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0) / allProducts.length || 0,
        totalViews: allProducts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
        totalSales: allProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0),
        productsByCategory: [], // TODO: Implement category grouping
      };

      return stats;
    },

    searchProducts: async (_parent, { query, limit = 10 }, context) => {
      return await context.db.query.products.findMany({
        where: (products: any, { like, and, eq }: any) => and(
          like(products.title, `%${query}%`),
          eq(products.status, 'ACTIVE')
        ),
        limit,
        orderBy: (products: any, { desc }: any) => desc(products.viewCount),
      });
    },

    featuredProducts: async (_parent, { limit = 10 }, context) => {
      return await context.db.query.products.findMany({
        where: (products: any, { eq, and }: any) => and(
          eq(products.status, 'ACTIVE'),
          eq(products.isFeatured, true)
        ),
        limit,
        orderBy: (products: any, { desc }: any) => desc(products.averageRating),
      });
    },

    popularProducts: async (_parent, { limit = 10 }, context) => {
      return await context.db.query.products.findMany({
        where: (products: any, { eq }: any) => eq(products.status, 'ACTIVE'),
        limit,
        orderBy: (products: any, { desc }: any) => [desc(products.viewCount), desc(products.soldCount)],
      });
    },

    relatedProducts: async (_parent, { productId, limit = 5 }, context) => {
      const product = await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, productId),
      });

      if (!product) return [];

      return await context.db.query.products.findMany({
        where: (products: any, { eq, ne, and }: any) => and(
          eq(products.categoryId, product.categoryId),
          ne(products.id, productId),
          eq(products.status, 'ACTIVE')
        ),
        limit,
        orderBy: (products: any, { desc }: any) => desc(products.averageRating),
      });
    },
  },

  Mutation: {
    createProduct: async (_parent, { input }, context) => {
      const user = requireSeller(context);

      const { randomUUID } = await import('crypto');
      const [newProduct] = await context.db
        .insert(context.schema.products)
        .values({
          id: randomUUID(),
          sellerId: user.id,
          ...input,
        })
        .returning();

      return newProduct;
    },

    updateProduct: async (_parent, { id, input }, context) => {
      const user = requireAuth(context);

      // Check ownership or admin
      const product = await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, id),
      });

      if (!product) throw new Error('Product not found');

      if (product.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to update this product');
      }

      const [updatedProduct] = await context.db
        .update(context.schema.products)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.products.id, id))
        .returning();

      return updatedProduct;
    },

    deleteProduct: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const product = await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, id),
      });

      if (!product) throw new Error('Product not found');

      if (product.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to delete this product');
      }

      await context.db
        .delete(context.schema.products)
        .where(eq(context.schema.products.id, id));

      return true;
    },

    publishProduct: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const [publishedProduct] = await context.db
        .update(context.schema.products)
        .set({
          status: 'ACTIVE',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(context.schema.products.id, id))
        .returning();

      return publishedProduct;
    },

    createCategory: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const [newCategory] = await context.db
        .insert(context.schema.categories)
        .values({
          id: randomUUID(),
          ...input,
        })
        .returning();

      return newCategory;
    },

    updateCategory: async (_parent, { id, input }, context) => {
      requireAdmin(context);

      const [updatedCategory] = await context.db
        .update(context.schema.categories)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.categories.id, id))
        .returning();

      return updatedCategory;
    },

    incrementProductView: async (_parent, { id }, context) => {
      await context.db
        .update(context.schema.products)
        .set({
          viewCount: context.db.query.products.findFirst({
            where: (products: any, { eq }: any) => eq(products.id, id),
          }).then((p: any) => (p?.viewCount || 0) + 1),
          updatedAt: new Date(),
        })
        .where(eq(context.schema.products.id, id));

      return await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, id),
      });
    },
  },

  // Type resolvers
  Product: {
    seller: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.sellerId),
      });
    },

    category: async (parent: any, _args: any, context: any) => {
      return context.db.query.categories.findFirst({
        where: (categories: any, { eq }: any) => eq(categories.id, parent.categoryId),
      });
    },

    variants: async (parent: any, _args: any, context: any) => {
      return context.db.query.productVariants.findMany({
        where: (variants: any, { eq }: any) => eq(variants.productId, parent.id),
        orderBy: (variants: any, { asc }: any) => asc(variants.sortOrder),
      });
    },
  },

  Category: {
    parent: async (parent: any, _args: any, context: any) => {
      if (!parent.parentId) return null;
      return context.db.query.categories.findFirst({
        where: (categories: any, { eq }: any) => eq(categories.id, parent.parentId),
      });
    },

    children: async (parent: any, _args: any, context: any) => {
      return context.db.query.categories.findMany({
        where: (categories: any, { eq }: any) => eq(categories.parentId, parent.id),
        orderBy: (categories: any, { asc }: any) => asc(categories.sortOrder),
      });
    },

    productCount: async (parent: any, _args: any, context: any) => {
      const products = await context.db.query.products.findMany({
        where: (products: any, { eq }: any) => eq(products.categoryId, parent.id),
      });
      return products.length;
    },
  },
};