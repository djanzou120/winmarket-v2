import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import type { Database, User, InsertUser, InsertUserProfile } from 'database/types';
import { users, userProfiles, wallets } from 'database/schema';
import { generateToken } from './utils/jwt';
import { validateEmail, validatePassword } from './utils/validation';
import { logger } from '../../infrastructure/logger';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'BUYER' | 'SELLER';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export class AuthService {
  constructor(private db: Database) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const { email, password, firstName, lastName, role = 'BUYER' } = input;

    // Validate input
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // Start transaction
      const result = await this.db.transaction(async (tx) => {
        // Create user
        const [newUser] = await tx
          .insert(users)
          .values({
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            status: 'ACTIVE',
            emailVerified: false,
          })
          .returning();

        // Create user profile
        await tx.insert(userProfiles).values({
          userId: newUser.id,
          firstName,
          lastName,
        });

        // Create user wallet
        await tx.insert(wallets).values({
          userId: newUser.id,
          balance: '0.00',
          currency: 'EUR',
        });

        return newUser;
      });

      logger.info('User registered successfully', { userId: result.id, email });

      // Generate JWT token
      const token = await generateToken({ userId: result.id, email: result.email, role: result.role });

      return {
        token,
        user: result,
      };
    } catch (error) {
      logger.error('Registration failed', { email, error });
      throw new Error('Registration failed');
    }
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;

    // Find user by email
    const user = await this.db.query.users.findFirst({
      where: and(
        eq(users.email, email.toLowerCase()),
        eq(users.status, 'ACTIVE')
      ),
      with: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    logger.info('User logged in successfully', { userId: user.id, email });

    // Generate JWT token
    const token = await generateToken({ userId: user.id, email: user.email, role: user.role });

    return {
      token,
      user,
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<boolean> {
    const { currentPassword, newPassword } = input;

    // Validate new password
    if (!validatePassword(newPassword)) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Get current user
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.db
      .update(users)
      .set({ password: hashedNewPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));

    logger.info('Password changed successfully', { userId });

    return true;
  }

  async generateTokenForUser(user: User): Promise<AuthPayload> {
    const token = await generateToken({ userId: user.id, email: user.email, role: user.role });
    return {
      token,
      user,
    };
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    // Implementation for email verification
    // This would be used when implementing email verification feature
    throw new Error('Email verification not implemented yet');
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    // Implementation for password reset
    // This would send a reset email to the user
    throw new Error('Password reset not implemented yet');
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Implementation for password reset confirmation
    throw new Error('Password reset not implemented yet');
  }
}