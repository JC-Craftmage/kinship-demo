// Bible Study page - Refactored version

'use client';

import { useState } from 'react';
import { useBibleStudy } from '@/hooks/use-bible-study';
import { BibleStudyCard } from '@/components/features/bible-study/bible-study-card';
import { BibleStudyModal } from '@/components/features/bible-study/bible-study-modal';
import { PostGroupModal, type PostGroupData } from '@/components/features/bible-study/post-group-modal';
import { BibleStudyGroup } from '@/lib/types';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { BoardError, BoardLoading } from '@/components/ui/board-status';
import { DemoBanner } from '@/components/ui/demo-banner';

export default function BibleStudyPage() {
  const { groups, filteredGroups, searchQuery, setSearchQuery, demo, loading, error, refresh } = useBibleStudy();
  const [selectedGroup, setSelectedGroup] = useState<BibleStudyGroup | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const openGroups = groups.filter(g => g.isOpen).length;
  const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);

  const handlePostGroup = (data: PostGroupData) => {
    console.log('New group created:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {demo && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <DemoBanner />
        </div>
      )}
      <ErrorBoundary>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen size={36} />
              <div>
                <h1 className="text-3xl font-bold">Bible Study Groups</h1>
                <p className="text-indigo-100 text-sm">Find your community in God&#39;s Word</p>
              </div>
            </div>
            <Button variant="secondary" icon={<Plus size={20} />} onClick={() => setShowPostModal(true)}>
              Start a Group
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{groups.length}</div>
              <div className="text-xs text-indigo-100">Total Groups</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{openGroups}</div>
              <div className="text-xs text-indigo-100">Open Groups</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{totalMembers}</div>
              <div className="text-xs text-indigo-100">Total Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by group name, book, or topic..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition"
          />
        </div>

        {error ? (
          <BoardError message={error} onRetry={() => void refresh()} />
        ) : loading ? (
          <BoardLoading label="Loading Bible study groups" />
        ) : (
          <>
            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <BibleStudyCard
                  key={group.id}
                  group={group}
                  onSelect={setSelectedGroup}
                />
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={36} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No groups found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                  {searchQuery ? 'Try adjusting your search to find a Bible study group.' : 'Start the first Bible study group and gather in God\'s Word together!'}
                </p>
                {!searchQuery && (
                  <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowPostModal(true)}>
                    Start a Group
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Group Detail Modal */}
      <BibleStudyModal
        group={selectedGroup}
        onClose={() => setSelectedGroup(null)}
      />

      {/* Create Group Modal */}
      <PostGroupModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostGroup}
      />
      </ErrorBoundary>
    </div>
  );
}