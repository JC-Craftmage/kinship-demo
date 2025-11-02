// Needs Board page - Refactored version

'use client';

import { useState } from 'react';
import { useNeeds } from '@/hooks/use-needs';
import { NeedCard } from '@/components/features/needs/need-card';
import { NeedModal } from '@/components/features/needs/need-modal';
import { Need } from '@/lib/types';
import { HandHeart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NeedsPage() {
  const { needs } = useNeeds();
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);

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
            <Button variant="secondary" icon={<Plus size={20} />}>
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {needs.map((need) => (
            <NeedCard
              key={need.id}
              need={need}
              onSelect={setSelectedNeed}
            />
          ))}
        </div>
      </div>

      {/* Need Modal */}
      <NeedModal
        need={selectedNeed}
        onClose={() => setSelectedNeed(null)}
      />
    </div>
  );
}
