import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth } from '../../../infrastructure/context';

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
      // TODO: Implémenter la récupération des sessions avec Better Auth
      return [];
    },

    twoFactorStatus: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter la vérification 2FA avec Better Auth
      return false;
    },
  },

  Mutation: {
    register: async (_parent, { input }, context) => {
      // TODO: Implémenter l'inscription avec Better Auth
      throw new Error('Registration not implemented in new architecture yet');
    },

    login: async (_parent, { input }, context) => {
      // TODO: Implémenter la connexion avec Better Auth
      throw new Error('Login not implemented in new architecture yet');
    },

    logout: async (_parent, _args, context) => {
      // TODO: Implémenter la déconnexion avec Better Auth
      return true;
    },

    logoutAllDevices: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter la déconnexion de tous les appareils
      return true;
    },

    changePassword: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter le changement de mot de passe
      return true;
    },

    forgotPassword: async (_parent, { input }, _context) => {
      // TODO: Implémenter mot de passe oublié
      return true;
    },

    resetPassword: async (_parent, { input }, _context) => {
      // TODO: Implémenter la réinitialisation
      return true;
    },

    sendVerificationEmail: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter l'envoi d'email de vérification
      return {
        sent: true,
        email: user.email,
      };
    },

    verifyEmail: async (_parent, { input }, _context) => {
      // TODO: Implémenter la vérification d'email
      return true;
    },

    resendVerificationEmail: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter le renvoi d'email
      return {
        sent: true,
        email: user.email,
      };
    },

    setupTwoFactor: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter la configuration 2FA
      return {
        secret: 'mock-secret',
        qrCode: 'mock-qr-code',
        backupCodes: ['code1', 'code2'],
      };
    },

    enableTwoFactor: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter l'activation 2FA
      return true;
    },

    disableTwoFactor: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter la désactivation 2FA
      return true;
    },

    generateBackupCodes: async (_parent, _args, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter la génération de codes de secours
      return ['backup1', 'backup2', 'backup3'];
    },

    socialSignIn: async (_parent, { input }, _context) => {
      // TODO: Implémenter l'authentification sociale
      throw new Error('Social sign-in not implemented yet');
    },

    linkSocialAccount: async (_parent, { input }, context) => {
      // TODO: Implémenter la liaison de compte social
      throw new Error('Social account linking not implemented yet');
    },

    unlinkSocialAccount: async (_parent, { provider }, context) => {
      // TODO: Implémenter la suppression de liaison de compte
      throw new Error('Social account unlinking not implemented yet');
    },

    revokeSession: async (_parent, { sessionId }, context) => {
      const user = requireAuth(context);
      // TODO: Implémenter la révocation de session
      return true;
    },

    refreshSession: async (_parent, _args, context) => {
      if (!context.session?.token) {
        throw new Error('No active session to refresh');
      }

      // TODO: Implémenter le rafraîchissement de session
      return {
        user: context.user,
        session: context.session,
        token: context.session.token,
      };
    },
  },
};