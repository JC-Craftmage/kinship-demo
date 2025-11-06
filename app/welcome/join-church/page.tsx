// Join church page - Enter invite code

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function JoinChurchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  // Pre-fill code from URL if present
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/invites/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join church');
      }

      // Success! Redirect to home
      router.push('/home');
    } catch (err) {
      console.error('Error joining church:', err);
      setError(err instanceof Error ? err.message : 'Failed to join church');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </Link>
          <Link href="/welcome">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join a Church
          </h1>
          <p className="text-lg text-gray-600">
            Enter your invite code to join
          </p>
        </div>

        {/* Profile Photo Guidelines */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
          <h4 className="font-bold text-blue-900 text-sm mb-2">📸 Before You Join</h4>
          <p className="text-xs text-blue-800">
            Please make sure you have a <strong>real and recent photo</strong> of yourself set as your profile picture.
            This helps your church community recognize and connect with you. Avoid using emojis, cartoons, pets, or old photos.
          </p>
        </Card>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                required
                className="w-full px-4 py-3 text-center text-xl font-mono uppercase border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-wider"
                placeholder="ABC12XYZ"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <p className="mt-2 text-sm text-gray-500">
                Get this code from your church leader or scan the QR code provided
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={isSubmitting || inviteCode.length === 0}
            >
              {isSubmitting ? 'Joining...' : 'Join Church'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* QR Code Scanner (Future Feature) */}
          <div className="text-center">
            <Button variant="secondary" className="w-full" disabled>
              📷 Scan QR Code (Coming Soon)
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              QR code scanning will be available in a future update
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Don't have an invite code?</p>
          <p className="mt-1">Contact your church leadership for access.</p>
        </div>
      </div>
    </div>
  );
}

export default function JoinChurchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    }>
      <JoinChurchContent />
    </Suspense>
  );
}
