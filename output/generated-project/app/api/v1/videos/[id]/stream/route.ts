import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { env } from '@/lib/env';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get video and verify access
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        feedback: {
          select: {
            trainerId: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if user has access (owner or assigned trainer)
    const isOwner = video.userId === session.user.id;
    const isAssignedTrainer = video.feedback.some(
      (f) => f.trainerId === session.user.id
    );

    if (!isOwner && !isAssignedTrainer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract S3 key from fileUrl
    const url = new URL(video.fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    // Generate fresh presigned URL with 1 hour expiration
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Redirect to presigned URL for streaming
    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
