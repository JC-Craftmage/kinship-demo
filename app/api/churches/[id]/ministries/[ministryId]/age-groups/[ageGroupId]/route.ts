// API route for managing individual age groups

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update an age group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; ageGroupId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;
    const ageGroupId = params.ageGroupId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can update age groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      minAge,
      maxAge,
      gradeLevel,
      roomLocation,
      maxCapacity,
      displayOrder,
      isActive,
    } = body;

    // Verify age group exists
    const { data: existingAgeGroup } = await supabase
      .from('childrens_age_groups')
      .select('id')
      .eq('id', ageGroupId)
      .eq('ministry_id', ministryId)
      .single();

    if (!existingAgeGroup) {
      return NextResponse.json(
        { error: 'Age group not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (minAge !== undefined) updates.min_age = minAge;
    if (maxAge !== undefined) updates.max_age = maxAge;
    if (gradeLevel !== undefined) updates.grade_level = gradeLevel;
    if (roomLocation !== undefined) updates.room_location = roomLocation;
    if (maxCapacity !== undefined) updates.max_capacity = maxCapacity;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    if (isActive !== undefined) updates.is_active = isActive;

    // Update age group
    const { data: updatedAgeGroup, error: updateError } = await supabase
      .from('childrens_age_groups')
      .update(updates)
      .eq('id', ageGroupId)
      .eq('ministry_id', ministryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating age group:', updateError);
      return NextResponse.json(
        { error: 'Failed to update age group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Age group updated successfully',
      ageGroup: updatedAgeGroup,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete an age group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; ageGroupId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;
    const ageGroupId = params.ageGroupId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can delete age groups' },
        { status: 403 }
      );
    }

    // Verify age group exists
    const { data: existingAgeGroup } = await supabase
      .from('childrens_age_groups')
      .select('id')
      .eq('id', ageGroupId)
      .eq('ministry_id', ministryId)
      .single();

    if (!existingAgeGroup) {
      return NextResponse.json(
        { error: 'Age group not found' },
        { status: 404 }
      );
    }

    // Delete age group
    const { error: deleteError } = await supabase
      .from('childrens_age_groups')
      .delete()
      .eq('id', ageGroupId)
      .eq('ministry_id', ministryId);

    if (deleteError) {
      console.error('Error deleting age group:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete age group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Age group deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
