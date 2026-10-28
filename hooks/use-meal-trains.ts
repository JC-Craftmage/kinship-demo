'use client';

// Meal Trains — loads the meal calendars of the caller's church.

import { useBoardData, BoardEnvelope } from './use-board-data';
import { MealTrain } from '@/lib/types';

export function useMealTrains() {
  const { data, loading, error, refresh } = useBoardData<{ mealTrains: MealTrain[] } & BoardEnvelope>('/api/meal-trains');

  const calculateProgress = (train: MealTrain) => {
    const totalSlots = train.signups.length;
    const filledSlots = train.signups.filter(s => s.signedUp).length;
    const percentFilled = totalSlots === 0 ? 0 : Math.round((filledSlots / totalSlots) * 100);

    return {
      totalSlots,
      filledSlots,
      percentFilled,
      needsMore: percentFilled < 100,
    };
  };

  return {
    mealTrains: data?.mealTrains ?? [],
    calculateProgress,
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
  };
}
