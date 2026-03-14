'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function RequestFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trainerId = searchParams.get('trainerId');
  const videoId = searchParams.get('videoId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!trainerId || !videoId) {
      router.push('/dashboard');
    }
  }, [trainerId, videoId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerId,
          videoId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to request feedback');
        setLoading(false);
        return;
      }

      router.push('/dashboard?feedback=requested');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Request Feedback
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              You are about to request feedback from a certified trainer. This will use 1 credit from your account.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold mb-2">What happens next:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>1 credit will be deducted from your account</li>
                <li>The trainer will be notified of your request</li>
                <li>You'll receive feedback within 24-48 hours</li>
                <li>You'll be notified when the feedback is ready</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
