// Life Events - the celebrations a church family shares.
//
// Scope: the caller's own church. The church id is derived from the caller's
// membership, never from client input, and every row read or written is
// filtered by it.
//
// The write path has two rules:
//   1. When an event names a member, that member must be a member of the
//      caller's own church. A member id from another church is refused with
//      the same "not in your church" error as an unknown id, so the route
//      never confirms that the id exists elsewhere.
//   2. A campus, when given, must belong to the caller's own church.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { isDemoMode, demoWriteBlocked } from '@/lib/demo/mode';
import { demoLifeEvents } from '@/lib/demo/loader';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadCampusNames, campusLabel } from '@/lib/supabase/lookups';
import { mapLifeEvent, mapLifeEventComment } from '@/lib/board-mappers';
import { LIFE_EVENT_TYPES } from '@/lib/types';
import type { LifeEvent, LifeEventComment } from '@/lib/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type LifeEventRow = Database['public']['Tables']['life_events']['Row'];
type LifeEventCommentRow = Database['public']['Tables']['life_event_comments']['Row'];

/** How many events the feed shows. */
const FEED_LIMIT = 100;

/** Title length, matching the schema CHECK. */
const MAX_TITLE_LENGTH = 100;
/** Description length, matching the schema CHECK. */
const MAX_DESCRIPTION_LENGTH = 300;

/**
 * The caller's church, resolved from their membership. Returns null when the
 * caller is not a member of any church.
 */
async function resolveChurchId(userId: string): Promise<string | null> {
  const first = await getAnyMembership(userId);
  if (!first) return null;
  const membership = await getMembership(userId, first.church_id);
  return membership ? membership.church_id : null;
}

