// API route for fetching church members

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
      .select('role')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this church' },
        { status: 403 }
      );
    }

    // Fetch all members with their details
    const { data: members, error } = await supabase
      .from('church_members')
      .select(`
        id,
        user_id,
        user_name,
        user_email,
        role,
        campus_id,
        joined_at
      `)
      .eq('church_id', churchId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedMembers = (members || []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      user_name: m.user_name || 'Unknown User',
      user_email: m.user_email || 'unknown@email.com',
      user_photo: null,
      role: m.role,
      campus_id: m.campus_id || null,
      joined_at: m.joined_at,
    }));

    return NextResponse.json({
      members: formattedMembers
    });

  } catch (error) {
    console.error('Unexpected error fetching members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
