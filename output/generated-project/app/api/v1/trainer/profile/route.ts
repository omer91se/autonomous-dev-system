import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { trainerProfileSchema } from '@/lib/validations';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TRAINER') {
      return NextResponse.json(
        { error: 'Only trainers can update trainer profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = trainerProfileSchema.parse(body);

    const updatedFields: string[] = [];
    const updateData: any = {};

    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio;
      updatedFields.push('bio');
    }

    if (validatedData.specialties !== undefined) {
      updateData.specialties = validatedData.specialties;
      updatedFields.push('specialties');
    }

    if (validatedData.hourlyRate !== undefined) {
      updateData.hourlyRate = validatedData.hourlyRate;
      updatedFields.push('hourlyRate');
    }

    if (validatedData.maxDailyReviews !== undefined) {
      updateData.maxDailyReviews = validatedData.maxDailyReviews;
      updatedFields.push('maxDailyReviews');
    }

    if (validatedData.availableHours !== undefined) {
      updateData.availableHours = validatedData.availableHours;
      updatedFields.push('availableHours');
    }

    const trainer = await prisma.trainer.update({
      where: { userId: session.user.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      trainer,
      updated: updatedFields,
    });
  } catch (error) {
    console.error('Error updating trainer profile:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
