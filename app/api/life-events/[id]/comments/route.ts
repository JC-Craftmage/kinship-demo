// Comments on a life event.
//
// Scope: the caller's own church, and only events that belong to it. The
// event id in the URL is never trusted on its own -- the route loads the
// event BY BOTH id and church id, so an event from another church is
// invisible here (404, not 403: the route does not confirm that the id
// exists).

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { demoWriteBlocked } from '@/lib/demo/mode';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { mapLifeEventComment } from '@/lib/board-mappers';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type LifeEventRow = Database['public']['Tables']['life_events']['Row'];
type LifeEventCommentRow = Database['public']['Tables']['life_event_comments']['Row'];

/** Comment length, matching the schema CHECK. */
const MAX_COMMENT_LENGTH = 500;

async function resolveChurchId(userId: string): Promise<string | null> {
  const first = await getAnyMembership(userId);
  if (!first) return null;
  const membership = await getMembership(userId, first.church_id);
  return membership ? membership.church_id : null;
}

/** The caller's own display name, used as the comment author. */
async function loadMyName(userId: string): Promise<string> {
  const { data } = await supabase.from('members').select('name').eq('user_id', userId).limit(1);
  return (data as { name: string }[])[0]?.name ?? '';
}

/**
 * Load the event and confirm it belongs to the caller's church. Returns null
 * when the event does not exist or belongs to another church -- the two
 * cases are deliberately indistinguishable.
 */
async function loadEventInChurch(eventId: string, churchId: string): Promise<LifeEventRow | null> {
  const { data, error } = await supabase
    .from('life_events')
    .select('*')
    .eq('id', eventId)
    .eq('church_id', churchId)
    .limit(1);

  if (error) {
    console.error('loadEventInChurch failed:', error.message);
    return null;
  }

  return (data as LifeEventRow[])[0] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = await resolveChurchId(userId);
    if (!churchId) {
      return NextResponse.json({ error: 'No church membership' }, { status: 403 });
    }

    const { id } = await params;

    const event = await loadEventInChurch(id, churchId);
    if (!event) {
      return NextResponse.json({ error: 'Life event not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('life_event_comments')
      .select('*')
      .eq('life_event_id', event.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('GET /api/life-events/[id]/comments failed:', error.message);
      return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
    }

    const rows = (data ?? []) as LifeEventCommentRow[];
    const authorIds = [...new Set(rows.map((row) => row.author_user_id))];
    const avatars = await loadAvatars(authorIds);

    const comments = rows
      .map((row) => mapLifeEventComment(row, avatars.get(row.author_user_id) ?? ''))
      .filter((comment): comment is NonNullable<typeof comment> => comment !== null);

    return NextResponse.json({ comments, demo: false });
  } catch (error) {
    console.error('GET /api/life-events/[id]/comments threw:', error);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Demo mode is read-only.
    const demoBlocked = demoWriteBlocked();
    if (demoBlocked) return demoBlocked;

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = await resolveChurchId(userId);
    if (!churchId) {
      return NextResponse.json({ error: 'No church membership' }, { status: 403 });
    }

    const { id } = await params;

    const event = await loadEventInChurch(id, churchId);
    if (!event) {
      return NextResponse.json({ error: 'Life event not found' }, { status: 404 });
    }

    let body: { text?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return NextResponse.json({ error: 'A comment cannot be empty' }, { status: 400 });
    }
    if (text.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    const authorName = await loadMyName(userId);

    const { data, error } = await supabase
      .from('life_event_comments')
      .insert({
        life_event_id: event.id,
        author_user_id: userId,
        author_name: authorName,
        body: text,
      })
      .select('*')
      .single();

    if (error) {
      console.error('POST /api/life-events/[id]/comments failed:', error.message);
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    const row = data as LifeEventCommentRow;
    const avatars = await loadAvatars([userId]);
    const comment = mapLifeEventComment(row, avatars.get(userId) ?? '');

    if (!comment) {
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    return NextResponse.json({ comment, demo: false }, { status: 201 });
  } catch (error) {
    console.error('POST /api/life-events/[id]/comments threw:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

/** Clerk user id -> avatar emoji, for comment authors. */
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
