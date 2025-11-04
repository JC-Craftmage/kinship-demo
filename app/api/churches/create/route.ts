// API route for creating a new church

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      churchName,
      churchDescription,
      campusName,
      campusLocation,
      campusAddress,
      campusZipCode,
      campusLatitude,
      campusLongitude
    } = body;

    // Validate required fields
    if (!churchName || !campusName) {
      return NextResponse.json(
        { error: 'Church name and campus name are required' },
        { status: 400 }
      );
    }

    // Check if user already belongs to a church
    const { data: existingMembership } = await supabase
      .from('church_members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of a church' },
        { status: 400 }
      );
    }

    // Create church
    const { data: church, error: churchError } = await supabase
      .from('churches')
      .insert({
        name: churchName,
        description: churchDescription,
        owner_id: userId,
      })
      .select()
      .single();

    if (churchError) {
      console.error('Error creating church:', churchError);
      return NextResponse.json(
        { error: 'Failed to create church' },
        { status: 500 }
      );
    }

    // Create first campus
    const { data: campus, error: campusError } = await supabase
      .from('campuses')
      .insert({
        church_id: church.id,
        name: campusName,
        location: campusLocation,
        address: campusAddress,
        zip_code: campusZipCode,
        latitude: campusLatitude,
        longitude: campusLongitude,
      })
      .select()
      .single();

    if (campusError) {
      console.error('Error creating campus:', campusError);
      // Rollback: delete the church
      await supabase.from('churches').delete().eq('id', church.id);
      return NextResponse.json(
        { error: 'Failed to create campus' },
        { status: 500 }
      );
    }

    // Add user as church owner
    const { error: memberError } = await supabase
      .from('church_members')
      .insert({
        church_id: church.id,
        campus_id: campus.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) {
      console.error('Error adding church member:', memberError);
      // Rollback: delete church (will cascade to campus)
      await supabase.from('churches').delete().eq('id', church.id);
      return NextResponse.json(
        { error: 'Failed to create membership' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      church: {
        id: church.id,
        name: church.name,
      },
      campus: {
        id: campus.id,
        name: campus.name,
      },
    });

  } catch (error) {
    console.error('Unexpected error in church creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
