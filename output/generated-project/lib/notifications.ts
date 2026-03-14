import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create feedback ready notification for user
 */
export async function notifyFeedbackReady(
  userId: string,
  videoTitle: string,
  feedbackId: string
) {
  return createNotification({
    userId,
    type: 'FEEDBACK_READY',
    title: 'Feedback Ready!',
    message: `Your feedback for "${videoTitle}" is ready to view`,
    link: `/feedback/${feedbackId}`,
  });
}

/**
 * Create video assigned notification for trainer
 */
export async function notifyVideoAssigned(
  trainerId: string,
  videoTitle: string,
  feedbackId: string
) {
  return createNotification({
    userId: trainerId,
    type: 'VIDEO_ASSIGNED',
    title: 'New Review Request',
    message: `New video "${videoTitle}" has been assigned to you for review`,
    link: `/trainer/review/${feedbackId}`,
  });
}

/**
 * Create upload success notification
 */
export async function notifyUploadSuccess(
  userId: string,
  videoTitle: string,
  videoId: string
) {
  return createNotification({
    userId,
    type: 'UPLOAD_SUCCESS',
    title: 'Upload Complete!',
    message: `Video "${videoTitle}" has been uploaded successfully`,
    link: `/dashboard`,
  });
}

/**
 * Create email verified notification
 */
export async function notifyEmailVerified(userId: string) {
  return createNotification({
    userId,
    type: 'EMAIL_VERIFIED',
    title: 'Email Verified!',
    message: 'Your email has been verified successfully. You can now upload videos.',
    link: '/upload',
  });
}

/**
 * Create password reset notification
 */
export async function notifyPasswordReset(userId: string) {
  return createNotification({
    userId,
    type: 'PASSWORD_RESET',
    title: 'Password Reset',
    message: 'Your password has been reset successfully',
    link: '/dashboard',
  });
}
