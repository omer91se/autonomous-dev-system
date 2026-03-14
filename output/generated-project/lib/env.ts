import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),

  // AWS S3
  AWS_ACCESS_KEY_ID: z
    .string()
    .min(16, 'AWS_ACCESS_KEY_ID must be at least 16 characters'),
  AWS_SECRET_ACCESS_KEY: z
    .string()
    .min(40, 'AWS_SECRET_ACCESS_KEY must be at least 40 characters'),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_S3_BUCKET: z.string().min(1, 'AWS_S3_BUCKET is required'),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),

  // Email (SMTP) - Optional for development
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required').optional(),
  SMTP_PORT: z.string().regex(/^\d+$/, 'SMTP_PORT must be a number').optional(),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required').optional(),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required').optional(),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email').optional(),

  // Optional - Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars: string[] = [];
      const invalidVars: string[] = [];

      error.errors.forEach((err) => {
        const varName = err.path.join('.');
        if (err.message.includes('Required')) {
          missingVars.push(varName);
        } else {
          invalidVars.push(`${varName}: ${err.message}`);
        }
      });

      console.error('\n===========================================');
      console.error('❌ ENVIRONMENT VARIABLE VALIDATION FAILED');
      console.error('===========================================\n');

      if (missingVars.length > 0) {
        console.error('Missing required environment variables:');
        missingVars.forEach((varName) => {
          console.error(`  - ${varName}`);
        });
        console.error('');
      }

      if (invalidVars.length > 0) {
        console.error('Invalid environment variables:');
        invalidVars.forEach((varInfo) => {
          console.error(`  - ${varInfo}`);
        });
        console.error('');
      }

      console.error('Please check your .env file and ensure all required');
      console.error('environment variables are set correctly.\n');
      console.error('===========================================\n');

      process.exit(1);
    }

    throw error;
  }
}

// Validate on module load
export const env = validateEnv();

// Type-safe env access
export type Env = z.infer<typeof envSchema>;
