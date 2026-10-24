'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone, ArrowDown } from 'lucide-react';

interface AddToHomeScreenBannerProps {
  onDismiss?: () => void;
}

export function AddToHomeScreenBanner({ onDismiss }: AddToHomeScreenBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (typeof window !== 'undefined' && localStorage.getItem('kinship_a2hs_dismissed')) {
      setIsDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('kinship_a2hs_dismissed', 'true');
    onDismiss?.();
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
      localStorage.setItem('kinship_a2hs_dismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || isDismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Add Kinship to your home screen</p>
              <p className="text-xs text-indigo-200">For the best experience — it&apos;s fast &amp; works offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-white text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition"
            >
              <ArrowDown size={14} />
              Add
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-white/20 transition"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
