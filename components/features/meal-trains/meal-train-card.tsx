// Meal train card component

import { MealTrain } from '@/lib/types';
import { MapPin, Heart, Calendar, Bell, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MealTrainCardProps {
  train: MealTrain;
  onSelect: (train: MealTrain) => void;
}

export function MealTrainCard({ train, onSelect }: MealTrainCardProps) {
  const totalSlots = train.signups.length;
  const filledSlots = train.signups.filter(s => s.signedUp).length;
  const percentFilled = Math.round((filledSlots / totalSlots) * 100);

  return (
    <Card hover onClick={() => onSelect(train)}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{train.recipient.avatar}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{train.recipient.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <Heart size={14} />
                    {train.reason}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} />
                    {train.recipient.campus}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{train.description}</p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Calendar size={16} />
              <span>
                {new Date(train.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(train.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{filledSlots} of {totalSlots} meals covered</span>
                <span className="font-bold text-rose-600">{percentFilled}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>

            {percentFilled < 100 && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 flex items-center gap-2">
                <Bell size={18} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>{totalSlots - filledSlots} meals still needed!</strong> Click to sign up
                </p>
              </div>
            )}

            {percentFilled === 100 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  <strong>All meals covered!</strong> Thank you, church family 💚
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
