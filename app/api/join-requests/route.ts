// API route for fetching join requests

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const churchId = searchParams.get('churchId');
    const status = searchParams.get('status');

    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Verify user has permission (must be Moderator or higher)
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .single();

    if (!membership || !['moderator', 'overseer', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to view join requests' },
        { status: 403 }
      );
    }

    // Fetch join requests
    let query = supabase
      .from('join_requests')
      .select(`
        id,
        user_name,
        user_email,
        user_photo,
        personal_note,
        status,
        created_at,
        campus_id,
        campuses (
          id,
          name
        )
      `)
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching join requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch join requests' },
        { status: 500 }
      );
    }

    // Fetch questionnaire responses for each request
    const requestsWithResponses = await Promise.all(
      (requests || []).map(async (request) => {
        const { data: responses } = await supabase
          .from('join_request_responses')
          .select(`
            answer,
            church_questionnaires (
              question
            )
          `)
          .eq('join_request_id', request.id);

        return {
          ...request,
          campus: request.campuses || null,
          responses: (responses || []).map((r: any) => ({
            question: r.church_questionnaires?.question || 'Unknown Question',
            answer: r.answer,
          })),
        };
      })
    );

    return NextResponse.json({
      requests: requestsWithResponses
    });

  } catch (error) {
    console.error('Unexpected error fetching join requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
