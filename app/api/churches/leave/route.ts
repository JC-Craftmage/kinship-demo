// API route for leaving a church

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { membershipId, reason } = body;

    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required' },
        { status: 400 }
      );
    }

    // Verify the membership belongs to this user
    const { data: membership, error: fetchError } = await supabase
      .from('church_members')
      .select('id, user_id, church_id, role')
      .eq('id', membershipId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Check if user is the church owner
    const { data: church } = await supabase
      .from('churches')
      .select('owner_id')
      .eq('id', membership.church_id)
      .single();

    if (church?.owner_id === userId) {
      return NextResponse.json(
        { error: 'Church owners cannot leave their church. Please transfer ownership first or delete the church.' },
        { status: 400 }
      );
    }

    // Get user info for logging
    const { data: userData } = await supabase
      .from('members')
      .select('name')
      .eq('user_id', userId)
      .single();

    const userName = userData?.name || 'Unknown User';

    // Log the departure for admin visibility
    const { error: logError } = await supabase
      .from('member_departures')
      .insert({
        church_id: membership.church_id,
        user_id: userId,
        user_name: userName,
        role: membership.role,
        reason: reason || null,
      });

    if (logError) {
      console.error('Error logging departure:', logError);
      // Continue anyway - logging failure shouldn't block departure
    }

    // Delete the membership
    const { error: deleteError } = await supabase
      .from('church_members')
      .delete()
      .eq('id', membershipId);

    if (deleteError) {
      console.error('Error deleting membership:', deleteError);
      return NextResponse.json(
        { error: 'Failed to leave church' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully left church'
    });

  } catch (error) {
    console.error('Unexpected error leaving church:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
