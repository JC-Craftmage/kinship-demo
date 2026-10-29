// Life Events - the celebrations a church family shares.
//
// A life event is always church-scoped: it belongs to the church of the
// person who posted it, and the feed only ever shows the caller's own
// church. An event may be about a member (`toMemberId`) or about the church
// as a whole, so the member is optional.
//
// The UI never renders an event whose type it does not recognize: an unknown
// type is a corrupt row, not a value.

/** The six kinds of celebration the UI can post. */
export const LIFE_EVENT_TYPES = [
  'baby',
  'birthday',
  'wedding',
  'new-home',
  'graduation',
  'travel',
] as const;

export type LifeEventType = (typeof LIFE_EVENT_TYPES)[number];

/** One comment on a life event. */
export interface LifeEventComment {
  id: string;
  /** Display name of the commenter. */
  authorName: string;
  /** Avatar of the commenter, when there is one. */
  authorAvatar: string;
  /** What they said. */
  text: string;
  /** ISO timestamp of when they said it. */
  time: string;
}

/** One celebration in the Life Events feed. */
export interface LifeEvent {
  id: string;
  /** Which kind of celebration this is. */
  type: LifeEventType;
  /** Headline, e.g. "Baby Elijah James Born". */
  title: string;
  /** Optional detail. */
  description: string;
  /** The day being celebrated (YYYY-MM-DD). */
  date: string;
  /** Name of the person the event is about, when it is about a member. */
  memberName: string;
  /** Avatar of that person, when there is one. */
  memberAvatar: string;
  /** Campus the event belongs to. */
  campus: string;
  /** Who posted it. */
  postedBy: string;
  /** ISO timestamp of when it was posted. */
  postedAt: string;
  /** Comments, oldest first. */
  comments: LifeEventComment[];
}
