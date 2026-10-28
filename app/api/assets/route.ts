// Assets Board — the equipment, vehicles and tools church members share.
//
// Scope: the caller's own church, derived from the caller's membership.

import { NextResponse } from 'next/server';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadChurchMembers } from '@/lib/supabase/members';
import { isDemoMode } from '@/lib/demo/mode';
import { demoAssets } from '@/lib/demo/loader';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo mode serves the fixtures instead of the database. The switch is
    // explicit and server-side; the response is flagged so the UI labels it.
    if (isDemoMode()) {
      return NextResponse.json({ assets: demoAssets(), demo: true });
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

    const { assets } = await loadChurchMembers(churchId);

    return NextResponse.json({ assets, demo: false });
  } catch (error) {
    console.error('GET /api/assets threw:', error);
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 });
  }
}
