// Post Offer Modal - Form for creating new offers

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { OfferCategory, OfferAvailability } from '@/lib/types';
import { Truck, Baby, Car, Wrench, Sparkles, Hammer, Package, Circle, X, Check } from 'lucide-react';
import { ProfileCompletenessGate } from '@/components/features/onboarding/profile-completeness-gate';
import { shouldShowGateForAction } from '@/hooks/use-contextual-gate';

interface PostOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostOfferData) => void;
}

export interface PostOfferData {
  title: string;
  description: string;
  category: OfferCategory;
  availability: OfferAvailability;
  availabilityNote: string;
  campus: string;
  isVerified: boolean;
}

const CATEGORIES: { value: OfferCategory; label: string; icon: React.ReactElement; color: string }[] = [
  { value: 'Moving Help', label: 'Moving Help', icon: <Truck size={20} />, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Childcare', label: 'Childcare', icon: <Baby size={20} />, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'Transportation', label: 'Transportation', icon: <Car size={20} />, color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Home Repair', label: 'Home Repair', icon: <Wrench size={20} />, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'Event Help', label: 'Event Help', icon: <Sparkles size={20} />, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Skilled Labor', label: 'Skilled Labor', icon: <Hammer size={20} />, color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'Equipment Rental', label: 'Equipment Rental', icon: <Package size={20} />, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { value: 'Other', label: 'Other', icon: <Circle size={20} />, color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

const AVAILABILITIES: { value: OfferAvailability; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'limited', label: 'Limited', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'unavailable', label: 'Unavailable', color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

const CAMPUSES = ['Downtown', 'Westside', 'Eastside', 'North Campus', 'South Campus'];

export function PostOfferModal({ isOpen, onClose, onSubmit }: PostOfferModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<OfferCategory | null>(null);
  const [availability, setAvailability] = useState<OfferAvailability>('available');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [campus, setCampus] = useState('Downtown');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGate, setShowGate] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(null);
    setAvailability('available');
    setAvailabilityNote('');
    setCampus('Downtown');
    setShowSuccess(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!availabilityNote.trim()) newErrors.availabilityNote = 'Please describe availability';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Check if profile gate should be shown
    if (shouldShowGateForAction('post_need')) {
      setPendingSubmit(true);
      setShowGate(true);
      return;
    }

    doSubmit();
  };

  const doSubmit = () => {
    const categoryIconMap: Record<OfferCategory, 'truck' | 'baby' | 'car' | 'wrench' | 'sparkles' | 'hammer' | 'package' | 'circle'> = {
      'Moving Help': 'truck',
      'Childcare': 'baby',
      'Transportation': 'car',
      'Home Repair': 'wrench',
      'Event Help': 'sparkles',
      'Skilled Labor': 'hammer',
      'Equipment Rental': 'package',
      'Other': 'circle',
    };

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: category!,
      availability,
      availabilityNote: availabilityNote.trim(),
      campus,
      isVerified: false,
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
      <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-teal-500 to-cyan-600">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Offer Posted!</h2>
          <p className="text-gray-600 text-lg">
            Your church family can now see your offer and reach out when they need help.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-teal-500 to-cyan-600">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Post an Offer</h2>
          <p className="text-gray-600 mt-1">Share what you have to offer your church family.</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">What are you offering?</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Pickup truck available on weekends"
            className={`w-full px-4 py-3 border-2 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
              errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={100}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          <p className="text-gray-400 text-xs mt-1 text-right">{title.length}/100</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                  category === cat.value
                    ? `${cat.color} border-current ring-2 ring-offset-1 ring-teal-400`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Details</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what you're offering and any relevant details..."
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none ${
              errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={500}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          <p className="text-gray-400 text-xs mt-1 text-right">{description.length}/500</p>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Status</label>
          <div className="grid grid-cols-3 gap-2">
            {AVAILABILITIES.map(a => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAvailability(a.value)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                  availability === a.value
                    ? `${a.color} border-current ring-2 ring-offset-1 ring-teal-400`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">When are you available?</label>
          <input
            type="text"
            value={availabilityNote}
            onChange={e => setAvailabilityNote(e.target.value)}
            placeholder="e.g., Weekday evenings, Sat-Sun mornings, By appointment"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
              errors.availabilityNote ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.availabilityNote && <p className="text-red-500 text-sm mt-1">{errors.availabilityNote}</p>}
        </div>

        {/* Campus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Campus</label>
          <select
            value={campus}
            onChange={e => setCampus(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
          >
            {CAMPUSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
          >
            Post Offer
          </Button>
        </div>
      </div>
    </Modal>

    {/* Profile Completeness Gate */}
    <ProfileCompletenessGate
      isOpen={showGate}
      onClose={() => {
        setShowGate(false);
        if (pendingSubmit) {
          setPendingSubmit(false);
          doSubmit();
        }
      }}
      onComplete={() => {
        setShowGate(false);
        setPendingSubmit(false);
      }}
      actionType="post_need"
    />
    </>
  );
}