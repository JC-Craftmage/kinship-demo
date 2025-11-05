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

    // Log the departure reason (optional: could store this in a separate table for admin review)
    if (reason) {
      console.log(`User ${userId} leaving church ${membership.church_id} with reason: ${reason}`);
      // TODO: Store departure reason in a separate table for admin visibility
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
