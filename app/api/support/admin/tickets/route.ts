// API route for listing support tickets for a church (admin view).
//
// Authorized by church role: only owners and overseers of that specific
// church may read its tickets. The churchId comes from the query string and
// is checked against the caller's own membership.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getUserId, requireChurchRole, ADMIN_ROLES } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const churchId = searchParams.get('churchId');
    const filter = searchParams.get('filter') || 'open';

    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Authorization: caller must be an owner or overseer of THIS church.
    const membership = await requireChurchRole(userId, churchId, ADMIN_ROLES);

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to view support tickets' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false });

    if (filter === 'open') {
      query = query.in('status', ['open', 'in_progress']);
    } else if (filter === 'resolved') {
      query = query.in('status', ['resolved', 'closed']);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    const ticketList = tickets || [];

    // Enrich tickets with the requester's name/email where we have a member record
    const userIds = Array.from(
      new Set(ticketList.map((t: { user_id: string }) => t.user_id).filter(Boolean))
    );

    const memberMap: Record<string, { name: string; email: string }> = {};

    if (userIds.length > 0) {
      const { data: members } = await supabase
        .from('members')
        .select('user_id, name, email')
        .in('user_id', userIds);

      for (const member of (members as { user_id: string; name: string; email: string }[]) || []) {
        memberMap[member.user_id] = { name: member.name, email: member.email };
      }
    }

    const enriched = ticketList.map((ticket: { user_id: string }) => ({
      ...ticket,
      user_name: memberMap[ticket.user_id]?.name,
      user_email: memberMap[ticket.user_id]?.email,
    }));

    return NextResponse.json({ tickets: enriched });

  } catch (error) {
    console.error('Unexpected error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
