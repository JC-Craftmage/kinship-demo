// API route for listing all invite codes for a church

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

    // Get churchId from query params
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId');

    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Verify user has permission to view invites for this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this church' },
        { status: 403 }
      );
    }

    // Only owners and overseers can view invites
    if (!['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to view invites' },
        { status: 403 }
      );
    }

    // Fetch all invite codes for this church
    const { data: invites, error: inviteError } = await supabase
      .from('invite_codes')
      .select(`
        *,
        campuses (
          id,
          name
        )
      `)
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (inviteError) {
      console.error('Error fetching invite codes:', inviteError);
      return NextResponse.json(
        { error: 'Failed to fetch invite codes' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedInvites = (invites || []).map((invite: any) => ({
      id: invite.id,
      code: invite.code,
      campusId: invite.campus_id,
      campusName: invite.campuses?.name || null,
      createdBy: invite.created_by,
      expiresAt: invite.expires_at,
      maxUses: invite.max_uses,
      currentUses: invite.current_uses,
      isActive: invite.is_active,
      createdAt: invite.created_at,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/welcome/join-church?code=${invite.code}`,
    }));

    return NextResponse.json({
      success: true,
      invites: formattedInvites,
    });

  } catch (error) {
    console.error('Unexpected error in invite list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
