// Offers Board — what members of one church are offering to share.
//
// Scope: the caller's own church, derived from the caller's membership.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadCampusNames, loadAvatars, campusLabel } from '@/lib/supabase/lookups';
import { mapOffer } from '@/lib/board-mappers';
import type { Offer } from '@/lib/types';

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

    const { data: offerRows, error } = await supabase
      .from('offers')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/offers failed:', error.message);
      return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 });
    }

    const rows = offerRows ?? [];
    const campusNames = await loadCampusNames(churchId);
    const avatars = await loadAvatars(rows.map((row) => row.provided_by));

    const mapped = rows.map((row) =>
      mapOffer(row, {
        posterAvatar: avatars.get(row.provided_by) ?? '',
        campusName: campusLabel(
          row.campus_id ? campusNames.get(row.campus_id) : undefined,
        ),
      }),
    );

    const offers = mapped.filter((offer): offer is Offer => offer !== null);
    const dropped = mapped.length - offers.length;
    if (dropped > 0) {
      console.warn(`GET /api/offers dropped ${dropped} row(s) with an unmapped category or availability`);
    }

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('GET /api/offers threw:', error);
    return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 });
  }
}
