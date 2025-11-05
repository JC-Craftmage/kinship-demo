// API route for creating join requests

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

    const body = await request.json();
    const { churchId, campusId, personalNote, questionnaireResponses } = body;

    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Check if user is already a member of this church
    const { data: existingMembership } = await supabase
      .from('church_members')
      .select('id')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this church' },
        { status: 400 }
      );
    }

    // Check for existing pending request
    const { data: existingRequest } = await supabase
      .from('join_requests')
      .select('id, status')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this church' },
        { status: 400 }
      );
    }

    // Check for recent denials (anti-spam: 3 denials = 90 day cooldown)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: recentDenials } = await supabase
      .from('join_request_denials')
      .select('id')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .gte('denied_at', ninetyDaysAgo.toISOString());

    if (recentDenials && recentDenials.length >= 3) {
      return NextResponse.json(
        { error: 'You have been denied multiple times. Please contact the church directly.' },
        { status: 403 }
      );
    }

    // Check weekly request limit (max 3 requests per week across all churches)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentRequests } = await supabase
      .from('join_requests')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    if (recentRequests && recentRequests.length >= 3) {
      return NextResponse.json(
        { error: 'You can only submit 3 join requests per week. Please try again later.' },
        { status: 429 }
      );
    }

    // Get user info from members table or Clerk
    const { data: memberData } = await supabase
      .from('members')
      .select('name, email, avatar')
      .eq('user_id', userId)
      .single();

    // If not in members table, we'll need to get from Clerk (or use default)
    const userName = memberData?.name || 'Unknown User';
    const userEmail = memberData?.email || 'unknown@email.com';
    const userPhoto = memberData?.avatar || null;

    // Create the join request
    const { data: joinRequest, error: requestError } = await supabase
      .from('join_requests')
      .insert({
        church_id: churchId,
        campus_id: campusId || null,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        user_photo: userPhoto,
        personal_note: personalNote || null,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating join request:', requestError);
      return NextResponse.json(
        { error: 'Failed to create join request' },
        { status: 500 }
      );
    }

    // Save questionnaire responses
    if (questionnaireResponses && questionnaireResponses.length > 0) {
      const responses = questionnaireResponses
        .filter((r: any) => r.answer && r.answer.trim())
        .map((r: any) => ({
          join_request_id: joinRequest.id,
          questionnaire_id: r.questionnaireId,
          answer: r.answer.trim(),
        }));

      if (responses.length > 0) {
        const { error: responsesError } = await supabase
          .from('join_request_responses')
          .insert(responses);

        if (responsesError) {
          console.error('Error saving questionnaire responses:', responsesError);
          // Don't fail the whole request - responses are optional
        }
      }
    }

    // TODO: Send notification to church admins (Phase 2)

    return NextResponse.json({
      success: true,
      requestId: joinRequest.id,
      message: 'Join request submitted successfully'
    });

  } catch (error) {
    console.error('Unexpected error creating join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
