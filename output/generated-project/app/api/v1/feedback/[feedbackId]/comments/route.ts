import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { commentCreateSchema } from '@/lib/validations';
import { sanitizeComment } from '@/lib/sanitize';

export async function POST(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackId } = params;
    const body = await request.json();
    const validatedData = commentCreateSchema.parse(body);

    // Verify feedback exists and user is the assigned trainer
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      select: {
        id: true,
        trainerId: true,
        status: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedback.trainerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the assigned trainer can add comments' },
        { status: 403 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        feedbackId,
        userId: session.user.id,
        content: sanitizeComment(validatedData.content),
        timestamp: validatedData.timestamp,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get total comments count
    const totalComments = await prisma.comment.count({
      where: { feedbackId },
    });

    return NextResponse.json(
      {
        comment,
        totalComments,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { feedbackId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackId } = params;

    // Verify user has access to this feedback
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        video: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Only allow trainer or video owner to view comments
    if (
      feedback.trainerId !== session.user.id &&
      feedback.video.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get comments ordered by timestamp
    const comments = await prisma.comment.findMany({
      where: { feedbackId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
