// Custom hook for offers management

import { useState } from 'react';
import { offers as mockOffers } from '@/data/offers';
import { Offer } from '@/lib/types';

export function useOffers() {
  const [offers] = useState<Offer[]>(mockOffers);

  return {
    offers,
  };
}