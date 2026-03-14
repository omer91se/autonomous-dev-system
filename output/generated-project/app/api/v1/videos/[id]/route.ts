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

    // Get video with feedback
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        feedback: {
          include: {
            trainer: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if user has access
    const isOwner = video.userId === session.user.id;
    const isAssignedTrainer = video.feedback.some(
      (f) => f.trainer.id === session.user.id
    );

    if (!isOwner && !isAssignedTrainer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate fresh presigned URL for the video
    const url = new URL(video.fileUrl);
    const key = url.pathname.substring(1);

    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Return video with fresh presigned URL
    return NextResponse.json({
      video: {
        ...video,
        fileUrl: presignedUrl,
        streamUrl: `/api/v1/videos/${video.id}/stream`,
      },
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
