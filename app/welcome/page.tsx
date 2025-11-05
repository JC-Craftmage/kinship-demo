// Welcome/Onboarding page for new users

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { hasChurch, isLoading } = useChurchMembership();

  // Redirect if user already has a church
  useEffect(() => {
    if (isLoaded && !isLoading && hasChurch) {
      router.push('/home');
    }
  }, [isLoaded, isLoading, hasChurch, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </div>
          <div className="text-sm text-gray-600">
            Welcome, {user?.firstName || 'there'}!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Primary Action - Join Church */}
        <div className="mb-12">
          <Card className="p-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-8xl mb-6">👥</div>
              <h1 className="text-5xl font-bold mb-4">
                Let's Find Your Church!
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                Join your church community on Kinship. Get your invite code from your church leader or scan their QR code.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4 mb-8">
              <div className="flex items-center gap-3 text-lg">
                <span className="text-3xl">✓</span>
                <span>Connect with your campus community</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <span className="text-3xl">✓</span>
                <span>Participate in meal trains and needs</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <span className="text-3xl">✓</span>
                <span>Share assets and build relationships</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/welcome/join-church">
                <Button
                  variant="primary"
                  className="px-16 py-6 text-2xl bg-white text-indigo-600 hover:bg-gray-100 shadow-xl"
                >
                  Join My Church →
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Divider */}
        <div className="flex items-center my-12">
          <div className="flex-1 border-t-2 border-gray-300"></div>
          <span className="px-6 text-gray-500 font-medium">OR</span>
          <div className="flex-1 border-t-2 border-gray-300"></div>
        </div>

        {/* Secondary Action - Create Church */}
        <div className="text-center">
          <p className="text-gray-700 mb-6">
            Is your church not on Kinship yet? You can set it up!
          </p>

          <Card className="p-6 max-w-2xl mx-auto bg-white/80 backdrop-blur">
            <div className="flex items-center gap-6">
              <div className="text-5xl">🏛️</div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Start a New Church
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Set up your church on Kinship and invite your community
                </p>
                <Link href="/welcome/create-church">
                  <Button variant="secondary" className="text-sm">
                    Create Church Account
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact your church leadership or reach out to support.</p>
        </div>
      </div>
    </div>
  );
}
