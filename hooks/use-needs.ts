'use client';

// Needs Board — loads the caller's church needs from the API.

import { useBoardData, BoardEnvelope } from './use-board-data';
import { Need } from '@/lib/types';

export function useNeeds() {
  const { data, loading, error, refresh } = useBoardData<{ needs: Need[] } & BoardEnvelope>('/api/needs');

  return {
    needs: data?.needs ?? [],
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
  };
}
