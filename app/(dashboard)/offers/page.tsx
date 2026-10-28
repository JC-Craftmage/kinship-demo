// Offers Board page - Refactored version

'use client';

import { useState, useMemo } from 'react';
import { useOffers } from '@/hooks/use-offers';
import { OfferCard } from '@/components/features/offers/offer-card';
import { OfferModal } from '@/components/features/offers/offer-modal';
import { PostOfferModal, type PostOfferData } from '@/components/features/offers/post-offer-modal';
import { Offer } from '@/lib/types';
import { Handshake, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { BoardError, BoardLoading } from '@/components/ui/board-status';
import { DemoBanner } from '@/components/ui/demo-banner';

export default function OffersPage() {
  const { offers, demo, loading, error, refresh } = useOffers();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'limited'>('all');

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = searchQuery === '' ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' ||
        (filter === 'available' && offer.availability === 'available') ||
        (filter === 'limited' && offer.availability === 'limited');
      return matchesSearch && matchesFilter;
    });
  }, [offers, searchQuery, filter]);

  const availableCount = offers.filter(o => o.availability === 'available').length;
  const limitedCount = offers.filter(o => o.availability === 'limited').length;

  const handlePostOffer = (data: PostOfferData) => {
    console.log('New offer posted:', data);
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
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Handshake size={36} />
              <div>
                <h1 className="text-3xl font-bold">Offers Board</h1>
                <p className="text-teal-100 text-sm">What can you offer your church family?</p>
              </div>
            </div>
            <Button variant="secondary" icon={<Plus size={20} />} onClick={() => setShowPostModal(true)}>
              Post Offer
            </Button>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border-2 border-white/30">
            <p className="text-sm text-white/90">
              💡 <strong>Demo Tip:</strong> Click any offer to contact the member directly!
            </p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search offers..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 transition"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({offers.length})
            </Button>
            <Button
              variant={filter === 'available' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('available')}
              className={filter === 'available' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              Available ({availableCount})
            </Button>
            <Button
              variant={filter === 'limited' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('limited')}
              className={filter === 'limited' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            >
              Limited ({limitedCount})
            </Button>
          </div>
        </div>

        {error ? (
          <BoardError message={error} onRetry={() => void refresh()} />
        ) : loading ? (
          <BoardLoading label="Loading offers" />
        ) : (
          <>
            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onSelect={setSelectedOffer}
                />
              ))}
            </div>

            {filteredOffers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake size={36} className="text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No offers found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                  {searchQuery ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Be the first to share what you can offer your church family!'}
                </p>
                {!searchQuery && (
                  <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowPostModal(true)}>
                    Post the First Offer
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Offer Modal */}
      <OfferModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />

      <PostOfferModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostOffer}
      />
        </ErrorBoundary>
    </div>
  );
}