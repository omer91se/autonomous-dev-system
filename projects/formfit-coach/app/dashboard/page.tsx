import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

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
                name: true,
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

        {videos.length === 0 ? (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-gray-600 mb-6">
              Upload your first workout video to get started
            </p>
            <Link href="/upload" className="btn btn-primary">
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    {video.description && (
                      <p className="text-gray-600 mb-2">{video.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {video.workoutType}
                      </span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {video.feedback.length === 0 ? (
                      <Link
                        href={`/trainers?videoId=${video.id}`}
                        className="btn btn-primary"
                      >
                        Request Feedback
                      </Link>
                    ) : video.feedback[0].status === 'PENDING' ? (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md">
                        Pending Review
                      </span>
                    ) : video.feedback[0].status === 'IN_PROGRESS' ? (
                      <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
                        In Progress
                      </span>
                    ) : (
                      <Link
                        href={`/feedback/${video.feedback[0].id}`}
                        className="btn btn-primary"
                      >
                        View Feedback
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
