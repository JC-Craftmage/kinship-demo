// Bible Study Board — the groups running in one church.
//
// Scope: the caller's own church, derived from the caller's membership.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadCampusNames, loadAvatars, campusLabel } from '@/lib/supabase/lookups';
import { mapBibleStudyGroup } from '@/lib/board-mappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const { data: groupRows, error } = await supabase
      .from('bible_study_groups')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/bible-study failed:', error.message);
      return NextResponse.json({ error: 'Failed to load Bible Study groups' }, { status: 500 });
    }

    const rows = groupRows ?? [];
    const groupIds = rows.map((row) => row.id);

    let signupRows: { group_id: string }[] = [];
    if (groupIds.length) {
      const { data, error: signupError } = await supabase
        .from('bible_study_signups')
        .select('group_id')
        .in('group_id', groupIds);
      if (signupError) {
        console.error('GET /api/bible-study (signups) failed:', signupError.message);
      }
      signupRows = (data ?? []) as { group_id: string }[];
    }

    const memberCounts = new Map<string, number>();
    for (const signup of signupRows) {
      memberCounts.set(signup.group_id, (memberCounts.get(signup.group_id) ?? 0) + 1);
    }

    const campusNames = await loadCampusNames(churchId);
    const avatars = await loadAvatars(rows.map((row) => row.leader_id));

    const groups = rows.map((row) =>
      mapBibleStudyGroup(row, {
        campusName: campusLabel(
          row.campus_id ? campusNames.get(row.campus_id) : undefined,
        ),
        leaderAvatar: avatars.get(row.leader_id) ?? '',
        memberCount: memberCounts.get(row.id) ?? 0,
      }),
    );

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('GET /api/bible-study threw:', error);
    return NextResponse.json({ error: 'Failed to load Bible Study groups' }, { status: 500 });
  }
}
