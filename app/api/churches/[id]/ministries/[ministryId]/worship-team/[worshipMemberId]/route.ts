// API route for managing individual worship team members

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update worship team member instruments/details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; worshipMemberId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const worshipMemberId = params.worshipMemberId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can update worship team' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      primaryInstrument,
      secondaryInstruments,
      skillLevel,
      canLead,
      notes,
    } = body;

    // Verify worship team member exists
    const { data: existingMember } = await supabase
      .from('worship_team_members')
      .select('id')
      .eq('id', worshipMemberId)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Worship team member not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (primaryInstrument !== undefined) updates.primary_instrument = primaryInstrument;
    if (secondaryInstruments !== undefined) updates.secondary_instruments = secondaryInstruments;
    if (skillLevel !== undefined) updates.skill_level = skillLevel;
    if (canLead !== undefined) updates.can_lead = canLead;
    if (notes !== undefined) updates.notes = notes;

    // Update worship team member
    const { data: updatedMember, error: updateError } = await supabase
      .from('worship_team_members')
      .update(updates)
      .eq('id', worshipMemberId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating worship team member:', updateError);
      return NextResponse.json(
        { error: 'Failed to update worship team member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Worship team member updated successfully',
      member: updatedMember,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove instrument info for a worship volunteer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; worshipMemberId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const worshipMemberId = params.worshipMemberId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can remove worship team members' },
        { status: 403 }
      );
    }

    // Verify worship team member exists
    const { data: existingMember } = await supabase
      .from('worship_team_members')
      .select('id')
      .eq('id', worshipMemberId)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Worship team member not found' },
        { status: 404 }
      );
    }

    // Delete worship team member
    const { error: deleteError } = await supabase
      .from('worship_team_members')
      .delete()
      .eq('id', worshipMemberId);

    if (deleteError) {
      console.error('Error removing worship team member:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove worship team member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Worship team member removed successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
