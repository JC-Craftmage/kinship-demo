// API route for fetching a member's profile

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

    const membershipId = params.id;

    // Fetch member profile with all details
    const { data: memberProfile, error: profileError } = await supabase
      .from('church_members')
      .select(`
        id,
        user_id,
        role,
        campus_id,
        joined_at,
        churches (
          id,
          name
        ),
        campuses (
          id,
          name
        ),
        members (
          name,
          email,
          avatar,
          phone,
          bio
        )
      `)
      .eq('id', membershipId)
      .single();

    if (profileError || !memberProfile) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Verify the requesting user is a member of the same church
    const { data: requestorMembership } = await supabase
      .from('church_members')
      .select('id')
      .eq('user_id', userId)
      .eq('church_id', (memberProfile.churches as any).id)
      .single();

    if (!requestorMembership) {
      return NextResponse.json(
        { error: 'You do not have permission to view this profile' },
        { status: 403 }
      );
    }

    // Format the response
    const profile = {
      id: memberProfile.id,
      user_id: memberProfile.user_id,
      user_name: (memberProfile.members as any)?.name || 'Unknown User',
      user_email: (memberProfile.members as any)?.email || 'unknown@email.com',
      user_photo: (memberProfile.members as any)?.avatar || null,
      user_phone: (memberProfile.members as any)?.phone || null,
      user_bio: (memberProfile.members as any)?.bio || null,
      role: memberProfile.role,
      campus_id: memberProfile.campus_id,
      campus_name: memberProfile.campuses ? (memberProfile.campuses as any).name : null,
      joined_at: memberProfile.joined_at,
      church_name: (memberProfile.churches as any).name,
    };

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Unexpected error fetching member profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
