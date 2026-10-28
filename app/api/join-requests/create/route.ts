// API route for creating join requests

import { NextRequest, NextResponse } from 'next/server';
import { demoWriteBlocked } from '@/lib/demo/mode';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/server';
import { getMembership, campusBelongsToChurch } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    // Demo mode is read-only: refuse the write so fixture data can never
    // land in a real church's database.
    const demoBlocked = demoWriteBlocked();
    if (demoBlocked) return demoBlocked;
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

    // A campus id must belong to the church being requested
    if (campusId) {
      const campusIsInChurch = await campusBelongsToChurch(campusId, churchId);
      if (!campusIsInChurch) {
        return NextResponse.json(
          { error: 'Campus does not belong to this church' },
          { status: 400 }
        );
      }
    }

    // Check if user is already a member of this church.
    // Membership lookup is scoped by BOTH user_id and church_id.
    const existingMembership = await getMembership(userId, churchId);

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this church' },
        { status: 400 }
      );
    }

    // Check for existing pending request
    const { data: existingRequests } = await supabase
      .from('join_requests')
      .select('id, status')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(1);

    const existingRequest = (existingRequests as { id: string; status: string }[] | null)?.[0];

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
    const { data: memberRows } = await supabase
      .from('members')
      .select('name, email, avatar')
      .eq('user_id', userId)
      .limit(1);

    const memberData = (memberRows as { name: string; email: string; avatar: string | null }[] | null)?.[0];

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
      const responses = (questionnaireResponses as {
        answer?: string | null;
        questionnaireId: string;
      }[])
        .filter(r => r.answer && r.answer.trim())
        .map(r => ({
          join_request_id: joinRequest.id,
          questionnaire_id: r.questionnaireId,
          answer: (r.answer as string).trim(),
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
