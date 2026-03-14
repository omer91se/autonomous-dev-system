import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations';
import { notifyPasswordReset } from '@/lib/notifications';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  return withRateLimit(request, async () => {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { resetToken: validatedData.token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        lastPasswordChange: new Date(),
      },
    });

    // Create notification
    try {
      await notifyPasswordReset(user.id);
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
  }, { strict: true });
}
