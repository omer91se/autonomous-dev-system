import { z } from 'zod';

// Password validation regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Authentication Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  role: z.enum(['USER', 'TRAINER']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

// User Profile Schemas
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  goals: z.string().max(500).optional(),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Trainer Schemas
export const trainerProfileSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500).optional(),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty').optional(),
  hourlyRate: z.number().min(0, 'Rate must be positive').optional(),
  maxDailyReviews: z.number().min(1).max(50).optional(),
  availableHours: z.record(z.any()).optional(),
});

export const trainerReviewSchema = z.object({
  feedbackId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// Video Schemas
export const videoUploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  workoutType: z.string().min(1, 'Workout type is required'),
  fileSize: z.number().max(524288000, 'File size must be less than 500MB'),
  fileUrl: z.string().url('Invalid file URL'),
  duration: z.number().min(0).optional(),
});

export const videoQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(['UPLOADING', 'PROCESSING', 'READY', 'FAILED']).optional(),
  workoutType: z.string().optional(),
});

// Feedback Schemas
export const feedbackCreateSchema = z.object({
  videoId: z.string(),
  trainerId: z.string(),
});

export const feedbackSubmitSchema = z.object({
  videoId: z.string(),
  content: z.string().min(50, 'Feedback must be at least 50 characters'),
  rating: z.number().min(1).max(5).optional(),
});

// Alias for backwards compatibility
export const feedbackSchema = feedbackSubmitSchema;

// Comment Schemas
export const commentCreateSchema = z.object({
  timestamp: z.number().min(0, 'Timestamp must be positive'),
  content: z.string().min(1, 'Comment cannot be empty').max(500),
});

export const commentUpdateSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500),
  timestamp: z.number().min(0, 'Timestamp must be positive').optional(),
});

// Legacy comment schema with feedbackId (for backwards compatibility)
export const commentSchema = z.object({
  feedbackId: z.string(),
  timestamp: z.number().min(0, 'Timestamp must be positive'),
  content: z.string().min(1, 'Comment cannot be empty').max(500),
});

// Credit & Purchase Schemas
export const creditPackageSchema = z.object({
  packageId: z.enum(['starter', 'pro', 'expert']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const creditPurchaseSchema = z.object({
  credits: z.number().min(1, 'Must purchase at least 1 credit'),
  amount: z.number().min(0, 'Amount must be positive'),
});

export const purchaseQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// Notification Schemas
export const notificationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().optional(),
});

// Trainer Listing Schemas
export const trainerQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
  sort: z.enum(['rating', 'reviews', 'recent']).default('rating'),
  specialty: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verified: z.coerce.boolean().optional(),
});

// Admin Schemas
export const adminUserQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
  role: z.enum(['USER', 'TRAINER', 'ADMIN']).optional(),
  search: z.string().optional(),
  emailVerified: z.coerce.boolean().optional(),
});

export const adminTrainerVerifySchema = z.object({
  isVerified: z.boolean(),
  notes: z.string().max(500).optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type TrainerProfileInput = z.infer<typeof trainerProfileSchema>;
export type TrainerReviewInput = z.infer<typeof trainerReviewSchema>;
export type VideoUploadInput = z.infer<typeof videoUploadSchema>;
export type VideoQueryInput = z.infer<typeof videoQuerySchema>;
export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
export type FeedbackSubmitInput = z.infer<typeof feedbackSubmitSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
export type CreditPackageInput = z.infer<typeof creditPackageSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
export type TrainerQueryInput = z.infer<typeof trainerQuerySchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
export type AdminTrainerVerifyInput = z.infer<typeof adminTrainerVerifySchema>;
