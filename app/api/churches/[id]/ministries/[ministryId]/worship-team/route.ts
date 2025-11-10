// API route for managing worship team members and instruments

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List worship team members with instruments
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

    // Verify ministry is worship team
    const { data: ministry } = await supabase
      .from('ministries')
      .select('id, category')
      .eq('id', ministryId)
      .eq('church_id', churchId)
      .single();

    if (!ministry) {
      return NextResponse.json(
        { error: 'Ministry not found' },
        { status: 404 }
      );
    }

    if (ministry.category !== 'worship') {
      return NextResponse.json(
        { error: 'This endpoint is only for worship ministries' },
        { status: 400 }
      );
    }

    // Get worship team members with instruments
    const { data: worshipTeam, error } = await supabase
      .from('worship_team_members')
      .select(`
        id,
        volunteer_id,
        primary_instrument,
        secondary_instruments,
        skill_level,
        can_lead,
        notes,
        created_at,
        updated_at,
        ministry_volunteers(
          user_id,
          is_active,
          ministry_roles(name, role_type)
        )
      `)
      .in('volunteer_id',
        supabase
          .from('ministry_volunteers')
          .select('id')
          .eq('ministry_id', ministryId)
      );

    if (error) {
      console.error('Error fetching worship team:', error);
      return NextResponse.json(
        { error: 'Failed to fetch worship team' },
        { status: 500 }
      );
    }

    // Get user details
    const userIds = worshipTeam?.map(wt => wt.ministry_volunteers?.user_id).filter(Boolean) || [];
    const { data: users } = await supabase
      .from('church_members')
      .select('user_id, user_name, user_email')
      .eq('church_id', churchId)
      .in('user_id', userIds);

    // Enrich worship team
    const enrichedWorshipTeam = (worshipTeam || []).map(member => {
      const user = users?.find(u => u.user_id === member.ministry_volunteers?.user_id);
      return {
        ...member,
        userName: user?.user_name || 'Unknown',
        userEmail: user?.user_email || '',
        isActive: member.ministry_volunteers?.is_active || false,
        roleName: member.ministry_volunteers?.ministry_roles?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      worshipTeam: enrichedWorshipTeam,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add instrument details for a worship volunteer
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
        { error: 'Only owners and overseers can manage worship team' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      volunteerId,
      primaryInstrument,
      secondaryInstruments,
      skillLevel,
      canLead,
      notes,
    } = body;

    if (!volunteerId || !primaryInstrument) {
      return NextResponse.json(
        { error: 'volunteerId and primaryInstrument are required' },
        { status: 400 }
      );
    }

    // Verify volunteer exists in this ministry
    const { data: volunteer } = await supabase
      .from('ministry_volunteers')
      .select('id')
      .eq('id', volunteerId)
      .eq('ministry_id', ministryId)
      .single();

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found in this ministry' },
        { status: 404 }
      );
    }

    // Check if already has instrument info
    const { data: existing } = await supabase
      .from('worship_team_members')
      .select('id')
      .eq('volunteer_id', volunteerId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Instrument info already exists for this volunteer. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Create worship team member
    const { data: newMember, error: insertError } = await supabase
      .from('worship_team_members')
      .insert({
        volunteer_id: volunteerId,
        primary_instrument: primaryInstrument,
        secondary_instruments: secondaryInstruments || [],
        skill_level: skillLevel || null,
        can_lead: canLead || false,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating worship team member:', insertError);
      return NextResponse.json(
        { error: 'Failed to add worship team member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Worship team member added successfully',
      member: newMember,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
