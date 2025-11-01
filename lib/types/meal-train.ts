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
}

export interface MealTrain {
  id: number;
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
