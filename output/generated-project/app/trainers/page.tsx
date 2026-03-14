import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default async function TrainersPage({
  searchParams,
}: {
  searchParams: { videoId?: string; page?: string; limit?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '12');
  const skip = (page - 1) * limit;

  const [trainers, totalCount] = await Promise.all([
    prisma.trainer.findMany({
      where: {
        isVerified: true,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.trainer.count({
      where: {
        isVerified: true,
        isActive: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Find a Trainer</h1>

        {trainers.length === 0 ? (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No trainers available</h2>
            <p className="text-gray-600">
              Please check back later for available trainers
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="card">
                  <h3 className="text-xl font-semibold mb-2">
                    {trainer.user.name || 'Trainer'}
                  </h3>
                  {trainer.bio && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{trainer.bio}</p>
                  )}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">
                        {trainer.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({trainer.totalReviews} reviews)
                      </span>
                    </div>
                    {trainer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {trainer.specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {searchParams.videoId && (
                    <Link
                      href={`/request-feedback?trainerId=${trainer.userId}&videoId=${searchParams.videoId}`}
                      className="btn btn-primary w-full"
                    >
                      Select Trainer
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                {page > 1 && (
                  <Link
                    href={`/trainers?page=${page - 1}${searchParams.videoId ? `&videoId=${searchParams.videoId}` : ''}`}
                    className="btn btn-secondary"
                  >
                    Previous
                  </Link>
                )}
                <span className="py-2 px-4">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link
                    href={`/trainers?page=${page + 1}${searchParams.videoId ? `&videoId=${searchParams.videoId}` : ''}`}
                    className="btn btn-primary"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
