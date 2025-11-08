// API route for managing individual safety team members

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update a safety team member's details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    const churchId = params.id;
    const memberId = params.memberId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can update safety team members' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      teamRole,
      specialty,
      certifications,
      phone,
      availabilityNotes,
      isActive,
    } = body;

    // Build update object (only include provided fields)
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (teamRole !== undefined) updates.team_role = teamRole;
    if (specialty !== undefined) updates.specialty = specialty;
    if (certifications !== undefined) updates.certifications = certifications;
    if (phone !== undefined) updates.phone = phone;
    if (availabilityNotes !== undefined) updates.availability_notes = availabilityNotes;
    if (isActive !== undefined) updates.is_active = isActive;

    // Verify the member exists and belongs to this church
    const { data: existingMember } = await supabase
      .from('safety_team_members')
      .select('id')
      .eq('id', memberId)
      .eq('church_id', churchId)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Safety team member not found' },
        { status: 404 }
      );
    }

    // Update the member
    const { data: updatedMember, error: updateError } = await supabase
      .from('safety_team_members')
      .update(updates)
      .eq('id', memberId)
      .eq('church_id', churchId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating safety team member:', updateError);
      return NextResponse.json(
        { error: 'Failed to update safety team member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Safety team member updated successfully',
      member: updatedMember,
    });

  } catch (error) {
    console.error('Unexpected error updating safety team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a member from the safety team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    const churchId = params.id;
    const memberId = params.memberId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can remove safety team members' },
        { status: 403 }
      );
    }

    // Verify the member exists and belongs to this church
    const { data: existingMember } = await supabase
      .from('safety_team_members')
      .select('id')
      .eq('id', memberId)
      .eq('church_id', churchId)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Safety team member not found' },
        { status: 404 }
      );
    }

    // Delete the member from safety team
    const { error: deleteError } = await supabase
      .from('safety_team_members')
      .delete()
      .eq('id', memberId)
      .eq('church_id', churchId);

    if (deleteError) {
      console.error('Error removing safety team member:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove safety team member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed from safety team successfully',
    });

  } catch (error) {
    console.error('Unexpected error removing safety team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
