// Member Directory — the people in one church.
//
// Scope: the caller's own church, derived from the caller's membership.

import { NextResponse } from 'next/server';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadChurchMembers } from '@/lib/supabase/members';

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

    const { members } = await loadChurchMembers(churchId);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('GET /api/directory threw:', error);
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 });
  }
}
