import { gql } from 'graphql-tag';

// Type definitions for reviews
export const reviewsTypeDefs = gql`
  type Review {
    id: ID!
    productId: ID!
    product: Product!
    buyerId: ID!
    buyer: User!
    orderId: ID!
    order: Order!
    rating: Int!
    title: String
    comment: String
    images: [String!]
    isVerifiedPurchase: Boolean!
    status: ReviewStatus!
    helpfulVotes: Int!
    totalVotes: Int!
    sellerResponse: String
    sellerResponseAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ReviewVote {
    id: ID!
    reviewId: ID!
    review: Review!
    userId: ID!
    user: User!
    isHelpful: Boolean!
    createdAt: DateTime!
  }

  type ReviewReport {
    id: ID!
    reviewId: ID!
    review: Review!
    reporterId: ID!
    reporter: User!
    reason: ReviewReportReason!
    description: String
    status: ReviewReportStatus!
    adminId: ID
    adminNotes: String
    resolvedAt: DateTime
    createdAt: DateTime!
  }

  type ReviewStats {
    averageRating: Float!
    totalReviews: Int!
    ratingBreakdown: [RatingCount!]!
  }

  type RatingCount {
    rating: Int!
    count: Int!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
    HIDDEN
  }

  enum ReviewReportReason {
    SPAM
    INAPPROPRIATE
    FAKE
    OFFENSIVE
    OTHER
  }

  enum ReviewReportStatus {
    PENDING
    RESOLVED
    DISMISSED
  }

  input CreateReviewInput {
    productId: ID!
    orderId: ID!
    rating: Int!
    title: String
    comment: String
    images: [String!]
  }

  input VoteReviewInput {
    reviewId: ID!
    isHelpful: Boolean!
  }

  input ReportReviewInput {
    reviewId: ID!
    reason: ReviewReportReason!
    description: String
  }

  input ReviewsFilterInput {
    productId: ID
    buyerId: ID
    rating: Int
    status: ReviewStatus
    isVerifiedPurchase: Boolean
  }

  type ReviewConnection {
    edges: [ReviewEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReviewEdge {
    node: Review!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  extend type Query {
    reviews(
      filter: ReviewsFilterInput
      pagination: PaginationInput
    ): ReviewConnection!

    review(id: ID!): Review

    reviewStats(productId: ID!): ReviewStats!

    myReviews(
      pagination: PaginationInput
    ): ReviewConnection!
  }

  extend type Mutation {
    createReview(input: CreateReviewInput!): Review!

    updateReview(
      id: ID!
      input: CreateReviewInput!
    ): Review!

    deleteReview(id: ID!): Boolean!

    voteReview(input: VoteReviewInput!): ReviewVote!

    reportReview(input: ReportReviewInput!): ReviewReport!

    respondToReview(
      id: ID!
      response: String!
    ): Review!
  }
`;

// Resolvers for reviews
export const reviewsResolvers = {
  Query: {
    reviews: async (parent: any, args: any, context: any) => {
      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      // Build where conditions
      const whereConditions = [];
      if (filter.productId) whereConditions.push(['productId', filter.productId]);
      if (filter.buyerId) whereConditions.push(['buyerId', filter.buyerId]);
      if (filter.rating) whereConditions.push(['rating', filter.rating]);
      if (filter.status) whereConditions.push(['status', filter.status]);
      if (filter.isVerifiedPurchase !== undefined) whereConditions.push(['isVerifiedPurchase', filter.isVerifiedPurchase]);

      const reviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq, and }: any) => {
          if (whereConditions.length === 0) return undefined;
          if (whereConditions.length === 1) return eq(reviews[whereConditions[0][0]], whereConditions[0][1]);
          return and(...whereConditions.map(([field, value]) => eq(reviews[field], value)));
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (reviews: any, { desc }: any) => desc(reviews.createdAt),
      });

      const totalCount = reviews.length;
      const hasNextPage = reviews.length === pagination.limit;

      return {
        edges: reviews.map((review: any, index: number) => ({
          node: review,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: pagination.offset > 0,
          startCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset + reviews.length - 1}`).toString('base64') : null,
        },
        totalCount,
      };
    },

    review: async (parent: any, args: any, context: any) => {
      return await context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, args.id),
      });
    },

    reviewStats: async (parent: any, args: any, context: any) => {
      const reviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq }: any) => eq(reviews.productId, args.productId),
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
        : 0;

      // Calculate rating breakdown
      const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviews.filter((review: any) => review.rating === rating).length,
      }));

      return {
        averageRating,
        totalReviews,
        ratingBreakdown: ratingCounts,
      };
    },

    myReviews: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { pagination = { limit: 20, offset: 0 } } = args;

      const reviews = await context.db.query.reviews.findMany({
        where: (reviews: any, { eq }: any) => eq(reviews.buyerId, context.user.id),
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (reviews: any, { desc }: any) => desc(reviews.createdAt),
      });

      const totalCount = reviews.length;
      const hasNextPage = reviews.length === pagination.limit;

      return {
        edges: reviews.map((review: any, index: number) => ({
          node: review,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: pagination.offset > 0,
          startCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: reviews.length > 0 ? Buffer.from(`${pagination.offset + reviews.length - 1}`).toString('base64') : null,
        },
        totalCount,
      };
    },
  },

  Mutation: {
    createReview: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { randomUUID } = await import('crypto');

      const newReview = {
        id: randomUUID(),
        buyerId: context.user.id,
        ...args.input,
        isVerifiedPurchase: true, // TODO: Verify against order
        status: 'PENDING',
        helpfulVotes: 0,
        totalVotes: 0,
      };

      const [review] = await context.db.insert(context.schema.reviews).values(newReview).returning();
      return review;
    },

    voteReview: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { randomUUID } = await import('crypto');

      const newVote = {
        id: randomUUID(),
        userId: context.user.id,
        ...args.input,
      };

      const [vote] = await context.db.insert(context.schema.reviewVotes).values(newVote).returning();
      return vote;
    },

    reportReview: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const { randomUUID } = await import('crypto');

      const newReport = {
        id: randomUUID(),
        reporterId: context.user.id,
        status: 'PENDING',
        ...args.input,
      };

      const [report] = await context.db.insert(context.schema.reviewReports).values(newReport).returning();
      return report;
    },
  },

  Review: {
    product: async (parent: any, _args: any, context: any) => {
      return context.db.query.products.findFirst({
        where: (products: any, { eq }: any) => eq(products.id, parent.productId),
      });
    },

    buyer: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.buyerId),
      });
    },

    order: async (parent: any, _args: any, context: any) => {
      return context.db.query.orders.findFirst({
        where: (orders: any, { eq }: any) => eq(orders.id, parent.orderId),
      });
    },
  },

  ReviewVote: {
    review: async (parent: any, _args: any, context: any) => {
      return context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, parent.reviewId),
      });
    },

    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },
  },

  ReviewReport: {
    review: async (parent: any, _args: any, context: any) => {
      return context.db.query.reviews.findFirst({
        where: (reviews: any, { eq }: any) => eq(reviews.id, parent.reviewId),
      });
    },

    reporter: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.reporterId),
      });
    },
  },
};