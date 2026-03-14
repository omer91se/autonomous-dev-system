import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notificationQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = notificationQuerySchema.parse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit'),
      unreadOnly: searchParams.get('unreadOnly'),
    });

    const where = {
      userId: session.user.id,
      ...(query.unreadOnly && { read: false }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      take: query.limit + 1,
      ...(query.cursor && {
        skip: 1,
        cursor: { id: query.cursor },
      }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = notifications.length > query.limit;
    const items = hasMore ? notifications.slice(0, -1) : notifications;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications: items,
      nextCursor,
      hasMore,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
