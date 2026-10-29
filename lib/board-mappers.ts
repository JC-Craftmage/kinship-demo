// Row -> UI mapping for the dashboard boards.
//
// The database stores snake_case columns and UUID primary keys; the UI types in
// `lib/types` speak camelCase and used to be fed by mock files under `data/`.
// This module is the single place where a database row becomes the object a
// component renders, so a schema change lands in one file instead of six
// hooks.
//
// Every mapper returns `null` for a row it cannot faithfully represent
// (unknown category, cancelled need). Callers drop those rows and log the
// count rather than inventing a value.

import type {
  Asset,
  BibleStudyGroup,
  KudosEntry,
  LifeEvent,
  LifeEventComment,
  LifeEventType,
  MealSignup,
  MealTrain,
  Member,
  Need,
  NeedCategory,
  NeedStatus,
  Offer,
  OfferAvailability,
  OfferCategory,
} from '@/lib/types';
import type { Database } from '@/lib/supabase/types';
import { LIFE_EVENT_TYPES } from '@/lib/types/life-events';

type Tables = Database['public']['Tables'];
type MemberRow = Tables['members']['Row'];
type AssetRow = Tables['assets']['Row'];
type NeedRow = Tables['needs']['Row'];
type OfferRow = Tables['offers']['Row'];
type MealTrainRow = Tables['meal_trains']['Row'];
type MealSignupRow = Tables['meal_signups']['Row'];
type StudyGroupRow = Tables['bible_study_groups']['Row'];
type KudosRow = Tables['kudos']['Row'];
type LifeEventRow = Tables['life_events']['Row'];
type LifeEventCommentRow = Tables['life_event_comments']['Row'];

// ---------------------------------------------------------------- categories

export const NEED_CATEGORY_ICONS: Record<NeedCategory, Need['categoryIcon']> = {
  'Moving Help': 'truck',
  'Prayer Request': 'heart',
  Childcare: 'baby',
  Transportation: 'car',
  'Home Repair': 'wrench',
  'Event Help': 'sparkles',
};

export const OFFER_CATEGORY_ICONS: Record<OfferCategory, Offer['categoryIcon']> = {
  'Moving Help': 'truck',
  Childcare: 'baby',
  Transportation: 'car',
  'Home Repair': 'wrench',
  'Event Help': 'sparkles',
  'Skilled Labor': 'wrench',
  'Equipment Rental': 'package',
  Other: 'circle',
};

const NEED_CATEGORY_VALUES: readonly string[] = [
  'Moving Help',
  'Prayer Request',
  'Childcare',
  'Transportation',
  'Home Repair',
  'Event Help',
];

const OFFER_CATEGORY_VALUES: readonly string[] = [
  'Moving Help',
  'Childcare',
  'Transportation',
  'Home Repair',
  'Event Help',
  'Skilled Labor',
  'Equipment Rental',
  'Other',
];

const ASSET_TYPES: readonly string[] = ['vehicle', 'equipment', 'tools', 'business'];
const OFFER_AVAILABILITIES: readonly string[] = ['available', 'limited', 'unavailable'];
const MEAL_TYPES: readonly string[] = ['lunch', 'dinner', 'breakfast'];

export function toNeedCategory(value: string): NeedCategory | null {
  return NEED_CATEGORY_VALUES.includes(value) ? (value as NeedCategory) : null;
}

export function toOfferCategory(value: string): OfferCategory | null {
  return OFFER_CATEGORY_VALUES.includes(value) ? (value as OfferCategory) : null;
}

export function toAssetType(value: string): Asset['type'] | null {
  return ASSET_TYPES.includes(value) ? (value as Asset['type']) : null;
}

export function toOfferAvailability(value: string): OfferAvailability | null {
  return OFFER_AVAILABILITIES.includes(value) ? (value as OfferAvailability) : null;
}

export function toMealType(value: string): MealSignup['meal'] | null {
  return MEAL_TYPES.includes(value) ? (value as MealSignup['meal']) : null;
}

/**
 * The database uses `in_progress`; the UI uses `in-progress`. A cancelled need
 * is not a board state at all, so it maps to null and the row is dropped.
 */
export function toNeedStatus(value: string): NeedStatus | null {
  switch (value) {
    case 'open':
      return 'open';
    case 'in_progress':
      return 'in-progress';
    case 'fulfilled':
      return 'fulfilled';
    default:
      return null;
  }
}

