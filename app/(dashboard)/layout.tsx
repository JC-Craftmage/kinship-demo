// Dashboard layout with navigation

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/navigation';

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
      browse: '/browse-churches',
      settings: '/settings',
    };
    router.push(routes[view] || '/home');
  };

  return (
    <div>
      {children}
      <Navigation
        currentView={getCurrentView()}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
