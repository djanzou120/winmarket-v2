import type { Resolvers } from '../../../infrastructure/types';
import { requireAuth, requireAdmin } from '../../../infrastructure/context';
import { eq } from 'drizzle-orm';

export const usersResolvers: Resolvers = {
  Query: {
    user: async (_parent, { id }, context) => {
      return await context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, id),
      });
    },

    users: async (_parent, args, context) => {
      // Require admin access for listing users
      requireAdmin(context);

      const { filter = {}, pagination = { limit: 20, offset: 0 } } = args;

      // Build where conditions
      const whereConditions = [];
      if (filter.userType) whereConditions.push(['userType', filter.userType]);
      if (filter.status) whereConditions.push(['status', filter.status]);
      if (filter.emailVerified !== undefined) whereConditions.push(['emailVerified', filter.emailVerified]);

      const users = await context.db.query.users.findMany({
        where: (users: any, { eq, and, like }: any) => {
          const conditions = whereConditions.map(([field, value]) => eq(users[field], value));

          if (filter.search) {
            conditions.push(
              like(users.email, `%${filter.search}%`),
              like(users.firstName, `%${filter.search}%`),
              like(users.lastName, `%${filter.search}%`)
            );
          }

          if (conditions.length === 0) return undefined;
          if (conditions.length === 1) return conditions[0];
          return and(...conditions);
        },
        limit: pagination.limit,
        offset: pagination.offset,
        orderBy: (users: any, { desc }: any) => desc(users.createdAt),
      });

      const totalCount = users.length;
      const hasNextPage = users.length === pagination.limit;

      return {
        edges: users.map((user: any, index: number) => ({
          node: user,
          cursor: Buffer.from(`${pagination.offset + index}`).toString('base64'),
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: pagination.offset > 0,
          startCursor: users.length > 0 ? Buffer.from(`${pagination.offset}`).toString('base64') : null,
          endCursor: users.length > 0 ? Buffer.from(`${pagination.offset + users.length - 1}`).toString('base64') : null,
        },
        totalCount,
      };
    },

    userStats: async (_parent, _args, context) => {
      requireAdmin(context);

      const allUsers = await context.db.query.users.findMany();

      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;
      const suspendedUsers = allUsers.filter(u => u.status === 'SUSPENDED').length;

      const usersByType = [
        { type: 'BUYER', count: allUsers.filter(u => u.userType === 'BUYER').length },
        { type: 'SELLER', count: allUsers.filter(u => u.userType === 'SELLER').length },
        { type: 'ADMIN', count: allUsers.filter(u => u.userType === 'ADMIN').length },
      ];

      // Get recent registrations (last 10)
      const recentRegistrations = allUsers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        usersByType,
        recentRegistrations,
      };
    },
  },

  Mutation: {
    updateUser: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      const [updatedUser] = await context.db
        .update(context.schema.users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.users.id, user.id))
        .returning();

      return updatedUser;
    },

    updateUserProfile: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      // Check if profile exists
      const existingProfile = await context.db.query.userProfiles.findFirst({
        where: (profiles: any, { eq }: any) => eq(profiles.userId, user.id),
      });

      if (existingProfile) {
        const [updatedProfile] = await context.db
          .update(context.schema.userProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(context.schema.userProfiles.id, existingProfile.id))
          .returning();

        return updatedProfile;
      } else {
        // Create new profile
        const { randomUUID } = await import('crypto');
        const [newProfile] = await context.db
          .insert(context.schema.userProfiles)
          .values({
            id: randomUUID(),
            userId: user.id,
            ...input,
          })
          .returning();

        return newProfile;
      }
    },

    deleteUser: async (_parent, { id }, context) => {
      const currentUser = requireAuth(context);

      // Users can only delete their own account, unless they're admin
      if (currentUser.id !== id && currentUser.userType !== 'ADMIN') {
        throw new Error('Unauthorized to delete this user');
      }

      await context.db
        .delete(context.schema.users)
        .where(eq(context.schema.users.id, id));

      return true;
    },

    suspendUser: async (_parent, { id, reason }, context) => {
      requireAdmin(context);

      const [suspendedUser] = await context.db
        .update(context.schema.users)
        .set({
          status: 'SUSPENDED',
          updatedAt: new Date(),
        })
        .where(eq(context.schema.users.id, id))
        .returning();

      // TODO: Log suspension reason

      return suspendedUser;
    },

    unsuspendUser: async (_parent, { id }, context) => {
      requireAdmin(context);

      const [unsuspendedUser] = await context.db
        .update(context.schema.users)
        .set({
          status: 'ACTIVE',
          updatedAt: new Date(),
        })
        .where(eq(context.schema.users.id, id))
        .returning();

      return unsuspendedUser;
    },

    verifyUserEmail: async (_parent, { id }, context) => {
      requireAdmin(context);

      const [verifiedUser] = await context.db
        .update(context.schema.users)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.users.id, id))
        .returning();

      return verifiedUser;
    },

    changeUserRole: async (_parent, { id, role }, context) => {
      requireAdmin(context);

      const [updatedUser] = await context.db
        .update(context.schema.users)
        .set({
          userType: role,
          updatedAt: new Date(),
        })
        .where(eq(context.schema.users.id, id))
        .returning();

      return updatedUser;
    },
  },

  User: {
    profile: async (parent: any, _args: any, context: any) => {
      return context.db.query.userProfiles.findFirst({
        where: (profiles: any, { eq }: any) => eq(profiles.userId, parent.id),
      });
    },

    wallet: async (parent: any, _args: any, context: any) => {
      return context.db.query.userWallets.findFirst({
        where: (wallets: any, { eq }: any) => eq(wallets.userId, parent.id),
      });
    },
  },

  UserProfile: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },
  },

  Wallet: {
    user: async (parent: any, _args: any, context: any) => {
      return context.db.query.users.findFirst({
        where: (users: any, { eq }: any) => eq(users.id, parent.userId),
      });
    },

    transactions: async (parent: any, _args: any, context: any) => {
      return context.db.query.walletTransactions.findMany({
        where: (transactions: any, { eq }: any) => eq(transactions.walletId, parent.id),
        orderBy: (transactions: any, { desc }: any) => desc(transactions.createdAt),
        limit: 50, // Limit to recent transactions
      });
    },
  },
};