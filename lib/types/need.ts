// Needs Board related TypeScript types

export interface NeedPoster {
  name: string;
  avatar: string;
  campus: string;
}

export interface NeedVolunteer {
  name: string;
  avatar: string;
  signedUp: boolean;
  confirmed: boolean;
}

export type NeedCategory =
  | 'Moving Help'
  | 'Prayer Request'
  | 'Childcare'
  | 'Transportation'
  | 'Home Repair'
  | 'Event Help';

export type NeedStatus = 'open' | 'in-progress' | 'fulfilled';

export type NeedUrgency = 'low' | 'medium' | 'high';

export interface Need {
  id: number;
  poster: NeedPoster;
  category: NeedCategory;
  categoryIcon: 'truck' | 'heart' | 'baby' | 'car' | 'wrench' | 'sparkles';
  title: string;
  description: string;
  date: string | null;
  timeframe: string;
  status: NeedStatus;
  volunteers: NeedVolunteer[];
  volunteersNeeded: number | null;
  urgency: NeedUrgency;
  createdAt: string;
  isAnonymous: boolean;
  suggestedGroups: string[];
  adminNotes: string;
}
