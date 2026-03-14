/**
 * Component Tests for ErrorBoundary (IMP-004 - P0 Critical)
 *
 * Tests error handling and fallback UI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/components/ErrorFallback';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws on button click
const ThrowOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Click error');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress error console logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should not show fallback UI when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch errors thrown by child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error fallback instead of crashing
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should render fallback UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should catch errors in event handlers', () => {
      render(
        <ErrorBoundary>
          <ThrowOnClick />
        </ErrorBoundary>
      );

      const button = screen.getByText('Trigger Error');
      fireEvent.click(button);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should catch errors in useEffect hooks', () => {
      const ErrorInEffect = () => {
        React.useEffect(() => {
          throw new Error('Effect error');
        }, []);
        return <div>Component</div>;
      };

      render(
        <ErrorBoundary>
          <ErrorInEffect />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Information', () => {
    it('should display error message in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when retry button clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByText(/try again/i);
      fireEvent.click(retryButton);

      // Rerender with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should call custom onError handler', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should provide error reset function', () => {
      const onReset = vi.fn();

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText(/try again/i);
      fireEvent.click(retryButton);

      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback component', () => {
      const CustomFallback = () => <div>Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('should pass error to custom fallback', () => {
      const CustomFallback = ({ error }: { error: Error }) => (
        <div>Error: {error.message}</div>
      );

      render(
        <ErrorBoundary
          fallback={(error: Error) => <CustomFallback error={error} />}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/error: test error/i)).toBeInTheDocument();
    });
  });

  describe('Component Stack', () => {
    it('should capture component stack trace', () => {
      let capturedErrorInfo: any;

      const onError = (error: Error, errorInfo: any) => {
        capturedErrorInfo = errorInfo;
      };

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(capturedErrorInfo).toBeDefined();
      expect(capturedErrorInfo.componentStack).toBeDefined();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should allow nested error boundaries', () => {
      render(
        <ErrorBoundary>
          <div>Outer content</div>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Outer boundary should still show its content
      expect(screen.getByText('Outer content')).toBeInTheDocument();
      // Inner boundary should show error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should catch errors at closest boundary', () => {
      const innerOnError = vi.fn();
      const outerOnError = vi.fn();

      render(
        <ErrorBoundary onError={outerOnError}>
          <ErrorBoundary onError={innerOnError}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Only inner boundary should catch error
      expect(innerOnError).toHaveBeenCalled();
      expect(outerOnError).not.toHaveBeenCalled();
    });
  });
});

describe('ErrorFallback Component', () => {
  const mockError = new Error('Test error message');

  it('should render error title', () => {
    render(<ErrorFallback error={mockError} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should render user-friendly message', () => {
    render(<ErrorFallback error={mockError} />);
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
  });

  it('should show Try Again button', () => {
    render(<ErrorFallback error={mockError} />);
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('should show Go to Dashboard button', () => {
    render(<ErrorFallback error={mockError} />);
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument();
  });

  it('should call resetError when Try Again clicked', () => {
    const resetError = vi.fn();
    render(<ErrorFallback error={mockError} resetError={resetError} />);

    const retryButton = screen.getByText(/try again/i);
    fireEvent.click(retryButton);

    expect(resetError).toHaveBeenCalled();
  });

  it('should show error details in development mode', () => {
    process.env.NODE_ENV = 'development';

    render(<ErrorFallback error={mockError} />);
    expect(screen.getByText(/test error message/i)).toBeInTheDocument();
  });

  it('should hide error details in production mode', () => {
    process.env.NODE_ENV = 'production';

    render(<ErrorFallback error={mockError} />);
    expect(screen.queryByText(/test error message/i)).not.toBeInTheDocument();
  });

  it('should render error icon', () => {
    render(<ErrorFallback error={mockError} />);
    // TODO: Verify error icon is rendered
  });

  it('should be accessible', () => {
    render(<ErrorFallback error={mockError} />);

    // TODO: Verify proper heading levels
    // TODO: Verify buttons have accessible labels
    // TODO: Verify ARIA roles if applicable
  });
});
