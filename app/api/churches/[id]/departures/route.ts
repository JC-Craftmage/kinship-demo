// API route for fetching departure history

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const churchId = params.id;

    // Verify user is an owner of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can view departure history' },
        { status: 403 }
      );
    }

    // Fetch all departures for this church
    const { data: departures, error: departureError } = await supabase
      .from('member_departures')
      .select('*')
      .eq('church_id', churchId)
      .order('departed_at', { ascending: false });

    if (departureError) {
      console.error('Error fetching departures:', departureError);
      return NextResponse.json(
        { error: 'Failed to fetch departure history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      departures: departures || [],
    });

  } catch (error) {
    console.error('Unexpected error fetching departure history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
