import { gql } from 'graphql-tag';

export const authTypeDefs = gql`
  type AuthPayload {
    token: String
    user: User!
    session: Session
  }

  type Session {
    id: String!
    userId: String!
    expiresAt: DateTime!
    token: String!
    ipAddress: String
    userAgent: String
  }

  type TwoFactorSetup {
    secret: String!
    qrCode: String!
    backupCodes: [String!]!
  }

  type EmailVerification {
    sent: Boolean!
    email: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
    userType: UserRole = BUYER
    inviteCode: String
  }

  input LoginInput {
    email: String!
    password: String!
    twoFactorCode: String
    rememberMe: Boolean = false
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
  }

  input VerifyEmailInput {
    token: String!
  }

  input Enable2FAInput {
    code: String!
  }

  input SocialSignInInput {
    provider: SocialProvider!
    code: String!
    redirectUri: String
  }

  enum SocialProvider {
    GOOGLE
    GITHUB
    FACEBOOK
    APPLE
  }

  extend type Query {
    me: User
    sessions: [Session!]!
    twoFactorStatus: Boolean!
  }

  extend type Mutation {
    # Basic auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    logoutAllDevices: Boolean!

    # Password management
    changePassword(input: ChangePasswordInput!): Boolean!
    forgotPassword(input: ForgotPasswordInput!): Boolean!
    resetPassword(input: ResetPasswordInput!): Boolean!

    # Email verification
    sendVerificationEmail: EmailVerification!
    verifyEmail(input: VerifyEmailInput!): Boolean!
    resendVerificationEmail: EmailVerification!

    # Two-factor authentication
    setupTwoFactor: TwoFactorSetup!
    enableTwoFactor(input: Enable2FAInput!): Boolean!
    disableTwoFactor: Boolean!
    generateBackupCodes: [String!]!

    # Social auth
    socialSignIn(input: SocialSignInInput!): AuthPayload!
    linkSocialAccount(input: SocialSignInInput!): Boolean!
    unlinkSocialAccount(provider: SocialProvider!): Boolean!

    # Session management
    revokeSession(sessionId: String!): Boolean!
    refreshSession: AuthPayload!
  }
`;