/** The caller's own display name, used for "posted by". */
async function loadMyName(userId: string): Promise<string> {
  const { data } = await supabase.from('members').select('name').eq('user_id', userId).limit(1);
  return (data as { name: string }[])[0]?.name ?? '';
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo mode serves the fixtures instead of the database. The switch is
    // explicit and server-side; the response is flagged so the UI labels it.
    if (isDemoMode()) {
      return NextResponse.json({ events: demoLifeEvents(), demo: true });
    }

    const churchId = await resolveChurchId(userId);
    if (!churchId) {
      return NextResponse.json({ error: 'No church membership' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('life_events')
      .select('*')
      .eq('church_id', churchId)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT);

    if (error) {
      console.error('GET /api/life-events failed:', error.message);
      return NextResponse.json({ error: 'Failed to load life events' }, { status: 500 });
    }

    const rows = (data ?? []) as LifeEventRow[];
    const eventIds = rows.map((row) => row.id);

    // Comments for every event in the feed, fetched in one query.
    const commentsByEvent = new Map<string, LifeEventComment[]>();
    if (eventIds.length) {
      const { data: commentRows, error: commentError } = await supabase
        .from('life_event_comments')
        .select('*')
        .in('life_event_id', eventIds)
        .order('created_at', { ascending: true });

      if (commentError) {
        console.error('GET /api/life-events (comments) failed:', commentError.message);
      } else {
        const commentList = (commentRows ?? []) as LifeEventCommentRow[];
        const authorIds = [...new Set(commentList.map((row) => row.author_user_id))];
        const avatars = await loadCommentAvatars(authorIds);

        for (const row of commentList) {
          const comment = mapLifeEventComment(row, avatars.get(row.author_user_id) ?? '');
          if (!comment) continue;
          const list = commentsByEvent.get(row.life_event_id) ?? [];
          list.push(comment);
          commentsByEvent.set(row.life_event_id, list);
        }
      }
    }

    // The member an event is about is resolved from the caller's own
    // directory. An event about someone outside the church still renders --
    // with the poster's name instead of a blank.
    const memberIds = [...new Set(rows.map((row) => row.to_member_id).filter((id): id is string => Boolean(id)))];
    const memberById = await loadMembers(memberIds);
    const campusNames = await loadCampusNames(churchId);

    const mapped = rows
      .map((row) => {
        const member = row.to_member_id ? memberById.get(row.to_member_id) : undefined;
        return mapLifeEvent(row, {
          memberName: member?.name ?? row.created_by_name ?? 'Our church family',
          memberAvatar: member?.avatar ?? '',
          campusName: campusLabel(row.campus_id ? campusNames.get(row.campus_id) : undefined),
          comments: commentsByEvent.get(row.id) ?? [],
        });
      })
      .filter((event): event is LifeEvent => event !== null);

    const dropped = rows.length - mapped.length;
    if (dropped > 0) {
      console.warn(`GET /api/life-events dropped ${dropped} row(s) with an unknown type`);
    }

    return NextResponse.json({ events: mapped, demo: false });
  } catch (error) {
    console.error('GET /api/life-events threw:', error);
    return NextResponse.json({ error: 'Failed to load life events' }, { status: 500 });
  }
}

/** Member id -> name/avatar, for the members an event is about. */
async function loadMembers(memberIds: string[]): Promise<Map<string, { name: string; avatar: string }>> {
  const result = new Map<string, { name: string; avatar: string }>();
  if (!memberIds.length) return result;

  const { data, error } = await supabase
    .from('members')
    .select('id, name, avatar')
    .in('id', memberIds);

  if (error) {
    console.error('loadMembers failed:', error.message);
    return result;
  }

  for (const row of (data ?? []) as { id: string; name: string; avatar: string | null }[]) {
    result.set(row.id, { name: row.name, avatar: row.avatar ?? '' });
  }
  return result;
}

/** Clerk user id -> avatar emoji, for comment authors. */
async function loadCommentAvatars(userIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  if (!unique.length) return result;

  const { data, error } = await supabase
    .from('members')
    .select('user_id, avatar')
    .in('user_id', unique);

  if (error) {
    console.error('loadCommentAvatars failed:', error.message);
    return result;
  }

  for (const row of (data ?? []) as { user_id: string; avatar: string | null }[]) {
    result.set(row.user_id, row.avatar ?? '');
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Demo mode is read-only: refuse the write so fixture data can never
    // land in a real church's database.
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

    let body: { type?: unknown; title?: unknown; description?: unknown; date?: unknown; toMemberId?: unknown; campusId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const type = typeof body.type === 'string' ? body.type.trim() : '';
    if (!(LIFE_EVENT_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: 'That is not a valid celebration type' }, { status: 400 });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'A title is required' }, { status: 400 });
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    const date = typeof body.date === 'string' ? body.date.trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'A valid date is required' }, { status: 400 });
    }

    // The member the event is about must be in the caller's own church. The
    // lookup is scoped by BOTH the member id and the church id.
    let toMemberId: string | null = null;
    if (typeof body.toMemberId === 'string' && body.toMemberId.trim()) {
      const candidate = body.toMemberId.trim();
      const { data: memberRows, error: memberError } = await supabase
        .from('members')
        .select('id, user_id')
        .eq('id', candidate)
        .limit(1);

      if (memberError) {
        console.error('POST /api/life-events (member) failed:', memberError.message);
        return NextResponse.json({ error: 'Failed to share life news' }, { status: 500 });
      }

      const member = (memberRows as { id: string; user_id: string }[])[0];
      if (!member) {
        return NextResponse.json(
          { error: 'That member is not in your church' },
          { status: 400 },
        );
      }

      const { data: membershipRows, error: membershipError } = await supabase
        .from('church_members')
        .select('id')
        .eq('user_id', member.user_id)
        .eq('church_id', churchId)
        .limit(1);

      if (membershipError) {
        console.error('POST /api/life-events (membership) failed:', membershipError.message);
        return NextResponse.json({ error: 'Failed to share life news' }, { status: 500 });
      }

      if (!membershipRows || membershipRows.length === 0) {
        return NextResponse.json(
          { error: 'That member is not in your church' },
          { status: 400 },
        );
      }

      toMemberId = member.id;
    }

    // A campus, when given, must belong to the caller's own church.
    let campusId: string | null = null;
    if (typeof body.campusId === 'string' && body.campusId.trim()) {
      const candidate = body.campusId.trim();
      const { data: campusRows, error: campusError } = await supabase
        .from('campuses')
        .select('id')
        .eq('id', candidate)
        .eq('church_id', churchId)
        .limit(1);

      if (campusError) {
        console.error('POST /api/life-events (campus) failed:', campusError.message);
        return NextResponse.json({ error: 'Failed to share life news' }, { status: 500 });
      }

      if (!campusRows || campusRows.length === 0) {
        return NextResponse.json({ error: 'That campus is not in your church' }, { status: 400 });
      }
      campusId = candidate;
    }

    const postedBy = await loadMyName(userId);

    const { data: inserted, error: insertError } = await supabase
      .from('life_events')
      .insert({
        church_id: churchId,
        created_by_user_id: userId,
        created_by_name: postedBy,
        to_member_id: toMemberId,
        event_type: type,
        title,
        description,
        event_date: date,
        campus_id: campusId,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('POST /api/life-events failed:', insertError.message);
      return NextResponse.json({ error: 'Failed to share life news' }, { status: 500 });
    }

    const row = inserted as LifeEventRow;
    const memberById = toMemberId ? await loadMembers([toMemberId]) : new Map();
    const member = toMemberId ? memberById.get(toMemberId) : undefined;
    const campusNames = await loadCampusNames(churchId);

    const event = mapLifeEvent(row, {
      memberName: member?.name ?? postedBy ?? 'Our church family',
      memberAvatar: member?.avatar ?? '',
      campusName: campusLabel(campusId ? campusNames.get(campusId) : undefined),
      comments: [],
    });

    if (!event) {
      return NextResponse.json({ error: 'Failed to share life news' }, { status: 500 });
    }

    return NextResponse.json({ event, demo: false }, { status: 201 });
  } catch (error) {
    console.error('POST /api/life-events threw:', error);
    return NextResponse.json({ error: 'Failed to share life news' }, { status: 500 });
  }
}
