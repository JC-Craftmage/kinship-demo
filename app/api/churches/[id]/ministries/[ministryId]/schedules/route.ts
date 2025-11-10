// API route for managing ministry schedules

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List schedules for a ministry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;

    // Verify membership
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this church' },
        { status: 403 }
      );
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const volunteerId = searchParams.get('volunteerId');

    // Build query
    let query = supabase
      .from('ministry_schedules')
      .select(`
        id,
        volunteer_id,
        scheduled_date,
        start_time,
        end_time,
        service_type,
        service_name,
        role_assignment,
        campus_id,
        status,
        notes,
        created_by,
        created_at,
        updated_at,
        ministry_volunteers(
          user_id,
          ministry_roles(name, role_type)
        ),
        campuses(name)
      `)
      .eq('ministry_id', ministryId);

    // Apply filters
    if (startDate) query = query.gte('scheduled_date', startDate);
    if (endDate) query = query.lte('scheduled_date', endDate);
    if (status) query = query.eq('status', status);
    if (volunteerId) query = query.eq('volunteer_id', volunteerId);

    query = query.order('scheduled_date', { ascending: true })
                 .order('start_time', { ascending: true });

    const { data: schedules, error } = await query;

    if (error) {
      console.error('Error fetching schedules:', error);
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      );
    }

    // Get user details
    const userIds = schedules?.map(s => s.ministry_volunteers?.user_id).filter(Boolean) || [];
    const { data: users } = await supabase
      .from('church_members')
      .select('user_id, user_name, user_email')
      .eq('church_id', churchId)
      .in('user_id', userIds);

    // Enrich schedules
    const enrichedSchedules = (schedules || []).map(schedule => {
      const user = users?.find(u => u.user_id === schedule.ministry_volunteers?.user_id);
      return {
        ...schedule,
        volunteerName: user?.user_name || 'Unknown',
        volunteerEmail: user?.user_email || '',
        campusName: schedule.campuses?.name || null,
        roleName: schedule.ministry_volunteers?.ministry_roles?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      schedules: enrichedSchedules,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new schedule
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        { error: 'Only owners and overseers can create schedules' },
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
      notes,
    } = body;

    if (!volunteerId || !scheduledDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'volunteerId, scheduledDate, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Verify volunteer exists and is active
    const { data: volunteer } = await supabase
      .from('ministry_volunteers')
      .select('id, is_active')
      .eq('id', volunteerId)
      .eq('ministry_id', ministryId)
      .single();

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found in this ministry' },
        { status: 404 }
      );
    }

    if (!volunteer.is_active) {
      return NextResponse.json(
        { error: 'Cannot schedule inactive volunteers' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const { data: conflicts } = await supabase
      .from('ministry_schedules')
      .select('id')
      .eq('volunteer_id', volunteerId)
      .eq('scheduled_date', scheduledDate)
      .in('status', ['scheduled', 'completed'])
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This volunteer is already scheduled during this time' },
        { status: 409 }
      );
    }

    // Create schedule
    const { data: newSchedule, error: insertError } = await supabase
      .from('ministry_schedules')
      .insert({
        ministry_id: ministryId,
        volunteer_id: volunteerId,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        service_type: serviceType || 'other',
        service_name: serviceName || null,
        role_assignment: roleAssignment || null,
        campus_id: campusId || null,
        status: 'scheduled',
        notes: notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating schedule:', insertError);
      return NextResponse.json(
        { error: 'Failed to create schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      schedule: newSchedule,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
