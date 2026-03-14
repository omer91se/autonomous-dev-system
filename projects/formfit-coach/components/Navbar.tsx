'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              FormFit Coach
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href={session.user.role === 'TRAINER' ? '/trainer/dashboard' : '/dashboard'}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                {session.user.role === 'USER' && (
                  <>
                    <Link
                      href="/trainers"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      Find Trainers
                    </Link>
                    <Link
                      href="/credits"
                      className="text-gray-700 hover:text-primary-600"
                    >
                      Buy Credits
                    </Link>
                  </>
                )}
                <span className="text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="btn btn-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
