// API route for managing safety team schedules

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List all safety schedules for a church
export async function GET(
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

    const churchId = params.id;

    // Verify user is a member of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this church to view schedules' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const campusId = searchParams.get('campusId');
    const status = searchParams.get('status');

    // Build base query
    let query = supabase
      .from('safety_schedules')
      .select(`
        id,
        campus_id,
        safety_member_id,
        scheduled_date,
        start_time,
        end_time,
        event_type,
        event_name,
        status,
        notes,
        created_by,
        created_at,
        updated_at,
        campuses(name),
        safety_team_members(
          user_id,
          team_role,
          specialty
        )
      `)
      .eq('church_id', churchId);

    // Apply filters
    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }
    if (campusId) {
      query = query.eq('campus_id', campusId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Order by date and time
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

    // Get user details for each safety team member
    const userIds = schedules?.map(s => s.safety_team_members?.user_id).filter(Boolean) || [];
    const { data: userDetails } = await supabase
      .from('church_members')
      .select('user_id, user_name, user_email')
      .eq('church_id', churchId)
      .in('user_id', userIds);

    // Enrich schedules with user details
    const enrichedSchedules = (schedules || []).map(schedule => {
      const userInfo = userDetails?.find(
        u => u.user_id === schedule.safety_team_members?.user_id
      );
      return {
        ...schedule,
        memberName: userInfo?.user_name || 'Unknown',
        memberEmail: userInfo?.user_email || '',
        campusName: schedule.campuses?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      schedules: enrichedSchedules,
    });

  } catch (error) {
    console.error('Unexpected error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new safety schedule
export async function POST(
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

    const churchId = params.id;

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
      notes,
    } = body;

    // Validate required fields
    if (!safetyMemberId || !scheduledDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'safetyMemberId, scheduledDate, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Verify safety member exists and belongs to this church
    const { data: safetyMember } = await supabase
      .from('safety_team_members')
      .select('id, is_active')
      .eq('id', safetyMemberId)
      .eq('church_id', churchId)
      .single();

    if (!safetyMember) {
      return NextResponse.json(
        { error: 'Safety team member not found' },
        { status: 404 }
      );
    }

    if (!safetyMember.is_active) {
      return NextResponse.json(
        { error: 'Cannot schedule inactive safety team members' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts (same member, overlapping time on same date)
    const { data: conflicts } = await supabase
      .from('safety_schedules')
      .select('id')
      .eq('safety_member_id', safetyMemberId)
      .eq('scheduled_date', scheduledDate)
      .in('status', ['scheduled', 'completed'])
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This member is already scheduled during this time period' },
        { status: 409 }
      );
    }

    // Create schedule
    const { data: newSchedule, error: insertError } = await supabase
      .from('safety_schedules')
      .insert({
        church_id: churchId,
        campus_id: campusId || null,
        safety_member_id: safetyMemberId,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType || null,
        event_name: eventName || null,
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
    console.error('Unexpected error creating schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
