import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { purchaseQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = purchaseQuerySchema.parse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit'),
    });

    const purchases = await prisma.purchase.findMany({
      where: { userId: session.user.id },
      take: query.limit + 1,
      ...(query.cursor && {
        skip: 1,
        cursor: { id: query.cursor },
      }),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = purchases.length > query.limit;
    const items = hasMore ? purchases.slice(0, -1) : purchases;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Calculate total spent
    const totalSpentResult = await prisma.purchase.aggregate({
      where: {
        userId: session.user.id,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      purchases: items,
      nextCursor,
      hasMore,
      totalSpent: totalSpentResult._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
