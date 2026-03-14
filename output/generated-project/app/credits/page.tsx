'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const creditPackages = [
  {
    credits: 1,
    price: 29.99,
    name: 'Single Review',
    description: 'Perfect for trying out the service',
    popular: false,
  },
  {
    credits: 3,
    price: 79.99,
    name: 'Starter Pack',
    description: 'Save $10 - Great for beginners',
    popular: false,
    savings: 10,
  },
  {
    credits: 5,
    price: 124.99,
    name: 'Pro Pack',
    description: 'Save $25 - Most popular choice',
    popular: true,
    savings: 25,
  },
  {
    credits: 10,
    price: 229.99,
    name: 'Premium Pack',
    description: 'Save $70 - Best value for serious athletes',
    popular: false,
    savings: 70,
  },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async (credits: number, amount: number, packageName: string) => {
    setLoading(true);
    setError('');

    try {
      toast.loading('Creating checkout session...');

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss();
        const errorMsg = data.error || 'Failed to create payment session';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        toast.dismiss();
        toast.success('Redirecting to secure checkout...');
        window.location.href = data.url;
      }
    } catch (err) {
      toast.dismiss();
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Credits
          </h1>
          <p className="text-xl text-gray-600">
            Get expert feedback on your workout form
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <Alert variant="error" title="Payment Error">
              {error}
            </Alert>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.credits}
              className={`card relative hover:shadow-lg transition-shadow ${
                pkg.popular ? 'ring-2 ring-primary-500 -translate-y-2' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="primary" className="px-3 py-1 font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              {pkg.savings && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success">Save ${pkg.savings}</Badge>
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

              <div className="mb-6">
                <p className="text-4xl font-bold text-primary-600">
                  ${pkg.price}
                </p>
                <p className="text-gray-600 mt-2">
                  {pkg.credits} {pkg.credits === 1 ? 'Credit' : 'Credits'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ${(pkg.price / pkg.credits).toFixed(2)} per review
                </p>
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                  <span>Expert trainer feedback</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                  <span>24-48 hour turnaround</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                  <span>Credits never expire</span>
                </div>
              </div>

              <Button
                onClick={() => handlePurchase(pkg.credits, pkg.price, pkg.name)}
                loading={loading}
                fullWidth
                variant={pkg.popular ? 'primary' : 'secondary'}
              >
                Purchase Now
              </Button>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">How Credits Work</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Purchase Credits</h3>
                  <p className="text-gray-600">
                    Choose a package that fits your needs. Credits never expire.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Your Video</h3>
                  <p className="text-gray-600">
                    Upload a workout video and select a certified trainer.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Expert Feedback</h3>
                  <p className="text-gray-600">
                    Receive detailed feedback within 24-48 hours. 1 credit per review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
