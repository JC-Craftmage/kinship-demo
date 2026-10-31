// The notification bell.
//
// Scope: the caller's OWN inbox. Notifications are the one feed in Kinship
// that is not church-scoped -- a notification belongs to exactly one person,
// so every read and every write here is filtered by the caller's own Clerk
// user id and by nothing else.
//
// The rules this route enforces:
//   1. A client can only ever see its own notifications. The user id comes
//      from the auth session, never from the request body.
//   2. Marking one notification read, marking them all read, and dismissing
//      one are all scoped by BOTH the notification id and the caller's user
//      id. A notification id belonging to somebody else is refused with the
//      same "not found" as an id that does not exist, so the route never
//      confirms that it exists.
//   3. Demo mode serves the fixtures and refuses every write, so fixture
//      data can never land in a real database.
//
// Notifications are never CREATED here. The client cannot fabricate an
// inbox; the server puts a notification in the box when the real thing
// happens (see lib/supabase/notifications.ts).

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { isDemoMode, demoWriteBlocked } from '@/lib/demo/mode';
import { demoNotifications } from '@/lib/demo/loader';
import { getUserId } from '@/lib/supabase/queries';
import { mapNotification } from '@/lib/board-mappers';
import type { AppNotification } from '@/lib/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/** How many notifications the bell shows. */
const FEED_LIMIT = 100;

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo mode serves the fixtures instead of the database. The switch is
    // explicit and server-side; the response is flagged so the UI labels it.
    if (isDemoMode()) {
      const fixtures = demoNotifications();
      return NextResponse.json({
        notifications: fixtures,
        unreadCount: fixtures.filter((item) => !item.read).length,
        demo: true,
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT);

    if (error) {
      console.error('GET /api/notifications failed:', error.message);
      return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
    }

    const rows = (data ?? []) as NotificationRow[];
    const avatars = await loadAvatars(rows.map((row) => row.actor_user_id));

    const mapped = rows
      .map((row) => mapNotification(row, { avatar: avatars.get(row.actor_user_id) ?? '' }))
      .filter((item): item is AppNotification => item !== null);

    const dropped = rows.length - mapped.length;
    if (dropped > 0) {
      console.warn(`GET /api/notifications dropped ${dropped} row(s) with an unknown type`);
    }

    return NextResponse.json({
      notifications: mapped,
      unreadCount: mapped.filter((item) => !item.read).length,
      demo: false,
    });
  } catch (error) {
    console.error('GET /api/notifications threw:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

/**
 * Mark notifications read.
 *
 * Body: `{ id: "<uuid>" }` to mark one read, or `{ all: true }` to mark
 * everything read.
 */
export async function PATCH(request: NextRequest) {
  try {
    // Demo mode is read-only.
    const demoBlocked = demoWriteBlocked();
    if (demoBlocked) return demoBlocked;

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id?: unknown; all?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const markAll = body.all === true;
    const id = typeof body.id === 'string' ? body.id.trim() : '';

    if (!markAll && !id) {
      return NextResponse.json(
        { error: 'A notification id is required' },
        { status: 400 },
      );
    }

    // Mark everything read. Scoped by the caller's user id, so one person can
    // never mark another person's notifications read.
    if (markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('PATCH /api/notifications (all) failed:', error.message);
        return NextResponse.json({ error: 'Failed to mark notifications read' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, all: true, demo: false });
    }

    // Mark one read. The row is located by BOTH the id and the caller's user
    // id: a notification belonging to somebody else is simply not there.
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('PATCH /api/notifications failed:', error.message);
      return NextResponse.json({ error: 'Failed to mark notification read' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const row = data as NotificationRow;
    const avatars = await loadAvatars([row.actor_user_id]);
    const item = mapNotification(row, { avatar: avatars.get(row.actor_user_id) ?? '' });

    return NextResponse.json({ notification: item, demo: false });
  } catch (error) {
    console.error('PATCH /api/notifications threw:', error);
    return NextResponse.json({ error: 'Failed to mark notification read' }, { status: 500 });
  }
}

/**
 * Dismiss a notification. Body: `{ id: "<uuid>" }`.
 *
 * Dismissal deletes the row -- there is no "dismissed" flag, because a
 * dismissed notification should not sit in the database forever.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Demo mode is read-only.
    const demoBlocked = demoWriteBlocked();
    if (demoBlocked) return demoBlocked;

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { id?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) {
      return NextResponse.json({ error: 'A notification id is required' }, { status: 400 });
    }

    // Scoped by BOTH the id and the caller's user id.
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('DELETE /api/notifications failed:', error.message);
      return NextResponse.json({ error: 'Failed to dismiss notification' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id, demo: false });
  } catch (error) {
    console.error('DELETE /api/notifications threw:', error);
    return NextResponse.json({ error: 'Failed to dismiss notification' }, { status: 500 });
  }
}

/** Clerk user id -> avatar emoji, for the people who caused the notifications. */
async function loadAvatars(userIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  if (!unique.length) return result;

  const { data, error } = await supabase
    .from('members')
    .select('user_id, avatar')
    .in('user_id', unique);

  if (error) {
    console.error('loadAvatars failed:', error.message);
    return result;
  }

  for (const row of (data ?? []) as { user_id: string; avatar: string | null }[]) {
    result.set(row.user_id, row.avatar ?? '');
  }
  return result;
}
