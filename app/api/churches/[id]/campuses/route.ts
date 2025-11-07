// API route for fetching campuses of a church

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

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
      .select('id')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this church' },
        { status: 403 }
      );
    }

    // Fetch all campuses for this church
    const { data: campuses, error: campusError } = await supabase
      .from('campuses')
      .select('id, name, location, address, latitude, longitude, zip_code, created_at')
      .eq('church_id', churchId)
      .order('name', { ascending: true });

    if (campusError) {
      console.error('Error fetching campuses:', campusError);
      return NextResponse.json(
        { error: 'Failed to fetch campuses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campuses: campuses || [],
    });

  } catch (error) {
    console.error('Unexpected error fetching campuses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Verify user is an owner of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can add campuses' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, location, address, zip_code } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Campus name is required' },
        { status: 400 }
      );
    }

    // Create campus
    const { data: campus, error: campusError } = await supabase
      .from('campuses')
      .insert({
        church_id: churchId,
        name: name.trim(),
        location: location?.trim() || null,
        address: address?.trim() || null,
        zip_code: zip_code?.trim() || null,
      })
      .select()
      .single();

    if (campusError) {
      console.error('Error creating campus:', campusError);
      return NextResponse.json(
        { error: 'Failed to create campus' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campus,
    });

  } catch (error) {
    console.error('Unexpected error creating campus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
