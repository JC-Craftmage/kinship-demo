// API route for searching existing churches

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        churches: [],
        message: 'Search query too short'
      });
    }

    // Search for churches by name (case-insensitive)
    const { data: churches, error } = await supabase
      .from('churches')
      .select(`
        id,
        name,
        description,
        created_at,
        campuses (
          id,
          name,
          location
        )
      `)
      .ilike('name', `%${query.trim()}%`)
      .limit(10);

    if (error) {
      console.error('Error searching churches:', error);
      return NextResponse.json(
        { error: 'Failed to search churches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      churches: churches || [],
      query: query.trim()
    });

  } catch (error) {
    console.error('Unexpected error in church search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
