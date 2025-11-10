// API route for managing children's ministry age groups

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

// GET: List age groups for a children's ministry
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

    // Verify ministry is children's ministry
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

    if (ministry.category !== 'childrens') {
      return NextResponse.json(
        { error: 'Age groups are only available for children\'s ministries' },
        { status: 400 }
      );
    }

    // Get age groups
    const { data: ageGroups, error } = await supabase
      .from('childrens_age_groups')
      .select('*')
      .eq('ministry_id', ministryId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching age groups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch age groups' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ageGroups: ageGroups || [],
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new age group
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
        { error: 'Only owners and overseers can manage age groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      minAge,
      maxAge,
      gradeLevel,
      roomLocation,
      maxCapacity,
      displayOrder,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Create age group
    const { data: newAgeGroup, error: insertError } = await supabase
      .from('childrens_age_groups')
      .insert({
        ministry_id: ministryId,
        name: name,
        description: description || null,
        min_age: minAge || null,
        max_age: maxAge || null,
        grade_level: gradeLevel || null,
        room_location: roomLocation || null,
        max_capacity: maxCapacity || null,
        display_order: displayOrder || 0,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating age group:', insertError);
      return NextResponse.json(
        { error: 'Failed to create age group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Age group created successfully',
      ageGroup: newAgeGroup,
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
