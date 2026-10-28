// Meal Trains — the meal calendars running in one church.
//
// Scope: the caller's own church, derived from the caller's membership.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getUserId, getAnyMembership, getMembership } from '@/lib/supabase/queries';
import { loadCampusNames, campusLabel } from '@/lib/supabase/lookups';
import { buildMealSlots, mapMealTrain } from '@/lib/board-mappers';
import type { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

type MealSignupRow = Database['public']['Tables']['meal_signups']['Row'];

/** The recipient has no user account, so the card gets a neutral emoji. */
const RECIPIENT_AVATAR = '🍲';

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

    const { data: trainRows, error } = await supabase
      .from('meal_trains')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/meal-trains failed:', error.message);
      return NextResponse.json({ error: 'Failed to load meal trains' }, { status: 500 });
    }

    const rows = trainRows ?? [];
    const trainIds = rows.map((row) => row.id);

    let signupRows: MealSignupRow[] = [];
    if (trainIds.length) {
      const { data, error: signupError } = await supabase
        .from('meal_signups')
        .select('*')
        .in('meal_train_id', trainIds);
      if (signupError) {
        console.error('GET /api/meal-trains (signups) failed:', signupError.message);
      }
      signupRows = (data ?? []) as MealSignupRow[];
    }

    const signupsByTrain = new Map<string, MealSignupRow[]>();
    for (const signup of signupRows) {
      const list = signupsByTrain.get(signup.meal_train_id) ?? [];
      list.push(signup);
      signupsByTrain.set(signup.meal_train_id, list);
    }

    const campusNames = await loadCampusNames(churchId);

    const mealTrains = rows.map((row) =>
      mapMealTrain(row, {
        campusName: campusLabel(
          row.campus_id ? campusNames.get(row.campus_id) : undefined,
        ),
        recipientAvatar: RECIPIENT_AVATAR,
        signups: buildMealSlots(
          row.start_date,
          row.end_date,
          signupsByTrain.get(row.id) ?? [],
          userId,
        ),
      }),
    );

    return NextResponse.json({ mealTrains });
  } catch (error) {
    console.error('GET /api/meal-trains threw:', error);
    return NextResponse.json({ error: 'Failed to load meal trains' }, { status: 500 });
  }
}
