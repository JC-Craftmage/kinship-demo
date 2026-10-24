// Dashboard header with notifications, search, and theme toggle

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Notifications } from '@/components/features/notifications/notifications';
import { GlobalSearchModal } from '@/components/features/global-search-modal';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
}

export function DashboardHeader({ title, subtitle, showNotifications = true }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="bg-indigo-600 text-white p-4 shadow-lg dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-indigo-200 dark:text-gray-300">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-indigo-500 dark:hover:bg-gray-700 transition"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg hover:bg-indigo-500 dark:hover:bg-gray-700 transition"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun size={20} className="text-yellow-400" />
                  ) : (
                    <Moon size={20} />
                  )}
                </button>
              )}
              {showNotifications && (
                <Notifications />
              )}
            </div>
          </div>
        </div>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}