// API route for toggling question active/inactive status

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

    const questionId = params.id;

    // Fetch question to get church_id and current status
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('church_questionnaires')
      .select('church_id, is_active')
      .eq('id', questionId)
      .single();

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Verify user is owner
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('church_id', existingQuestion.church_id)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can toggle questions' },
        { status: 403 }
      );
    }

    // Toggle is_active
    const { error: updateError } = await supabase
      .from('church_questionnaires')
      .update({
        is_active: !existingQuestion.is_active,
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error toggling question:', updateError);
      return NextResponse.json(
        { error: 'Failed to toggle question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question status updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error toggling question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
