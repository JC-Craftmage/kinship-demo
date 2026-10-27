// API route for fetching the current user's church membership.
//
// Replaces the browser-side Supabase query that previously exposed the anon
// key to the client. The browser now asks the server, which resolves the
// Clerk user and returns only that user's own membership.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getUserId, getAnyMembership } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const membership = await getAnyMembership(userId);

    if (!membership) {
      // Not an error - the user simply hasn't joined a church yet.
      return NextResponse.json({ membership: null });
    }

    const { data: church } = await supabase
      .from('churches')
      .select('id, name')
      .eq('id', membership.church_id)
      .limit(1);

    let campusName: string | null = null;

    if (membership.campus_id) {
      const { data: campus } = await supabase
        .from('campuses')
        .select('id, name')
        .eq('id', membership.campus_id)
        .limit(1);

      campusName = (campus as { name: string }[] | null)?.[0]?.name ?? null;
    }

    return NextResponse.json({
      membership: {
        id: membership.id,
        churchId: membership.church_id,
        churchName: (church as { name: string }[] | null)?.[0]?.name ?? null,
        campusId: membership.campus_id,
        campusName,
        role: membership.role,
        joinedAt: membership.joined_at,
      },
    });

  } catch (error) {
    console.error('Unexpected error fetching membership:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
