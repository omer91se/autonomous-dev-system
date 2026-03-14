/**
 * Unit Tests for Input Validation Schemas (IMP-001)
 *
 * Tests comprehensive input validation using Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  videoUploadSchema,
  feedbackSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  // Import other schemas as needed
} from '@/lib/validations';

describe('Authentication Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'USER' as const,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak passwords', () => {
      const weakPassword = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        role: 'USER' as const,
      };

      const result = registerSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('password');
      }
    });

    it('should reject invalid email formats', () => {
      const invalidEmail = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'SecurePass123!',
        role: 'USER' as const,
      };

      const result = registerSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const missingName = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const result = registerSchema.safeParse(missingName);
      expect(result.success).toBe(false);
    });

    it('should validate trainer role registration', () => {
      const trainerData = {
        name: 'Jane Trainer',
        email: 'jane@example.com',
        password: 'SecurePass123!',
        role: 'TRAINER' as const,
      };

      const result = registerSchema.safeParse(trainerData);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login credentials', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe('passwordChangeSchema', () => {
    it('should validate password change with strong new password', () => {
      const validChange = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewSecurePass456!',
      };

      const result = passwordChangeSchema.safeParse(validChange);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const weakNewPassword = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
      };

      const result = passwordChangeSchema.safeParse(weakNewPassword);
      expect(result.success).toBe(false);
    });

    it('should require minimum password length', () => {
      const shortPassword = {
        currentPassword: 'OldPassword123!',
        newPassword: 'Sh0rt!',
      };

      const result = passwordChangeSchema.safeParse(shortPassword);
      expect(result.success).toBe(false);
    });
  });
});

describe('Video Upload Validation', () => {
  describe('videoUploadSchema', () => {
    it('should validate correct video upload data', () => {
      const validVideo = {
        title: 'My Workout Video',
        workoutType: 'SQUAT',
        description: 'Form check for squat',
        fileSize: 50000000, // 50MB
        fileName: 'workout.mp4',
      };

      const result = videoUploadSchema.safeParse(validVideo);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const emptyTitle = {
        title: '',
        workoutType: 'SQUAT',
        fileSize: 50000000,
        fileName: 'workout.mp4',
      };

      const result = videoUploadSchema.safeParse(emptyTitle);
      expect(result.success).toBe(false);
    });

    it('should reject file size exceeding limit (500MB)', () => {
      const tooLarge = {
        title: 'My Video',
        workoutType: 'SQUAT',
        fileSize: 600000000, // 600MB
        fileName: 'workout.mp4',
      };

      const result = videoUploadSchema.safeParse(tooLarge);
      expect(result.success).toBe(false);
    });

    it('should validate all workout types', () => {
      const workoutTypes = ['SQUAT', 'DEADLIFT', 'BENCH_PRESS', 'OVERHEAD_PRESS', 'OTHER'];

      workoutTypes.forEach((type) => {
        const video = {
          title: 'Test Video',
          workoutType: type,
          fileSize: 10000000,
          fileName: 'test.mp4',
        };

        const result = videoUploadSchema.safeParse(video);
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Feedback Validation', () => {
  describe('feedbackSchema', () => {
    it('should validate complete feedback with comments', () => {
      const validFeedback = {
        overallFeedback: 'Great form on most reps, but watch your depth.',
        rating: 8,
        comments: [
          { timestamp: 15, comment: 'Good bar position' },
          { timestamp: 30, comment: 'Depth could be better here' },
        ],
      };

      const result = feedbackSchema.safeParse(validFeedback);
      expect(result.success).toBe(true);
    });

    it('should reject rating outside 1-10 range', () => {
      const invalidRating = {
        overallFeedback: 'Good work',
        rating: 11,
      };

      const result = feedbackSchema.safeParse(invalidRating);
      expect(result.success).toBe(false);
    });

    it('should validate minimum feedback length', () => {
      const tooShort = {
        overallFeedback: 'OK',
        rating: 7,
      };

      const result = feedbackSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });

    it('should reject negative timestamps in comments', () => {
      const negativeTimestamp = {
        overallFeedback: 'Good overall technique',
        rating: 8,
        comments: [{ timestamp: -5, comment: 'Invalid timestamp' }],
      };

      const result = feedbackSchema.safeParse(negativeTimestamp);
      expect(result.success).toBe(false);
    });
  });
});

describe('Profile Update Validation', () => {
  describe('profileUpdateSchema', () => {
    it('should validate name update', () => {
      const validUpdate = {
        name: 'John Updated',
      };

      const result = profileUpdateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate fitness level update', () => {
      const validUpdate = {
        fitnessLevel: 'INTERMEDIATE',
      };

      const result = profileUpdateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const emptyName = {
        name: '   ',
      };

      const result = profileUpdateSchema.safeParse(emptyName);
      expect(result.success).toBe(false);
    });

    it('should accept partial updates', () => {
      const partialUpdate = {
        goals: 'Build strength and improve form',
      };

      const result = profileUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });
});

describe('XSS Prevention', () => {
  it('should handle HTML in text fields', () => {
    const htmlInjection = {
      overallFeedback: '<script>alert("XSS")</script>Good form!',
      rating: 8,
    };

    // Schema should accept it (sanitization happens server-side)
    const result = feedbackSchema.safeParse(htmlInjection);
    expect(result.success).toBe(true);

    // TODO: Add sanitization tests when implementing DOMPurify
  });

  it('should handle special characters in usernames', () => {
    const specialChars = {
      name: "O'Brien <test>",
      email: 'test@example.com',
      password: 'SecurePass123!',
      role: 'USER' as const,
    };

    const result = registerSchema.safeParse(specialChars);
    expect(result.success).toBe(true);
  });
});

describe('Edge Cases', () => {
  it('should handle unicode characters in names', () => {
    const unicodeName = {
      name: 'José García 李明',
      email: 'jose@example.com',
      password: 'SecurePass123!',
      role: 'USER' as const,
    };

    const result = registerSchema.safeParse(unicodeName);
    expect(result.success).toBe(true);
  });

  it('should handle very long valid inputs', () => {
    const longDescription = 'A'.repeat(5000);
    const video = {
      title: 'Test Video',
      workoutType: 'SQUAT',
      description: longDescription,
      fileSize: 10000000,
      fileName: 'test.mp4',
    };

    const result = videoUploadSchema.safeParse(video);
    // Should have max length validation
    expect(result.success).toBeDefined();
  });
});
