import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { trainerProfileSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const isActive = searchParams.get('isActive');

    const where: any = {
      isVerified: true,
    };

    if (specialty) {
      where.specialties = {
        has: specialty,
      };
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const trainers = await prisma.trainer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
    });

    return NextResponse.json({ trainers });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = trainerProfileSchema.parse(body);

    const trainer = await prisma.trainer.update({
      where: { userId: session.user.id },
      data: {
        bio: validatedData.bio,
        specialties: validatedData.specialties,
        hourlyRate: validatedData.hourlyRate,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ trainer });
  } catch (error) {
    console.error('Error updating trainer:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
