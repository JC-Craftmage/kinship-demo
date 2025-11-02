// Custom hook for needs management

import { useState } from 'react';
import { needs as mockNeeds } from '@/data/needs';
import { Need } from '@/lib/types';

export function useNeeds() {
  const [needs] = useState<Need[]>(mockNeeds);

  return {
    needs,
  };
}
