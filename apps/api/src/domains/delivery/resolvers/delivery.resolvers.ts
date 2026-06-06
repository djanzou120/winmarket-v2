import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth, requireAdmin } from '../../../infrastructure/context';
import { eq, and, desc } from 'drizzle-orm';

export const deliveryResolvers: Resolvers = {
  Query: {
    deliveryProvider: async (_parent, { id }, context) => {
      return await context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, id),
      });
    },

    deliveryProviders: async (_parent, _args, context) => {
      return await context.db.query.deliveryProviders.findMany({
        where: (providers: any, { eq }: any) => eq(providers.isActive, true),
        orderBy: (providers: any, { asc }: any) => asc(providers.name),
      });
    },

    deliveryOption: async (_parent, { id }, context) => {
      return await context.db.query.deliveryOptions.findFirst({
        where: (options: any, { eq }: any) => eq(options.id, id),
      });
    },

    deliveryOptions: async (_parent, { providerId }, context) => {
      const whereCondition = providerId
        ? (options: any, { eq, and }: any) => and(
            eq(options.providerId, providerId),
            eq(options.isActive, true)
          )
        : (options: any, { eq }: any) => eq(options.isActive, true);

      return await context.db.query.deliveryOptions.findMany({
        where: whereCondition,
        orderBy: (options: any, { asc }: any) => [asc(options.sortOrder), asc(options.name)],
      });
    },

    availableDeliveryOptions: async (_parent, { input }, context) => {
      // Get all active delivery options
      const options = await context.db.query.deliveryOptions.findMany({
        where: (options: any, { eq }: any) => eq(options.isActive, true),
        orderBy: (options: any, { asc }: any) => asc(options.basePrice),
      });

      // Calculate pricing and availability for each option
      const quotes = await Promise.all(
        options.map(async (option: any) => {
          const provider = await context.db.query.deliveryProviders.findFirst({
            where: (providers: any, { eq }: any) => eq(providers.id, option.providerId),
          });

          if (!provider || !provider.isActive) {
            return null;
          }

          // Basic availability check
          const isAvailable = checkOptionAvailability(option, input);
          if (!isAvailable.available) {
            return {
              option,
              price: 0,
              estimatedDays: option.estimatedDays,
              isAvailable: false,
              restrictions: isAvailable.restrictions,
            };
          }

          // Calculate price
          const price = calculateDeliveryPrice(option, input);

          return {
            option,
            price,
            estimatedDays: option.estimatedDays,
            isAvailable: true,
            restrictions: [],
          };
        })
      );

      return quotes.filter(q => q !== null);
    },

    deliveryZones: async (_parent, _args, context) => {
      return await context.db.query.deliveryZones.findMany({
        where: (zones: any, { eq }: any) => eq(zones.isActive, true),
        orderBy: (zones: any, { asc }: any) => asc(zones.name),
      });
    },

    trackDelivery: async (_parent, { trackingNumber }, context) => {
      return await context.db.query.deliveryTracking.findFirst({
        where: (tracking: any, { eq }: any) => eq(tracking.trackingNumber, trackingNumber),
      });
    },

    orderTracking: async (_parent, { orderId }, context) => {
      const user = requireAuth(context);

      // Verify user can access this order
      const order = await context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, orderId),
      });

      if (!order) throw new Error('Order not found');

      if (order.buyerId !== user.id && order.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to view tracking for this order');
      }

      return await context.db.query.deliveryTracking.findFirst({
        where: (tracking: any, { eq }: any) => eq(tracking.orderId, orderId),
      });
    },

    calculateShipping: async (_parent, { input }, context) => {
      // Same logic as availableDeliveryOptions but focused on pricing
      const options = await context.db.query.deliveryOptions.findMany({
        where: (options: any, { eq }: any) => eq(options.isActive, true),
      });

      return options.map((option: any) => ({
        option,
        price: calculateDeliveryPrice(option, input),
        estimatedDays: option.estimatedDays,
        isAvailable: checkOptionAvailability(option, input).available,
        restrictions: checkOptionAvailability(option, input).restrictions,
      }));
    },

    deliveryStats: async (_parent, _args, context) => {
      requireAdmin(context);

      const allTracking = await context.db.query.deliveryTracking.findMany();

      const stats = {
        totalDeliveries: allTracking.length,
        pendingDeliveries: allTracking.filter(t => t.status === 'PENDING').length,
        inTransitDeliveries: allTracking.filter(t => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(t.status)).length,
        deliveredToday: allTracking.filter(t =>
          t.status === 'DELIVERED' &&
          new Date(t.actualDelivery || '').toDateString() === new Date().toDateString()
        ).length,
        failedDeliveries: allTracking.filter(t => t.status === 'FAILED').length,
        averageDeliveryTime: calculateAverageDeliveryTime(allTracking),
        onTimeDeliveryRate: calculateOnTimeRate(allTracking),
      };

      return stats;
    },
  },

  Mutation: {
    createDeliveryProvider: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const [newProvider] = await context.db
        .insert(context.schema.deliveryProviders)
        .values({
          id: randomUUID(),
          ...input,
          coverageAreas: JSON.stringify(input.coverageAreas || []),
        })
        .returning();

      return newProvider;
    },

    updateDeliveryProvider: async (_parent, { id, input }, context) => {
      requireAdmin(context);

      const [updatedProvider] = await context.db
        .update(context.schema.deliveryProviders)
        .set({
          ...input,
          coverageAreas: input.coverageAreas ? JSON.stringify(input.coverageAreas) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.deliveryProviders.id, id))
        .returning();

      return updatedProvider;
    },

    createDeliveryOption: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const [newOption] = await context.db
        .insert(context.schema.deliveryOptions)
        .values({
          id: randomUUID(),
          ...input,
        })
        .returning();

      return newOption;
    },

    updateDeliveryOption: async (_parent, { id, input }, context) => {
      requireAdmin(context);

      const [updatedOption] = await context.db
        .update(context.schema.deliveryOptions)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.deliveryOptions.id, id))
        .returning();

      return updatedOption;
    },

    createDeliveryZone: async (_parent, { input }, context) => {
      requireAdmin(context);

      const { randomUUID } = await import('crypto');
      const [newZone] = await context.db
        .insert(context.schema.deliveryZones)
        .values({
          id: randomUUID(),
          ...input,
        })
        .returning();

      return newZone;
    },

    createDeliveryTracking: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Verify user can create tracking for this order
      const order = await context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, input.orderId),
      });

      if (!order) throw new Error('Order not found');

      if (order.sellerId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to create tracking for this order');
      }

      const { randomUUID } = await import('crypto');
      const [newTracking] = await context.db
        .insert(context.schema.deliveryTracking)
        .values({
          id: randomUUID(),
          ...input,
          pickupAddress: input.pickupAddress ? JSON.stringify(input.pickupAddress) : null,
          deliveryAddress: JSON.stringify(input.deliveryAddress),
          trackingEvents: JSON.stringify([{
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            description: 'Shipment created',
            location: 'Origin',
          }]),
        })
        .returning();

      return newTracking;
    },

    updateDeliveryTracking: async (_parent, { id, input }, context) => {
      requireAuth(context);

      const [updatedTracking] = await context.db
        .update(context.schema.deliveryTracking)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.deliveryTracking.id, id))
        .returning();

      return updatedTracking;
    },

    addTrackingEvent: async (_parent, { id, event }, context) => {
      requireAuth(context);

      const tracking = await context.db.query.deliveryTracking.findFirst({
        where: (tracking: any, { eq }: any) => eq(tracking.id, id),
      });

      if (!tracking) throw new Error('Tracking not found');

      const existingEvents = tracking.trackingEvents ? JSON.parse(tracking.trackingEvents) : [];
      const updatedEvents = [...existingEvents, event];

      const [updatedTracking] = await context.db
        .update(context.schema.deliveryTracking)
        .set({
          trackingEvents: JSON.stringify(updatedEvents),
          status: event.status,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.deliveryTracking.id, id))
        .returning();

      return updatedTracking;
    },

    updateDeliveryStatus: async (_parent, { trackingNumber, status }, context) => {
      requireAuth(context);

      const [updatedTracking] = await context.db
        .update(context.schema.deliveryTracking)
        .set({
          status,
          actualDelivery: status === 'DELIVERED' ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.deliveryTracking.trackingNumber, trackingNumber))
        .returning();

      return updatedTracking;
    },

    markAsDelivered: async (_parent, { trackingNumber, deliveredAt }, context) => {
      requireAuth(context);

      const deliveryDate = deliveredAt ? new Date(deliveredAt) : new Date();

      const [updatedTracking] = await context.db
        .update(context.schema.deliveryTracking)
        .set({
          status: 'DELIVERED',
          actualDelivery: deliveryDate,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.deliveryTracking.trackingNumber, trackingNumber))
        .returning();

      // Update order status
      if (updatedTracking) {
        await context.db
          .update(context.schema.orders)
          .set({
            status: 'DELIVERED',
            deliveredAt: deliveryDate,
            updatedAt: new Date(),
          })
          .where(eq(context.schema.orders.id, updatedTracking.orderId));
      }

      return updatedTracking;
    },
  },

  // Type resolvers
  DeliveryProvider: {
    options: async (parent: any, _args: any, context: any) => {
      return context.db.query.deliveryOptions.findMany({
        where: (options: any, { eq }: any) => eq(options.providerId, parent.id),
        orderBy: (options: any, { asc }: any) => asc(options.sortOrder),
      });
    },

    coverageAreas: (parent: any) => {
      try {
        return parent.coverageAreas ? JSON.parse(parent.coverageAreas) : [];
      } catch {
        return [];
      }
    },
  },

  DeliveryOption: {
    provider: async (parent: any, _args: any, context: any) => {
      return context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, parent.providerId),
      });
    },
  },

  DeliveryTracking: {
    provider: async (parent: any, _args: any, context: any) => {
      return context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, parent.providerId),
      });
    },

    order: async (parent: any, _args: any, context: any) => {
      return context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, parent.orderId),
      });
    },

    pickupAddress: (parent: any) => {
      try {
        return parent.pickupAddress ? JSON.parse(parent.pickupAddress) : null;
      } catch {
        return null;
      }
    },

    deliveryAddress: (parent: any) => {
      try {
        return parent.deliveryAddress ? JSON.parse(parent.deliveryAddress) : null;
      } catch {
        return null;
      }
    },

    trackingEvents: (parent: any) => {
      try {
        return parent.trackingEvents ? JSON.parse(parent.trackingEvents) : [];
      } catch {
        return [];
      }
    },

    trackingUrl: async (parent: any, _args: any, context: any) => {
      const provider = await context.db.query.deliveryProviders.findFirst({
        where: (providers: any, { eq }: any) => eq(providers.id, parent.providerId),
      });

      if (!provider?.trackingUrlPattern) return null;

      return provider.trackingUrlPattern.replace('{trackingNumber}', parent.trackingNumber);
    },
  },
};

