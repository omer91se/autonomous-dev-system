import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showContactSupport?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  onGoHome,
  showContactSupport = false,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="rounded-full bg-error-light p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-error" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button
            variant="secondary"
            onClick={onGoHome}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go Home
          </Button>
        )}
        {showContactSupport && (
          <Button
            variant="ghost"
            onClick={() => (window.location.href = 'mailto:support@formfit.com')}
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Contact Support
          </Button>
        )}
      </div>
    </div>
  );
}
