// Kudos Board - recognition given by the members of one church to another.
//
// Scope: the caller's own church. The church id is derived from the caller's
// membership, never from client input, and every row read or written is
// filtered by it.
//
// The write path has two rules that keep the leaderboard honest:
//   1. The recipient must be a member of the caller's own church. A member id
//      from another church is refused with the same "not in your church"
//      error as an unknown id, so the route never confirms that the id exists.
//   2. Self-kudos are refused. Otherwise one person could inflate their own
//      rank on the leaderboard.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { isDemoMode, demoWriteBlocked } from '@/lib/demo/mode';
import { demoKudos } from '@/lib/demo/loader';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadChurchMembers } from '@/lib/supabase/members';
import { mapKudos, MAX_KUDOS_AMOUNT } from '@/lib/board-mappers';
import { createNotification } from '@/lib/supabase/notifications';
import type { KudosEntry } from '@/lib/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type KudosRow = Database['public']['Tables']['kudos']['Row'];

/** How many entries the feed shows. */
const FEED_LIMIT = 100;

/** The reason column is CHECKed to this length in the schema too. */
const MAX_REASON_LENGTH = 200;

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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo mode serves the fixtures instead of the database. The switch is
    // explicit and server-side; the response is flagged so the UI labels it.
    if (isDemoMode()) {
      return NextResponse.json({ kudos: demoKudos(), demo: true });
    }

    const churchId = await resolveChurchId(userId);
    if (!churchId) {
      return NextResponse.json({ error: 'No church membership' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('kudos')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT);

    if (error) {
      console.error('GET /api/kudos failed:', error.message);
      return NextResponse.json({ error: 'Failed to load kudos' }, { status: 500 });
    }

    const rows = (data ?? []) as KudosRow[];

    // The recipient's name, avatar and campus are resolved from the caller's
    // own directory. A row whose recipient is not in this church is dropped
    // rather than rendered with a blank name.
    const bundle = await loadChurchMembers(churchId);
    const memberById = new Map(bundle.members.map((member) => [member.id, member]));

    const mapped = rows
      .map((row) => {
        const member = memberById.get(row.to_member_id);
        if (!member) return null;
        return mapKudos(row, {
          memberName: member.name,
          memberAvatar: member.avatar,
          campusName: member.campus,
        });
      })
      .filter((entry): entry is KudosEntry => entry !== null);

    const dropped = rows.length - mapped.length;
    if (dropped > 0) {
      console.warn(`GET /api/kudos dropped ${dropped} row(s) with an unresolved recipient`);
    }

    return NextResponse.json({ kudos: mapped, demo: false });
  } catch (error) {
    console.error('GET /api/kudos threw:', error);
    return NextResponse.json({ error: 'Failed to load kudos' }, { status: 500 });
  }
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

    let body: { toMemberId?: unknown; reason?: unknown; amount?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const toMemberId = typeof body.toMemberId === 'string' ? body.toMemberId.trim() : '';
    if (!toMemberId) {
      return NextResponse.json({ error: 'A member is required' }, { status: 400 });
    }

    const amount = typeof body.amount === 'number' ? Math.trunc(body.amount) : 1;
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_KUDOS_AMOUNT) {
      return NextResponse.json(
        { error: `Amount must be between 1 and ${MAX_KUDOS_AMOUNT}` },
        { status: 400 },
      );
    }

    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json(
        { error: `Reason must be ${MAX_REASON_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    // The recipient must be a member of the caller's own church. The lookup
    // is scoped by BOTH the member id and the church id.
    const { data: targetRows, error: targetError } = await supabase
      .from('members')
      .select('id, user_id, name')
      .eq('id', toMemberId)
      .limit(1);

    if (targetError) {
      console.error('POST /api/kudos (recipient) failed:', targetError.message);
      return NextResponse.json({ error: 'Failed to give kudos' }, { status: 500 });
    }

    const target = (targetRows as { id: string; user_id: string; name: string }[])[0];
    if (!target) {
      return NextResponse.json(
        { error: 'That member is not in your church' },
        { status: 400 },
      );
    }

    const { data: targetMemberships, error: membershipError } = await supabase
      .from('church_members')
      .select('id')
      .eq('user_id', target.user_id)
      .eq('church_id', churchId)
      .limit(1);

    if (membershipError) {
      console.error('POST /api/kudos (membership) failed:', membershipError.message);
      return NextResponse.json({ error: 'Failed to give kudos' }, { status: 500 });
    }

    if (!targetMemberships || targetMemberships.length === 0) {
      return NextResponse.json(
        { error: 'That member is not in your church' },
        { status: 400 },
      );
    }

    if (target.user_id === userId) {
      return NextResponse.json(
        { error: 'You cannot give kudos to yourself' },
        { status: 400 },
      );
    }

    // The giver's name is denormalized so the feed can still name someone who
    // has since left the church.
    const { data: giverRows } = await supabase
      .from('members')
      .select('name')
      .eq('user_id', userId)
      .limit(1);
    const fromName = (giverRows as { name: string }[])[0]?.name ?? '';

    const { data: inserted, error: insertError } = await supabase
      .from('kudos')
      .insert({
        church_id: churchId,
        to_member_id: toMemberId,
        from_user_id: userId,
        from_name: fromName,
        amount,
        reason,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('POST /api/kudos failed:', insertError.message);
      return NextResponse.json({ error: 'Failed to give kudos' }, { status: 500 });
    }

    const row = inserted as KudosRow;
    const bundle = await loadChurchMembers(churchId);
    const member = bundle.members.find((entry) => entry.id === toMemberId);

    // The bell rings for the recipient. A failure here never fails the
    // kudos -- the recognition still happened.
    await createNotification({
      userId: target.user_id,
      churchId,
      actorUserId: userId,
      actorName: fromName,
      type: 'kudos',
      title: 'You received kudos!',
      message: reason
        ? `${fromName || 'Someone'} gave you ${amount} kudos for "${reason}"`
        : `${fromName || 'Someone'} gave you ${amount} kudos`,
      actionUrl: '/kudos',
    });

    const entry = mapKudos(row, {
      memberName: member?.name ?? target.name,
      memberAvatar: member?.avatar ?? '',
      campusName: member?.campus ?? '',
    });

    return NextResponse.json({ kudos: entry, demo: false }, { status: 201 });
  } catch (error) {
    console.error('POST /api/kudos threw:', error);
    return NextResponse.json({ error: 'Failed to give kudos' }, { status: 500 });
  }
}
