import { gql } from 'graphql-tag';
import type { Resolvers } from '../../generated/graphql';
import { AuthService } from './auth.service';

// GraphQL Type Definitions
export const authTypeDefs = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String
    lastName: String
    role: UserRole = BUYER
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    changePassword(input: ChangePasswordInput!): Boolean!
    logout: Boolean!
    refreshToken: AuthPayload!
  }
`;

// GraphQL Resolvers
export const authResolvers: Resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (!context.isAuthenticated || !context.user) {
        return null;
      }
      return context.user;
    },
  },

  Mutation: {
    register: async (_parent, { input }, context) => {
      const authService = new AuthService(context.db);
      return authService.register(input);
    },

    login: async (_parent, { input }, context) => {
      const authService = new AuthService(context.db);
      return authService.login(input);
    },

    changePassword: async (_parent, { input }, context) => {
      const authService = new AuthService(context.db);
      const user = requireAuth(context);
      return authService.changePassword(user.id, input);
    },

    logout: async (_parent, _args, context) => {
      // In a stateless JWT system, logout is handled client-side
      // Here we could add token to a blacklist if needed
      return true;
    },

    refreshToken: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const authService = new AuthService(context.db);
      return authService.generateTokenForUser(user);
    },
  },
};

// Import required functions
import { requireAuth } from '../../infrastructure/context';