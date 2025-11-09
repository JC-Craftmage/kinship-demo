// API route for managing individual ministries

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update a ministry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string } }
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
    const ministryId = params.ministryId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can update ministries' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      category,
      description,
      leaderUserId,
      contactEmail,
      contactPhone,
      meetingInfo,
      isActive,
    } = body;

    // Verify ministry exists
    const { data: existingMinistry } = await supabase
      .from('ministries')
      .select('id, is_default')
      .eq('id', ministryId)
      .eq('church_id', churchId)
      .single();

    if (!existingMinistry) {
      return NextResponse.json(
        { error: 'Ministry not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (leaderUserId !== undefined) updates.leader_user_id = leaderUserId;
    if (contactEmail !== undefined) updates.contact_email = contactEmail;
    if (contactPhone !== undefined) updates.contact_phone = contactPhone;
    if (meetingInfo !== undefined) updates.meeting_info = meetingInfo;
    if (isActive !== undefined) updates.is_active = isActive;

    // Update ministry
    const { data: updatedMinistry, error: updateError } = await supabase
      .from('ministries')
      .update(updates)
      .eq('id', ministryId)
      .eq('church_id', churchId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating ministry:', updateError);
      return NextResponse.json(
        { error: 'Failed to update ministry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ministry updated successfully',
      ministry: updatedMinistry,
    });

  } catch (error) {
    console.error('Unexpected error updating ministry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a ministry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string } }
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
    const ministryId = params.ministryId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can delete ministries' },
        { status: 403 }
      );
    }

    // Verify ministry exists and is not a default ministry
    const { data: existingMinistry } = await supabase
      .from('ministries')
      .select('id, is_default, name')
      .eq('id', ministryId)
      .eq('church_id', churchId)
      .single();

    if (!existingMinistry) {
      return NextResponse.json(
        { error: 'Ministry not found' },
        { status: 404 }
      );
    }

    if (existingMinistry.is_default) {
      return NextResponse.json(
        { error: 'Default ministries cannot be deleted. You can deactivate them instead.' },
        { status: 400 }
      );
    }

    // Delete ministry (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('ministries')
      .delete()
      .eq('id', ministryId)
      .eq('church_id', churchId);

    if (deleteError) {
      console.error('Error deleting ministry:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete ministry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ministry deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error deleting ministry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
