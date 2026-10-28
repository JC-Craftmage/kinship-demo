'use client';

// Assets Board — loads the assets shared by the caller's church members.

import { useMemo, useState } from 'react';
import { useBoardData } from './use-board-data';
import { AssetWithOwner } from '@/lib/types';

type AssetFilter = 'all' | 'vehicle' | 'equipment' | 'tools' | 'business';

export function useAssets() {
  const { data, loading, error, refresh } = useBoardData<{ assets: AssetWithOwner[] }>('/api/assets');
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('all');

  const allAssets = useMemo(() => data?.assets ?? [], [data]);

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
    loading,
    error,
    refresh,
  };
}
