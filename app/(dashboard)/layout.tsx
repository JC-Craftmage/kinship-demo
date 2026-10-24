// Dashboard layout with navigation

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/navigation';
import { AddToHomeScreenBanner } from '@/components/features/add-to-home-screen';
import { FloatingActionButton } from '@/components/ui/fab';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract view from pathname
  const getCurrentView = () => {
    if (pathname === '/home') return 'home';
    if (pathname === '/directory') return 'directory';
    if (pathname === '/assets') return 'assets';
    if (pathname === '/meal-trains') return 'mealtrains';
    if (pathname === '/needs') return 'needs';
    if (pathname === '/kudos') return 'kudos';
    if (pathname === '/life-events') return 'lifeevents';
    if (pathname === '/browse-churches') return 'browse';
    if (pathname === '/settings') return 'settings';
    if (pathname === '/manage-requests') return 'home'; // Keep home tab active
    return 'home';
  };

  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = {
      home: '/home',
      directory: '/directory',
      assets: '/assets',
      mealtrains: '/meal-trains',
      needs: '/needs',
      kudos: '/kudos',
      lifeevents: '/life-events',
      browse: '/browse-churches',
      settings: '/settings',
    };
    router.push(routes[view] || '/home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AddToHomeScreenBanner />
      <FloatingActionButton />
      <div className="flex-1 pb-20">
        {children}
      </div>
      <Navigation
        currentView={getCurrentView()}
        onNavigate={handleNavigate}
      />
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-center py-2 text-xs text-gray-400 z-40 pointer-events-none">
        Kinship © 2026 · Built for church communities
      </footer>
    </div>
  );
}
