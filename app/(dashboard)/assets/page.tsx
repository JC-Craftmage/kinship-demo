// Assets page - Refactored version

'use client';

import { useState } from 'react';
import { useAssets } from '@/hooks/use-assets';
import { AssetCard } from '@/components/features/assets/asset-card';
import { AssetModal } from '@/components/features/assets/asset-modal';
import { AssetWithOwner } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function AssetsPage() {
  const { filteredAssets, assetFilter, setAssetFilter, assetCounts } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<AssetWithOwner | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Kinship</h1>
          <p className="text-sm text-indigo-200">Community Assets</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Available Assets</h2>
          <p className="text-gray-600 mb-4">Equipment, vehicles, and resources you can borrow from church members</p>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={assetFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setAssetFilter('all')}
            >
              All Assets ({assetCounts.all})
            </Button>
            <Button
              variant={assetFilter === 'vehicle' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setAssetFilter('vehicle')}
            >
              🚗 Vehicles ({assetCounts.vehicle})
            </Button>
            <Button
              variant={assetFilter === 'equipment' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setAssetFilter('equipment')}
            >
              🚜 Equipment ({assetCounts.equipment})
            </Button>
            {assetCounts.business > 0 && (
              <Button
                variant={assetFilter === 'business' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAssetFilter('business')}
              >
                💼 Business ({assetCounts.business})
              </Button>
            )}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset, i) => (
            <AssetCard
              key={i}
              asset={asset}
              onSelect={setSelectedAsset}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">No assets in this category</h3>
            <p className="text-gray-600">Try selecting a different filter</p>
          </div>
        )}
      </div>

      {/* Asset Modal */}
      <AssetModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
}