// ------------------------------------------------------------------- members

export interface MemberContext {
  campusName: string;
  assets: Asset[];
  /** Total kudos received by this member, summed from the kudos table. */
  kudosCount?: number;
}

export function mapMember(row: MemberRow, ctx: MemberContext): Member {
  return {
    id: row.id,
    name: row.name,
    campus: ctx.campusName,
    skills: row.skills ?? [],
    interests: row.interests ?? [],
    avatar: row.avatar ?? '',
    // Kudos totals come from the kudos table (sum of the amounts received).
    // Zero means "has not received kudos", not "we do not know yet".
    kudos: ctx.kudosCount ?? 0,
    jobTitle: row.job_title ?? '',
    company: row.company ?? null,
    bio: row.bio ?? '',
    seekingWork: row.seeking_work ?? false,
    lookingForGroups: row.looking_for_groups ?? [],
    assets: ctx.assets,
    memberSince: String(new Date(row.created_at).getFullYear()),
  };
}

export function mapAsset(row: AssetRow): Asset | null {
  const type = toAssetType(row.category);
  if (!type) return null;
  return {
    type,
    name: row.name,
    available: row.availability ?? '',
    description: row.description ?? '',
  };
}

// --------------------------------------------------------------------- needs

export interface NeedContext {
  posterAvatar: string;
  campusName: string;
  volunteers: Need['volunteers'];
}

export function mapNeed(row: NeedRow, ctx: NeedContext): Need | null {
  const category = toNeedCategory(row.category);
  if (!category) return null;
  const status = toNeedStatus(row.status);
  if (!status) return null;

  const isAnonymous = row.posted_by_name.trim().toLowerCase() === 'anonymous';

  return {
    id: row.id,
    requesterId: row.posted_by,
    poster: {
      name: isAnonymous ? 'Anonymous' : row.posted_by_name,
      avatar: ctx.posterAvatar,
      campus: ctx.campusName,
    },
    category,
    categoryIcon: NEED_CATEGORY_ICONS[category],
    title: row.title,
    description: row.description,
    date: row.deadline,
    timeframe: row.deadline ? `Needed by ${row.deadline}` : 'Ongoing',
    status,
    volunteers: ctx.volunteers,
    volunteersNeeded: row.volunteers_needed,
    urgency: row.urgency,
    createdAt: row.created_at,
    isAnonymous,
    suggestedGroups: [],
    adminNotes: '',
  };
}

// -------------------------------------------------------------------- offers

export interface OfferContext {
  posterAvatar: string;
  campusName: string;
}

export function mapOffer(row: OfferRow, ctx: OfferContext): Offer | null {
  const category = toOfferCategory(row.category);
  if (!category) return null;
  const availability = toOfferAvailability(row.availability);
  if (!availability) return null;

  return {
    id: row.id,
    providerId: row.provided_by,
    poster: {
      name: row.provided_by_name,
      avatar: ctx.posterAvatar,
      campus: ctx.campusName,
    },
    category,
    categoryIcon: OFFER_CATEGORY_ICONS[category],
    title: row.title,
    description: row.description,
    availability,
    availabilityNote: row.availability_note ?? '',
    campus: ctx.campusName,
    createdAt: row.created_at,
    isVerified: row.is_verified,
  };
}

// -------------------------------------------------------------------- kudos

export interface KudosContext {
  /** Resolved recipient of the kudos. */
  memberName: string;
  memberAvatar: string;
  campusName: string;
}

/** Kudos amounts are 1..10; anything else is a corrupt row, not a value. */
export const MAX_KUDOS_AMOUNT = 10;

export function mapKudos(row: KudosRow, ctx: KudosContext): KudosEntry | null {
  if (!Number.isInteger(row.amount) || row.amount < 1 || row.amount > MAX_KUDOS_AMOUNT) {
    return null;
  }

  return {
    id: row.id,
    toMemberId: row.to_member_id,
    memberName: ctx.memberName,
    memberAvatar: ctx.memberAvatar,
    fromName: row.from_name?.trim() ? row.from_name : 'A member',
    reason: row.reason ?? '',
    amount: row.amount,
    createdAt: row.created_at,
    campus: ctx.campusName,
  };
}

// --------------------------------------------------------------- life events

/** The UI's event types, mirrored so an unknown type is detectable. */
export const LIFE_EVENT_TYPE_VALUES: readonly string[] = LIFE_EVENT_TYPES;

