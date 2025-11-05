// First-time photo upload prompt modal

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle } from 'lucide-react';

export function PhotoPromptModal() {
  const { user } = useUser();
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasGoodPhoto, setHasGoodPhoto] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkPhotoPrompt = () => {
      if (!user) return;

      // Check if user has dismissed this before
      const dismissed = localStorage.getItem('photo-prompt-dismissed');
      if (dismissed) return;

      // Check if user has an image URL (from social login or upload)
      const hasPhoto = !!user.imageUrl;

      // Show prompt on first visit (after a short delay so they see the app first)
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    checkPhotoPrompt();
  }, [user]);

  const handleConfirmGoodPhoto = () => {
    localStorage.setItem('photo-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  const handleUpdatePhoto = () => {
    localStorage.setItem('photo-prompt-dismissed', 'true');
    setShowPrompt(false);
    // Open Clerk user profile modal
    if (user) {
      user.createEmailAddress; // This triggers Clerk to open the profile
      // Note: Clerk's UserButton component handles photo updates
      alert('Click on your profile photo in the bottom navigation to update your photo through Clerk.');
    }
  };

  const handleSkip = () => {
    // Don't mark as dismissed, so they see it next time
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Modal
      isOpen={showPrompt}
      onClose={handleSkip}
      title="Welcome to Kinship! 👋"
    >
      <div className="space-y-4">
        {/* Photo Display */}
        <div className="flex justify-center mb-4">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Your profile photo"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
              <Camera className="w-12 h-12 text-indigo-600" />
            </div>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Profile Photo Guidelines
          </h4>
          <p className="text-xs text-blue-800 mb-2">
            To help your church community recognize and connect with you, please use a <strong>real and recent photo of yourself</strong>.
          </p>
          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>Use a clear, well-lit photo showing your face</li>
            <li>Avoid using emojis, cartoon characters, pets, or old photos</li>
            <li>Current photos help build trust and recognition within your community</li>
            <li>This is especially important for church leaders and volunteers</li>
          </ul>
        </div>

        {/* Question */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-900 mb-3">
            Is your current profile photo a recent, clear photo of yourself?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleConfirmGoodPhoto}
              className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
            >
              <CheckCircle size={16} className="mr-2" />
              Yes, it's good!
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdatePhoto}
              className="flex-1"
            >
              <Camera size={16} className="mr-2" />
              Update Photo
            </Button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            I'll do this later
          </button>
          <p className="text-xs text-gray-500 mt-1">
            We'll remind you next time
          </p>
        </div>

        {/* Why It Matters */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-600 text-center">
            <strong>Why this matters:</strong> Your photo helps church members recognize you during services,
            events, and when coordinating ministry activities. It builds trust and community connection.
          </p>
        </div>
      </div>
    </Modal>
  );
}
