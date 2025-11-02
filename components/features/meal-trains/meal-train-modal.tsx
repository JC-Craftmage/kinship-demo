// Meal train modal with calendar

import { MealTrain } from '@/lib/types';
import { MapPin, ChefHat, Calendar, Plus, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { formatDateShort } from '@/lib/utils/date';

interface MealTrainModalProps {
  train: MealTrain | null;
  onClose: () => void;
}

export function MealTrainModal({ train, onClose }: MealTrainModalProps) {
  if (!train) return null;

  const handleSignup = (signupIndex: number) => {
    alert(`Great! You've signed up to provide a meal!\n\nIn the real app, this would:\n• Send you a confirmation\n• Add it to your calendar\n• Send a reminder 24hrs before\n• Let you coordinate with ${train.recipient.name}`);
  };

  return (
    <Modal
      isOpen={!!train}
      onClose={onClose}
      headerColor="from-rose-500 to-pink-600"
      titleIcon={<div className="text-6xl">{train.recipient.avatar}</div>}
      title=""
    >
      <div className="mb-6 -mt-6">
        <h2 className="text-3xl font-bold text-gray-900">{train.recipient.name}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-semibold">
            {train.reason}
          </span>
          <span className="text-gray-600 text-sm flex items-center gap-1">
            <MapPin size={14} />
            {train.recipient.campus}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-900">About This Need</h3>
          <p className="text-gray-700 text-lg">{train.description}</p>
        </div>

        {train.preferences && (
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
            <h3 className="font-bold text-lg mb-2 text-blue-900 flex items-center gap-2">
              <ChefHat size={20} />
              Meal Preferences
            </h3>
            <p className="text-blue-800">{train.preferences}</p>
          </div>
        )}

        <div>
          <h3 className="font-bold text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Calendar size={24} />
            Meal Calendar - Click to Sign Up!
          </h3>

          <div className="space-y-2">
            {train.signups.map((signup, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 transition ${
                  signup.signedUp
                    ? signup.volunteer === 'You!'
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300'
                      : 'bg-gray-50 border-gray-300'
                    : 'bg-white border-rose-200 hover:border-rose-400 hover:bg-rose-50 cursor-pointer'
                }`}
                onClick={() => !signup.signedUp && handleSignup(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="font-bold text-lg text-gray-900">{formatDateShort(signup.date)}</p>
                      <p className="text-sm text-gray-600 capitalize">{signup.meal}</p>
                    </div>

                    <div className="flex-1">
                      {signup.signedUp ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={20} className={signup.volunteer === 'You!' ? 'text-indigo-600' : 'text-green-600'} />
                          <span className={`font-semibold ${signup.volunteer === 'You!' ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {signup.volunteer === 'You!' ? '✨ You signed up!' : `Covered by ${signup.volunteer}`}
                          </span>
                          {signup.delivered && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold ml-2">
                              Delivered ✓
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus size={20} className="text-rose-600" />
                          <span className="font-semibold text-rose-900">Available - Click to sign up!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
          <h3 className="font-bold text-lg mb-2 text-amber-900">📋 Meal Train Tips</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Plan to deliver meals between 4-6 PM unless arranged otherwise</li>
            <li>• Use disposable containers (no need to return dishes!)</li>
            <li>• Include heating instructions if needed</li>
            <li>• Text before dropping off to coordinate timing</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p><strong>Created by:</strong> {train.createdBy}</p>
          <p className="mt-1">
            <strong>Duration:</strong> {formatDateShort(train.startDate)} - {formatDateShort(train.endDate)}
          </p>
        </div>
      </div>
    </Modal>
  );
}
