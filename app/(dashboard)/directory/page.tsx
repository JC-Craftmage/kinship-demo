// Member Directory Page - Refactored version

'use client';

import { useState, useMemo } from 'react';
import { useMembers } from '@/hooks/use-members';
import { MemberCard } from '@/components/features/directory/member-card';
import { MemberModal } from '@/components/features/directory/member-modal';
import { Member } from '@/lib/types';
import { Search, Users } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default function DirectoryPage() {
  const { filteredMembers } = useMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const searchedMembers = useMemo(() => {
    if (!searchQuery.trim()) return filteredMembers;
    const q = searchQuery.toLowerCase();
    return filteredMembers.filter(member =>
      member.name.toLowerCase().includes(q) ||
      member.skills.some(s => s.toLowerCase().includes(q)) ||
      member.interests.some(i => i.toLowerCase().includes(q)) ||
      member.campus.toLowerCase().includes(q) ||
      (member.jobTitle && member.jobTitle.toLowerCase().includes(q)) ||
      (member.company && member.company.toLowerCase().includes(q))
    );
  }, [filteredMembers, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        <DashboardHeader
          title="Member Directory"
          subtitle="Find and connect with church members"
        />

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
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
              {searchedMembers.length === 0
                ? 'No members found'
                : `${searchedMembers.length} member${searchedMembers.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>

        {searchedMembers.length === 0 && !searchQuery ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Members Yet</h3>
            <p className="text-gray-600">Members will appear here once your church grows.</p>
          </div>
        ) : searchedMembers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches</h3>
            <p className="text-gray-600">Try different search terms.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {searchedMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onSelect={setSelectedMember}
            />
          ))}
        </div>
      </div>

      )}</div>
        )}
      </div>

      {/* Member Modal */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
