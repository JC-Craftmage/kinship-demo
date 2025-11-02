// API route for generating invite codes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';

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
    const { churchId, campusId, maxUses, expiresInDays } = body;

    // Validate required fields
    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Verify user has permission to create invites for this church
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

    // Only owners and overseers can create invites
    if (!['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create invites' },
        { status: 403 }
      );
    }

    // Generate unique invite code (8 characters, URL-safe)
    const code = nanoid(8);

    // Calculate expiration date if specified
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expiresInDays);
      expiresAt = expireDate.toISOString();
    }

    // Create invite code
    const { data: invite, error: inviteError } = await supabase
      .from('invite_codes')
      .insert({
        church_id: churchId,
        campus_id: campusId || null,
        code,
        created_by: userId,
        max_uses: maxUses || null,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite code:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invite code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.code,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/welcome/join-church?code=${invite.code}`,
      },
    });

  } catch (error) {
    console.error('Unexpected error in invite generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
