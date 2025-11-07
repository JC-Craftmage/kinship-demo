// API route for managing church visibility settings

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

    const churchId = params.id;

    // Parse request body
    const body = await request.json();
    const { isPublic } = body;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean value' },
        { status: 400 }
      );
    }

    // Verify user is an owner of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can change visibility settings' },
        { status: 403 }
      );
    }

    // Update church visibility
    const { error: updateError } = await supabase
      .from('churches')
      .update({ is_public: isPublic })
      .eq('id', churchId);

    if (updateError) {
      console.error('Error updating church visibility:', updateError);
      return NextResponse.json(
        { error: 'Failed to update visibility settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isPublic
        ? 'Church is now visible in public search'
        : 'Church is now invite-only',
      isPublic,
    });

  } catch (error) {
    console.error('Unexpected error updating church visibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
