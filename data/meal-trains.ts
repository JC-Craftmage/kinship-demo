// Mock meal train data - will be replaced with API calls later

import { MealTrain } from '@/lib/types';

export const mealTrains: MealTrain[] = [
  {
    id: 1,
    recipient: { name: 'Sarah Johnson', avatar: '👩', campus: 'Downtown' },
    reason: 'New Baby',
    description: 'Baby Emma arrived! Meals for a family of 4 (including two picky eaters ages 5 and 3).',
    startDate: '2025-11-01',
    endDate: '2025-11-14',
    preferences: 'No nuts please! Love casseroles and simple meals.',
    createdBy: 'Admin',
    signups: [
      { date: '2025-11-01', meal: 'dinner', signedUp: true, volunteer: 'Emily Rodriguez', delivered: false },
      { date: '2025-11-02', meal: 'dinner', signedUp: true, volunteer: 'Lisa Thompson', delivered: false },
      { date: '2025-11-03', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-04', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-05', meal: 'dinner', signedUp: true, volunteer: 'You!', delivered: false },
      { date: '2025-11-06', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-07', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-08', meal: 'dinner', signedUp: true, volunteer: 'David Martinez', delivered: false },
      { date: '2025-11-09', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-10', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-11', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-12', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-13', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-14', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
    ],
    kudosAwarded: false
  },
  {
    id: 2,
    recipient: { name: 'Robert Chen', avatar: '👴', campus: 'Downtown' },
    reason: 'Recovery - Hip Surgery',
    description: 'Robert is recovering from hip surgery. Meals for 1 person.',
    startDate: '2025-11-03',
    endDate: '2025-11-10',
    preferences: 'Light, healthy meals preferred. Easy to reheat.',
    createdBy: 'Pastor Mike',
    signups: [
      { date: '2025-11-03', meal: 'lunch', signedUp: true, volunteer: 'James Wilson', delivered: false },
      { date: '2025-11-03', meal: 'dinner', signedUp: true, volunteer: 'Mike Chen', delivered: false },
      { date: '2025-11-04', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-04', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-05', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-05', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-06', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-06', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-07', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-07', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-08', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-08', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-09', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-09', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-10', meal: 'lunch', signedUp: false, volunteer: null, delivered: false },
      { date: '2025-11-10', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
    ],
    kudosAwarded: false
  },
  {
    id: 3,
    recipient: { name: 'Martinez Family', avatar: '👨‍👩‍👧‍👦', campus: 'Westside' },
    reason: 'House Fire Recovery',
    description: 'The Martinez family lost their home in a fire. Meals for 5 people while they rebuild.',
    startDate: '2025-10-28',
    endDate: '2025-11-18',
    preferences: 'No dietary restrictions. Very grateful for any help!',
    createdBy: 'Westside Campus Pastor',
    signups: [
      { date: '2025-10-28', meal: 'dinner', signedUp: true, volunteer: 'Multiple families', delivered: true },
      { date: '2025-10-29', meal: 'dinner', signedUp: true, volunteer: 'Small Group #3', delivered: true },
      { date: '2025-10-30', meal: 'dinner', signedUp: true, volunteer: 'Youth Group', delivered: false },
      { date: '2025-10-31', meal: 'dinner', signedUp: true, volunteer: 'Emily Rodriguez', delivered: false },
      { date: '2025-11-01', meal: 'dinner', signedUp: false, volunteer: null, delivered: false },
    ],
    kudosAwarded: false
  }
];
