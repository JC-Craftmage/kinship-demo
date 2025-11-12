// API route for fetching ministry roles

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; ministryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = params.id;
    const ministryId = params.ministryId;

    // Verify membership
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be a member of this church' },
        { status: 403 }
      );
    }

    // Fetch roles for this ministry
    const { data: roles, error } = await supabase
      .from('ministry_roles')
      .select('id, name, description, role_type, requirements, display_order')
      .eq('ministry_id', ministryId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching ministry roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ministry roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roles: roles || [],
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
