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
    return 'home';
  };

  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = {
      home: '/home',
      directory: '/directory',
      assets: '/assets',
      mealtrains: '/meal-trains',
      needs: '/needs',
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
