'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';

interface AnalyticsData {
  members: {
    total: number;
    byRole: {
      owner: number;
      overseer: number;
      moderator: number;
      member: number;
    };
    recent: number; // joined in last 30 days
  };
  joinRequests: {
    total: number;
    pending: number;
    approved: number;
    denied: number;
    recent: number; // last 30 days
  };
  departures: {
    total: number;
    recent: number; // last 30 days
  };
  campuses: {
    total: number;
    memberCounts: Array<{
      name: string;
      count: number;
    }>;
  };
  growth: {
    last30Days: number;
    last90Days: number;
    percentageChange: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = role === 'owner';

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!membership?.churchId || !isOwner) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/churches/${membership.churchId}/analytics`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics');
        }

        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [membership, isOwner]);

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
          <p className="text-gray-600 mb-4">
            Only church owners can view analytics.
          </p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Failed to load analytics'}</p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 size={32} className="text-indigo-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Insights and statistics for {membership?.churchName}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Members */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-600" />
              {analytics.members.recent > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                  +{analytics.members.recent} this month
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.members.total}</p>
          </Card>

          {/* Pending Requests */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Pending Requests</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.joinRequests.pending}</p>
          </Card>

          {/* Total Campuses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Campuses</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.campuses.total}</p>
          </Card>

          {/* Growth Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              {analytics.growth.percentageChange >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                analytics.growth.percentageChange >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {analytics.growth.percentageChange >= 0 ? '+' : ''}
                {analytics.growth.percentageChange.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">90-Day Growth</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.growth.percentageChange >= 0 ? '+' : ''}
              {analytics.growth.last90Days}
            </p>
          </Card>
        </div>

        {/* Member Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Members by Role */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Members by Role</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded">
                <span className="font-medium text-purple-900">Owners</span>
                <span className="text-2xl font-bold text-purple-600">
                  {analytics.members.byRole.owner}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <span className="font-medium text-blue-900">Overseers</span>
                <span className="text-2xl font-bold text-blue-600">
                  {analytics.members.byRole.overseer}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <span className="font-medium text-green-900">Moderators</span>
                <span className="text-2xl font-bold text-green-600">
                  {analytics.members.byRole.moderator}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                <span className="font-medium text-gray-900">Members</span>
                <span className="text-2xl font-bold text-gray-600">
                  {analytics.members.byRole.member}
                </span>
              </div>
            </div>
          </Card>

          {/* Members by Campus */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Members by Campus</h3>
            {analytics.campuses.memberCounts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No campuses configured yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.campuses.memberCounts.map((campus, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded"
                  >
                    <span className="font-medium text-indigo-900">{campus.name || 'Unassigned'}</span>
                    <span className="text-2xl font-bold text-indigo-600">{campus.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Join Requests Overview */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Join Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded">
              <Users className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.joinRequests.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{analytics.joinRequests.pending}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">{analytics.joinRequests.approved}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Denied</p>
                <p className="text-2xl font-bold text-red-900">{analytics.joinRequests.denied}</p>
              </div>
            </div>
          </div>
          {analytics.joinRequests.recent > 0 && (
            <p className="text-sm text-gray-600 mt-4">
              <strong>{analytics.joinRequests.recent}</strong> requests received in the last 30 days
            </p>
          )}
        </Card>

        {/* Member Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              Recent Joins (30 days)
            </h3>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-green-600 mb-2">{analytics.members.recent}</p>
              <p className="text-sm text-gray-600">new members</p>
            </div>
          </Card>

          {/* Departures */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-red-600" />
              Departures (30 days)
            </h3>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-red-600 mb-2">{analytics.departures.recent}</p>
              <p className="text-sm text-gray-600">members left</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
