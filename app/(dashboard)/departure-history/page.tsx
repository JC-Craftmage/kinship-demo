'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, UserMinus, Calendar } from 'lucide-react';

interface Departure {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  role: 'owner' | 'overseer' | 'moderator' | 'member';
  reason: string | null;
  departed_at: string;
}

export default function DepartureHistoryPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [filteredDepartures, setFilteredDepartures] = useState<Departure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isOwner = role === 'owner';

  useEffect(() => {
    const fetchDepartures = async () => {
      if (!membership?.churchId || !isOwner) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/churches/${membership.churchId}/departures`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch departure history');
        }

        setDepartures(data.departures || []);
        setFilteredDepartures(data.departures || []);
      } catch (error) {
        console.error('Error fetching departure history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartures();
  }, [membership, isOwner]);

  // Filter and search logic
  useEffect(() => {
    let filtered = departures;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(d => d.role === roleFilter);
    }

    // Search by name or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.user_name.toLowerCase().includes(query) ||
        (d.user_email && d.user_email.toLowerCase().includes(query))
      );
    }

    setFilteredDepartures(filtered);
  }, [departures, searchQuery, roleFilter]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'overseer': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
          <p className="text-gray-600 mb-4">
            Only church owners can view departure history.
          </p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading departure history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Departure History</h1>
          <p className="text-gray-600">
            View members who have left your church, including their role and reason for leaving.
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name or Email
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Previous Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="overseer">Overseer</option>
                <option value="moderator">Moderator</option>
                <option value="member">Member</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredDepartures.length} of {departures.length} departures
          </div>
        </Card>

        {/* Departure List */}
        <div className="space-y-4">
          {filteredDepartures.length === 0 ? (
            <Card className="p-8 text-center">
              <UserMinus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchQuery || roleFilter !== 'all'
                  ? 'No departures match your filters'
                  : 'No Departure History'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || roleFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No members have left your church yet.'}
              </p>
            </Card>
          ) : (
            filteredDepartures.map(departure => (
              <Card key={departure.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserMinus className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-bold text-gray-900">{departure.user_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(departure.role)}`}>
                        {getRoleLabel(departure.role)}
                      </span>
                    </div>

                    {departure.user_email && (
                      <p className="text-sm text-gray-600 mb-2">{departure.user_email}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Left on {new Date(departure.departed_at).toLocaleDateString()} at{' '}
                        {new Date(departure.departed_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {departure.reason && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-700 font-bold mb-1">Reason for Leaving</p>
                        <p className="text-sm text-yellow-900">{departure.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Statistics Card */}
        {departures.length > 0 && (
          <Card className="p-6 mt-6 bg-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Departure Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Departures</p>
                <p className="text-2xl font-bold text-gray-900">{departures.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Owners</p>
                <p className="text-2xl font-bold text-purple-600">
                  {departures.filter(d => d.role === 'owner').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overseers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {departures.filter(d => d.role === 'overseer').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Moderators</p>
                <p className="text-2xl font-bold text-green-600">
                  {departures.filter(d => d.role === 'moderator').length}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
