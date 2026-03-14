'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            classNames: {
              error: 'bg-error-light text-error-dark border-error',
              success: 'bg-success-light text-success-dark border-success',
              warning: 'bg-warning-light text-warning-dark border-warning',
              info: 'bg-info-light text-info-dark border-info',
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
