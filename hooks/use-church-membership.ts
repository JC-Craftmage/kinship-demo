// Hook for managing user's church membership and role

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import type { ChurchRole } from '@/lib/supabase/types';

export interface ChurchMembership {
  id: string;
  churchId: string;
  churchName: string;
  campusId: string | null;
  campusName: string | null;
  role: ChurchRole;
  joinedAt: string;
}

export interface UseChurchMembershipReturn {
  membership: ChurchMembership | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasChurch: boolean;
  role: ChurchRole | null;
}

export function useChurchMembership(): UseChurchMembershipReturn {
  const { user, isLoaded } = useUser();
  const [membership, setMembership] = useState<ChurchMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembership = useCallback(async () => {
    if (!user?.id) {
      setMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Ask the server for the signed-in user's own membership. The browser
      // never talks to Supabase directly, so no database credentials are
      // exposed to the client.
      const response = await fetch('/api/me/church', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch church membership');
      }

      const payload = await response.json();

      if (payload.membership) {
        setMembership(payload.membership as ChurchMembership);
      } else {
        // No membership found - this is okay, user hasn't joined a church yet
        setMembership(null);
      }
    } catch (err) {
      console.error('Error fetching church membership:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoaded) {
      fetchMembership();
    }
  }, [isLoaded, fetchMembership]);

  return {
    membership,
    isLoading: !isLoaded || isLoading,
    error,
    refetch: fetchMembership,
    hasChurch: !!membership,
    role: membership?.role || null,
  };
}
