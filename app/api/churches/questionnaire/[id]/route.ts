// API route for updating/deleting individual questionnaire questions

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
    const body = await request.json();
    const { question, isRequired } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    // Fetch question to get church_id
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('church_questionnaires')
      .select('church_id')
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
        { error: 'Only church owners can edit questions' },
        { status: 403 }
      );
    }

    // Update question
    const { error: updateError } = await supabase
      .from('church_questionnaires')
      .update({
        question: question.trim(),
        is_required: isRequired !== false,
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Error updating question:', updateError);
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error updating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Fetch question to get church_id
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('church_questionnaires')
      .select('church_id')
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
        { error: 'Only church owners can delete questions' },
        { status: 403 }
      );
    }

    // Delete question
    const { error: deleteError } = await supabase
      .from('church_questionnaires')
      .delete()
      .eq('id', questionId);

    if (deleteError) {
      console.error('Error deleting question:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error deleting question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
