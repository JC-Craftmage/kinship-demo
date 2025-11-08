// API route for managing safety incident reports (ADMIN ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List all incident reports (admin only)
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

    // Verify user is admin (owner, overseer, or moderator)
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only admins can view incident reports' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const campusId = searchParams.get('campusId');
    const incidentType = searchParams.get('type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('incident_reports')
      .select(`
        id,
        campus_id,
        reported_by,
        incident_type,
        severity,
        title,
        description,
        location,
        occurred_at,
        people_involved,
        witnesses,
        actions_taken,
        follow_up_needed,
        follow_up_notes,
        status,
        resolved_at,
        resolved_by,
        created_at,
        updated_at,
        campuses(name)
      `)
      .eq('church_id', churchId);

    // Apply filters
    if (startDate) {
      query = query.gte('occurred_at', startDate);
    }
    if (endDate) {
      query = query.lte('occurred_at', endDate);
    }
    if (campusId) {
      query = query.eq('campus_id', campusId);
    }
    if (incidentType) {
      query = query.eq('incident_type', incidentType);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Order by most recent first
    query = query.order('occurred_at', { ascending: false });

    const { data: incidents, error } = await query;

    if (error) {
      console.error('Error fetching incidents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch incident reports' },
        { status: 500 }
      );
    }

    // Get reporter names
    const reporterIds = [...new Set([
      ...incidents?.map(i => i.reported_by) || [],
      ...incidents?.map(i => i.resolved_by).filter(Boolean) || [],
    ])];

    const { data: users } = await supabase
      .from('church_members')
      .select('user_id, user_name')
      .eq('church_id', churchId)
      .in('user_id', reporterIds);

    // Enrich incidents with user names
    const enrichedIncidents = (incidents || []).map(incident => {
      const reporter = users?.find(u => u.user_id === incident.reported_by);
      const resolver = incident.resolved_by
        ? users?.find(u => u.user_id === incident.resolved_by)
        : null;

      return {
        ...incident,
        reporterName: reporter?.user_name || 'Unknown',
        resolverName: resolver?.user_name || null,
        campusName: incident.campuses?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      incidents: enrichedIncidents,
    });

  } catch (error) {
    console.error('Unexpected error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new incident report (admin only)
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

    // Verify user is admin
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only admins can create incident reports' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      campusId,
      incidentType,
      severity,
      title,
      description,
      location,
      occurredAt,
      peopleInvolved,
      witnesses,
      actionsTaken,
      followUpNeeded,
      followUpNotes,
    } = body;

    // Validate required fields
    if (!incidentType || !severity || !title || !description || !occurredAt || !actionsTaken) {
      return NextResponse.json(
        { error: 'Missing required fields: incidentType, severity, title, description, occurredAt, actionsTaken' },
        { status: 400 }
      );
    }

    // Create incident report
    const { data: newIncident, error: insertError } = await supabase
      .from('incident_reports')
      .insert({
        church_id: churchId,
        campus_id: campusId || null,
        reported_by: userId,
        incident_type: incidentType,
        severity: severity,
        title: title,
        description: description,
        location: location || null,
        occurred_at: occurredAt,
        people_involved: peopleInvolved || null,
        witnesses: witnesses || null,
        actions_taken: actionsTaken,
        follow_up_needed: followUpNeeded || false,
        follow_up_notes: followUpNotes || null,
        status: 'open',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating incident report:', insertError);
      return NextResponse.json(
        { error: 'Failed to create incident report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Incident report created successfully',
      incident: newIncident,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating incident report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