// Helper functions
function checkOptionAvailability(option: any, input: any): { available: boolean; restrictions: string[] } {
  const restrictions: string[] = [];

  // Check weight limits
  if (option.maxWeight && input.weight && input.weight > option.maxWeight) {
    restrictions.push(`Exceeds maximum weight of ${option.maxWeight}kg`);
  }

  // Check dimensions (basic implementation)
  if (option.maxDimensions && input.dimensions) {
    // TODO: Implement proper dimension checking
  }

  // Check coverage area (simplified)
  // TODO: Implement proper geographic coverage checking

  return {
    available: restrictions.length === 0,
    restrictions,
  };
}

function calculateDeliveryPrice(option: any, input: any): number {
  let price = parseFloat(option.basePrice || '0');

  // Add weight-based pricing
  if (option.pricePerKg && input.weight) {
    price += parseFloat(option.pricePerKg) * input.weight;
  }

  // Check for free shipping threshold
  if (option.freeShippingThreshold && input.value && input.value >= option.freeShippingThreshold) {
    price = 0;
  }

  return Math.max(0, price);
}

function calculateAverageDeliveryTime(trackingRecords: any[]): number {
  const delivered = trackingRecords.filter(t =>
    t.status === 'DELIVERED' && t.actualDelivery && t.createdAt
  );

  if (delivered.length === 0) return 0;

  const totalDays = delivered.reduce((sum, record) => {
    const start = new Date(record.createdAt);
    const end = new Date(record.actualDelivery);
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return totalDays / delivered.length;
}

function calculateOnTimeRate(trackingRecords: any[]): number {
  const delivered = trackingRecords.filter(t =>
    t.status === 'DELIVERED' && t.actualDelivery && t.estimatedDelivery
  );

  if (delivered.length === 0) return 100;

  const onTime = delivered.filter(record => {
    const actual = new Date(record.actualDelivery);
    const estimated = new Date(record.estimatedDelivery);
    return actual <= estimated;
  }).length;

  return (onTime / delivered.length) * 100;
}