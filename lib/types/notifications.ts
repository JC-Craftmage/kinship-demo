// Notifications - the bell in the dashboard header.
//
// Unlike every other feed in Kinship, notifications are NOT church-scoped:
// a notification belongs to exactly one person. The API route scopes every
// read and write by the caller's own Clerk user id.
//
// The UI never renders a notification whose type it does not recognize: an
// unknown type is a corrupt row, not a value.

/** The six kinds of notification the UI can render. */
export const NOTIFICATION_TYPES = [
  'kudos',
  'meal_train',
  'asset_request',
  'join_request',
  'comment',
  'mention',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** One notification in the caller's own inbox. */
export interface AppNotification {
  id: string;
  /** Which kind of notification this is. */
  type: NotificationType;
  /** Short headline, e.g. "You received kudos!". */
  title: string;
  /** The detail line. */
  message: string;
  /** ISO timestamp of when it arrived. */
  timestamp: string;
  /** Whether the caller has already seen it. */
  read: boolean;
  /** Avatar of whoever caused it, when there is one. */
  avatar?: string;
  /** Where to send the user when they click it. */
  actionUrl?: string;
}
