// Member Directory Page - Refactored version

'use client';

import { useState } from 'react';
import { useMembers } from '@/hooks/use-members';
import { MemberCard } from '@/components/features/directory/member-card';
import { MemberModal } from '@/components/features/directory/member-modal';
import { Member } from '@/lib/types';

export default function DirectoryPage() {
  const { filteredMembers } = useMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Kinship</h1>
          <p className="text-sm text-indigo-200">Member Directory</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Member Directory</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onSelect={setSelectedMember}
            />
          ))}
        </div>
      </div>

      {/* Member Modal */}
      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
