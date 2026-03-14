'use client';

import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Skeleton } from '@/components/ui/Skeleton';

interface Video {
  id: string;
  title: string;
  description: string | null;
  workoutType: string;
  fileUrl: string;
  createdAt: Date;
  feedback: Array<{
    id: string;
    status: string;
    trainer: {
      id: string;
      user: {
        name: string | null;
      };
    };
  }>;
}

interface DashboardClientProps {
  videos: Video[];
  creditBalance: number;
}

export function DashboardClient({ videos, creditBalance }: DashboardClientProps) {
  if (videos.length === 0) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
        <p className="text-gray-600 mb-6">
          Upload your first workout video to get started
        </p>
        <Link href="/upload" className="btn btn-primary">
          Upload Your First Video
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {videos.map((video) => (
        <div key={video.id} className="card">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Player */}
            <div>
              <VideoPlayer
                url={video.fileUrl}
              />
            </div>

            {/* Video Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                {video.description && (
                  <p className="text-gray-600 mb-4">{video.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {video.workoutType}
                  </span>
                  <span>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto">
                {video.feedback.length === 0 ? (
                  <Link
                    href={`/trainers?videoId=${video.id}`}
                    className="btn btn-primary w-full"
                  >
                    Request Feedback
                  </Link>
                ) : video.feedback[0].status === 'PENDING' ? (
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md">
                      Pending Review
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Assigned to {video.feedback[0].trainer.user.name || 'trainer'}
                    </p>
                  </div>
                ) : video.feedback[0].status === 'IN_PROGRESS' ? (
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
                      In Progress
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      {video.feedback[0].trainer.user.name || 'Trainer'} is reviewing
                    </p>
                  </div>
                ) : (
                  <Link
                    href={`/feedback/${video.feedback[0].id}`}
                    className="btn btn-primary w-full"
                  >
                    View Feedback
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
