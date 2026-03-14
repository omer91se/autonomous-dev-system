'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send verification email');
      }

      setSent(true);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address to receive a verification link
            </p>
          </div>

          {sent ? (
            <Alert variant="success" title="Email Sent!" className="mb-6">
              <p className="mb-4">
                We&apos;ve sent a verification link to <strong>{email}</strong>.
                Please check your inbox and click the link to verify your email address.
              </p>
              <p className="text-sm">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
            </Alert>
          ) : (
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <Button type="submit" loading={loading} fullWidth>
                Send Verification Email
              </Button>
            </form>
          )}

          {sent && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              Send to Different Email
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
