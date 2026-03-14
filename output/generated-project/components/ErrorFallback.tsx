'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface ErrorFallbackProps {
  error: Error | null;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="rounded-full bg-error-light p-3 inline-flex mb-4">
          <AlertTriangle className="h-12 w-12 text-error" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-gray-100 rounded-md p-4 mb-6 text-left">
            <p className="text-sm font-mono text-gray-700 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={handleGoHome}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go to Dashboard
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please contact support at{' '}
          <a
            href="mailto:support@formfit.com"
            className="text-primary-600 hover:underline"
          >
            support@formfit.com
          </a>
        </p>
      </div>
    </div>
  );
}
