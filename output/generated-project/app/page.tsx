import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === 'TRAINER') {
      redirect('/trainer/dashboard');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">FormFit Coach</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Perfect Your Form,
            <span className="text-primary-600"> Prevent Injuries</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Get personalized feedback on your workout videos from certified trainers.
            Improve your technique, build strength safely, and achieve your fitness goals.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="btn btn-primary text-lg px-8 py-3"
            >
              Start Your Journey
            </Link>
            <Link
              href="/auth/signup?role=trainer"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Become a Trainer
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Upload Your Video</h4>
              <p className="text-gray-600">
                Record and upload your workout video. Add details about what you want feedback on.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Expert Review</h4>
              <p className="text-gray-600">
                A certified trainer analyzes your form and provides detailed feedback.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Improve & Grow</h4>
              <p className="text-gray-600">
                Apply the feedback, track your progress, and achieve your fitness goals safely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose FormFit Coach</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card">
              <h4 className="text-lg font-semibold mb-2">Certified Trainers</h4>
              <p className="text-gray-600">
                Work with experienced, certified fitness professionals
              </p>
            </div>
            <div className="card">
              <h4 className="text-lg font-semibold mb-2">Detailed Feedback</h4>
              <p className="text-gray-600">
                Get timestamped comments and personalized corrections
              </p>
            </div>
            <div className="card">
              <h4 className="text-lg font-semibold mb-2">Flexible Pricing</h4>
              <p className="text-gray-600">
                Pay per review or choose a subscription that fits your needs
              </p>
            </div>
            <div className="card">
              <h4 className="text-lg font-semibold mb-2">24-48 Hour Turnaround</h4>
              <p className="text-gray-600">
                Fast feedback so you can keep progressing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 FormFit Coach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
