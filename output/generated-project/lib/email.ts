import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = env.SMTP_HOST ? nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
}) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    console.warn('Email service not configured - skipping email send');
    return;
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM || 'noreply@formfit.app',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = 'Welcome to FormFit Coach!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0ea5e9;">Welcome to FormFit Coach!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining FormFit Coach. We're excited to help you improve your fitness form and technique with personalized feedback from certified trainers.</p>
      <p>Get started by:</p>
      <ul>
        <li>Completing your profile</li>
        <li>Uploading your first workout video</li>
        <li>Selecting a trainer to review your form</li>
      </ul>
      <p>Best regards,<br>The FormFit Coach Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendFeedbackReadyEmail(
  email: string,
  name: string,
  videoTitle: string
) {
  const subject = 'Your Feedback is Ready!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0ea5e9;">Your Feedback is Ready!</h1>
      <p>Hi ${name},</p>
      <p>Great news! Your trainer has completed the review for your video "${videoTitle}".</p>
      <p>Log in to view your personalized feedback and improve your technique.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">View Feedback</a>
      <p>Best regards,<br>The FormFit Coach Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function sendNewReviewRequestEmail(
  email: string,
  name: string,
  videoTitle: string
) {
  const subject = 'New Review Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0ea5e9;">New Review Request</h1>
      <p>Hi ${name},</p>
      <p>You have a new video review request for "${videoTitle}".</p>
      <p>Log in to your trainer dashboard to start reviewing.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/trainer/dashboard" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">View Request</a>
      <p>Best regards,<br>The FormFit Coach Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}
