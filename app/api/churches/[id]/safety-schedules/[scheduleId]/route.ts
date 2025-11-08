// API route for managing individual safety schedules

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update a safety schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
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
    const scheduleId = params.scheduleId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can update schedules' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      safetyMemberId,
      campusId,
      scheduledDate,
      startTime,
      endTime,
      eventType,
      eventName,
      status,
      notes,
    } = body;

    // Verify the schedule exists and belongs to this church
    const { data: existingSchedule } = await supabase
      .from('safety_schedules')
      .select('id, safety_member_id, scheduled_date, start_time, end_time')
      .eq('id', scheduleId)
      .eq('church_id', churchId)
      .single();

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (safetyMemberId !== undefined) updates.safety_member_id = safetyMemberId;
    if (campusId !== undefined) updates.campus_id = campusId;
    if (scheduledDate !== undefined) updates.scheduled_date = scheduledDate;
    if (startTime !== undefined) updates.start_time = startTime;
    if (endTime !== undefined) updates.end_time = endTime;
    if (eventType !== undefined) updates.event_type = eventType;
    if (eventName !== undefined) updates.event_name = eventName;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    // If changing member or time, check for conflicts
    const memberChanged = safetyMemberId && safetyMemberId !== existingSchedule.safety_member_id;
    const dateChanged = scheduledDate && scheduledDate !== existingSchedule.scheduled_date;
    const timeChanged = (startTime && startTime !== existingSchedule.start_time) ||
                       (endTime && endTime !== existingSchedule.end_time);

    if (memberChanged || dateChanged || timeChanged) {
      const checkMemberId = safetyMemberId || existingSchedule.safety_member_id;
      const checkDate = scheduledDate || existingSchedule.scheduled_date;
      const checkStartTime = startTime || existingSchedule.start_time;
      const checkEndTime = endTime || existingSchedule.end_time;

      const { data: conflicts } = await supabase
        .from('safety_schedules')
        .select('id')
        .eq('safety_member_id', checkMemberId)
        .eq('scheduled_date', checkDate)
        .in('status', ['scheduled', 'completed'])
        .neq('id', scheduleId)
        .or(`and(start_time.lte.${checkEndTime},end_time.gte.${checkStartTime})`);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: 'This member is already scheduled during this time period' },
          { status: 409 }
        );
      }
    }

    // Update the schedule
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('safety_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .eq('church_id', churchId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating schedule:', updateError);
      return NextResponse.json(
        { error: 'Failed to update schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule: updatedSchedule,
    });

  } catch (error) {
    console.error('Unexpected error updating schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a safety schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
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
    const scheduleId = params.scheduleId;

    // Verify user is owner or overseer
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can delete schedules' },
        { status: 403 }
      );
    }

    // Verify the schedule exists and belongs to this church
    const { data: existingSchedule } = await supabase
      .from('safety_schedules')
      .select('id')
      .eq('id', scheduleId)
      .eq('church_id', churchId)
      .single();

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Delete the schedule
    const { error: deleteError } = await supabase
      .from('safety_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('church_id', churchId);

    if (deleteError) {
      console.error('Error deleting schedule:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
