import { z } from 'zod';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation schema
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .regex(emailRegex, 'Invalid email format');

// Registration input schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
});

// Login input schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  bio: z.string().max(500).optional(),
});

// Validation helper functions
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

export function getValidationErrors(error: z.ZodError): string[] {
  return error.issues.map(issue => issue.message);
}

// Common validation patterns
export const validationPatterns = {
  email: emailRegex,
  phone: /^\+?[1-9]\d{1,14}$/,
  postalCode: /^[0-9]{5}(?:-[0-9]{4})?$/, // US postal code format
  currency: /^[A-Z]{3}$/, // ISO 4217 currency codes
  decimal: /^\d+(\.\d{1,2})?$/, // Decimal with up to 2 decimal places
};

// Sanitization functions
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}