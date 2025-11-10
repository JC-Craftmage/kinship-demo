// API route for managing individual ministry volunteers

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update a volunteer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; volunteerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;
    const volunteerId = params.volunteerId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can update volunteers' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      roleId,
      availabilityNotes,
      backgroundCheckDate,
      trainingCompleted,
      isActive,
    } = body;

    // Verify volunteer exists
    const { data: existingVolunteer } = await supabase
      .from('ministry_volunteers')
      .select('id')
      .eq('id', volunteerId)
      .eq('ministry_id', ministryId)
      .single();

    if (!existingVolunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (roleId !== undefined) updates.role_id = roleId;
    if (availabilityNotes !== undefined) updates.availability_notes = availabilityNotes;
    if (backgroundCheckDate !== undefined) updates.background_check_date = backgroundCheckDate;
    if (trainingCompleted !== undefined) updates.training_completed = trainingCompleted;
    if (isActive !== undefined) updates.is_active = isActive;

    // Update volunteer
    const { data: updatedVolunteer, error: updateError } = await supabase
      .from('ministry_volunteers')
      .update(updates)
      .eq('id', volunteerId)
      .eq('ministry_id', ministryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating volunteer:', updateError);
      return NextResponse.json(
        { error: 'Failed to update volunteer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer updated successfully',
      volunteer: updatedVolunteer,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a volunteer from a ministry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; volunteerId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;
    const volunteerId = params.volunteerId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can remove volunteers' },
        { status: 403 }
      );
    }

    // Verify volunteer exists
    const { data: existingVolunteer } = await supabase
      .from('ministry_volunteers')
      .select('id')
      .eq('id', volunteerId)
      .eq('ministry_id', ministryId)
      .single();

    if (!existingVolunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Delete volunteer
    const { error: deleteError } = await supabase
      .from('ministry_volunteers')
      .delete()
      .eq('id', volunteerId)
      .eq('ministry_id', ministryId);

    if (deleteError) {
      console.error('Error removing volunteer:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove volunteer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer removed successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
