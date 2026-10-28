'use client';

// Needs Board — loads the caller's church needs from the API.

import { useBoardData } from './use-board-data';
import { Need } from '@/lib/types';

export function useNeeds() {
  const { data, loading, error, refresh } = useBoardData<{ needs: Need[] }>('/api/needs');

  return {
    needs: data?.needs ?? [],
    loading,
    error,
    refresh,
  };
}
