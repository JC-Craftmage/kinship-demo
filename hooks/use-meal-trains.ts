// Custom hook for meal trains management

import { useState } from 'react';
import { mealTrains as mockMealTrains } from '@/data/meal-trains';
import { MealTrain } from '@/lib/types';

export function useMealTrains() {
  const [mealTrains] = useState<MealTrain[]>(mockMealTrains);

  const calculateProgress = (train: MealTrain) => {
    const totalSlots = train.signups.length;
    const filledSlots = train.signups.filter(s => s.signedUp).length;
    const percentFilled = Math.round((filledSlots / totalSlots) * 100);

    return {
      totalSlots,
      filledSlots,
      percentFilled,
      needsMore: percentFilled < 100,
    };
  };

  return {
    mealTrains,
    calculateProgress,
  };
}
