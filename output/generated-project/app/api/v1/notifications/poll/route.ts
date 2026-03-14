import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? new Date(sinceParam) : undefined;

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    // Get latest notification
    const latestNotification = await prisma.notification.findFirst({
      where: {
        userId: session.user.id,
        ...(since && { createdAt: { gt: since } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      unreadCount,
      hasNew: !!latestNotification,
      latestNotification,
    });
  } catch (error) {
    console.error('Error polling notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
