// Mock needs data - will be replaced with API calls later

import { Need } from '@/lib/types';

export const needs: Need[] = [
  {
    id: 1,
    poster: { name: 'Sarah Johnson', avatar: '👩', campus: 'Downtown' },
    category: 'Moving Help',
    categoryIcon: 'truck',
    title: 'Need help moving to new apartment',
    description: 'Moving to a 2-bedroom apartment across town on Nov 15th. Need help loading/unloading truck. Heavy furniture includes couch, beds, and dining table. Pizza and drinks provided!',
    date: '2025-11-15',
    timeframe: '9:00 AM - 3:00 PM',
    status: 'open',
    volunteers: [],
    volunteersNeeded: 4,
    urgency: 'medium',
    createdAt: '2025-10-25',
    isAnonymous: false,
    suggestedGroups: ['Truck Owners', 'Young Adults', 'Mens Group'],
    adminNotes: 'Consider notifying teen parents - good service opportunity'
  },
  {
    id: 2,
    poster: { name: 'Anonymous', avatar: '🙏', campus: 'Downtown' },
    category: 'Prayer Request',
    categoryIcon: 'heart',
    title: 'Prayer for family health crisis',
    description: 'Going through a difficult medical situation with a family member. Would appreciate prayers for healing and peace. Prefer to keep details private but deeply need the support of our church family right now.',
    date: null,
    timeframe: 'Ongoing',
    status: 'open',
    volunteers: [],
    volunteersNeeded: null,
    urgency: 'high',
    createdAt: '2025-10-28',
    isAnonymous: true,
    suggestedGroups: ['Prayer Team', 'Care Ministry'],
    adminNotes: 'Pastoral follow-up requested'
  },
  {
    id: 3,
    poster: { name: 'Emily Rodriguez', avatar: '👩‍🦱', campus: 'Westside' },
    category: 'Childcare',
    categoryIcon: 'baby',
    title: 'Childcare for parent-teacher conferences',
    description: 'Need someone to watch my two kids (ages 3 and 5) during parent-teacher conferences on Nov 12th evening. About 2 hours. Kids are well-behaved and love to play!',
    date: '2025-11-12',
    timeframe: '6:00 PM - 8:00 PM',
    status: 'in-progress',
    volunteers: [
      { name: 'Lisa Thompson', avatar: '👩‍🎨', signedUp: true, confirmed: true }
    ],
    volunteersNeeded: 1,
    urgency: 'medium',
    createdAt: '2025-10-20',
    isAnonymous: false,
    suggestedGroups: ['Parents', 'Young Moms', 'Childcare Volunteers'],
    adminNotes: 'Lisa Thompson confirmed - all set!'
  },
  {
    id: 4,
    poster: { name: 'Robert Chen', avatar: '👴', campus: 'Downtown' },
    category: 'Transportation',
    categoryIcon: 'car',
    title: 'Rides to physical therapy',
    description: 'Recovering from hip surgery and need rides to PT appointments 3x per week for the next month. Appointments are at Westside Medical Center, usually morning slots around 10 AM. Would be grateful for any help!',
    date: '2025-11-01',
    timeframe: 'Mon/Wed/Fri mornings',
    status: 'open',
    volunteers: [
      { name: 'David Martinez', avatar: '👨‍💼', signedUp: true, confirmed: false },
      { name: 'You!', avatar: '⭐', signedUp: true, confirmed: false }
    ],
    volunteersNeeded: 12,
    urgency: 'high',
    createdAt: '2025-10-26',
    isAnonymous: false,
    suggestedGroups: ['Retired Members', 'Care Ministry', 'Seniors'],
    adminNotes: 'Could use a coordinator to schedule the rides'
  },
  {
    id: 5,
    poster: { name: 'Mike Chen', avatar: '👨', campus: 'Downtown' },
    category: 'Home Repair',
    categoryIcon: 'wrench',
    title: 'Help fixing leaky roof before winter',
    description: 'Have a persistent leak in the garage roof that needs repair before the rainy season. I have the materials but need someone with roofing experience to help guide the project. Probably a Saturday project.',
    date: '2025-11-09',
    timeframe: 'Saturday, weather permitting',
    status: 'fulfilled',
    volunteers: [
      { name: 'James Wilson', avatar: '👨‍🔧', signedUp: true, confirmed: true }
    ],
    volunteersNeeded: 1,
    urgency: 'low',
    createdAt: '2025-10-18',
    isAnonymous: false,
    suggestedGroups: ['Handymen', 'Construction', 'Mens Group'],
    adminNotes: 'James Wilson helped - roof is fixed! Award kudos.'
  },
  {
    id: 6,
    poster: { name: 'Lisa Thompson', avatar: '👩‍🎨', campus: 'Westside' },
    category: 'Event Help',
    categoryIcon: 'sparkles',
    title: 'Volunteers for Fall Festival setup',
    description: 'Our church Fall Festival is coming up Nov 16th! Need volunteers to help with setup on Friday evening (Nov 15th) and breakdown on Saturday evening. Setup involves tables, chairs, decorations, and game booths. Fun community event!',
    date: '2025-11-15',
    timeframe: 'Friday 5-8 PM, Saturday 7-9 PM',
    status: 'open',
    volunteers: [
      { name: 'Youth Group', avatar: '👥', signedUp: true, confirmed: true },
      { name: 'Sarah Johnson', avatar: '👩', signedUp: true, confirmed: true },
      { name: 'Mike Chen', avatar: '👨', signedUp: true, confirmed: false }
    ],
    volunteersNeeded: 10,
    urgency: 'medium',
    createdAt: '2025-10-22',
    isAnonymous: false,
    suggestedGroups: ['Youth Group', 'Young Families', 'Events Team'],
    adminNotes: 'Great turnout so far! Need 7 more volunteers'
  }
];
