import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth, requireAdmin } from '../../../infrastructure/context';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export const ordersResolvers: Resolvers = {
  Query: {
    order: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const order = await context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, id),
      });

      if (!order) throw new Error('Order not found');

      // Users can only view their own orders unless they're admin
      if (order.buyerId !== user.id && order.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to view this order');
      }

      return order;
    },

    orderByNumber: async (_parent, { orderNumber }, context) => {
      const user = requireAuth(context);

      const order = await context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.orderNumber, orderNumber),
      });

      if (!order) throw new Error('Order not found');

      if (order.buyerId !== user.id && order.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to view this order');
      }

      return order;
    },

    orders: async (_parent, args, context) => {
      requireAdmin(context); // Admin only for all orders

      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      const whereConditions = [];

      if (filter.status) whereConditions.push(['status', filter.status]);
      if (filter.paymentStatus) whereConditions.push(['paymentStatus', filter.paymentStatus]);
      if (filter.paymentMethod) whereConditions.push(['paymentMethod', filter.paymentMethod]);
      if (filter.buyerId) whereConditions.push(['buyerId', filter.buyerId]);
      if (filter.sellerId) whereConditions.push(['sellerId', filter.sellerId]);

      const orders = await context.db.query.orders.findMany({
        where: (orders: any, { eq, and, gte, lte }: any) => {
          const conditions = whereConditions.map(([field, value]) => eq(orders[field], value));

          if (filter.dateFrom) conditions.push(gte(orders.createdAt, new Date(filter.dateFrom)));
          if (filter.dateTo) conditions.push(lte(orders.createdAt, new Date(filter.dateTo)));
          if (filter.minAmount) conditions.push(gte(orders.totalAmount, filter.minAmount));
          if (filter.maxAmount) conditions.push(lte(orders.totalAmount, filter.maxAmount));

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (orders: any, { desc }: any) => desc(orders.createdAt),
      });

      return {
        edges: orders.map((order: any, index: number) => ({
          node: order,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: orders.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: orders.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: orders.length > 0 ? Buffer.from(`${pagination.offset + orders.length - 1}`).toString('base64') : null,
        },
        totalCount: orders.length,
      };
    },

    myOrders: async (_parent, args, context) => {
      const user = requireAuth(context);
      const { pagination = { limit: 20, offset: 0 } } = args;

      const orders = await context.db.query.orders.findMany({
        where: (orders: any, { eq, or }: any) => or(
          eq(orders.buyerId, user.id),
          eq(orders.sellerId, user.id)
        ),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (orders: any, { desc }: any) => desc(orders.createdAt),
      });

      return {
        edges: orders.map((order: any, index: number) => ({
          node: order,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: orders.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: orders.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: orders.length > 0 ? Buffer.from(`${pagination.offset + orders.length - 1}`).toString('base64') : null,
        },
        totalCount: orders.length,
      };
    },

    myPurchases: async (_parent, args, context) => {
      const user = requireAuth(context);
      const { pagination = { limit: 20, offset: 0 } } = args;

      const orders = await context.db.query.orders.findMany({
        where: (orders: any, { eq }: any) => eq(orders.buyerId, user.id),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (orders: any, { desc }: any) => desc(orders.createdAt),
      });

      return {
        edges: orders.map((order: any, index: number) => ({
          node: order,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: orders.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: orders.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: orders.length > 0 ? Buffer.from(`${pagination.offset + orders.length - 1}`).toString('base64') : null,
        },
        totalCount: orders.length,
      };
    },

    mySales: async (_parent, args, context) => {
      const user = requireAuth(context);
      const { pagination = { limit: 20, offset: 0 } } = args;

      const orders = await context.db.query.orders.findMany({
        where: (orders: any, { eq }: any) => eq(orders.sellerId, user.id),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (orders: any, { desc }: any) => desc(orders.createdAt),
      });

      return {
        edges: orders.map((order: any, index: number) => ({
          node: order,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: orders.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: orders.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: orders.length > 0 ? Buffer.from(`${pagination.offset + orders.length - 1}`).toString('base64') : null,
        },
        totalCount: orders.length,
      };
    },

    myCart: async (_parent, _args, context) => {
      const user = requireAuth(context);

      const cartItems = await context.db.query.cartItems.findMany({
        where: (cartItems: any, { eq }: any) => eq(cartItems.userId, user.id),
        orderBy: (cartItems: any, { desc }: any) => desc(cartItems.addedAt),
      });

      // Calculate totals
      let subtotal = 0;
      const itemsWithPricing = await Promise.all(
        cartItems.map(async (item: any) => {
          const product = await context.db.query.products.findFirst({
            where: (products: any, { eq }: any) => eq(products.id, item.productId),
          });

          const unitPrice = parseFloat(product?.price || '0');
          const totalPrice = unitPrice * item.quantity;
          subtotal += totalPrice;

          return {
            ...item,
            unitPrice,
            totalPrice,
          };
        })
      );

      return {
        items: itemsWithPricing,
        itemCount: cartItems.length,
        subtotal,
        currency: 'XOF',
        updatedAt: cartItems[0]?.updatedAt || new Date().toISOString(),
      };
    },

    orderStats: async (_parent, _args, context) => {
      requireAdmin(context);

      const allOrders = await context.db.query.orders.findMany();

      const stats = {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === 'PENDING').length,
        confirmedOrders: allOrders.filter(o => o.status === 'CONFIRMED').length,
        shippedOrders: allOrders.filter(o => o.status === 'SHIPPED').length,
        deliveredOrders: allOrders.filter(o => o.status === 'DELIVERED').length,
        cancelledOrders: allOrders.filter(o => o.status === 'CANCELLED').length,
        totalRevenue: allOrders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0),
        averageOrderValue: allOrders.length > 0 ?
          allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0) / allOrders.length : 0,
        ordersByStatus: [
          { status: 'PENDING', count: allOrders.filter(o => o.status === 'PENDING').length },
          { status: 'CONFIRMED', count: allOrders.filter(o => o.status === 'CONFIRMED').length },
          { status: 'PROCESSING', count: allOrders.filter(o => o.status === 'PROCESSING').length },
          { status: 'SHIPPED', count: allOrders.filter(o => o.status === 'SHIPPED').length },
          { status: 'DELIVERED', count: allOrders.filter(o => o.status === 'DELIVERED').length },
          { status: 'CANCELLED', count: allOrders.filter(o => o.status === 'CANCELLED').length },
          { status: 'REFUNDED', count: allOrders.filter(o => o.status === 'REFUNDED').length },
        ],
        recentOrders: allOrders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10),
      };

      return stats;
    },

    myTransactions: async (_parent, args, context) => {
      const user = requireAuth(context);
      const { pagination = { limit: 20, offset: 0 } } = args;

      // Get user's wallet
      const wallet = await context.db.query.userWallets.findFirst({
        where: (wallets: any, { eq }: any) => eq(wallets.userId, user.id),
      });

      if (!wallet) return [];

      return await context.db.query.walletTransactions.findMany({
        where: (transactions: any, { eq }: any) => eq(transactions.walletId, wallet.id),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (transactions: any, { desc }: any) => desc(transactions.createdAt),
      });
    },
  },

  Mutation: {
    createOrder: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate totals (simplified)
      const items = input.items;
      let subtotal = 0;

      // Validate items and calculate subtotal
      for (const item of items) {
        const product = await context.db.query.products.findFirst({
          where: (products: any, { eq }: any) => eq(products.id, item.productId),
        });

        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.title}`);

        subtotal += parseFloat(product.price) * item.quantity;
      }

      const taxAmount = subtotal * 0.18; // 18% tax (example)
      const shippingAmount = 1000; // Fixed shipping (example)
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Assume all items are from same seller for simplicity
      const firstProduct = await context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, items[0].productId),
      });

      const { randomUUID } = await import('crypto');
      const [newOrder] = await context.db
        .insert(context.schema.orders)
        .values({
          id: randomUUID(),
          buyerId: user.id,
          sellerId: firstProduct!.sellerId,
          orderNumber,
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          shippingAmount: shippingAmount.toString(),
          totalAmount: totalAmount.toString(),
          shippingAddress: JSON.stringify(input.shippingAddress),
          billingAddress: JSON.stringify(input.billingAddress || input.shippingAddress),
          paymentMethod: input.paymentMethod,
          shippingMethod: input.shippingMethod,
          notes: input.notes,
        })
        .returning();

      // Create order items
      for (const item of items) {
        const product = await context.db.query.products.findFirst({
          where: (products: any, { eq }: any) => eq(products.id, item.productId),
        });

        await context.db.insert(context.schema.orderItems).values({
          id: randomUUID(),
          orderId: newOrder.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          productName: product!.title,
          productImage: product!.images?.[0] || '',
          productSku: product!.sku,
          unitPrice: product!.price,
          quantity: item.quantity,
          totalPrice: (parseFloat(product!.price) * item.quantity).toString(),
        });

        // Update product stock
        await context.db
          .update(context.schema.products)
          .set({
            stock: sql`${context.schema.products.stock} - ${item.quantity}`,
            soldCount: sql`${context.schema.products.soldCount} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(context.schema.products.id, item.productId));
      }

      return newOrder;
    },

    updateOrder: async (_parent, { id, input }, context) => {
      const user = requireAuth(context);

      const order = await context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, id),
      });

      if (!order) throw new Error('Order not found');

      // Only seller or admin can update orders
      if (order.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to update this order');
      }

      const [updatedOrder] = await context.db
        .update(context.schema.orders)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.orders.id, id))
        .returning();

      return updatedOrder;
    },

    cancelOrder: async (_parent, { id, reason }, context) => {
      const user = requireAuth(context);

      const order = await context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, id),
      });

      if (!order) throw new Error('Order not found');

      // Buyer can cancel pending/confirmed orders, seller/admin can cancel any
      if (order.buyerId === user.id && !['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      if (order.buyerId !== user.id && order.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to cancel this order');
      }

      const [cancelledOrder] = await context.db
        .update(context.schema.orders)
        .set({
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(context.schema.orders.id, id))
        .returning();

      return cancelledOrder;
    },

    addToCart: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Check if item already exists in cart
      const existingItem = await context.db.query.cartItems.findFirst({
        where: (cartItems: any, { eq, and }: any) => and(
          eq(cartItems.userId, user.id),
          eq(cartItems.productId, input.productId),
          input.productVariantId
            ? eq(cartItems.productVariantId, input.productVariantId)
            : eq(cartItems.productVariantId, null)
        ),
      });

      if (existingItem) {
        // Update quantity
        const [updatedItem] = await context.db
          .update(context.schema.cartItems)
          .set({
            quantity: existingItem.quantity + input.quantity,
            updatedAt: new Date(),
          })
          .where(eq(context.schema.cartItems.id, existingItem.id))
          .returning();

        return updatedItem;
      } else {
        // Create new cart item
        const { randomUUID } = await import('crypto');
        const [newItem] = await context.db
          .insert(context.schema.cartItems)
          .values({
            id: randomUUID(),
            userId: user.id,
            productId: input.productId,
            productVariantId: input.productVariantId,
            quantity: input.quantity,
          })
          .returning();

        return newItem;
      }
    },

    removeFromCart: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      await context.db
        .delete(context.schema.cartItems)
        .where(and(
          eq(context.schema.cartItems.id, id),
          eq(context.schema.cartItems.userId, user.id)
        ));

      return true;
    },

    clearCart: async (_parent, _args, context) => {
      const user = requireAuth(context);

      await context.db
        .delete(context.schema.cartItems)
        .where(eq(context.schema.cartItems.userId, user.id));

      return true;
    },
  },

  // Type resolvers
  Order: {
    buyer: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.buyerId),
      });
    },

    seller: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.sellerId),
      });
    },

    items: async (parent: any, _args: any, context: any) => {
      return context.db.query.orderItems.findMany({
        where: (orderItems: any, { eq }: any) => eq(orderItems.orderId, parent.id),
      });
    },

    itemCount: async (parent: any, _args: any, context: any) => {
      const items = await context.db.query.orderItems.findMany({
        where: (orderItems: any, { eq }: any) => eq(orderItems.orderId, parent.id),
      });
      return items.length;
    },

    shippingAddress: (parent: any) => {
      try {
        return parent.shippingAddress ? JSON.parse(parent.shippingAddress) : null;
      } catch {
        return null;
      }
    },

    billingAddress: (parent: any) => {
      try {
        return parent.billingAddress ? JSON.parse(parent.billingAddress) : null;
      } catch {
        return null;
      }
    },
  },

  OrderItem: {
    product: async (parent: any, _args: any, context: any) => {
      return context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, parent.productId),
      });
    },

    productVariant: async (parent: any, _args: any, context: any) => {
      if (!parent.productVariantId) return null;
      return context.db.query.productVariants.findFirst({
        where: (variants: any, { eq }: any) => eq(variants.id, parent.productVariantId),
      });
    },
  },

  CartItem: {
    product: async (parent: any, _args: any, context: any) => {
      return context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, parent.productId),
      });
    },

    productVariant: async (parent: any, _args: any, context: any) => {
      if (!parent.productVariantId) return null;
      return context.db.query.productVariants.findFirst({
        where: (variants: any, { eq }: any) => eq(variants.id, parent.productVariantId),
      });
    },
  },

  WalletTransaction: {
    order: async (parent: any, _args: any, context: any) => {
      if (!parent.orderId) return null;
      return context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, parent.orderId),
      });
    },
  },
};