// API route for fetching church analytics

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

    // Verify user is an owner of this church
    const { data: membership } = await supabase
      .from('church_members')
      .select('role')
      .eq('user_id', userId)
      .eq('church_id', churchId)
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only church owners can view analytics' },
        { status: 403 }
      );
    }

    // Calculate date thresholds
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Fetch all members
    const { data: allMembers } = await supabase
      .from('church_members')
      .select('role, joined_at, campus_id, campuses(name)')
      .eq('church_id', churchId);

    // Fetch join requests
    const { data: allRequests } = await supabase
      .from('join_requests')
      .select('status, created_at')
      .eq('church_id', churchId);

    // Fetch departures
    const { data: allDepartures } = await supabase
      .from('member_departures')
      .select('departed_at')
      .eq('church_id', churchId);

    // Fetch campuses
    const { data: allCampuses } = await supabase
      .from('campuses')
      .select('id, name')
      .eq('church_id', churchId);

    // Process member statistics
    const members = allMembers || [];
    const membersByRole = {
      owner: members.filter(m => m.role === 'owner').length,
      overseer: members.filter(m => m.role === 'overseer').length,
      moderator: members.filter(m => m.role === 'moderator').length,
      member: members.filter(m => m.role === 'member').length,
    };

    const recentMembers = members.filter(
      m => new Date(m.joined_at) >= thirtyDaysAgo
    ).length;

    const membersLast90Days = members.filter(
      m => new Date(m.joined_at) >= ninetyDaysAgo
    ).length;

    // Calculate growth rate
    const totalBefore90Days = members.length - membersLast90Days;
    const percentageChange = totalBefore90Days > 0
      ? ((membersLast90Days / totalBefore90Days) * 100) - 100
      : membersLast90Days > 0 ? 100 : 0;

    // Process join requests statistics
    const requests = allRequests || [];
    const requestsByStatus = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      denied: requests.filter(r => r.status === 'denied').length,
    };

    const recentRequests = requests.filter(
      r => new Date(r.created_at) >= thirtyDaysAgo
    ).length;

    // Process departure statistics
    const departures = allDepartures || [];
    const recentDepartures = departures.filter(
      d => new Date(d.departed_at) >= thirtyDaysAgo
    ).length;

    // Process campus statistics
    const campuses = allCampuses || [];
    const memberCounts = campuses.map(campus => ({
      name: campus.name,
      count: members.filter(m => m.campus_id === campus.id).length,
    }));

    // Add unassigned members
    const unassignedCount = members.filter(m => !m.campus_id).length;
    if (unassignedCount > 0) {
      memberCounts.push({
        name: 'Unassigned',
        count: unassignedCount,
      });
    }

    // Sort by count descending
    memberCounts.sort((a, b) => b.count - a.count);

    const analytics = {
      members: {
        total: members.length,
        byRole: membersByRole,
        recent: recentMembers,
      },
      joinRequests: {
        ...requestsByStatus,
        recent: recentRequests,
      },
      departures: {
        total: departures.length,
        recent: recentDepartures,
      },
      campuses: {
        total: campuses.length,
        memberCounts,
      },
      growth: {
        last30Days: recentMembers,
        last90Days: membersLast90Days,
        percentageChange: Math.round(percentageChange * 10) / 10,
      },
    };

    return NextResponse.json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error('Unexpected error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
