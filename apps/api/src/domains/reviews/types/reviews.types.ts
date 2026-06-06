// GraphQL Type Definitions for Reviews Domain

export const reviewsTypeDefs = `#graphql
  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
    HIDDEN
  }

  enum VoteType {
    HELPFUL
    NOT_HELPFUL
  }

  enum ReportReason {
    INAPPROPRIATE_CONTENT
    SPAM
    FAKE_REVIEW
    OFFENSIVE_LANGUAGE
    COPYRIGHT_VIOLATION
    OTHER
  }

  type ReviewResponse {
    id: ID!
    reviewId: ID!
    userId: ID!
    user: User!
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type ReviewVote {
    id: ID!
    reviewId: ID!
    userId: ID!
    user: User!
    voteType: VoteType!
    createdAt: String!
  }

  type ReviewReport {
    id: ID!
    reviewId: ID!
    reporterId: ID!
    reporter: User!
    reason: ReportReason!
    description: String
    status: String!
    reviewedBy: ID
    reviewer: User
    reviewedAt: String
    resolution: String
    createdAt: String!
  }

  type Review {
    id: ID!
    productId: ID!
    product: Product!
    userId: ID!
    user: User!
    orderId: ID
    order: Order
    orderItemId: ID
    orderItem: OrderItem

    # Review content
    rating: Int!
    title: String
    content: String
    images: [String!]!

    # Metadata
    status: ReviewStatus!
    isVerifiedPurchase: Boolean!
    isAnonymous: Boolean!

    # Engagement
    helpfulVotes: Int!
    totalVotes: Int!
    helpfulnessRatio: Float!

    # User interaction
    userVote: VoteType
    canEdit: Boolean!
    canDelete: Boolean!

    # Relations
    votes: [ReviewVote!]!
    reports: [ReviewReport!]!
    responses: [ReviewResponse!]!

    # Moderation
    moderatedBy: ID
    moderator: User
    moderatedAt: String
    moderationReason: String

    createdAt: String!
    updatedAt: String!
  }

  type ReviewsConnection {
    edges: [ReviewEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReviewEdge {
    node: Review!
    cursor: String!
  }

  type ReviewStats {
    totalReviews: Int!
    averageRating: Float!
    ratingDistribution: [RatingCount!]!
    pendingReviews: Int!
    reportedReviews: Int!
    verifiedPurchaseReviews: Int!
  }

  type RatingCount {
    rating: Int!
    count: Int!
    percentage: Float!
  }

  type ProductReviewSummary {
    productId: ID!
    totalReviews: Int!
    averageRating: Float!
    ratingDistribution: [RatingCount!]!
    recentReviews: [Review!]!
    topReviews: [Review!]!
  }

  input ReviewFilter {
    productId: ID
    userId: ID
    rating: Int
    status: ReviewStatus
    isVerifiedPurchase: Boolean
    hasImages: Boolean
    dateFrom: String
    dateTo: String
  }

  input CreateReviewInput {
    productId: ID!
    orderId: ID
    orderItemId: ID
    rating: Int!
    title: String
    content: String
    images: [String!]
    isAnonymous: Boolean
  }

  input UpdateReviewInput {
    rating: Int
    title: String
    content: String
    images: [String!]
    isAnonymous: Boolean
  }

  input VoteOnReviewInput {
    reviewId: ID!
    voteType: VoteType!
  }

  input ReportReviewInput {
    reviewId: ID!
    reason: ReportReason!
    description: String
  }

  input RespondToReviewInput {
    reviewId: ID!
    content: String!
  }

  input ModerateReviewInput {
    status: ReviewStatus!
    reason: String
  }

  extend type Query {
    # Reviews
    review(id: ID!): Review
    reviews(
      filter: ReviewFilter
      pagination: PaginationInput
    ): ReviewsConnection!

    # Product reviews
    productReviews(
      productId: ID!
      pagination: PaginationInput
    ): ReviewsConnection!
    productReviewSummary(productId: ID!): ProductReviewSummary!

    # User reviews
    myReviews(pagination: PaginationInput): ReviewsConnection!
    userReviews(userId: ID!, pagination: PaginationInput): ReviewsConnection!

    # Admin queries
    reviewStats: ReviewStats!
    pendingReviews(pagination: PaginationInput): ReviewsConnection!
    reportedReviews(pagination: PaginationInput): ReviewsConnection!

    # Can user review product?
    canReviewProduct(productId: ID!): Boolean!
  }

  extend type Mutation {
    # Review management
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!

    # Voting
    voteOnReview(input: VoteOnReviewInput!): Review!
    removeVote(reviewId: ID!): Review!

    # Reporting
    reportReview(input: ReportReviewInput!): ReviewReport!

    # Responses
    respondToReview(input: RespondToReviewInput!): ReviewResponse!
    updateReviewResponse(id: ID!, content: String!): ReviewResponse!
    deleteReviewResponse(id: ID!): Boolean!

    # Moderation (admin only)
    moderateReview(id: ID!, input: ModerateReviewInput!): Review!
    bulkModerateReviews(ids: [ID!]!, input: ModerateReviewInput!): [Review!]!

    # Review management
    hideReview(id: ID!): Review!
    approveReview(id: ID!): Review!
    rejectReview(id: ID!, reason: String!): Review!
  }
`;