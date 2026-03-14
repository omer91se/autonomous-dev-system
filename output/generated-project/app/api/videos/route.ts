import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { videoUploadSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let videos;

    if (userId && session.user.id === userId) {
      // Get user's own videos
      videos = await prisma.video.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          feedback: {
            include: {
              trainer: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (session.user.role === 'TRAINER') {
      // Get videos assigned to this trainer
      videos = await prisma.video.findMany({
        where: {
          feedback: {
            some: {
              trainerId: session.user.id,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          feedback: {
            where: {
              trainerId: session.user.id,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = videoUploadSchema.parse(body);

    // Check if user has credits
    if (session.user.role === 'USER') {
      const credit = await prisma.credit.findFirst({
        where: { userId: session.user.id },
      });

      if (!credit || credit.balance < 1) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 400 }
        );
      }
    }

    const video = await prisma.video.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        workoutType: validatedData.workoutType,
        fileUrl: body.fileUrl, // This will be set by the upload handler
        fileSize: validatedData.fileSize,
        status: 'READY',
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
