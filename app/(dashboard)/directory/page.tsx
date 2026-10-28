// Member Directory Page - Refactored version

'use client';

import { useState } from 'react';
import { useMembers } from '@/hooks/use-members';
import { MemberCard } from '@/components/features/directory/member-card';
import { MemberModal } from '@/components/features/directory/member-modal';
import { Member } from '@/lib/types';
import { Search, Users } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { BoardError, BoardLoading } from '@/components/ui/board-status';

export default function DirectoryPage() {
  const {
    filteredMembers,
    campuses,
    campusFilter,
    setCampusFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refresh,
  } = useMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        <DashboardHeader
          title="Member Directory"
          subtitle="Find and connect with church members"
        />

      <div className="max-w-7xl mx-auto p-4">
        <ErrorBoundary>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Member Directory</h2>
          <p className="text-gray-600 text-sm mb-4">{filteredMembers.length} members in your church</p>

          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skill, interest, or campus..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition text-base"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              {filteredMembers.length === 0
                ? 'No members found'
                : `${filteredMembers.length} member${filteredMembers.length !== 1 ? 's' : ''} found`}
            </p>
          )}

          {/* Campus filters — derived from the campuses that actually have members */}
          {campuses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => setCampusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${
                  campusFilter === 'all'
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                All Campuses
              </button>
              {campuses.map(campus => (
                <button
                  key={campus}
                  type="button"
                  onClick={() => setCampusFilter(campus)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${
                    campusFilter === campus
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {campus}
                </button>
              ))}
            </div>
          )}
        </div>

        {error ? (
          <BoardError message={error} onRetry={() => void refresh()} />
        ) : loading ? (
          <BoardLoading label="Loading members" />
        ) : filteredMembers.length === 0 && !searchQuery ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Members Yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Members will appear here once your church grows.</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={36} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Try different search terms to find who you&apos;re looking for.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onSelect={setSelectedMember}
              />
            ))}
          </div>
        )}
      </ErrorBoundary>
      </div>

      {/* Member Modal */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
