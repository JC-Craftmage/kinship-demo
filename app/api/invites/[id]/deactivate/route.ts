// API route for deactivating an invite code

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function PUT(
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

    const inviteId = params.id;

    // Fetch the invite to get church_id
    const { data: invite, error: fetchError } = await supabase
      .from('invite_codes')
      .select('church_id')
      .eq('id', inviteId)
      .single();

    if (fetchError || !invite) {
      return NextResponse.json(
        { error: 'Invite code not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to manage invites for this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', invite.church_id)
      .single();

    if (!membership || !['owner', 'overseer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to manage invites' },
        { status: 403 }
      );
    }

    // Deactivate the invite code
    const { error: updateError } = await supabase
      .from('invite_codes')
      .update({ is_active: false })
      .eq('id', inviteId);

    if (updateError) {
      console.error('Error deactivating invite code:', updateError);
      return NextResponse.json(
        { error: 'Failed to deactivate invite code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invite code deactivated successfully',
    });

  } catch (error) {
    console.error('Unexpected error deactivating invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
