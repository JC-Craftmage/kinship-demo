// Kudos Modal - Give recognition to a church member

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Member } from '@/lib/types';
import { Award, Heart, Star, ThumbsUp, Check } from 'lucide-react';

interface KudosModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onGiveKudos: (memberId: number, reason: string, amount: number) => void;
}

const KUDOS_REASONS = [
  { id: 'helped-moving', label: 'Helped with moving', emoji: '📦', icon: 'Truck' },
  { id: 'meal-train', label: 'Cooked a meal for someone', emoji: '🍲', icon: 'Heart' },
  { id: 'rides', label: 'Gave rides to someone', emoji: '🚗', icon: 'Car' },
  { id: 'childcare', label: 'Helped with childcare', emoji: '👶', icon: 'Baby' },
  { id: 'home-repair', label: 'Helped with home repair', emoji: '🔧', icon: 'Wrench' },
  { id: 'prayer', label: 'Prayed for someone', emoji: '🙏', icon: 'Heart' },
  { id: 'mentoring', label: 'Mentored or coached', emoji: '💪', icon: 'Star' },
  { id: 'hosting', label: 'Hosted an event', emoji: '🎉', icon: 'Sparkles' },
  { id: 'other', label: 'Just being a blessing', emoji: '✨', icon: 'Star' },
];

export function KudosModal({ isOpen, onClose, member, onGiveKudos }: KudosModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [amount, setAmount] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    const reason = selectedReason === 'other'
      ? customReason.trim()
      : KUDOS_REASONS.find(r => r.id === selectedReason)?.label || '';

    if (!reason && !customReason.trim()) return;

    onGiveKudos(member.id, reason || customReason.trim(), amount);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedReason(null);
      setCustomReason('');
      setAmount(1);
      onClose();
    }, 1500);
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} headerColor="from-yellow-400 to-amber-500">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Award size={48} className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kudos Given! 🎉</h2>
          <p className="text-gray-600">
            You just recognized <strong>{member.name}</strong> for being a blessing!
          </p>
          <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 inline-block">
            <span className="text-3xl font-bold text-yellow-700">+{amount} ⭐</span>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} headerColor="from-yellow-400 to-amber-500">
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">{member.avatar}</div>
          <h2 className="text-2xl font-bold text-gray-900">Give Kudos to {member.name}</h2>
          <p className="text-gray-600 text-sm mt-1">
            Recognize a church family member for being a blessing
          </p>
        </div>

        {/* Amount Selector */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">How much kudos?</label>
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setAmount(n)}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition ${
                  amount === n
                    ? 'border-yellow-400 bg-white shadow-md ring-2 ring-yellow-300'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-2xl font-bold text-yellow-600">{n}</span>
                <span className="text-xs text-gray-500">⭐</span>
              </button>
            ))}
          </div>
          {amount > 1 && (
            <p className="text-center text-sm text-yellow-700 mt-2 font-medium">
              You're giving {amount} kudos — that's a big deal! 💛
            </p>
          )}
        </div>

        {/* Reason Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">What did they do? (optional)</label>
          <div className="grid grid-cols-3 gap-2">
            {KUDOS_REASONS.map(reason => (
              <button
                key={reason.id}
                type="button"
                onClick={() => setSelectedReason(reason.id)}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-xs font-medium transition ${
                  selectedReason === reason.id
                    ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300 text-yellow-800'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-2xl">{reason.emoji}</span>
                <span className="text-center leading-tight">{reason.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Reason */}
        {(selectedReason === 'other' || customReason) && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tell us more</label>
            <textarea
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="What did they do that was a blessing?"
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400 transition resize-none"
              maxLength={200}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900"
            icon={<Award size={18} />}
          >
            Give {amount} Kudos
          </Button>
        </div>
      </div>
    </Modal>
  );
}
