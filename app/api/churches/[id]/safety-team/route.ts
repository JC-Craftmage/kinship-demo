// API route for managing church safety team roster

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List all safety team members for a church
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

    // Verify user is a member of this church (any role can view safety team)
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this church to view the safety team' },
        { status: 403 }
      );
    }

    // Fetch all safety team members with their user details
    const { data: safetyTeam, error } = await supabase
      .from('safety_team_members')
      .select(`
        id,
        user_id,
        team_role,
        specialty,
        certifications,
        phone,
        is_active,
        availability_notes,
        joined_team_at,
        created_at,
        updated_at
      `)
      .eq('church_id', churchId)
      .order('joined_team_at', { ascending: false });

    if (error) {
      console.error('Error fetching safety team:', error);
      return NextResponse.json(
        { error: 'Failed to fetch safety team members' },
        { status: 500 }
      );
    }

    // Fetch user details from church_members for each safety team member
    const userIds = safetyTeam?.map(member => member.user_id) || [];
    const { data: userDetails } = await supabase
      .from('church_members')
      .select('user_id, user_name, user_email, campuses(name)')
      .eq('church_id', churchId)
      .in('user_id', userIds);

    // Combine safety team data with user details
    const enrichedTeam = (safetyTeam || []).map(member => {
      const userInfo = userDetails?.find(u => u.user_id === member.user_id);
      return {
        ...member,
        userName: userInfo?.user_name || 'Unknown',
        userEmail: userInfo?.user_email || '',
        campus: userInfo?.campuses?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      safetyTeam: enrichedTeam,
    });

  } catch (error) {
    console.error('Unexpected error fetching safety team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a member to the safety team
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

    // Verify user is owner or overseer (only they can manage safety team)
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only owners and overseers can manage the safety team' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      targetUserId,
      teamRole,
      specialty,
      certifications,
      phone,
      availabilityNotes,
    } = body;

    // Validate required fields
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required' },
        { status: 400 }
      );
    }

    // Verify target user is a member of this church
    const { data: targetMember } = await supabase
      .from('church_members')
      .select('user_id')
      .eq('user_id', targetUserId)
      .eq('church_id', churchId)
      .single();

    if (!targetMember) {
      return NextResponse.json(
        { error: 'User must be a member of this church to join the safety team' },
        { status: 400 }
      );
    }

    // Check if already on safety team
    const { data: existing } = await supabase
      .from('safety_team_members')
      .select('id')
      .eq('church_id', churchId)
      .eq('user_id', targetUserId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This user is already on the safety team' },
        { status: 409 }
      );
    }

    // Add to safety team
    const { data: newMember, error: insertError } = await supabase
      .from('safety_team_members')
      .insert({
        church_id: churchId,
        user_id: targetUserId,
        team_role: teamRole || 'member',
        specialty: specialty || 'general',
        certifications: certifications || null,
        phone: phone || null,
        availability_notes: availabilityNotes || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding to safety team:', insertError);
      return NextResponse.json(
        { error: 'Failed to add member to safety team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member added to safety team successfully',
      member: newMember,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error adding to safety team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
