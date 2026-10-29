// ============================================================================
// DEMO FIXTURES ONLY — NOT PRODUCTION DATA.
// These records are fake. They exist so a demo build has something to show.
// They must only ever reach the app through the explicit, env-gated demo
// mode. The boards themselves read from the authenticated API routes.
// Guarded by scripts/check-no-mock-imports.js — do not import from a client.
// ============================================================================

import { LifeEvent } from '@/lib/types';

export const lifeEvents: LifeEvent[] = [
  {
    id: 'demo-le-1',
    type: 'baby',
    title: 'Baby Elijah James Born',
    description: 'Welcome to the world, Elijah! 7lbs 2oz, 20 inches of pure joy.',
    date: '2026-04-15',
    memberName: 'Mike Chen',
    memberAvatar: '👨‍👩‍👦',
    campus: 'Downtown',
    postedBy: 'Mike Chen',
    postedAt: '2026-04-15T18:20:00.000Z',
    comments: [
      {
        id: 'demo-le-1-c1',
        authorName: 'Sarah Johnson',
        authorAvatar: '👩',
        text: 'Congratulations! So happy for you!',
        time: '2026-04-16T09:05:00.000Z',
      },
      {
        id: 'demo-le-1-c2',
        authorName: 'Mike Chen',
        authorAvatar: '👨',
        text: 'What a beautiful blessing!',
        time: '2026-04-17T15:40:00.000Z',
      },
    ],
  },
  {
    id: 'demo-le-2',
    type: 'wedding',
    title: 'David & Maria Reyes Wedding',
    description: 'Two become one. Thank you to everyone who celebrated with us!',
    date: '2026-04-10',
    memberName: 'Sarah Johnson',
    memberAvatar: '💒',
    campus: 'Westside',
    postedBy: 'Sarah Johnson',
    postedAt: '2026-04-10T20:00:00.000Z',
    comments: [],
  },
  {
    id: 'demo-le-3',
    type: 'graduation',
    title: 'Joshua Graduates High School!',
    description: 'Our Joshua is officially a high school graduate. So proud!',
    date: '2026-04-08',
    memberName: 'Emily Davis',
    memberAvatar: '👨‍👩‍👦‍👦',
    campus: 'Downtown',
    postedBy: 'Emily Davis',
    postedAt: '2026-04-08T14:30:00.000Z',
    comments: [],
  },
  {
    id: 'demo-le-4',
    type: 'new-home',
    title: 'New House — Eastside Campus',
    description: 'We did it! After 3 years of searching, we finally have our forever home.',
    date: '2026-04-05',
    memberName: 'Robert Chen',
    memberAvatar: '🏠',
    campus: 'Eastside',
    postedBy: 'Robert Chen',
    postedAt: '2026-04-05T11:15:00.000Z',
    comments: [],
  },
];
