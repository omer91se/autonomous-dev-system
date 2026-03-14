import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { feedbackSchema } from '@/lib/validations';
import { sendFeedbackReadyEmail, sendNewReviewRequestEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const trainerId = searchParams.get('trainerId');

    let feedback;

    if (videoId) {
      feedback = await prisma.feedback.findMany({
        where: { videoId },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          video: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    } else if (trainerId && session.user.id === trainerId) {
      feedback = await prisma.feedback.findMany({
        where: { trainerId },
        include: {
          video: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          comments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
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

    // Creating a new feedback request
    if (body.trainerId && session.user.role === 'USER') {
      const video = await prisma.video.findUnique({
        where: { id: body.videoId },
        include: { user: true },
      });

      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }

      if (video.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Check if user has credits
      const credit = await prisma.credit.findFirst({
        where: { userId: session.user.id },
      });

      if (!credit || credit.balance < 1) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 400 }
        );
      }

      // Deduct credit
      await prisma.credit.update({
        where: { id: credit.id },
        data: { balance: credit.balance - 1 },
      });

      // Create feedback request
      const feedback = await prisma.feedback.create({
        data: {
          videoId: body.videoId,
          trainerId: body.trainerId,
          content: '',
          status: 'PENDING',
        },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Send notification to trainer
      try {
        await sendNewReviewRequestEmail(
          feedback.trainer.email,
          feedback.trainer.name || 'Trainer',
          video.title
        );
      } catch (error) {
        console.error('Failed to send notification email:', error);
      }

      return NextResponse.json({ feedback }, { status: 201 });
    }

    // Submitting feedback as trainer
    if (session.user.role === 'TRAINER') {
      const validatedData = feedbackSchema.parse(body);

      const existingFeedback = await prisma.feedback.findFirst({
        where: {
          videoId: validatedData.videoId,
          trainerId: session.user.id,
        },
        include: {
          video: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!existingFeedback) {
        return NextResponse.json(
          { error: 'Feedback request not found' },
          { status: 404 }
        );
      }

      const updatedFeedback = await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: {
          content: validatedData.content,
          rating: validatedData.rating,
          status: 'COMPLETED',
        },
      });

      // Update trainer stats
      await prisma.trainer.update({
        where: { userId: session.user.id },
        data: {
          totalReviews: { increment: 1 },
        },
      });

      // Send notification to user
      try {
        await sendFeedbackReadyEmail(
          existingFeedback.video.user.email,
          existingFeedback.video.user.name || 'User',
          existingFeedback.video.title
        );
      } catch (error) {
        console.error('Failed to send notification email:', error);
      }

      return NextResponse.json({ feedback: updatedFeedback });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error creating/updating feedback:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
