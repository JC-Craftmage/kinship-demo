// The explicit demo loader.
//
// This is the ONLY module in the codebase allowed to import the fixtures in
// `data/` (enforced by scripts/check-no-mock-imports.js). It runs on the
// server, behind the demo switch, and returns exactly the shapes the board
// API routes return — so a demo build exercises the same contract the
// production build does.
//
// The fixtures are fake people, fake needs and fake churches. They exist so
// a pastor can see the product without a live database. They must never
// reach a user who believes they are looking at their own church's data,
// which is why every route flags the response with `demo: true` and the UI
// labels it.

import 'server-only';

import { members } from '@/data/members';
import { kudos } from '@/data/kudos';
import { needs } from '@/data/needs';
import { offers } from '@/data/offers';
import { mealTrains } from '@/data/meal-trains';
import { bibleStudyGroups } from '@/data/bible-study';
import type {
  AssetWithOwner,
  BibleStudyGroup,
  KudosEntry,
  MealTrain,
  Member,
  Need,
  Offer,
} from '@/lib/types';

export function demoMembers(): Member[] {
  return members;
}

export function demoNeeds(): Need[] {
  return needs;
}

export function demoOffers(): Offer[] {
  return offers;
}

export function demoMealTrains(): MealTrain[] {
  return mealTrains;
}

export function demoBibleStudyGroups(): BibleStudyGroup[] {
  return bibleStudyGroups;
}

/**
 * The Kudos feed. The fixture references recipients by `members.id`, so the
 * name, avatar and campus are resolved from the members fixture here instead
 * of being duplicated -- the feed can never disagree with the directory.
 */
export function demoKudos(): KudosEntry[] {
  const memberById = new Map(members.map((member) => [member.id, member]));

  return kudos
    .map((record) => {
      const member = memberById.get(record.toMemberId);
      if (!member) return null;

      return {
        id: record.id,
        toMemberId: member.id,
        memberName: member.name,
        memberAvatar: member.avatar,
        fromName: record.fromName,
        reason: record.reason,
        amount: record.amount,
        createdAt: record.createdAt,
        campus: member.campus,
      } satisfies KudosEntry;
    })
    .filter((entry): entry is KudosEntry => entry !== null);
}

/**
 * The Assets Board shows the same data as the Member Directory from the
 * other side: every asset with its owner attached.
 */
export function demoAssets(): AssetWithOwner[] {
  const assets: AssetWithOwner[] = [];
  for (const member of members) {
    for (const asset of member.assets) {
      assets.push({ ...asset, owner: member });
    }
  }
  return assets;
}
