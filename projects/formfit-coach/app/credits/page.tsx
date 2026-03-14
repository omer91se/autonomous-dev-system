'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';

const creditPackages = [
  { credits: 1, price: 29.99, name: 'Single Review' },
  { credits: 3, price: 79.99, name: 'Starter Pack', popular: false },
  { credits: 5, price: 124.99, name: 'Pro Pack', popular: true },
  { credits: 10, price: 229.99, name: 'Premium Pack', popular: false },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async (credits: number, amount: number) => {
    setLoading(true);
    setError('');

    try {
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
        setError(data.error || 'Failed to create payment session');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.credits}
              className={`card relative ${
                pkg.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-3xl font-bold text-primary-600 mb-4">
                ${pkg.price}
              </p>
              <p className="text-gray-600 mb-6">
                {pkg.credits} {pkg.credits === 1 ? 'Credit' : 'Credits'}
              </p>
              <button
                onClick={() => handlePurchase(pkg.credits, pkg.price)}
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Purchase'}
              </button>
              <p className="text-sm text-gray-500 mt-4 text-center">
                ${(pkg.price / pkg.credits).toFixed(2)} per review
              </p>
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
