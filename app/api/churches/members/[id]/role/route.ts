// API route for changing member roles

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

    const memberId = params.id;
    const body = await request.json();
    const { role } = body;

    if (!role || !['owner', 'overseer', 'moderator', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Fetch the member to get church_id
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
        { error: 'Only church owners can change member roles' },
        { status: 403 }
      );
    }

    // Prevent removing the last owner
    if (targetMember.role === 'owner' && role !== 'owner') {
      const { data: ownerCount } = await supabase
        .from('church_members')
        .select('id', { count: 'exact', head: true })
        .eq('church_id', targetMember.church_id)
        .eq('role', 'owner');

      if (ownerCount && ownerCount.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last owner. Promote another member to owner first.' },
          { status: 400 }
        );
      }
    }

    // Update the role
    const { error: updateError } = await supabase
      .from('church_members')
      .update({ role })
      .eq('id', memberId);

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error updating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
