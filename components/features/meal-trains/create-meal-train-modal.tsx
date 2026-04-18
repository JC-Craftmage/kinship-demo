// Create Meal Train Modal - Form for creating new meal trains

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface CreateMealTrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MealTrainData) => void;
}

export interface MealTrainData {
  recipientName: string;
  recipientSituation: string;
  recipientDietary: string;
  recipientAddress: string;
  startDate: string;
  endDate: string;
  preferences: string;
  notes: string;
}

const CAMPUSES = ['Downtown', 'Westside', 'Eastside', 'North Campus', 'South Campus'];

export function CreateMealTrainModal({ isOpen, onClose, onSubmit }: CreateMealTrainModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [situation, setSituation] = useState('');
  const [dietary, setDietary] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');
  const [campus, setCampus] = useState('Downtown');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setRecipientName('');
    setSituation('');
    setDietary('');
    setAddress('');
    setStartDate('');
    setEndDate('');
    setPreferences('');
    setNotes('');
    setCampus('Downtown');
    setShowSuccess(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!recipientName.trim()) newErrors.recipientName = 'Name is required';
    if (!situation.trim()) newErrors.situation = 'Situation/reason is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      recipientName: recipientName.trim(),
      recipientSituation: situation.trim(),
      recipientDietary: dietary.trim(),
      recipientAddress: address.trim(),
      startDate,
      endDate,
      preferences: preferences.trim(),
      notes: notes.trim(),
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
      <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-rose-500 to-pink-600">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Meal Train Created! 🎉</h2>
          <p className="text-gray-600 text-lg">
            Your church family can now sign up to bring meals.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-rose-500 to-pink-600">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create a Meal Train</h2>
          <p className="text-gray-600 mt-1">Coordinate meals for someone going through a tough time</p>
        </div>

        {/* Recipient Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient's Name</label>
          <input
            type="text"
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder="Who is receiving the meals?"
            className={`w-full px-4 py-3 border-2 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition ${
              errors.recipientName ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={50}
          />
          {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
        </div>

        {/* Situation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">What's happening?</label>
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="e.g., Just had a new baby, recovering from surgery, new foster placement..."
            rows={2}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-none ${
              errors.situation ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={200}
          />
          {errors.situation && <p className="text-red-500 text-sm mt-1">{errors.situation}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition ${
                errors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition ${
                errors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Campus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Campus</label>
          <select
            value={campus}
            onChange={e => setCampus(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition bg-white"
          >
            {CAMPUSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary Restrictions (optional)</label>
          <input
            type="text"
            value={dietary}
            onChange={e => setDietary(e.target.value)}
            placeholder="e.g., No nuts, vegetarian, gluten-free..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
            maxLength={100}
          />
        </div>

        {/* Meal Preferences */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Preferences (optional)</label>
          <textarea
            value={preferences}
            onChange={e => setPreferences(e.target.value)}
            placeholder="Any favorite meals, cuisines, or things the family loves?"
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-none"
            maxLength={200}
          />
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address (optional)</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Will only be shown to people signed up to deliver"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Allergies, pet info, best delivery times, parking instructions..."
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-none"
            maxLength={200}
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
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          >
            Create Meal Train
          </Button>
        </div>
      </div>
    </Modal>
  );
}
