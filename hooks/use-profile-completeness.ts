// Profile completeness hook - checks how complete a user's profile is

import { useUser } from '@clerk/nextjs';
import { useNeeds } from '@/hooks/use-needs';
import { useOffers } from '@/hooks/use-offers';
import { useAssets } from '@/hooks/use-assets';
import { useState, useEffect, useMemo } from 'react';

export interface ProfileCompletenessResult {
  isComplete: boolean;
  completenessPercent: number;
  missingItems: MissingItem[];
  shouldNudge: boolean;
  hasPhoto: boolean;
  hasSkills: boolean;
  hasBio: boolean;
  hasPostedSomething: boolean;
}

export interface MissingItem {
  key: string;
  label: string;
  href: string;
}

export function useProfileCompleteness(): ProfileCompletenessResult {
  const { user, isLoaded } = useUser();
  const { needs } = useNeeds();
  const { offers } = useOffers();
  const { allAssets } = useAssets();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sessionStart] = useState(Date.now());

  // Check if user has had a meaningful interaction (posted something or browsed >2 min)
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInteracted(true);
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    if (!isLoaded) {
      return {
        isComplete: false,
        completenessPercent: 0,
        missingItems: [],
        shouldNudge: false,
        hasPhoto: false,
        hasSkills: false,
        hasBio: false,
        hasPostedSomething: false,
      };
    }

    const userId = user?.id;

    // Check photo - must have a real image URL (not placeholder)
    const hasPhoto = !!(user?.imageUrl && !user.imageUrl.includes('placeholder') && !user.imageUrl.includes('default'));

    // Check skills/business - check Clerk publicMetadata or fall back to mock data awareness
    // We can't directly check Clerk metadata easily, so we use a heuristic:
    // If user has a bio, they're likely engaged and may have added skills
    // A more robust solution would involve API calls to check user profile
    const publicMetadata = user?.publicMetadata as Record<string, unknown> | undefined;
    const hasSkills = !!(publicMetadata?.skills && (publicMetadata.skills as string[]).length > 0);

    // Check bio
    const hasBio = !!(user?.publicMetadata?.bio);

    // Check if user has posted a need, offer, or asset
    const hasPostedNeed = needs.some(n => n.requesterId === userId);
    const hasPostedOffer = offers.some(o => o.providerId === userId);
    // For assets, we'd need to track who listed them - using a heuristic here
    const hasPostedAsset = false; // Asset listing tracked separately via localStorage or API
    const hasPostedSomething = hasPostedNeed || hasPostedOffer || hasPostedAsset;

    // Calculate completeness (each item is ~25%)
    // 25% photo, 25% skills, 25% bio, 25% posted something
    let completenessPercent = 0;
    if (hasPhoto) completenessPercent += 25;
    if (hasSkills) completenessPercent += 25;
    if (hasBio) completenessPercent += 25;
    if (hasPostedSomething) completenessPercent += 25;

    const isComplete = completenessPercent === 100;

    const missingItems: MissingItem[] = [];
    if (!hasPhoto) missingItems.push({ key: 'photo', label: 'Add a profile photo', href: '/settings' });
    if (!hasSkills) missingItems.push({ key: 'skills', label: 'List your skills', href: '/settings' });
    if (!hasBio) missingItems.push({ key: 'bio', label: 'Add a bio', href: '/settings' });
    if (!hasPostedSomething) missingItems.push({ key: 'post', label: 'Post a need or offer', href: '/needs' });

    // Only nudge if:
    // 1. Not complete
    // 2. User has interacted meaningfully (posted something OR browsed >2 min)
    const shouldNudge = !isComplete && (hasPostedSomething || hasInteracted);

    return {
      isComplete,
      completenessPercent,
      missingItems,
      shouldNudge,
      hasPhoto,
      hasSkills,
      hasBio,
      hasPostedSomething,
    };
  }, [isLoaded, user, needs, offers, hasInteracted]);

  return result;
}
