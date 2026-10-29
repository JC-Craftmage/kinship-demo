// Demo fixture for the Kudos board.
//
// These are fake recognitions between fake people. They exist so a pastor can
// see the board without a live database, and they are only ever served when
// the server-side demo switch is on.
//
// The recipient is referenced by `members.id` from `data/members.ts`. Names,
// avatars and campuses are resolved from that fixture by the demo loader, so
// the feed can never disagree with the directory.

export interface DemoKudosRecord {
  id: string;
  /** `members.id` of the person who received the kudos. */
  toMemberId: string;
  /** Name of the person who gave the kudos. */
  fromName: string;
  reason: string;
  amount: number;
  createdAt: string;
}

export const kudos: DemoKudosRecord[] = [
  {
    id: 'demo-kudos-1',
    toMemberId: '2',
    fromName: 'Sarah Johnson',
    reason: 'Helped someone move',
    amount: 3,
    createdAt: '2026-04-17T09:00:00.000Z',
  },
  {
    id: 'demo-kudos-2',
    toMemberId: '8',
    fromName: 'Rachel Kim',
    reason: 'Cooked 3 meals for a new mom',
    amount: 5,
    createdAt: '2026-04-16T09:00:00.000Z',
  },
  {
    id: 'demo-kudos-3',
    toMemberId: '3',
    fromName: 'Lisa Thompson',
    reason: 'Gave rides to PT for 2 weeks',
    amount: 4,
    createdAt: '2026-04-15T09:00:00.000Z',
  },
  {
    id: 'demo-kudos-4',
    toMemberId: '1',
    fromName: 'Mike Chen',
    reason: 'Hosted the welcome committee',
    amount: 2,
    createdAt: '2026-04-14T09:00:00.000Z',
  },
  {
    id: 'demo-kudos-5',
    toMemberId: '5',
    fromName: 'Emily Rodriguez',
    reason: 'Mentored a young family',
    amount: 3,
    createdAt: '2026-04-12T09:00:00.000Z',
  },
];
