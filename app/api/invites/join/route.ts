// API route for joining a church with an invite code

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
    const { code } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
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

    // Find and validate invite code
    const { data: invite, error: inviteError } = await supabase
      .from('invite_codes')
      .select(`
        *,
        churches (
          id,
          name
        ),
        campuses (
          id,
          name
        )
      `)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 404 }
      );
    }

    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 400 }
      );
    }

    // Check if invite has reached max uses
    if (invite.max_uses && invite.current_uses >= invite.max_uses) {
      return NextResponse.json(
        { error: 'This invite code has reached its maximum uses' },
        { status: 400 }
      );
    }

    // Add user to church
    const { data: newMember, error: memberError } = await supabase
      .from('church_members')
      .insert({
        church_id: invite.church_id,
        campus_id: invite.campus_id,
        user_id: userId,
        role: 'member',
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating church membership:', memberError);
      return NextResponse.json(
        { error: 'Failed to join church' },
        { status: 500 }
      );
    }

    // Increment invite code usage count
    await supabase
      .from('invite_codes')
      .update({ current_uses: invite.current_uses + 1 })
      .eq('id', invite.id);

    return NextResponse.json({
      success: true,
      church: {
        id: invite.church_id,
        name: (invite.churches as any).name,
      },
      campus: invite.campus_id ? {
        id: invite.campus_id,
        name: (invite.campuses as any).name,
      } : null,
    });

  } catch (error) {
    console.error('Unexpected error in church join:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
