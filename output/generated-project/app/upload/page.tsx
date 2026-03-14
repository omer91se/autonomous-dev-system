'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { VideoUpload } from '@/components/VideoUpload';

const workoutTypes = [
  'Weightlifting',
  'Cardio',
  'Yoga',
  'Pilates',
  'CrossFit',
  'Bodyweight',
  'Stretching',
  'Other',
];

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileUrl) {
      setError('Please upload a video first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          workoutType,
          fileUrl,
          fileSize: 0, // This would be set from the upload
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create video');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Workout Video</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Video File</h2>
            <VideoUpload onUploadComplete={setFileUrl} />
            {fileUrl && (
              <p className="mt-2 text-sm text-green-600">Video uploaded successfully!</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Video Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Deadlift Form Check"
                />
              </div>

              <div>
                <label htmlFor="workoutType" className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Type
                </label>
                <select
                  id="workoutType"
                  required
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="input"
                >
                  <option value="">Select a type</option>
                  {workoutTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="What feedback are you looking for? Any specific concerns?"
                />
              </div>
            </div>
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
              disabled={loading || !fileUrl}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
