// Server-side helper for putting a notification in a user's inbox.
//
// Notifications are NOT created by the client. The browser never gets to say
// "you were notified" -- that would let any page fabricate an inbox. They
// are created here, by the server, at the moment the real thing happens:
// kudos given, a comment posted, a request approved.
//
// A failed notification must never fail the action that caused it. The giver
// still got their kudos even if the bell did not light up, so every failure
// is logged and swallowed rather than thrown.

import 'server-only';

import { supabase } from './server';
import type { NotificationType } from '@/lib/types';

export interface NotificationInput {
  /** Who receives it (Clerk user id). */
  userId: string;
  /** The church it came from, when there is one. */
  churchId?: string | null;
  /** Who caused it (Clerk user id). */
  actorUserId?: string;
  /** The actor's display name, denormalized so it survives their departure. */
  actorName?: string;
  type: NotificationType;
  title: string;
  message?: string;
  /** Where the bell should send the user when they click. */
  actionUrl?: string;
}

/**
 * Put one notification in a recipient's inbox.
 *
 * Returns true when the row was written. Returns false (and logs) when it
 * could not be -- callers treat that as "the action still happened, the bell
 * did not ring".
 */
export async function createNotification(input: NotificationInput): Promise<boolean> {
  // Never notify someone about their own action.
  if (!input.userId) return false;
  if (input.actorUserId && input.actorUserId === input.userId) return false;

  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    church_id: input.churchId ?? null,
    actor_user_id: input.actorUserId ?? '',
    actor_name: input.actorName ?? '',
    type: input.type,
    title: input.title,
    message: input.message ?? '',
    action_url: input.actionUrl ?? '',
  });

  if (error) {
    console.error('createNotification failed:', error.message);
    return false;
  }

  return true;
}
