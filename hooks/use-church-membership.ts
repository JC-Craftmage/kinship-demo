// Hook for managing user's church membership and role

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase/client';
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

  const fetchMembership = async () => {
    if (!user?.id) {
      setMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's church membership with church and campus details
      const { data, error: fetchError } = await supabase
        .from('church_members')
        .select(`
          id,
          role,
          joined_at,
          church_id,
          campus_id,
          churches!inner (
            id,
            name
          ),
          campuses (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No membership found - this is okay, user hasn't joined a church yet
          setMembership(null);
          setIsLoading(false);
          return;
        }
        throw fetchError;
      }

      if (data) {
        setMembership({
          id: data.id,
          churchId: data.church_id,
          churchName: (data.churches as any).name,
          campusId: data.campus_id,
          campusName: data.campuses ? (data.campuses as any).name : null,
          role: data.role,
          joinedAt: data.joined_at,
        });
      } else {
        setMembership(null);
      }
    } catch (err) {
      console.error('Error fetching church membership:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchMembership();
    }
  }, [user?.id, isLoaded]);

  return {
    membership,
    isLoading: !isLoaded || isLoading,
    error,
    refetch: fetchMembership,
    hasChurch: !!membership,
    role: membership?.role || null,
  };
}
