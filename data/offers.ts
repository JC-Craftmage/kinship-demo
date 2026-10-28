// ============================================================================
// DEMO FIXTURES ONLY — NOT PRODUCTION DATA.
// These records are fake. They exist so a demo build has something to show.
// They must only ever reach the app through the explicit, env-gated demo
// mode. The boards themselves read from the authenticated API routes.
// Guarded by scripts/check-no-mock-imports.js — do not import from a client.
// ============================================================================

// Mock offers data - will be replaced with API calls later

import { Offer } from '@/lib/types';

export const offers: Offer[] = [
  {
    id: '1',
    poster: { name: 'Mike Chen', avatar: '👨', campus: 'Downtown' },
    category: 'Transportation',
    categoryIcon: 'car',
    title: 'Pickup truck available on weekends',
    description: 'I have a 2005 Ford F-150 and am happy to help with moves, hauling debris, or transporting large items. Available Saturday and Sunday mornings.',
    availability: 'available',
    availabilityNote: 'Sat-Sun mornings',
    campus: 'Downtown',
    createdAt: '2025-10-15',
    isVerified: true
  },
  {
    id: '2',
    poster: { name: 'Robert Chen', avatar: '👴', campus: 'Downtown' },
    category: 'Skilled Labor',
    categoryIcon: 'wrench',
    title: 'Woodworking and furniture repair',
    description: 'Retired cabinet maker. I can help repair furniture, build custom pieces, or teach woodworking. Have a fully equipped shop.',
    availability: 'limited',
    availabilityNote: 'By appointment only',
    campus: 'Downtown',
    createdAt: '2025-10-18',
    isVerified: true
  },
  {
    id: '3',
    poster: { name: 'Emily Rodriguez', avatar: '👩‍🦱', campus: 'Westside' },
    category: 'Childcare',
    categoryIcon: 'baby',
    title: 'Experienced mom available for childcare',
    description: 'Mom of two (ages 5 and 3). Available for occasional date nights or emergency childcare. CPR certified, background check on file.',
    availability: 'limited',
    availabilityNote: 'Evenings and weekends',
    campus: 'Westside',
    createdAt: '2025-10-20',
    isVerified: true
  },
  {
    id: '4',
    poster: { name: 'James Wilson', avatar: '👨‍🔧', campus: 'Eastside' },
    category: 'Home Repair',
    categoryIcon: 'wrench',
    title: 'General handyman services',
    description: '30 years experience in home repair and maintenance. Can handle plumbing minor fixes, electrical outlets, drywall repair, painting, and general carpentry. Licensed and insured.',
    availability: 'available',
    availabilityNote: 'Weekday evenings',
    campus: 'Eastside',
    createdAt: '2025-10-22',
    isVerified: true
  },
  {
    id: '5',
    poster: { name: 'David Martinez', avatar: '👨‍💼', campus: 'Downtown' },
    category: 'Transportation',
    categoryIcon: 'car',
    title: 'Van available for group transport',
    description: 'I have a 12-passenger van and am willing to help with youth group trips, mission events, or church transport needs. Will need advance notice.',
    availability: 'limited',
    availabilityNote: '2 weeks notice required',
    campus: 'Downtown',
    createdAt: '2025-10-25',
    isVerified: true
  },
  {
    id: '6',
    poster: { name: 'Lisa Thompson', avatar: '👩‍🎨', campus: 'Westside' },
    category: 'Equipment Rental',
    categoryIcon: 'package',
    title: 'Lawn care equipment sharing',
    description: 'Have riding mower, edger, leaf blower, and power washer available for church members to borrow. Just ask ahead of time and return clean.',
    availability: 'available',
    availabilityNote: 'Contact for availability',
    campus: 'Westside',
    createdAt: '2025-10-28',
    isVerified: true
  }
];