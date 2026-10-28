// Profile Completeness Gate Modal - soft gate that intercepts actions
// NOT a hard gate - "Maybe Later" lets them proceed but records the nudge

'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Camera, User, Briefcase, Settings } from 'lucide-react';
import { GateActionType, shouldShowGateForAction, recordGateNudge } from '@/hooks/use-contextual-gate';
import Link from 'next/link';

interface ProfileCompletenessGateProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  actionType: GateActionType;
}

const ACTION_COPY: Record<GateActionType, { title: string; body: string; icon: React.ReactElement }> = {
  post_need: {
    title: 'Add a photo so neighbors know who\'s posting this need',
    body: 'Your church family is more likely to respond when they know who\'s asking.',
    icon: <Camera size={48} className="text-indigo-500" />,
  },
  respond_need: {
    title: 'Complete your profile so they know who\'s reaching out',
    body: 'Let them see who\'s offering to help — it builds trust.',
    icon: <User size={48} className="text-indigo-500" />,
  },
  contact_member: {
    title: 'Complete your profile so they know who\'s reaching out',
    body: 'A complete profile helps build real connections within your church family.',
    icon: <User size={48} className="text-indigo-500" />,
  },
  post_asset: {
    title: 'Add a photo and skills so people know whose asset they\'re borrowing',
    body: 'Build trust by letting others see who\'s sharing with the community.',
    icon: <Briefcase size={48} className="text-indigo-500" />,
  },
};

export function ProfileCompletenessGate({
  isOpen,
  onClose,
  onComplete,
  actionType,
}: ProfileCompletenessGateProps) {
  const { user } = useUser();
  const copy = ACTION_COPY[actionType];

  const handleClose = () => {
    // Record that we nudged them (soft gate - they can still proceed)
    recordGateNudge(actionType);
    onClose();
  };

  const handleComplete = () => {
    onClose();
    onComplete();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      headerColor="from-indigo-500 to-purple-600"
    >
      <div className="text-center space-y-5">
        {/* Profile photo or placeholder */}
        <div className="flex justify-center">
          <div className="relative">
            {user?.imageUrl && !user.imageUrl.includes('placeholder') ? (
              <Image
                src={user.imageUrl}
                alt="Your profile"
                width={96}
                height={96}
                unoptimized
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-indigo-200 flex items-center justify-center">
                <User size={48} className="text-indigo-400" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
          </div>
        </div>

        {/* Icon that matches action type */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            {copy.icon}
          </div>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {copy.title}
          </h2>
          <p className="text-gray-600">
            {copy.body}
          </p>
        </div>

        {/* Quick preview of missing items */}
        <div className="bg-indigo-50 rounded-xl p-4 text-left">
          <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
            <Settings size={16} />
            Complete your profile to unlock:
          </p>
          <ul className="text-sm text-indigo-700 space-y-1 ml-2">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs">✓</span>
              Full community visibility
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs">✓</span>
              Ability to respond to needs
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs">✓</span>
              Contact other members directly
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Link href="/settings" className="flex-1" onClick={handleComplete}>
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Complete Profile
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}

// Helper to check if gate should be shown (for use in event handlers)
export function checkGateShouldShow(actionType: GateActionType): boolean {
  return shouldShowGateForAction(actionType);
}
