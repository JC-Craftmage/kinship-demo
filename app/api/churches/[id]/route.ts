// API route for fetching individual church details

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

    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Fetch church with all campus details
    const { data: church, error } = await supabase
      .from('churches')
      .select(`
        id,
        name,
        description,
        created_at,
        campuses (
          id,
          name,
          location,
          address,
          zip_code,
          latitude,
          longitude
        )
      `)
      .eq('id', churchId)
      .single();

    if (error) {
      console.error('Error fetching church:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Church not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch church' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      church
    });

  } catch (error) {
    console.error('Unexpected error fetching church:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
