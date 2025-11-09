// API route for managing church ministries

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List all ministries for a church
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
        { error: 'You must be a member of this church to view ministries' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    // Build query
    let query = supabase
      .from('ministries')
      .select(`
        id,
        name,
        category,
        description,
        is_active,
        is_default,
        leader_user_id,
        contact_email,
        contact_phone,
        meeting_info,
        created_at,
        updated_at
      `)
      .eq('church_id', churchId)
      .order('name', { ascending: true });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: ministries, error } = await query;

    if (error) {
      console.error('Error fetching ministries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ministries' },
        { status: 500 }
      );
    }

    // Get leader names
    const leaderIds = ministries?.map(m => m.leader_user_id).filter(Boolean) || [];
    let leaderNames: Record<string, string> = {};

    if (leaderIds.length > 0) {
      const { data: leaders } = await supabase
        .from('church_members')
        .select('user_id, user_name')
        .eq('church_id', churchId)
        .in('user_id', leaderIds);

      leaderNames = (leaders || []).reduce((acc, leader) => {
        acc[leader.user_id] = leader.user_name;
        return acc;
      }, {} as Record<string, string>);
    }

    // Get volunteer counts for each ministry
    const ministryIds = ministries?.map(m => m.id) || [];
    const { data: volunteerCounts } = await supabase
      .from('ministry_volunteers')
      .select('ministry_id')
      .in('ministry_id', ministryIds)
      .eq('is_active', true);

    const countsByMinistry = (volunteerCounts || []).reduce((acc, vol) => {
      acc[vol.ministry_id] = (acc[vol.ministry_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Enrich ministries
    const enrichedMinistries = (ministries || []).map(ministry => ({
      ...ministry,
      leaderName: ministry.leader_user_id ? leaderNames[ministry.leader_user_id] : null,
      volunteerCount: countsByMinistry[ministry.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      ministries: enrichedMinistries,
    });

  } catch (error) {
    console.error('Unexpected error fetching ministries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new ministry
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
        { error: 'Only owners and overseers can create ministries' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      category,
      description,
      leaderUserId,
      contactEmail,
      contactPhone,
      meetingInfo,
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'name and category are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const { data: existing } = await supabase
      .from('ministries')
      .select('id')
      .eq('church_id', churchId)
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A ministry with this name already exists' },
        { status: 409 }
      );
    }

    // Create ministry
    const { data: newMinistry, error: insertError } = await supabase
      .from('ministries')
      .insert({
        church_id: churchId,
        name: name,
        category: category,
        description: description || null,
        leader_user_id: leaderUserId || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        meeting_info: meetingInfo || null,
        is_active: true,
        is_default: false,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating ministry:', insertError);
      return NextResponse.json(
        { error: 'Failed to create ministry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ministry created successfully',
      ministry: newMinistry,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error creating ministry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
