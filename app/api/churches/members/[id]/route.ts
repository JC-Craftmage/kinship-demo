// API route for removing church members

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function DELETE(
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

    const memberId = params.id;

    // Fetch the member to get church_id and role
    const { data: targetMember, error: fetchError } = await supabase
      .from('church_members')
      .select('church_id, user_id, role')
      .eq('id', memberId)
      .single();

    if (fetchError || !targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Verify the requester is a church owner
    const { data: requesterMembership } = await supabase
      .from('church_members')
      .select('role')
      .eq('church_id', targetMember.church_id)
      .eq('user_id', userId)
      .single();

    if (!requesterMembership || requesterMembership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can remove members' },
        { status: 403 }
      );
    }

    // Prevent removing an owner
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove church owners. Demote them first.' },
        { status: 400 }
      );
    }

    // Prevent self-removal
    if (targetMember.user_id === userId) {
      return NextResponse.json(
        { error: 'You cannot remove yourself. Use "Leave Church" instead.' },
        { status: 400 }
      );
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from('church_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error removing member:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    // TODO: Log removal in member_departures table

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Unexpected error removing member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
