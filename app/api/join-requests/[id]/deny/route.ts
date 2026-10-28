// API route for denying join requests

import { NextRequest, NextResponse } from 'next/server';
import { demoWriteBlocked } from '@/lib/demo/mode';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/server';
import { getMembership, REQUEST_REVIEW_ROLES } from '@/lib/supabase/queries';

interface JoinRequestRow {
  id: string;
  church_id: string;
  campus_id: string | null;
  user_id: string;
  status: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Demo mode is read-only: refuse the write so fixture data can never
    // land in a real church's database.
    const demoBlocked = demoWriteBlocked();
    if (demoBlocked) return demoBlocked;
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: requestId } = await params;
    const body = await request.json();
    const { reviewNote } = body;

    if (!reviewNote || !reviewNote.trim()) {
      return NextResponse.json(
        { error: 'A reason for denial is required' },
        { status: 400 }
      );
    }

    // Fetch the join request
    const { data: joinRequests, error: fetchError } = await supabase
      .from('join_requests')
      .select('*')
      .eq('id', requestId)
      .limit(1);

    if (fetchError) {
      console.error('Error fetching join request:', fetchError);
    }

    const joinRequest = (joinRequests as JoinRequestRow[] | null)?.[0];

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      );
    }

    // Verify user has permission (must be Moderator or higher).
    // Membership lookup is scoped by BOTH user_id and the request's church_id.
    const membership = await getMembership(userId, joinRequest.church_id);

    if (!membership || !REQUEST_REVIEW_ROLES.includes(membership.role)) {
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
