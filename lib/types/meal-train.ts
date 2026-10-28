// Meal Train related TypeScript types

export interface MealRecipient {
  name: string;
  avatar: string;
  campus: string;
}

export interface MealSignup {
  date: string;
  meal: 'lunch' | 'dinner' | 'breakfast';
  signedUp: boolean;
  volunteer: string | null;
  delivered: boolean;
  /** True when this slot was signed up for by the signed-in member. */
  isMine?: boolean;
}

export interface MealTrain {
  /** `meal_trains.id` — a uuid. Mock rows used to use numbers. */
  id: string;
  recipient: MealRecipient;
  reason: string;
  description: string;
  startDate: string;
  endDate: string;
  preferences: string;
  createdBy: string;
  signups: MealSignup[];
  kudosAwarded: boolean;
}
