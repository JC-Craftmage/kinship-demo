// API route for managing ministry volunteers

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List all volunteers for a ministry
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

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('isActive');

    // Build query
    let query = supabase
      .from('ministry_volunteers')
      .select(`
        id,
        user_id,
        role_id,
        is_active,
        availability_notes,
        background_check_date,
        training_completed,
        joined_at,
        created_at,
        updated_at,
        ministry_roles(id, name, role_type)
      `)
      .eq('ministry_id', ministryId);

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: volunteers, error } = await query;

    if (error) {
      console.error('Error fetching volunteers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch volunteers' },
        { status: 500 }
      );
    }

    // Get user details
    const userIds = volunteers?.map(v => v.user_id) || [];
    const { data: users } = await supabase
      .from('church_members')
      .select('user_id, user_name, user_email')
      .eq('church_id', churchId)
      .in('user_id', userIds);

    // Enrich volunteers
    const enrichedVolunteers = (volunteers || []).map(volunteer => {
      const user = users?.find(u => u.user_id === volunteer.user_id);
      return {
        ...volunteer,
        userName: user?.user_name || 'Unknown',
        userEmail: user?.user_email || '',
        roleName: volunteer.ministry_roles?.name || null,
        roleType: volunteer.ministry_roles?.role_type || null,
      };
    });

    return NextResponse.json({
      success: true,
      volunteers: enrichedVolunteers,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a volunteer to a ministry
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
        { error: 'Only owners and overseers can manage volunteers' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      targetUserId,
      roleId,
      availabilityNotes,
      backgroundCheckDate,
      trainingCompleted,
    } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required' },
        { status: 400 }
      );
    }

    // Verify target user is a member
    const { data: targetMember } = await supabase
      .from('church_members')
      .select('user_id')
      .eq('user_id', targetUserId)
      .eq('church_id', churchId)
      .single();

    if (!targetMember) {
      return NextResponse.json(
        { error: 'User must be a church member' },
        { status: 400 }
      );
    }

    // Verify ministry exists
    const { data: ministry } = await supabase
      .from('ministries')
      .select('id')
      .eq('id', ministryId)
      .eq('church_id', churchId)
      .single();

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministry not found' },
        { status: 404 }
      );
    }

    // Check if already a volunteer
    const { data: existing } = await supabase
      .from('ministry_volunteers')
      .select('id')
      .eq('ministry_id', ministryId)
      .eq('user_id', targetUserId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User is already a volunteer in this ministry' },
        { status: 409 }
      );
    }

    // Add volunteer
    const { data: newVolunteer, error: insertError } = await supabase
      .from('ministry_volunteers')
      .insert({
        ministry_id: ministryId,
        user_id: targetUserId,
        role_id: roleId || null,
        availability_notes: availabilityNotes || null,
        background_check_date: backgroundCheckDate || null,
        training_completed: trainingCompleted || false,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding volunteer:', insertError);
      return NextResponse.json(
        { error: 'Failed to add volunteer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer added successfully',
      volunteer: newVolunteer,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
