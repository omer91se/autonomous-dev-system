import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailSchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Send reset email
    const resetUrl = `${request.nextUrl.origin}/reset-password/${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password - FormFit Coach',
        html: `
          <h1>Reset your password</h1>
          <p>Hello ${user.name || 'there'},</p>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
  }, { strict: true });
}
