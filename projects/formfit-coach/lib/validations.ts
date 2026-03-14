import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'TRAINER']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  goals: z.string().optional(),
});

export const trainerProfileSchema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
  hourlyRate: z.number().min(0, 'Rate must be positive').optional(),
});

export const videoUploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  workoutType: z.string().min(1, 'Workout type is required'),
  fileSize: z.number().max(524288000, 'File size must be less than 500MB'),
});

export const feedbackSchema = z.object({
  videoId: z.string(),
  content: z.string().min(50, 'Feedback must be at least 50 characters'),
  rating: z.number().min(1).max(5).optional(),
});

export const commentSchema = z.object({
  feedbackId: z.string(),
  content: z.string().min(1, 'Comment cannot be empty'),
  timestamp: z.number().optional(),
});

export const creditPurchaseSchema = z.object({
  credits: z.number().min(1, 'Must purchase at least 1 credit'),
  amount: z.number().min(0, 'Amount must be positive'),
});
