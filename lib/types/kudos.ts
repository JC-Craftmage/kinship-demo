// Kudos - recognition one member gives to another.
//
// A kudos entry is always church-scoped: it points at a member of the same
// church as the giver. The UI never renders an entry whose recipient it
// cannot resolve, so a feed row always carries a real name and avatar.

/** One entry in the kudos feed. */
export interface KudosEntry {
  id: string;
  /** `members.id` of the person who received the kudos. */
  toMemberId: string;
  /** Name of the person who received the kudos. */
  memberName: string;
  /** Avatar of the person who received the kudos. */
  memberAvatar: string;
  /** Name of the person who gave the kudos. */
  fromName: string;
  /** Why the kudos was given. */
  reason: string;
  /** How many kudos were given (1..10). */
  amount: number;
  /** ISO timestamp of when the kudos was given. */
  createdAt: string;
  /** Campus label of the recipient. */
  campus: string;
}
