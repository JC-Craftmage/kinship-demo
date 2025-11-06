// API route for approving join requests

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(
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

    const requestId = params.id;
    const body = await request.json();
    const { reviewNote } = body;

    // Fetch the join request
    const { data: joinRequest, error: fetchError } = await supabase
      .from('join_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      );
    }

    // Verify user has permission (must be Moderator or higher)
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('church_id', joinRequest.church_id)
      .eq('user_id', userId)
      .single();

    if (!membership || !['moderator', 'overseer', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to approve requests' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('church_members')
      .select('id')
      .eq('church_id', joinRequest.church_id)
      .eq('user_id', joinRequest.user_id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this church' },
        { status: 400 }
      );
    }

    // Add user as a church member
    const { error: memberError } = await supabase
      .from('church_members')
      .insert({
        church_id: joinRequest.church_id,
        campus_id: joinRequest.campus_id,
        user_id: joinRequest.user_id,
        role: 'member',
      });

    if (memberError) {
      console.error('Error adding member:', memberError);
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      );
    }

    // Update join request status
    const { error: updateError } = await supabase
      .from('join_requests')
      .update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote || null,
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating join request:', updateError);
      // Member was added, so don't fail
    }

    // TODO: Send notification to user (Phase 2)

    return NextResponse.json({
      success: true,
      message: 'Join request approved and user added as member'
    });

  } catch (error) {
    console.error('Unexpected error approving join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