export interface LifeEventContext {
  /** Name of the member the event is about, when it is about a member. */
  memberName: string;
  memberAvatar: string;
  /** Campus the event belongs to. */
  campusName: string;
  /** Comments on this event, oldest first. */
  comments: LifeEventComment[];
}

function isLifeEventType(value: string): value is LifeEventType {
  return (LIFE_EVENT_TYPES as readonly string[]).includes(value);
}

/**
 * A life event with a type the UI does not know is a corrupt row, not a
 * value: the page has no icon, color or label for it, so it is dropped
 * rather than rendered as something it is not.
 */
export function mapLifeEvent(row: LifeEventRow, ctx: LifeEventContext): LifeEvent | null {
  if (!isLifeEventType(row.event_type)) return null;
  if (!row.title || !row.title.trim()) return null;
  if (!row.event_date) return null;

  return {
    id: row.id,
    type: row.event_type,
    title: row.title.trim(),
    description: row.description ?? '',
    date: row.event_date,
    memberName: ctx.memberName,
    memberAvatar: ctx.memberAvatar,
    campus: ctx.campusName,
    postedBy: row.created_by_name?.trim() ? row.created_by_name : 'A member',
    postedAt: row.created_at,
    comments: ctx.comments,
  };
}

export function mapLifeEventComment(
  row: LifeEventCommentRow,
  authorAvatar: string,
): LifeEventComment | null {
  if (!row.body || !row.body.trim()) return null;
  return {
    id: row.id,
    authorName: row.author_name?.trim() ? row.author_name : 'A member',
    authorAvatar,
    text: row.body.trim(),
    time: row.created_at,
  };
}

// --------------------------------------------------------------- meal trains

export function mapMealTrain(
  row: MealTrainRow,
  ctx: { campusName: string; recipientAvatar: string; signups: MealSignup[] },
): MealTrain {
  return {
    id: row.id,
    recipient: {
      name: row.recipient_name,
      avatar: ctx.recipientAvatar,
      campus: ctx.campusName,
    },
    reason: row.recipient_situation,
    description: row.recipient_address ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
    preferences: row.recipient_dietary ?? '',
    createdBy: row.created_by,
    signups: ctx.signups,
    kudosAwarded: false,
  };
}

/** Hard cap so a mistyped end date cannot generate thousands of slots. */
const MAX_MEAL_SLOTS = 366;

/**
 * Build the meal calendar for one train: one slot per day across the train's
 * date range, so the board can show how many meals are still needed. Rows in
 * `meal_signups` fill those slots; the schema allows one signup per date.
 */
export function buildMealSlots(
  startDate: string,
  endDate: string,
  signups: MealSignupRow[],
  currentUserId: string | null,
): MealSignup[] {
  const slots: MealSignup[] = [];

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return slots;
  if (end < start) return slots;

  const byDate = new Map<string, MealSignupRow>();
  for (const row of signups) byDate.set(row.date, row);

  const cursor = new Date(start.getTime());
  while (cursor <= end && slots.length < MAX_MEAL_SLOTS) {
    const iso = cursor.toISOString().slice(0, 10);
    const row = byDate.get(iso);
    const active = row && row.status !== 'cancelled' ? row : undefined;

    slots.push({
      date: iso,
      meal: (active && toMealType(active.meal_type)) || 'dinner',
      signedUp: Boolean(active),
      volunteer: active ? active.user_name : null,
      delivered: active?.status === 'delivered',
      isMine: Boolean(active && active.user_id === currentUserId),
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return slots;
}

// -------------------------------------------------------------- bible study

export function mapBibleStudyGroup(
  row: StudyGroupRow,
  ctx: { campusName: string; leaderAvatar: string; memberCount: number },
): BibleStudyGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    leader: {
      name: row.leader_name,
      avatar: ctx.leaderAvatar,
      email: row.leader_email ?? undefined,
      phone: row.leader_phone ?? undefined,
    },
    schedule: row.schedule ?? '',
    location: row.location ?? '',
    campus: ctx.campusName,
    currentBook: row.current_book ?? '',
    currentChapter: row.current_chapter ?? '',
    nextStudyDate: row.next_study_date ?? '',
    memberCount: ctx.memberCount,
    maxMembers: row.max_members,
    isOpen: row.is_open,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}
