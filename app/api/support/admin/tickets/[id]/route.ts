// API route for updating a support ticket status (admin view).
//
// Authorization is derived from the ticket's own church_id, not from anything
// the client sends, so a caller cannot update a ticket outside their church.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getUserId, requireChurchRole, ADMIN_ROLES } from '@/lib/supabase/queries';

const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ticketId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Load the ticket so authorization is tied to its church
    const { data: tickets, error: fetchError } = await supabase
      .from('support_tickets')
      .select('id, church_id, status')
      .eq('id', ticketId)
      .limit(1);

    if (fetchError) {
      console.error('Error fetching ticket:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch ticket' },
        { status: 500 }
      );
    }

    const ticket = (tickets as { id: string; church_id: string | null; status: string }[] | null)?.[0];

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (!ticket.church_id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this ticket' },
        { status: 403 }
      );
    }

    // Authorization: caller must be an owner or overseer of the ticket's church
    const membership = await requireChurchRole(userId, ticket.church_id, ADMIN_ROLES);

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have permission to update this ticket' },
        { status: 403 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return NextResponse.json(
        { error: 'Failed to update ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
    });

  } catch (error) {
    console.error('Unexpected error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
