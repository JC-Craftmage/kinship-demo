// Offers Board related TypeScript types

export interface OfferPoster {
  name: string;
  avatar: string;
  campus: string;
}

export type OfferCategory =
  | 'Moving Help'
  | 'Childcare'
  | 'Transportation'
  | 'Home Repair'
  | 'Event Help'
  | 'Skilled Labor'
  | 'Equipment Rental'
  | 'Other';

export type OfferAvailability = 'available' | 'limited' | 'unavailable';

export interface Offer {
  id: number;
  poster: OfferPoster;
  category: OfferCategory;
  categoryIcon: 'truck' | 'baby' | 'car' | 'wrench' | 'sparkles' | 'hammer' | 'package' | 'circle';
  title: string;
  description: string;
  availability: OfferAvailability;
  availabilityNote: string;
  campus: string;
  createdAt: string;
  isVerified: boolean;
}