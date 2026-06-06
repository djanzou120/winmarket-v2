import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth, requireAdmin } from '../../../infrastructure/context';
import { eq, and, desc, asc, sql, count } from 'drizzle-orm';

export const reviewsResolvers: Resolvers = {
  Query: {
    review: async (_parent, { id }, context) => {
      return await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, id),
      });
    },

    reviews: async (_parent, args, context) => {
      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      const whereConditions = [];

      if (filter.productId) whereConditions.push(['productId', filter.productId]);
      if (filter.userId) whereConditions.push(['userId', filter.userId]);
      if (filter.rating) whereConditions.push(['rating', filter.rating]);
      if (filter.status) whereConditions.push(['status', filter.status]);
      if (filter.isVerifiedPurchase !== undefined) whereConditions.push(['isVerifiedPurchase', filter.isVerifiedPurchase]);

      const reviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq, and, gte, lte }: any) => {
          const conditions = whereConditions.map(([field, value]) => eq(reviews[field], value));

          if (filter.dateFrom) conditions.push(gte(reviews.createdAt, new Date(filter.dateFrom)));
          if (filter.dateTo) conditions.push(lte(reviews.createdAt, new Date(filter.dateTo)));

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (reviews: any, { desc }: any) => desc(reviews.createdAt),
      });

      return {
        edges: reviews.map((review: any, index: number) => ({
          node: review,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: reviews.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset + reviews.length - 1}`).toString('base64') : null,
        },
        totalCount: reviews.length,
      };
    },

    productReviews: async (_parent, { productId, pagination = { limit: 20, offset: 0 } }, context) => {
      const reviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq, and }: any) => and(
          eq(reviews.productId, productId),
          eq(reviews.status, 'APPROVED')
        ),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (reviews: any, { desc }: any) => [desc(reviews.helpfulVotes), desc(reviews.createdAt)],
      });

      return {
        edges: reviews.map((review: any, index: number) => ({
          node: review,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: reviews.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset + reviews.length - 1}`).toString('base64') : null,
        },
        totalCount: reviews.length,
      };
    },

    productReviewSummary: async (_parent, { productId }, context) => {
      const allReviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq, and }: any) => and(
          eq(reviews.productId, productId),
          eq(reviews.status, 'APPROVED')
        ),
      });

      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      // Rating distribution
      const ratingCounts = [1, 2, 3, 4, 5].map(rating => {
        const count = allReviews.filter(r => r.rating === rating).length;
        return {
          rating,
          count,
          percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
        };
      });

      // Recent reviews (last 5)
      const recentReviews = allReviews
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Top reviews (most helpful)
      const topReviews = allReviews
        .sort((a, b) => b.helpfulVotes - a.helpfulVotes)
        .slice(0, 5);

      return {
        productId,
        totalReviews,
        averageRating,
        ratingDistribution: ratingCounts,
        recentReviews,
        topReviews,
      };
    },

    myReviews: async (_parent, { pagination = { limit: 20, offset: 0 } }, context) => {
      const user = requireAuth(context);

      const reviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq }: any) => eq(reviews.userId, user.id),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (reviews: any, { desc }: any) => desc(reviews.createdAt),
      });

      return {
        edges: reviews.map((review: any, index: number) => ({
          node: review,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: reviews.length === pagination.limit,
          hasPreviousPage: pagination.offset > 0,
          startCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset + reviews.length - 1}`).toString('base64') : null,
        },
        totalCount: reviews.length,
      };
    },

    reviewStats: async (_parent, _args, context) => {
      requireAdmin(context);

      const allReviews = await context.db.query.reviews.findMany();

      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
        const count = allReviews.filter(r => r.rating === rating).length;
        return {
          rating,
          count,
          percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
        };
      });

      const pendingReviews = allReviews.filter(r => r.status === 'PENDING').length;
      const reportedReviews = allReviews.filter(r => r.reports && r.reports.length > 0).length;
      const verifiedPurchaseReviews = allReviews.filter(r => r.isVerifiedPurchase).length;

      return {
        totalReviews,
        averageRating,
        ratingDistribution,
        pendingReviews,
        reportedReviews,
        verifiedPurchaseReviews,
      };
    },

    canReviewProduct: async (_parent, { productId }, context) => {
      const user = requireAuth(context);

      // Check if user has purchased this product
      const orderItems = await context.db.query.orderItems.findMany({
        where: (orderItems: any, { eq }: any) => eq(orderItems.productId, productId),
      });

      const userOrders = await Promise.all(
        orderItems.map(async (item: any) => {
          return await context.db.query.orders.findFirst({
            where: (orders: any, { eq, and }: any) => and(
              eq(orders.id, item.orderId),
              eq(orders.buyerId, user.id),
              eq(orders.status, 'DELIVERED')
            ),
          });
        })
      );

      const hasPurchased = userOrders.some(order => order !== null);

      if (!hasPurchased) return false;

      // Check if user already reviewed this product
      const existingReview = await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq, and }: any) => and(
          eq(reviews.productId, productId),
          eq(reviews.userId, user.id)
        ),
      });

      return !existingReview;
    },
  },

  Mutation: {
    createReview: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Validate that user can review this product
      const canReview = await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq, and }: any) => and(
          eq(reviews.productId, input.productId),
          eq(reviews.userId, user.id)
        ),
      });

      if (canReview) {
        throw new Error('You have already reviewed this product');
      }

      // Check if it's a verified purchase
      let isVerifiedPurchase = false;
      if (input.orderId) {
        const order = await context.db.query.orders.findFirst({
          where: (orders: any, { eq, and }: any) => and(
            eq(orders.id, input.orderId),
            eq(orders.buyerId, user.id),
            eq(orders.status, 'DELIVERED')
          ),
        });
        isVerifiedPurchase = !!order;
      }

      const { randomUUID } = await import('crypto');
      const [newReview] = await context.db
        .insert(context.schema.reviews)
        .values({
          id: randomUUID(),
          userId: user.id,
          productId: input.productId,
          orderId: input.orderId,
          orderItemId: input.orderItemId,
          rating: input.rating,
          title: input.title,
          content: input.content,
          images: JSON.stringify(input.images || []),
          isAnonymous: input.isAnonymous || false,
          isVerifiedPurchase,
          status: 'PENDING', // Reviews need approval
        })
        .returning();

      // Update product rating
      await updateProductRating(context, input.productId);

      return newReview;
    },

    updateReview: async (_parent, { id, input }, context) => {
      const user = requireAuth(context);

      const review = await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, id),
      });

      if (!review) throw new Error('Review not found');

      if (review.userId !== user.id) {
        throw new Error('Unauthorized to update this review');
      }

      const [updatedReview] = await context.db
        .update(context.schema.reviews)
        .set({
          ...input,
          images: input.images ? JSON.stringify(input.images) : undefined,
          updatedAt: new Date(),
          status: 'PENDING', // Re-review after edit
        })
        .where(eq(context.schema.reviews.id, id))
        .returning();

      // Update product rating
      await updateProductRating(context, review.productId);

      return updatedReview;
    },

    deleteReview: async (_parent, { id }, context) => {
      const user = requireAuth(context);

      const review = await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, id),
      });

      if (!review) throw new Error('Review not found');

      if (review.userId !== user.id && user.userType !== 'ADMIN') {
        throw new Error('Unauthorized to delete this review');
      }

      const productId = review.productId;

      await context.db
        .delete(context.schema.reviews)
        .where(eq(context.schema.reviews.id, id));

      // Update product rating
      await updateProductRating(context, productId);

      return true;
    },

    voteOnReview: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Check if user already voted
      const existingVote = await context.db.query.reviewVotes.findFirst({
        where: (votes: any, { eq, and }: any) => and(
          eq(votes.reviewId, input.reviewId),
          eq(votes.userId, user.id)
        ),
      });

      const { randomUUID } = await import('crypto');

      if (existingVote) {
        // Update existing vote
        await context.db
          .update(context.schema.reviewVotes)
          .set({ voteType: input.voteType })
          .where(eq(context.schema.reviewVotes.id, existingVote.id));
      } else {
        // Create new vote
        await context.db
          .insert(context.schema.reviewVotes)
          .values({
            id: randomUUID(),
            reviewId: input.reviewId,
            userId: user.id,
            voteType: input.voteType,
          });
      }

      // Update review vote counts
      const votes = await context.db.query.reviewVotes.findMany({
        where: (votes: any, { eq }: any) => eq(votes.reviewId, input.reviewId),
      });

      const helpfulVotes = votes.filter(v => v.voteType === 'HELPFUL').length;
      const totalVotes = votes.length;

      await context.db
        .update(context.schema.reviews)
        .set({
          helpfulVotes,
          totalVotes,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.reviews.id, input.reviewId));

      return await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, input.reviewId),
      });
    },

    reportReview: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      const { randomUUID } = await import('crypto');
      const [report] = await context.db
        .insert(context.schema.reviewReports)
        .values({
          id: randomUUID(),
          reviewId: input.reviewId,
          reporterId: user.id,
          reason: input.reason,
          description: input.description,
        })
        .returning();

      return report;
    },

    moderateReview: async (_parent, { id, input }, context) => {
      const user = requireAdmin(context);

      const [moderatedReview] = await context.db
        .update(context.schema.reviews)
        .set({
          status: input.status,
          moderatedBy: user.id,
          moderatedAt: new Date(),
          moderationReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.reviews.id, id))
        .returning();

      return moderatedReview;
    },

    approveReview: async (_parent, { id }, context) => {
      const user = requireAdmin(context);

      const [approvedReview] = await context.db
        .update(context.schema.reviews)
        .set({
          status: 'APPROVED',
          moderatedBy: user.id,
          moderatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(context.schema.reviews.id, id))
        .returning();

      return approvedReview;
    },
  },

  // Type resolvers
  Review: {
    product: async (parent: any, _args: any, context: any) => {
      return context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, parent.productId),
      });
    },

    user: async (parent: any, _args: any, context: any) => {
      if (parent.isAnonymous) return null;
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },

    order: async (parent: any, _args: any, context: any) => {
      if (!parent.orderId) return null;
      return context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, parent.orderId),
      });
    },

    images: (parent: any) => {
      try {
        return parent.images ? JSON.parse(parent.images) : [];
      } catch {
        return [];
      }
    },

    helpfulnessRatio: (parent: any) => {
      if (parent.totalVotes === 0) return 0;
      return (parent.helpfulVotes / parent.totalVotes) * 100;
    },

    userVote: async (parent: any, _args: any, context: any) => {
      if (!context.user) return null;

      const vote = await context.db.query.reviewVotes.findFirst({
        where: (votes: any, { eq, and }: any) => and(
          eq(votes.reviewId, parent.id),
          eq(votes.userId, context.user.id)
        ),
      });

      return vote?.voteType || null;
    },

    canEdit: (parent: any, _args: any, context: any) => {
      if (!context.user) return false;
      return parent.userId === context.user.id || context.user.userType === 'ADMIN';
    },

    canDelete: (parent: any, _args: any, context: any) => {
      if (!context.user) return false;
      return parent.userId === context.user.id || context.user.userType === 'ADMIN';
    },

    responses: async (parent: any, _args: any, context: any) => {
      return context.db.query.reviewResponses.findMany({
        where: (responses: any, { eq }: any) => eq(responses.reviewId, parent.id),
        orderBy: (responses: any, { asc }: any) => asc(responses.createdAt),
      });
    },
  },
};

// Helper function to update product rating
async function updateProductRating(context: any, productId: string) {
  const reviews = await context.db.query.reviews.findMany({
    where: (reviews: any, { eq, and }: any) => and(
      eq(reviews.productId, productId),
      eq(reviews.status, 'APPROVED')
    ),
  });

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  await context.db
    .update(context.schema.products)
    .set({
      avgRating: averageRating.toFixed(2),
      ratingCount: reviewCount,
      updatedAt: new Date(),
    })
    .where(eq(context.schema.products.id, productId));
}