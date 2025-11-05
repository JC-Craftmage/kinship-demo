// API route for denying join requests

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

    if (!reviewNote || !reviewNote.trim()) {
      return NextResponse.json(
        { error: 'A reason for denial is required' },
        { status: 400 }
      );
    }

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
        { error: 'You do not have permission to deny requests' },
        { status: 403 }
      );
    }

    // Update join request status
    const { error: updateError } = await supabase
      .from('join_requests')
      .update({
        status: 'denied',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote.trim(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating join request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update join request' },
        { status: 500 }
      );
    }

    // Log denial for anti-spam tracking
    const { error: logError } = await supabase
      .from('join_request_denials')
      .insert({
        church_id: joinRequest.church_id,
        user_id: joinRequest.user_id,
        denied_by: userId,
        reason: reviewNote.trim(),
      });

    if (logError) {
      console.error('Error logging denial:', logError);
      // Don't fail the request - denial was recorded
    }

    // TODO: Send notification to user (Phase 2)

    return NextResponse.json({
      success: true,
      message: 'Join request denied'
    });

  } catch (error) {
    console.error('Unexpected error denying join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
