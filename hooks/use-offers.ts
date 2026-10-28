'use client';

// Offers Board — loads the caller's church offers from the API.

import { useBoardData } from './use-board-data';
import { Offer } from '@/lib/types';

export function useOffers() {
  const { data, loading, error, refresh } = useBoardData<{ offers: Offer[] }>('/api/offers');

  return {
    offers: data?.offers ?? [],
    loading,
    error,
    refresh,
  };
}
