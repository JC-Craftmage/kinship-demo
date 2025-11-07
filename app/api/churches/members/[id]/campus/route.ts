// API route for assigning a member to a campus

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function PUT(
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

    const membershipId = params.id;

    // Parse request body
    const body = await request.json();
    const { campusId } = body;

    // Get member's church_id
    const { data: member, error: memberError } = await supabase
      .from('church_members')
      .select('church_id')
      .eq('id', membershipId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Verify user has permission (Owner or Overseer)
    const { data: requestorMembership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', member.church_id)
      .single();

    if (!requestorMembership || !['owner', 'overseer'].includes(requestorMembership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can assign campuses' },
        { status: 403 }
      );
    }

    // If campusId is provided, verify it belongs to the same church
    if (campusId) {
      const { data: campus } = await supabase
        .from('campuses')
        .select('church_id')
        .eq('id', campusId)
        .single();

      if (!campus || campus.church_id !== member.church_id) {
        return NextResponse.json(
          { error: 'Invalid campus' },
          { status: 400 }
        );
      }
    }

    // Update member's campus assignment
    const { error: updateError } = await supabase
      .from('church_members')
      .update({ campus_id: campusId || null })
      .eq('id', membershipId);

    if (updateError) {
      console.error('Error updating campus assignment:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign campus' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: campusId ? 'Campus assigned successfully' : 'Campus assignment removed',
    });

  } catch (error) {
    console.error('Unexpected error assigning campus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
