import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'USER') {
    redirect('/trainer/dashboard');
  }

  // Fetch user's videos and credits
  const [videos, credit] = await Promise.all([
    prisma.video.findMany({
      where: { userId: session.user.id },
      include: {
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
      take: 10,
    }),
    prisma.credit.findFirst({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="card py-2 px-4">
              <span className="text-sm text-gray-600">Credits: </span>
              <span className="text-lg font-bold text-primary-600">
                {credit?.balance || 0}
              </span>
            </div>
            <Link href="/upload" className="btn btn-primary">
              Upload Video
            </Link>
          </div>
        </div>

        <DashboardClient
          videos={videos}
          creditBalance={credit?.balance || 0}
        />
      </div>
    </div>
  );
}
