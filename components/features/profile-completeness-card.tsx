'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useNeeds } from '@/hooks/use-needs';
import { useOffers } from '@/hooks/use-offers';
import { Settings, Camera, Briefcase, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface ProfileCompletenessProps {
  onDismiss?: () => void;
}

export function ProfileCompletenessCard({ onDismiss }: ProfileCompletenessProps) {
  const { user, isLoaded } = useUser();
  const { needs } = useNeeds();
  const { offers } = useOffers();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Check dismissal
    const dismissedAt = localStorage.getItem('kinship_profile_nudge_dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    // Check profile completeness
    const hasImage = user?.imageUrl && !user.imageUrl.includes('placeholder');
    const hasSkillsOrBusiness = true; // We can't easily check Clerk metadata here, so assume true unless no image
    const userId = user?.id;
    const hasPosted = needs.some(n => n.requesterId === userId) || offers.some(o => o.providerId === userId);

    const isComplete = hasImage && hasPosted;

    setIsVisible(!isComplete && !isDismissed);
  }, [isLoaded, user, needs, offers]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('kinship_profile_nudge_dismissed', new Date().toISOString());
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  const missingItems = [];

  if (!user?.imageUrl || user.imageUrl.includes('placeholder')) {
    missingItems.push({
      icon: Camera,
      label: 'Add a profile photo',
      description: 'Help your community recognize you',
      href: '/settings',
    });
  }

  missingItems.push({
    icon: PlusCircle,
    label: 'Post a need or offer',
    description: 'Get involved and help your community',
    href: '/needs',
  });

  return (
    <Card className="overflow-hidden border-indigo-200">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Settings size={18} />
            Complete Your Profile
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            A complete profile helps you get more value from Kinship
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
        {missingItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} href={item.href}>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                <span className="text-indigo-600 text-sm">→</span>
              </div>
            </Link>
          );
        })}
        <Link href="/settings" className="block">
          <div className="w-full text-center py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Go to Settings →
          </div>
        </Link>
      </div>
    </Card>
  );
}
