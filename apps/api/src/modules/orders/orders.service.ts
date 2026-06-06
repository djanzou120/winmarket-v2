import { eq, and, desc, gte, lte, inArray } from 'drizzle-orm';
import type { Database } from '../../infrastructure/database/connection';
import { orders, orderItems, products, users, walletTransactions, userWallets } from '../../infrastructure/database/schema';
import { randomUUID } from "crypto";

export interface CreateOrderInput {
  sellerId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'WALLET' | 'MANUAL_PAYMENT' | 'CASH_ON_DELIVERY';
  buyerNotes?: string;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  sellerId?: string;
  buyerId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class OrdersService {
  constructor(private db: Database) {}

  async createOrder(buyerId: string, input: CreateOrderInput) {
    return await this.db.transaction(async (tx) => {
      // Validate products and calculate total
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of input.items) {
        const product = await tx.query.products.findFirst({
          where: and(
            eq(products.id, item.productId),
            eq(products.sellerId, input.sellerId),
            eq(products.status, 'ACTIVE')
          ),
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found or not available`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.title}`);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          id: randomUUID(),
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal.toFixed(2),
          productSnapshot: JSON.stringify({
            title: product.title,
            price: product.price,
            images: product.images,
          }),
        });
      }

      // Calculate platform fee (5% commission)
      const platformFee = subtotal * 0.05;
      const totalAmount = subtotal;

      // Generate order number
      const orderNumber = `WM${Date.now().toString().slice(-8)}`;

      // Create order
      const [order] = await tx.insert(orders).values({
        id: randomUUID(),
        buyerId,
        sellerId: input.sellerId,
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: input.paymentMethod,
        subtotal: subtotal.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        shippingAddress: JSON.stringify(input.shippingAddress),
        buyerNotes: input.buyerNotes,
      }).returning();

      // Create order items
      for (const itemData of orderItemsData) {
        await tx.insert(orderItems).values({
          ...itemData,
          orderId: order.id,
        });
      }

      // If payment method is wallet, process payment immediately
      if (input.paymentMethod === 'WALLET') {
        await this.processWalletPayment(tx, buyerId, input.sellerId, order, platformFee);
      }

      // Update product stock
      for (const item of input.items) {
        await tx.update(products)
          .set({
            stock: tx.select({ stock: products.stock })
              .from(products)
              .where(eq(products.id, item.productId))
              .then(result => result[0].stock - item.quantity),
            soldCount: tx.select({ soldCount: products.soldCount })
              .from(products)
              .where(eq(products.id, item.productId))
              .then(result => (result[0].soldCount || 0) + item.quantity),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }

      return order;
    });
  }

  private async processWalletPayment(tx: any, buyerId: string, sellerId: string, order: any, platformFee: number) {
    // Get buyer wallet
    const buyerWallet = await tx.query.userWallets.findFirst({
      where: eq(userWallets.userId, buyerId),
    });

    if (!buyerWallet) {
      throw new Error('Buyer wallet not found');
    }

    const buyerBalance = parseFloat(buyerWallet.balance);
    const orderTotal = parseFloat(order.totalAmount);

    if (buyerBalance < orderTotal) {
      throw new Error('Insufficient wallet balance');
    }

    // Deduct from buyer wallet
    const newBuyerBalance = buyerBalance - orderTotal;
    await tx.update(userWallets)
      .set({
        balance: newBuyerBalance.toFixed(2),
        totalSpent: (parseFloat(buyerWallet.totalSpent) + orderTotal).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(userWallets.id, buyerWallet.id));

    // Create buyer transaction
    await tx.insert(walletTransactions).values({
      id: randomUUID(),
      userId: buyerId,
      orderId: order.id,
      type: 'PAYMENT',
      amount: (-orderTotal).toFixed(2),
      balanceBefore: buyerBalance.toFixed(2),
      balanceAfter: newBuyerBalance.toFixed(2),
      description: `Payment for order ${order.orderNumber}`,
    });

    // Get or create seller wallet
    let sellerWallet = await tx.query.userWallets.findFirst({
      where: eq(userWallets.userId, sellerId),
    });

    if (!sellerWallet) {
      [sellerWallet] = await tx.insert(userWallets).values({
        id: randomUUID(),
        userId: sellerId,
        balance: '0.00',
        frozenBalance: '0.00',
        totalEarnings: '0.00',
        totalSpent: '0.00',
      }).returning();
    }

    // Calculate seller amount (total - platform fee)
    const sellerAmount = orderTotal - platformFee;
    const sellerBalance = parseFloat(sellerWallet.balance);
    const newSellerBalance = sellerBalance + sellerAmount;

    // Add to seller wallet
    await tx.update(userWallets)
      .set({
        balance: newSellerBalance.toFixed(2),
        totalEarnings: (parseFloat(sellerWallet.totalEarnings) + sellerAmount).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(userWallets.id, sellerWallet.id));

    // Create seller transaction
    await tx.insert(walletTransactions).values({
      id: randomUUID(),
      userId: sellerId,
      orderId: order.id,
      type: 'COMMISSION',
      amount: sellerAmount.toFixed(2),
      balanceBefore: sellerBalance.toFixed(2),
      balanceAfter: newSellerBalance.toFixed(2),
      description: `Sale commission for order ${order.orderNumber}`,
    });

    // Update order status
    await tx.update(orders)
      .set({
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
  }

  async getOrderById(orderId: string, userId?: string) {
    const conditions = [eq(orders.id, orderId)];

    if (userId) {
      // User can only see their own orders (as buyer or seller)
      conditions.push(
        and(
          eq(orders.buyerId, userId),
          eq(orders.sellerId, userId)
        )
      );
    }

    return await this.db.query.orders.findFirst({
      where: and(...conditions),
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
  }

  async getOrdersByUser(userId: string, filters: OrderFilters) {
    const { limit = 20, offset = 0, status, paymentStatus, startDate, endDate } = filters;

    const conditions = [
      and(
        eq(orders.buyerId, userId),
        eq(orders.sellerId, userId)
      ),
    ];

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus));
    }

    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(orders.createdAt, endDate));
    }

    const userOrders = await this.db.query.orders.findMany({
      where: and(...conditions),
      orderBy: desc(orders.createdAt),
      limit,
      offset,
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });

    const total = await this.db.$count(orders, and(...conditions));

    return {
      orders: userOrders,
      total,
      hasMore: offset + limit < total,
    };
  }

  async updateOrderStatus(orderId: string, newStatus: string, userId?: string) {
    const conditions = [eq(orders.id, orderId)];

    if (userId) {
      // Only seller can update order status
      conditions.push(eq(orders.sellerId, userId));
    }

    const [updatedOrder] = await this.db.update(orders)
      .set({
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'SHIPPED' && { shippedAt: new Date() }),
        ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() }),
        ...(newStatus === 'CANCELLED' && { cancelledAt: new Date() }),
      })
      .where(and(...conditions))
      .returning();

    return updatedOrder;
  }

  async getAllOrders(filters: OrderFilters) {
    const { limit = 20, offset = 0, status, paymentStatus, sellerId, buyerId, startDate, endDate } = filters;

    const conditions = [];

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus));
    }

    if (sellerId) {
      conditions.push(eq(orders.sellerId, sellerId));
    }

    if (buyerId) {
      conditions.push(eq(orders.buyerId, buyerId));
    }

    if (startDate) {
      conditions.push(gte(orders.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(orders.createdAt, endDate));
    }

    const allOrders = await this.db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: desc(orders.createdAt),
      limit,
      offset,
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });

    const total = await this.db.$count(
      orders,
      conditions.length > 0 ? and(...conditions) : undefined
    );

    return {
      orders: allOrders,
      total,
      hasMore: offset + limit < total,
    };
  }
}