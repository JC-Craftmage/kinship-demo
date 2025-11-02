// Asset details modal

import { AssetWithOwner } from '@/lib/types';
import { MapPin, Award } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface AssetModalProps {
  asset: AssetWithOwner | null;
  onClose: () => void;
  onViewOwner?: (owner: any) => void;
}

export function AssetModal({ asset, onClose, onViewOwner }: AssetModalProps) {
  if (!asset) return null;

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return '🚗';
      case 'equipment': return '🚜';
      case 'tools': return '🔧';
      case 'business': return '💼';
      default: return '📦';
    }
  };

  const handleRequest = () => {
    alert(`Request sent to ${asset.owner.name}!\n\nIn the real app, this would:\n• Send them a notification\n• Start a message thread\n• Track the loan request`);
  };

  return (
    <Modal
      isOpen={!!asset}
      onClose={onClose}
      headerColor="from-green-500 to-emerald-600"
      titleIcon={<div className="text-6xl">{getAssetIcon(asset.type)}</div>}
      title=""
    >
      <div className="mb-6 -mt-6">
        <h2 className="text-3xl font-bold text-gray-900">{asset.name}</h2>
        <p className="text-gray-600 text-sm mt-1">
          📅 {asset.available}
        </p>
      </div>

      <div className="space-y-6">
        {asset.description && (
          <div>
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{asset.description}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-bold text-lg mb-3">Availability</h3>
          <p className="text-gray-700">{asset.available}</p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3">Owner</h3>
          <div
            className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl cursor-pointer hover:border-indigo-400 transition"
            onClick={() => {
              if (onViewOwner) {
                onClose();
                onViewOwner(asset.owner);
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{asset.owner.avatar}</div>
              <div className="flex-1">
                <p className="font-bold text-lg">{asset.owner.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} />
                  {asset.owner.campus} Campus
                </p>
                {asset.owner.kudos >= 50 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 mt-1">
                    <Award size={12} />
                    {asset.owner.kudos} kudos
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-indigo-600 mt-3 font-medium">Click to view full profile →</p>
          </div>
        </div>

        <Button variant="success" className="w-full" onClick={handleRequest}>
          📬 Request to Borrow
        </Button>

        <p className="text-xs text-center text-gray-500">
          The owner will receive your request and can approve or suggest alternative dates
        </p>
      </div>
    </Modal>
  );
}
