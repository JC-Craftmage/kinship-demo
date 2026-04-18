// Add Asset Modal - Form for listing new assets

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Check, Truck, Wrench, Briefcase } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetData) => void;
}

export interface AssetData {
  name: string;
  type: 'vehicle' | 'equipment' | 'tools' | 'business';
  description: string;
  available: string;
  restrictions: string;
}

const ASSET_TYPES = [
  { id: 'vehicle', label: 'Vehicle', icon: Truck, emoji: '🚗' },
  { id: 'equipment', label: 'Equipment', icon: Wrench, emoji: '🚜' },
  { id: 'tools', label: 'Tools', icon: Wrench, emoji: '🔧' },
  { id: 'business', label: 'Business Service', icon: Briefcase, emoji: '💼' },
];

export function AddAssetModal({ isOpen, onClose, onSubmit }: AddAssetModalProps) {
  const [assetType, setAssetType] = useState<'vehicle' | 'equipment' | 'tools' | 'business'>('vehicle');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setAssetType('vehicle');
    setName('');
    setDescription('');
    setAvailable('');
    setRestrictions('');
    setShowSuccess(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!available.trim()) newErrors.available = 'Availability is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      type: assetType,
      description: description.trim(),
      available: available.trim(),
      restrictions: restrictions.trim(),
    });

    setShowSuccess(true);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-green-500 to-emerald-600">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Asset Listed! 🎉</h2>
          <p className="text-gray-600 text-lg">
            Your {name} is now available for the community to request.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-green-500 to-emerald-600">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">List an Asset</h2>
          <p className="text-gray-600 mt-1">Share equipment, vehicles, or services with your church family</p>
        </div>

        {/* Asset Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">What type of asset?</label>
          <div className="grid grid-cols-2 gap-3">
            {ASSET_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setAssetType(type.id as typeof assetType)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  assetType === type.id
                    ? 'border-green-400 bg-green-50 ring-2 ring-green-300'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-3xl">{type.emoji}</span>
                <span className="font-semibold text-sm text-gray-700">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., 2019 F-150 Pickup Truck, Kubota Tractor"
            className={`w-full px-4 py-3 border-2 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
              errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={80}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">When is it available?</label>
          <input
            type="text"
            value={available}
            onChange={e => setAvailable(e.target.value)}
            placeholder="e.g., Weekends, Evenings, By appointment"
            className={`w-full px-4 py-3 border-2 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
              errors.available ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={100}
          />
          {errors.available && <p className="text-red-500 text-sm mt-1">{errors.available}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Details about capacity, condition, any specs that would help someone decide..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition resize-none"
            maxLength={300}
          />
        </div>

        {/* Restrictions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Restrictions (optional)</label>
          <input
            type="text"
            value={restrictions}
            onChange={e => setRestrictions(e.target.value)}
            placeholder="e.g., Must have valid driver's license, Experience required, Towing capacity 5000lbs"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            maxLength={150}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            List Asset
          </Button>
        </div>
      </div>
    </Modal>
  );
}
