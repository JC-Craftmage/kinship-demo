// Custom hook for assets management and filtering

import { useState, useMemo } from 'react';
import { members } from '@/data/members';
import { AssetWithOwner } from '@/lib/types';

type AssetFilter = 'all' | 'vehicle' | 'equipment' | 'tools' | 'business';

export function useAssets() {
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('all');

  // Flatten all assets from all members with owner information
  const allAssets = useMemo(() => {
    return members.flatMap(member =>
      member.assets.map(asset => ({
        ...asset,
        owner: member
      }))
    );
  }, []);

  // Filter assets by type
  const filteredAssets = useMemo(() => {
    if (assetFilter === 'all') return allAssets;
    return allAssets.filter(asset => asset.type === assetFilter);
  }, [allAssets, assetFilter]);

  // Get asset counts by type
  const assetCounts = useMemo(() => ({
    all: allAssets.length,
    vehicle: allAssets.filter(a => a.type === 'vehicle').length,
    equipment: allAssets.filter(a => a.type === 'equipment').length,
    tools: allAssets.filter(a => a.type === 'tools').length,
    business: allAssets.filter(a => a.type === 'business').length,
  }), [allAssets]);

  return {
    allAssets,
    filteredAssets,
    assetFilter,
    setAssetFilter,
    assetCounts,
  };
}
