import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { commentUpdateSchema } from '@/lib/validations';
import { sanitizeComment } from '@/lib/sanitize';

export async function PUT(
  request: NextRequest,
  { params }: { params: { feedbackId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackId, commentId } = params;
    const body = await request.json();
    const validatedData = commentUpdateSchema.parse(body);

    // Verify comment exists and user is the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        feedback: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the comment author can update it' },
        { status: 403 }
      );
    }

    if (comment.feedbackId !== feedbackId) {
      return NextResponse.json(
        { error: 'Comment does not belong to this feedback' },
        { status: 400 }
      );
    }

    // Cannot edit comments after feedback is completed
    if (comment.feedback.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot edit comments after feedback is completed' },
        { status: 400 }
      );
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: sanitizeComment(validatedData.content),
        ...(validatedData.timestamp !== undefined && {
          timestamp: validatedData.timestamp,
        }),
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

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { feedbackId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackId, commentId } = params;

    // Verify comment exists and user is the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        feedback: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the comment author can delete it' },
        { status: 403 }
      );
    }

    if (comment.feedbackId !== feedbackId) {
      return NextResponse.json(
        { error: 'Comment does not belong to this feedback' },
        { status: 400 }
      );
    }

    // Cannot delete comments after feedback is completed
    if (comment.feedback.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete comments after feedback is completed' },
        { status: 400 }
      );
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Get remaining comments count
    const remainingComments = await prisma.comment.count({
      where: { feedbackId },
    });

    return NextResponse.json({
      success: true,
      remainingComments,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
