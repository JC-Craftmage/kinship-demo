// DEMO FIXTURES -- notifications.
//
// These are fake notifications for a demo build. They live in `data/` because
// that is where every other fixture lives, and they are reachable ONLY through
// `lib/demo/loader.ts` (enforced by scripts/check-no-mock-imports.js). The
// production bell reads the `notifications` table through
// `/api/notifications`.
//
// The shape is exactly `AppNotification` so the demo exercises the same
// contract the production build does.

import type { AppNotification } from '@/lib/types';

export const notifications: AppNotification[] = [
  {
    id: 'demo-notification-1',
    type: 'kudos',
    title: 'You received kudos!',
    message: 'Sarah Johnson gave you 3 kudos for "Helped with moving"',
    timestamp: '2026-04-18T10:30:00.000Z',
    read: false,
    avatar: '👩',
    actionUrl: '/kudos',
  },
  {
    id: 'demo-notification-2',
    type: 'meal_train',
    title: 'New meal train signup',
    message: 'Mike Chen signed up to bring dinner for the Thompson family',
    timestamp: '2026-04-18T09:15:00.000Z',
    read: false,
    avatar: '👨',
    actionUrl: '/meal-trains',
  },
  {
    id: 'demo-notification-3',
    type: 'asset_request',
    title: 'Asset request approved',
    message: 'Your request to borrow the Kubota Tractor was approved!',
    timestamp: '2026-04-17T16:45:00.000Z',
    read: true,
    avatar: '👴',
    actionUrl: '/assets',
  },
  {
    id: 'demo-notification-4',
    type: 'join_request',
    title: 'New join request',
    message: 'Emily Davis wants to join First Church',
    timestamp: '2026-04-17T14:20:00.000Z',
    read: true,
    avatar: '👩',
    actionUrl: '/settings',
  },
  {
    id: 'demo-notification-5',
    type: 'comment',
    title: 'New comment',
    message: 'Robert Chen commented on your life event: "What a beautiful blessing!"',
    timestamp: '2026-04-17T11:00:00.000Z',
    read: true,
    avatar: '👴',
    actionUrl: '/life-events',
  },
];
