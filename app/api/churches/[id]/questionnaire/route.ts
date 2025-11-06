// API route for managing church questionnaire

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

    // Check if requester is owner (wants all questions) or regular user (wants only active)
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .single();

    const isOwner = membership?.role === 'owner';

    // Fetch questionnaire questions
    let query = supabase
      .from('church_questionnaires')
      .select('id, question, is_required, display_order, is_active')
      .eq('church_id', churchId)
      .order('display_order', { ascending: true });

    // Non-owners only see active questions
    if (!isOwner) {
      query = query.eq('is_active', true);
    }

    const { data: questions, error } = await query;

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

export async function POST(
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
    const body = await request.json();
    const { question, isRequired } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    // Verify user is owner
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can add questions' },
        { status: 403 }
      );
    }

    // Get max display order
    const { data: maxOrder } = await supabase
      .from('church_questionnaires')
      .select('display_order')
      .eq('church_id', churchId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder && maxOrder[0]?.display_order || 0) + 1;

    // Create question
    const { error: insertError } = await supabase
      .from('church_questionnaires')
      .insert({
        church_id: churchId,
        question: question.trim(),
        is_required: isRequired !== false,
        display_order: nextOrder,
        is_active: true,
      });

    if (insertError) {
      console.error('Error creating question:', insertError);
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question added successfully'
    });

  } catch (error) {
    console.error('Unexpected error creating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
