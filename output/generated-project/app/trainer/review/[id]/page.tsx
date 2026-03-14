'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFeedback() {
      try {
        const response = await fetch(`/api/feedback?videoId=${params.id}`);
        const data = await response.json();
        if (data.feedback && data.feedback.length > 0) {
          setFeedback(data.feedback[0]);
          setContent(data.feedback[0].content || '');
        }
      } catch (err) {
        setError('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: feedback.videoId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      router.push('/trainer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Video</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Video</h2>
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
            <div className="flex items-center space-x-2">
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                {feedback.video.workoutType}
              </span>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Detailed Feedback
                </label>
                <textarea
                  id="content"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input"
                  rows={12}
                  placeholder="Provide detailed feedback on form, technique, and areas for improvement..."
                  minLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 50 characters
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
