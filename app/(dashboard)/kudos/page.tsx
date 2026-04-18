// Kudos page - See and give kudos to church members

'use client';

import { useState, useMemo } from 'react';
import { useMembers } from '@/hooks/use-members';
import { KudosModal } from '@/components/features/kudos/kudos-modal';
import { Member } from '@/lib/types';
import { Award, Search, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock kudos leaderboard data
const MOCK_KUDOS_FEED = [
  { id: 1, memberId: 2, memberName: 'Mike Chen', memberAvatar: '👨', reason: 'Helped someone move', amount: 3, timestamp: '2026-04-17', campus: 'Downtown' },
  { id: 2, memberId: 8, memberName: 'Robert Chen', memberAvatar: '👴', reason: 'Cooked 3 meals for a new mom', amount: 5, timestamp: '2026-04-16', campus: 'Downtown' },
  { id: 3, memberId: 3, memberName: 'Lisa Thompson', memberAvatar: '👩‍🎨', reason: 'Gave rides to PT for 2 weeks', amount: 4, timestamp: '2026-04-15', campus: 'Westside' },
  { id: 4, memberId: 1, memberName: 'Sarah Johnson', memberAvatar: '👩', reason: 'Hosted the welcome committee', amount: 2, timestamp: '2026-04-14', campus: 'Downtown' },
  { id: 5, memberId: 5, memberName: 'David Martinez', memberAvatar: '👨‍💼', reason: 'Mentored a young family', amount: 3, timestamp: '2026-04-12', campus: 'Downtown' },
];

export default function KudosPage() {
  const { filteredMembers } = useMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchableMembers = useMemo(() => {
    if (!searchQuery.trim()) return filteredMembers;
    const q = searchQuery.toLowerCase();
    return filteredMembers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.skills.some(s => s.toLowerCase().includes(q)) ||
      m.interests.some(i => i.toLowerCase().includes(q))
    );
  }, [filteredMembers, searchQuery]);

  // Leaderboard: sort members by kudos
  const leaderboard = useMemo(() => {
    return [...filteredMembers]
      .sort((a, b) => b.kudos - a.kudos)
      .slice(0, 10);
  }, [filteredMembers]);

  const handleGiveKudos = (memberId: number, reason: string, amount: number) => {
    console.log(`Gave ${amount} kudos to member ${memberId} for: ${reason}`);
    // In production: POST to API, update local state
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Award size={36} />
            <div>
              <h1 className="text-3xl font-bold">Kudos</h1>
              <p className="text-yellow-100 text-sm">Celebrate the helpers in your church</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Leaderboard */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 p-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Award size={20} />
              Top Helpers This Month
            </h2>
          </div>
          <div className="divide-y">
            {leaderboard.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => {
                  setSelectedMember(member);
                  setShowKudosModal(true);
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-300 text-white' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="text-3xl">{member.avatar}</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.campus}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-yellow-500"><Award size={16} /></span>
                    <span className="font-bold text-gray-900">{member.kudos}</span>
                  </div>
                  <p className="text-xs text-gray-500">kudos</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No kudos data yet — be the first to recognize someone!
              </div>
            )}
          </div>
        </Card>

        {/* Give Kudos */}
        <Card className="p-6">
          <h2 className="font-bold text-xl text-gray-900 mb-1">Give Kudos</h2>
          <p className="text-gray-600 text-sm mb-4">Recognize someone who's been a blessing</p>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a church member..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Member Grid */}
          <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {searchableMembers.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  setShowKudosModal(true);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition"
              >
                <div className="text-4xl">{member.avatar}</div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-900 truncate w-full">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.campus}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={12} className="text-yellow-500" />
                  <span className="text-xs font-bold text-gray-700">{member.kudos}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Kudos Feed */}
        <Card className="overflow-hidden">
          <div className="bg-gray-50 border-b p-4">
            <h2 className="font-bold text-gray-900 text-lg">Recent Recognition</h2>
          </div>
          <div className="divide-y">
            {MOCK_KUDOS_FEED.map(entry => (
              <div key={entry.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{entry.memberAvatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{entry.memberName}</span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">
                        +{entry.amount} ⭐
                      </span>
                      <span className="text-xs text-gray-400">{getTimeAgo(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {entry.reason}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{entry.campus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Kudos Modal */}
      {selectedMember && (
        <KudosModal
          isOpen={showKudosModal}
          onClose={() => setShowKudosModal(false)}
          member={selectedMember}
          onGiveKudos={handleGiveKudos}
        />
      )}
    </div>
  );
}
