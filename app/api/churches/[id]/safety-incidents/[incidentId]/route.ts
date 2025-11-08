// API route for managing individual incident reports (ADMIN ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// PUT: Update an incident report (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; incidentId: string } }
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
    const incidentId = params.incidentId;

    // Verify user is admin
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only admins can update incident reports' },
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
      status,
    } = body;

    // Verify the incident exists and belongs to this church
    const { data: existingIncident } = await supabase
      .from('incident_reports')
      .select('id, status')
      .eq('id', incidentId)
      .eq('church_id', churchId)
      .single();

    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident report not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (campusId !== undefined) updates.campus_id = campusId;
    if (incidentType !== undefined) updates.incident_type = incidentType;
    if (severity !== undefined) updates.severity = severity;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (occurredAt !== undefined) updates.occurred_at = occurredAt;
    if (peopleInvolved !== undefined) updates.people_involved = peopleInvolved;
    if (witnesses !== undefined) updates.witnesses = witnesses;
    if (actionsTaken !== undefined) updates.actions_taken = actionsTaken;
    if (followUpNeeded !== undefined) updates.follow_up_needed = followUpNeeded;
    if (followUpNotes !== undefined) updates.follow_up_notes = followUpNotes;

    // If status is being updated to 'resolved' or 'closed', set resolved info
    if (status !== undefined) {
      updates.status = status;
      if ((status === 'resolved' || status === 'closed') && existingIncident.status !== 'resolved' && existingIncident.status !== 'closed') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = userId;
      }
      // If reopening, clear resolved info
      if ((status === 'open' || status === 'under_review') && (existingIncident.status === 'resolved' || existingIncident.status === 'closed')) {
        updates.resolved_at = null;
        updates.resolved_by = null;
      }
    }

    // Update the incident
    const { data: updatedIncident, error: updateError } = await supabase
      .from('incident_reports')
      .update(updates)
      .eq('id', incidentId)
      .eq('church_id', churchId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating incident report:', updateError);
      return NextResponse.json(
        { error: 'Failed to update incident report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Incident report updated successfully',
      incident: updatedIncident,
    });

  } catch (error) {
    console.error('Unexpected error updating incident report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an incident report (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; incidentId: string } }
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
    const incidentId = params.incidentId;

    // Verify user is admin
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only admins can delete incident reports' },
        { status: 403 }
      );
    }

    // Verify the incident exists and belongs to this church
    const { data: existingIncident } = await supabase
      .from('incident_reports')
      .select('id')
      .eq('id', incidentId)
      .eq('church_id', churchId)
      .single();

    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident report not found' },
        { status: 404 }
      );
    }

    // Delete the incident
    const { error: deleteError } = await supabase
      .from('incident_reports')
      .delete()
      .eq('id', incidentId)
      .eq('church_id', churchId);

    if (deleteError) {
      console.error('Error deleting incident report:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete incident report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Incident report deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error deleting incident report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
