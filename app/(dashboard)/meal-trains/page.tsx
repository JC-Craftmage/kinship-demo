// Meal Trains page - Refactored version

'use client';

import { useState } from 'react';
import { useMealTrains } from '@/hooks/use-meal-trains';
import { MealTrainCard } from '@/components/features/meal-trains/meal-train-card';
import { MealTrainModal } from '@/components/features/meal-trains/meal-train-modal';
import { CreateMealTrainModal, type MealTrainData } from '@/components/features/meal-trains/create-meal-train-modal';
import { MealTrain } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { BoardError, BoardLoading } from '@/components/ui/board-status';
import { DemoBanner } from '@/components/ui/demo-banner';

export default function MealTrainsPage() {
  const { mealTrains, demo, loading, error, refresh } = useMealTrains();
  const [selectedMealTrain, setSelectedMealTrain] = useState<MealTrain | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateMealTrain = (data: MealTrainData) => {
    console.log('Creating meal train:', data);
    // In production: POST to API, update local state
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {demo && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <DemoBanner />
        </div>
      )}
      <DashboardHeader
        title="Meal Trains"
        subtitle="Supporting our church family"
      />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Button variant="secondary" icon={<Plus size={20} />} onClick={() => setShowCreateModal(true)}>
          Create New
        </Button>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-900">
            💡 <strong>Demo Tip:</strong> Click on any meal train to see the interactive calendar and sign up for meal slots!
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {error ? (
          <BoardError message={error} onRetry={() => void refresh()} />
        ) : loading ? (
          <BoardLoading label="Loading meal trains" />
        ) : mealTrains.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
            <div className="text-6xl mb-4">🍲</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No meal trains yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Start a meal train to support a family in your church family.
            </p>
          </div>
        ) : (
          mealTrains.map((train) => (
            <MealTrainCard
              key={train.id}
              train={train}
              onSelect={setSelectedMealTrain}
            />
          ))
        )}
      </div>

      {/* Meal Train Modal */}
      <MealTrainModal
        train={selectedMealTrain}
        onClose={() => setSelectedMealTrain(null)}
      />

      {/* Create Meal Train Modal */}
      <CreateMealTrainModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateMealTrain}
      />
    </div>
  );
}
