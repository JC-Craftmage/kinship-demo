// Home dashboard page - Refactored version

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMembers } from '@/hooks/use-members';
import { useChurchMembership } from '@/hooks/use-church-membership';

export default function HomePage() {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { hasChurch, isLoading, membership } = useChurchMembership();
  const { totalMembers, totalAssets, champions } = useMembers();

  // Redirect to welcome if user doesn't have a church
  useEffect(() => {
    if (isLoaded && !isLoading && !hasChurch) {
      router.push('/welcome');
    }
  }, [isLoaded, isLoading, hasChurch, router]);

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // If no church, don't render (will redirect)
  if (!hasChurch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Kinship</h1>
          <p className="text-sm text-indigo-200">{membership?.churchName || 'Church Community'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome! ⛵</h2>
          <p>Your community is thriving - {totalMembers} members connected</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalMembers}</div>
              <div className="text-sm text-gray-600">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalAssets}</div>
              <div className="text-sm text-gray-600">Assets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{champions.length}</div>
              <div className="text-sm text-gray-600">Champions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
