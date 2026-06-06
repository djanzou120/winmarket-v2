import { gql } from 'graphql-tag';
import type { Resolvers } from '../../generated/graphql';
import { AuthService } from './auth.service';
import { auth } from '../../infrastructure/auth/better-auth';

// GraphQL Type Definitions
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

// GraphQL Resolvers
export const authResolvers: Resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (!context.isAuthenticated || !context.user) {
        return null;
      }
      return context.user;
    },

    sessions: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const sessions = await auth.api.listSessions({
        query: { userId: user.id },
      });
      return sessions.data || [];
    },

    twoFactorStatus: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const twoFactorEnabled = await auth.api.getTwoFactorStatus({
        query: { userId: user.id },
      });
      return twoFactorEnabled.data?.enabled || false;
    },
  },

  Mutation: {
    register: async (_parent, { input }, context) => {
      const result = await auth.api.signUp.email({
        body: {
          email: input.email,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
          userType: input.userType || 'BUYER',
        },
      });

      if (!result.data) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      return {
        user: result.data.user,
        session: result.data.session,
        token: result.data.session?.token,
      };
    },

    login: async (_parent, { input }, context) => {
      const result = await auth.api.signIn.email({
        body: {
          email: input.email,
          password: input.password,
          twoFactorCode: input.twoFactorCode,
          rememberMe: input.rememberMe,
        },
      });

      if (!result.data) {
        throw new Error(result.error?.message || 'Login failed');
      }

      return {
        user: result.data.user,
        session: result.data.session,
        token: result.data.session?.token,
      };
    },

    logout: async (_parent, _args, context) => {
      if (context.session?.token) {
        await auth.api.signOut({
          headers: {
            authorization: `Bearer ${context.session.token}`,
          },
        });
      }
      return true;
    },

    logoutAllDevices: async (_parent, _args, context) => {
      const user = requireAuth(context);
      await auth.api.revokeAllSessions({
        body: { userId: user.id },
      });
      return true;
    },

    changePassword: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const result = await auth.api.changePassword({
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
        headers: context.session?.token ? {
          authorization: `Bearer ${context.session.token}`,
        } : {},
      });

      return result.data?.success || false;
    },

    forgotPassword: async (_parent, { input }, _context) => {
      const result = await auth.api.forgetPassword({
        body: { email: input.email },
      });
      return result.data?.success || false;
    },

    resetPassword: async (_parent, { input }, _context) => {
      const result = await auth.api.resetPassword({
        body: {
          token: input.token,
          password: input.password,
        },
      });
      return result.data?.success || false;
    },

    sendVerificationEmail: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const result = await auth.api.sendVerificationEmail({
        body: { email: user.email },
      });

      return {
        sent: result.data?.success || false,
        email: user.email,
      };
    },

    verifyEmail: async (_parent, { input }, _context) => {
      const result = await auth.api.verifyEmail({
        body: { token: input.token },
      });
      return result.data?.success || false;
    },

    resendVerificationEmail: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const result = await auth.api.sendVerificationEmail({
        body: { email: user.email },
      });

      return {
        sent: result.data?.success || false,
        email: user.email,
      };
    },

    setupTwoFactor: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const result = await auth.api.twoFactor.setup({
        headers: context.session?.token ? {
          authorization: `Bearer ${context.session.token}`,
        } : {},
      });

      if (!result.data) {
        throw new Error('Failed to setup two-factor authentication');
      }

      return {
        secret: result.data.totpSecret,
        qrCode: result.data.qrCode,
        backupCodes: result.data.backupCodes || [],
      };
    },

    enableTwoFactor: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const result = await auth.api.twoFactor.enable({
        body: { code: input.code },
        headers: context.session?.token ? {
          authorization: `Bearer ${context.session.token}`,
        } : {},
      });

      return result.data?.success || false;
    },

    disableTwoFactor: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const result = await auth.api.twoFactor.disable({
        headers: context.session?.token ? {
          authorization: `Bearer ${context.session.token}`,
        } : {},
      });

      return result.data?.success || false;
    },

    generateBackupCodes: async (_parent, _args, context) => {
      const user = requireAuth(context);
      const result = await auth.api.twoFactor.generateBackupCodes({
        headers: context.session?.token ? {
          authorization: `Bearer ${context.session.token}`,
        } : {},
      });

      return result.data?.backupCodes || [];
    },

    socialSignIn: async (_parent, { input }, _context) => {
      // TODO: Implement social sign-in
      throw new Error('Social sign-in not implemented yet');
    },

    linkSocialAccount: async (_parent, { input }, context) => {
      // TODO: Implement social account linking
      throw new Error('Social account linking not implemented yet');
    },

    unlinkSocialAccount: async (_parent, { provider }, context) => {
      // TODO: Implement social account unlinking
      throw new Error('Social account unlinking not implemented yet');
    },

    revokeSession: async (_parent, { sessionId }, context) => {
      const user = requireAuth(context);
      const result = await auth.api.revokeSession({
        body: { sessionId },
      });

      return result.data?.success || false;
    },

    refreshSession: async (_parent, _args, context) => {
      if (!context.session?.token) {
        throw new Error('No active session to refresh');
      }

      const result = await auth.api.getSession({
        headers: {
          authorization: `Bearer ${context.session.token}`,
        },
      });

      if (!result.data) {
        throw new Error('Failed to refresh session');
      }

      return {
        user: result.data.user,
        session: result.data.session,
        token: result.data.session?.token,
      };
    },
  },
};

// Import required functions
import { requireAuth } from '../../infrastructure/context';