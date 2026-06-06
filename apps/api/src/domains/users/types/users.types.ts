import { gql } from 'graphql-tag';

export const usersTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    phone: String
    firstName: String!
    lastName: String!
    avatar: String
    userType: UserRole!
    status: UserStatus!
    emailVerified: Boolean!
    phoneVerified: Boolean!
    lastLoginAt: DateTime
    profile: UserProfile
    wallet: Wallet
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserProfile {
    id: ID!
    userId: ID!
    user: User!
    bio: String
    address: String
    city: String
    zipCode: String
    country: String
    timezone: String
    language: String!
    notificationsEnabled: Boolean!
    marketingEnabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Wallet {
    id: ID!
    userId: ID!
    user: User!
    balance: Float!
    frozenBalance: Float!
    totalEarnings: Float!
    totalSpent: Float!
    transactions: [WalletTransaction!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UserRole {
    BUYER
    SELLER
    ADMIN
  }

  enum UserStatus {
    ACTIVE
    SUSPENDED
    PENDING_VERIFICATION
  }

  input UpdateUserProfileInput {
    bio: String
    address: String
    city: String
    zipCode: String
    country: String
    timezone: String
    language: String
    notificationsEnabled: Boolean
    marketingEnabled: Boolean
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    phone: String
    avatar: String
  }

  input UsersFilterInput {
    userType: UserRole
    status: UserStatus
    emailVerified: Boolean
    search: String
    createdAfter: DateTime
    createdBefore: DateTime
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  extend type Query {
    user(id: ID!): User
    users(
      filter: UsersFilterInput
      pagination: PaginationInput
    ): UserConnection!

    # Admin only
    userStats: UserStats!
  }

  extend type Mutation {
    updateUser(input: UpdateUserInput!): User!
    updateUserProfile(input: UpdateUserProfileInput!): UserProfile!
    deleteUser(id: ID!): Boolean!

    # Admin only
    suspendUser(id: ID!, reason: String!): User!
    unsuspendUser(id: ID!): User!
    verifyUserEmail(id: ID!): User!
    changeUserRole(id: ID!, role: UserRole!): User!
  }

  type UserStats {
    totalUsers: Int!
    activeUsers: Int!
    suspendedUsers: Int!
    usersByType: [UserTypeCount!]!
    recentRegistrations: [User!]!
  }

  type UserTypeCount {
    type: UserRole!
    count: Int!
  }
`;