'use client';

// Offers Board — loads the caller's church offers from the API.

import { useBoardData, BoardEnvelope } from './use-board-data';
import { Offer } from '@/lib/types';

export function useOffers() {
  const { data, loading, error, refresh } = useBoardData<{ offers: Offer[] } & BoardEnvelope>('/api/offers');

  return {
    offers: data?.offers ?? [],
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
  };
}
