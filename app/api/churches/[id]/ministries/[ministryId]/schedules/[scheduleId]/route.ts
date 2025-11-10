// API route for managing individual ministry schedules

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update a schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; scheduleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;
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

    const body = await request.json();
    const {
      volunteerId,
      scheduledDate,
      startTime,
      endTime,
      serviceType,
      serviceName,
      roleAssignment,
      campusId,
      status,
      notes,
    } = body;

    // Verify schedule exists
    const { data: existingSchedule } = await supabase
      .from('ministry_schedules')
      .select('id, volunteer_id, scheduled_date, start_time, end_time')
      .eq('id', scheduleId)
      .eq('ministry_id', ministryId)
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

    if (volunteerId !== undefined) updates.volunteer_id = volunteerId;
    if (scheduledDate !== undefined) updates.scheduled_date = scheduledDate;
    if (startTime !== undefined) updates.start_time = startTime;
    if (endTime !== undefined) updates.end_time = endTime;
    if (serviceType !== undefined) updates.service_type = serviceType;
    if (serviceName !== undefined) updates.service_name = serviceName;
    if (roleAssignment !== undefined) updates.role_assignment = roleAssignment;
    if (campusId !== undefined) updates.campus_id = campusId;
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    // Check for conflicts if volunteer, date, or time changed
    const volunteerChanged = volunteerId && volunteerId !== existingSchedule.volunteer_id;
    const dateChanged = scheduledDate && scheduledDate !== existingSchedule.scheduled_date;
    const timeChanged = (startTime && startTime !== existingSchedule.start_time) ||
                       (endTime && endTime !== existingSchedule.end_time);

    if (volunteerChanged || dateChanged || timeChanged) {
      const checkVolunteerId = volunteerId || existingSchedule.volunteer_id;
      const checkDate = scheduledDate || existingSchedule.scheduled_date;
      const checkStartTime = startTime || existingSchedule.start_time;
      const checkEndTime = endTime || existingSchedule.end_time;

      const { data: conflicts } = await supabase
        .from('ministry_schedules')
        .select('id')
        .eq('volunteer_id', checkVolunteerId)
        .eq('scheduled_date', checkDate)
        .in('status', ['scheduled', 'completed'])
        .neq('id', scheduleId)
        .or(`and(start_time.lte.${checkEndTime},end_time.gte.${checkStartTime})`);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: 'This volunteer is already scheduled during this time' },
          { status: 409 }
        );
      }
    }

    // Update schedule
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('ministry_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .eq('ministry_id', ministryId)
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
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string; scheduleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;
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

    // Verify schedule exists
    const { data: existingSchedule } = await supabase
      .from('ministry_schedules')
      .select('id')
      .eq('id', scheduleId)
      .eq('ministry_id', ministryId)
      .single();

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Delete schedule
    const { error: deleteError } = await supabase
      .from('ministry_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('ministry_id', ministryId);

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
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
