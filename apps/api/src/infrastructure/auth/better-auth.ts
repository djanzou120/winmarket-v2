import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, twoFactor, admin } from "better-auth/plugins";
import { db } from "../database/connection";
import { users, userProfiles, userWallets } from "../database/schema";
import { env } from "../env-validation";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (data) => {
      // TODO: Implement email sending
      console.log("Reset password email for:", data.user.email);
    },
    sendVerificationEmail: async (data) => {
      // TODO: Implement email sending
      console.log("Verification email for:", data.user.email);
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID || "",
      clientSecret: env.FACEBOOK_CLIENT_SECRET || "",
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      allowUserToInviteMembers: true,
      organizationSchema: {
        fields: {
          description: {
            type: "string",
            required: false,
          },
          website: {
            type: "string",
            required: false,
          },
          industry: {
            type: "string",
            required: false,
          },
        }
      }
    }),
    twoFactor({
      issuer: "WinMarket",
      accountName: (user) => user.email,
    }),
    admin({
      adminRole: "ADMIN",
    }),
  ],
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      phone: {
        type: "string",
        required: false,
      },
      userType: {
        type: "string",
        required: true,
        defaultValue: "BUYER",
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "ACTIVE",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: env.COOKIE_DOMAIN || "localhost",
    },
    generateId: () => {
      return require('crypto').randomUUID();
    },
  },
  trustedOrigins: [
    env.FRONTEND_URL || "http://localhost:3000",
    env.ADMIN_URL || "http://localhost:3001",
  ],
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "warn",
    disabled: env.NODE_ENV === "test",
  },
  hooks: {
    after: [
      {
        matcher(context) {
          return context.path === "/sign-up";
        },
        handler: async (ctx) => {
          // Create user profile and wallet after registration
          const user = ctx.user;
          if (!user) return;

          try {
            // Create user profile
            await db.insert(userProfiles).values({
              id: require('crypto').randomUUID(),
              userId: user.id,
              language: 'fr',
              notificationsEnabled: true,
              marketingEnabled: false,
            });

            // Create user wallet
            await db.insert(userWallets).values({
              id: require('crypto').randomUUID(),
              userId: user.id,
              balance: "0.00",
              frozenBalance: "0.00",
              totalEarnings: "0.00",
              totalSpent: "0.00",
            });

            console.log(`Created profile and wallet for user: ${user.id}`);
          } catch (error) {
            console.error("Failed to create user dependencies:", error);
          }
        },
      },
    ],
  },
});

export type Auth = typeof auth;