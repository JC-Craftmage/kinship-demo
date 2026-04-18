// Needs Board page - Refactored version

'use client';

import { useState, useMemo } from 'react';
import { useNeeds } from '@/hooks/use-needs';
import { NeedCard } from '@/components/features/needs/need-card';
import { NeedModal } from '@/components/features/needs/need-modal';
import { PostNeedModal, PostNeedData } from '@/components/features/needs/post-need-modal';
import { Need } from '@/lib/types';
import { HandHeart, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NeedsPage() {
  const { needs } = useNeeds();
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'urgent' | 'ongoing'>('all');

  const filteredNeeds = useMemo(() => {
    return needs.filter(need => {
      const matchesSearch = searchQuery === '' ||
        need.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        need.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' ||
        (filter === 'urgent' && need.isUrgent) ||
        (filter === 'ongoing' && !need.isUrgent);
      return matchesSearch && matchesFilter;
    });
  }, [needs, searchQuery, filter]);

  const urgentCount = needs.filter(n => n.isUrgent).length;
  const ongoingCount = needs.filter(n => !n.isUrgent).length;

  const handlePostNeed = (data: PostNeedData) => {
    console.log('New need posted:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HandHeart size={36} />
              <div>
                <h1 className="text-3xl font-bold">Needs Board</h1>
                <p className="text-teal-100 text-sm">How can we help each other?</p>
              </div>
            </div>
            <Button variant="secondary" icon={<Plus size={20} />} onClick={() => setShowPostModal(true)}>
              Post Need
            </Button>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border-2 border-white/30">
            <p className="text-sm text-white/90">
              💡 <strong>Demo Tip:</strong> Click any need to see details and volunteer! Anonymous requests show as 🙏.
            </p>
          </div>
        </div>
      </div>

      {/* Needs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search needs..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 transition"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({needs.length})
            </Button>
            <Button
              variant={filter === 'urgent' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('urgent')}
              className={filter === 'urgent' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              🚨 Urgent ({urgentCount})
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('ongoing')}
            >
              Ongoing ({ongoingCount})
            </Button>
          </div>
        </div>

        {/* Needs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNeeds.map((need) => (
            <NeedCard
              key={need.id}
              need={need}
              onSelect={setSelectedNeed}
            />
          ))}
        </div>

        {filteredNeeds.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No needs found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'Be the first to post a need!'}
            </p>
          </div>
        )}
      </div>

      {/* Need Modal */}
      <NeedModal
        need={selectedNeed}
        onClose={() => setSelectedNeed(null)}
      />

      <PostNeedModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostNeed}
      />
    </div>
  );
}
