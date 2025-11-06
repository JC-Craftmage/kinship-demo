// API route for fetching church questionnaire

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

    // Fetch active questionnaire questions for this church
    const { data: questions, error } = await supabase
      .from('church_questionnaires')
      .select('id, question, is_required, display_order')
      .eq('church_id', churchId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching questionnaire:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: questions || []
    });

  } catch (error) {
    console.error('Unexpected error fetching questionnaire:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
