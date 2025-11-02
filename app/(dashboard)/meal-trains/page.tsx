// Meal Trains page - Refactored version

'use client';

import { useState } from 'react';
import { useMealTrains } from '@/hooks/use-meal-trains';
import { MealTrainCard } from '@/components/features/meal-trains/meal-train-card';
import { MealTrainModal } from '@/components/features/meal-trains/meal-train-modal';
import { MealTrain } from '@/lib/types';
import { ChefHat, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MealTrainsPage() {
  const { mealTrains } = useMealTrains();
  const [selectedMealTrain, setSelectedMealTrain] = useState<MealTrain | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat size={36} />
              <div>
                <h1 className="text-3xl font-bold">Meal Trains</h1>
                <p className="text-rose-100 text-sm">Supporting our church family</p>
              </div>
            </div>
            <Button variant="secondary" icon={<Plus size={20} />}>
              Create New
            </Button>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border-2 border-white/30">
            <p className="text-sm text-white/90">
              💡 <strong>Demo Tip:</strong> Click on any meal train to see the interactive calendar and sign up for meal slots!
            </p>
          </div>
        </div>
      </div>

      {/* Meal Trains List */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {mealTrains.map((train) => (
          <MealTrainCard
            key={train.id}
            train={train}
            onSelect={setSelectedMealTrain}
          />
        ))}
      </div>

      {/* Meal Train Modal */}
      <MealTrainModal
        train={selectedMealTrain}
        onClose={() => setSelectedMealTrain(null)}
      />
    </div>
  );
}
