// Post Need Modal - Form for creating new needs

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { NeedCategory, NeedUrgency } from '@/lib/types';
import { Truck, Heart, Baby, Car, Wrench, Sparkles, X, Check } from 'lucide-react';

interface PostNeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostNeedData) => void;
}

export interface PostNeedData {
  title: string;
  description: string;
  category: NeedCategory;
  urgency: NeedUrgency;
  date: string | null;
  timeframe: string;
  campus: string;
  volunteersNeeded: number;
  isAnonymous: boolean;
}

const CATEGORIES: { value: NeedCategory; label: string; icon: React.ReactElement; color: string }[] = [
  { value: 'Moving Help', label: 'Moving Help', icon: <Truck size={20} />, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Prayer Request', label: 'Prayer Request', icon: <Heart size={20} />, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { value: 'Childcare', label: 'Childcare', icon: <Baby size={20} />, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'Transportation', label: 'Transportation', icon: <Car size={20} />, color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Home Repair', label: 'Home Repair', icon: <Wrench size={20} />, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'Event Help', label: 'Event Help', icon: <Sparkles size={20} />, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
];

const URGENCIES: { value: NeedUrgency; label: string; color: string }[] = [
  { value: 'low', label: 'Flexible', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'medium', label: 'Soon', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'high', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' },
];

const CAMPUSES = ['Downtown', 'Westside', 'Eastside', 'North Campus', 'South Campus'];

export function PostNeedModal({ isOpen, onClose, onSubmit }: PostNeedModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NeedCategory | null>(null);
  const [urgency, setUrgency] = useState<NeedUrgency>('medium');
  const [date, setDate] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [campus, setCampus] = useState('Downtown');
  const [volunteersNeeded, setVolunteersNeeded] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(null);
    setUrgency('medium');
    setDate('');
    setTimeframe('');
    setCampus('Downtown');
    setVolunteersNeeded(1);
    setIsAnonymous(false);
    setShowSuccess(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Please select a category';
    if (category === 'Prayer Request' && volunteersNeeded > 1) {
      // Prayer requests don't need multiple volunteers
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const categoryIconMap: Record<NeedCategory, 'truck' | 'heart' | 'baby' | 'car' | 'wrench' | 'sparkles'> = {
      'Moving Help': 'truck',
      'Prayer Request': 'heart',
      'Childcare': 'baby',
      'Transportation': 'car',
      'Home Repair': 'wrench',
      'Event Help': 'sparkles',
    };

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: category!,
      urgency,
      date: date || null,
      timeframe: timeframe.trim(),
      campus,
      volunteersNeeded: category === 'Prayer Request' ? null : volunteersNeeded,
      isAnonymous,
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
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Request Posted! 🎉</h2>
          <p className="text-gray-600 text-lg">
            Your church family will see your need and can step up to help.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-teal-500 to-cyan-600">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Post a Need</h2>
          <p className="text-gray-600 mt-1">Ask your church family for help — that's what we're here for.</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">What's needed?</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Rides to medical appointments"
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
            placeholder="Share context that would help someone decide if they can help..."
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none ${
              errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={500}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          <p className="text-gray-400 text-xs mt-1 text-right">{description.length}/500</p>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date (if applicable)</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Time / Schedule</label>
            <input
              type="text"
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              placeholder="e.g., Mon/Wed/Fri mornings"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
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

        {/* Urgency */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
          <div className="grid grid-cols-3 gap-2">
            {URGENCIES.map(u => (
              <button
                key={u.value}
                type="button"
                onClick={() => setUrgency(u.value)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                  urgency === u.value
                    ? `${u.color} border-current ring-2 ring-offset-1 ring-teal-400`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Volunteers Needed */}
        {category !== 'Prayer Request' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Volunteers needed</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setVolunteersNeeded(Math.max(1, volunteersNeeded - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 text-xl font-bold text-gray-700 hover:bg-gray-200 transition"
              >
                −
              </button>
              <span className="text-3xl font-bold text-gray-900 w-12 text-center">{volunteersNeeded}</span>
              <button
                type="button"
                onClick={() => setVolunteersNeeded(volunteersNeeded + 1)}
                className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 text-xl font-bold text-gray-700 hover:bg-gray-200 transition"
              >
                +
              </button>
              <span className="text-gray-600 text-sm ml-2">person{(volunteersNeeded !== 1) ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Anonymous Toggle */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Post anonymously</p>
              <p className="text-sm text-gray-600">Your name will only be visible to pastoral staff</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative w-14 h-8 rounded-full transition ${
                isAnonymous ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition ${
                  isAnonymous ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
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
            Post Need
          </Button>
        </div>
      </div>
    </Modal>
  );
}
