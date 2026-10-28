// Needs Board — the needs posted by one church.
//
// Scope: the caller's own church. The church id is derived from the caller's
// membership, never from client input, and every row read is filtered by it.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo/mode';
import { demoNeeds } from '@/lib/demo/loader';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadCampusNames, loadAvatars, campusLabel } from '@/lib/supabase/lookups';
import { mapNeed } from '@/lib/board-mappers';
import type { Need } from '@/lib/types';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type VolunteerRow = Database['public']['Tables']['need_volunteers']['Row'];

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo mode serves the fixtures instead of the database. The switch is
    // explicit and server-side; the response is flagged so the UI labels it.
    if (isDemoMode()) {
      return NextResponse.json({ needs: demoNeeds(), demo: true });
    }

    const first = await getAnyMembership(userId);
    if (!first) {
      return NextResponse.json({ error: 'No church membership' }, { status: 403 });
    }
    const membership = await getMembership(userId, first.church_id);
    if (!membership) {
      return NextResponse.json({ error: 'No church membership' }, { status: 403 });
    }
    const churchId = membership.church_id;

    const { data: needRows, error } = await supabase
      .from('needs')
      .select('*')
      .eq('church_id', churchId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/needs failed:', error.message);
      return NextResponse.json({ error: 'Failed to load needs' }, { status: 500 });
    }

    const rows = needRows ?? [];
    const needIds = rows.map((row) => row.id);

    let volunteerRows: VolunteerRow[] = [];
    if (needIds.length) {
      const { data, error: volunteerError } = await supabase
        .from('need_volunteers')
        .select('*')
        .in('need_id', needIds);
      if (volunteerError) {
        console.error('GET /api/needs (volunteers) failed:', volunteerError.message);
      }
      volunteerRows = (data ?? []) as VolunteerRow[];
    }

    const volunteersByNeed = new Map<string, VolunteerRow[]>();
    for (const volunteer of volunteerRows) {
      const list = volunteersByNeed.get(volunteer.need_id) ?? [];
      list.push(volunteer);
      volunteersByNeed.set(volunteer.need_id, list);
    }

    const campusNames = await loadCampusNames(churchId);
    const avatars = await loadAvatars([
      ...rows.map((row) => row.posted_by),
      ...volunteerRows.map((volunteer) => volunteer.user_id),
    ]);

    const mapped = rows.map((row) =>
      mapNeed(row, {
        posterAvatar: avatars.get(row.posted_by) ?? '',
        campusName: campusLabel(
          row.campus_id ? campusNames.get(row.campus_id) : undefined,
        ),
        volunteers: (volunteersByNeed.get(row.id) ?? []).map((volunteer) => ({
          name: volunteer.user_name,
          avatar: avatars.get(volunteer.user_id) ?? '',
          signedUp: true,
          confirmed:
            volunteer.status === 'accepted' || volunteer.status === 'completed',
        })),
      }),
    );

    const needs = mapped.filter((need): need is Need => need !== null);
    const dropped = mapped.length - needs.length;
    if (dropped > 0) {
      console.warn(`GET /api/needs dropped ${dropped} row(s) with an unmapped category or status`);
    }

    return NextResponse.json({ needs, demo: false });
  } catch (error) {
    console.error('GET /api/needs threw:', error);
    return NextResponse.json({ error: 'Failed to load needs' }, { status: 500 });
  }
}
