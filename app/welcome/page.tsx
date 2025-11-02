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
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Kinship! ⛵
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's get you connected with your church community.
            Choose one of the options below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Church Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create a Church
              </h2>
              <p className="text-gray-600">
                Start a new church community on Kinship
              </p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Full control as Church Owner</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Create multiple campuses</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Invite members with QR codes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Promote overseers and moderators</span>
              </div>
            </div>

            <Link href="/welcome/create-church">
              <Button variant="primary" className="w-full py-3">
                Create Your Church
              </Button>
            </Link>
          </Card>

          {/* Join Church Card */}
          <Card className="p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Join a Church
              </h2>
              <p className="text-gray-600">
                Connect with an existing church community
              </p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Scan a QR code from your church</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Or enter an invite code</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Access your campus community</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Participate in events and needs</span>
              </div>
            </div>

            <Link href="/welcome/join-church">
              <Button variant="secondary" className="w-full py-3">
                Join a Church
              </Button>
            </Link>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Not sure which option to choose? Contact your church leadership for guidance.</p>
        </div>
      </div>
    </div>
  );
}
