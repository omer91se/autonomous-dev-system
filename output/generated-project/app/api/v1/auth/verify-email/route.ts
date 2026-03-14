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

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a verification link has been sent.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.',
      });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationTokenExpiry: expiry,
      },
    });

    // Send verification email
    const verificationUrl = `${request.nextUrl.origin}/verify/${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email - FormFit Coach',
        html: `
          <h1>Verify your email address</h1>
          <p>Hello ${user.name || 'there'},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with FormFit Coach, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
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
