'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function FeedbackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFeedback() {
      try {
        // In a real implementation, we'd fetch by feedback ID
        // For now, this is a simplified version
        const response = await fetch(`/api/feedback?feedbackId=${params.id}`);
        const data = await response.json();
        if (data.feedback && data.feedback.length > 0) {
          setFeedback(data.feedback[0]);
        }
      } catch (err) {
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [params.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId: params.id,
          content: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      setComment('');
      // Reload feedback to show new comment
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Feedback not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Feedback Details</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Video</h2>
            <div className="bg-gray-900 rounded-lg aspect-video mb-4">
              <video
                src={feedback.video.fileUrl}
                controls
                className="w-full h-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <h3 className="font-semibold mb-2">{feedback.video.title}</h3>
            {feedback.video.description && (
              <p className="text-gray-600 mb-2">{feedback.video.description}</p>
            )}
          </div>

          {/* Feedback Section */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Trainer Feedback</h2>
                {feedback.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{feedback.rating}/5</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                From: {feedback.trainer.name}
              </p>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{feedback.content}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Follow-up Questions</h3>

              {feedback.comments && feedback.comments.length > 0 && (
                <div className="space-y-4 mb-6">
                  {feedback.comments.map((comment: any) => (
                    <div key={comment.id} className="bg-gray-50 rounded p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {comment.user.name}
                      </p>
                      <p className="text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCommentSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input mb-4"
                  rows={3}
                  placeholder="Ask a follow-up question..."
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
