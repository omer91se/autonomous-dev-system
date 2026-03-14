import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default async function TrainerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TRAINER') {
    redirect('/dashboard');
  }

  const [trainer, feedbackRequests] = await Promise.all([
    prisma.trainer.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
      },
    }),
    prisma.feedback.findMany({
      where: { trainerId: session.user.id },
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
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  if (!trainer) {
    return <div>Trainer profile not found</div>;
  }

  const pendingRequests = feedbackRequests.filter(
    (f) => f.status === 'PENDING' || f.status === 'IN_PROGRESS'
  );
  const completedRequests = feedbackRequests.filter((f) => f.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Trainer Dashboard</h1>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-primary-600">
                {trainer.rating.toFixed(1)} ★
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-primary-600">
                {trainer.totalReviews}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingRequests.length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-sm font-semibold">
                {trainer.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-gray-600">Inactive</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Reviews</h2>
            {pendingRequests.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-600">No pending review requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((feedback) => (
                  <div key={feedback.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {feedback.video.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          From: {feedback.video.user.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {feedback.video.workoutType}
                          </span>
                          <span>
                            Requested: {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/trainer/review/${feedback.id}`}
                        className="btn btn-primary ml-4"
                      >
                        {feedback.status === 'PENDING' ? 'Start Review' : 'Continue Review'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Reviews</h2>
            {completedRequests.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-600">No completed reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedRequests.slice(0, 5).map((feedback) => (
                  <div key={feedback.id} className="card">
                    <h3 className="text-lg font-semibold mb-2">
                      {feedback.video.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Completed: {new Date(feedback.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
