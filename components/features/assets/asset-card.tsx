// Asset card component

import { AssetWithOwner } from '@/lib/types';
import { MapPin, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AssetCardProps {
  asset: AssetWithOwner;
  onSelect: (asset: AssetWithOwner) => void;
}

export function AssetCard({ asset, onSelect }: AssetCardProps) {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return '🚗';
      case 'equipment': return '🚜';
      case 'tools': return '🔧';
      case 'business': return '💼';
      default: return '📦';
    }
  };

  return (
    <Card hover onClick={() => onSelect(asset)}>
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-t-xl border-b-2 border-green-200">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{getAssetIcon(asset.type)}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{asset.name}</h3>
            <p className="text-sm text-green-700 font-medium mt-1">
              📅 {asset.available}
            </p>
          </div>
        </div>
        {asset.description && (
          <p className="text-sm text-gray-600 mt-3">{asset.description}</p>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-2">Owned by:</p>
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="text-3xl">{asset.owner.avatar}</div>
          <div className="flex-1">
            <p className="font-bold text-sm">{asset.owner.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={10} />
              {asset.owner.campus} Campus
            </p>
            {asset.owner.kudos >= 50 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 mt-1">
                <Award size={10} />
                {asset.owner.kudos}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
