// Profile Completeness Nudge - dismissible card shown on home page
// Appears after meaningful interaction and shows missing items as checklist

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useProfileCompleteness, MissingItem } from '@/hooks/use-profile-completeness';
import { Camera, Briefcase, FileText, PlusCircle, X, Check, Settings } from 'lucide-react';

const ITEM_ICONS: Record<string, React.ReactElement> = {
  photo: <Camera size={18} className="text-indigo-600" />,
  skills: <Briefcase size={18} className="text-indigo-600" />,
  bio: <FileText size={18} className="text-indigo-600" />,
  post: <PlusCircle size={18} className="text-indigo-600" />,
};

const ITEM_STATUS: Record<string, { filled: boolean; label: string }> = {
  photo: { filled: false, label: 'Add a photo ✓' },
  skills: { filled: false, label: 'List your skills ✗' },
  bio: { filled: false, label: 'Add a bio ✗' },
  post: { filled: false, label: 'Add an asset ✗' },
};

const DISMISSAL_KEY = 'kinship_profile_nudge_dismissed_home';

export function ProfileCompletenessNudge() {
  const { missingItems, completenessPercent, shouldNudge, hasPostedSomething } = useProfileCompleteness();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldNudge) {
      setIsVisible(false);
      return;
    }

    // Check localStorage for recent dismissal
    const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        setIsVisible(false);
        return;
      }
    }

    setIsDismissed(false);
    setIsVisible(true);
  }, [shouldNudge]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(DISMISSAL_KEY, new Date().toISOString());
  };

  if (!isVisible || isDismissed || missingItems.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-indigo-200 shadow-md">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Settings size={18} />
            Your Profile is {completenessPercent}% Complete
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            Complete these items to get more from Kinship
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-white/20 transition"
          aria-label="Dismiss"
        >
          <X size={18} className="text-white/80" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {missingItems.map((item: MissingItem) => {
          const Icon = ITEM_ICONS[item.key] || <Check size={18} className="text-indigo-600" />;
          return (
            <Link key={item.key} href={item.href}>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  {Icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">
                    {item.key === 'photo' && 'Help your church family recognize you'}
                    {item.key === 'skills' && 'Show what you have to offer'}
                    {item.key === 'bio' && 'Tell your story in a few words'}
                    {item.key === 'post' && 'Get involved with the community'}
                  </p>
                </div>
                <span className="text-indigo-600 text-sm font-medium">Add now →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
