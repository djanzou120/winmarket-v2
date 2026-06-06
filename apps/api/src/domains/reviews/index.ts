// Reviews domain exports
export * from './schema/reviews.schema';
export * from './types/reviews.types';
export * from './resolvers/reviews.resolvers';

// Combined exports for easy import
export { reviewsTypeDefs } from './types/reviews.types';
export { reviewsResolvers } from './resolvers/reviews.resolvers';
export {
  reviews,
  reviewVotes,
  reviewReports,
  reviewResponses,
  type Review,
  type ReviewVote,
  type ReviewReport,
  type ReviewResponse,
} from './schema/reviews.schema';