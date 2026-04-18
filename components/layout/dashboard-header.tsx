// Dashboard header with notifications

'use client';

import { Notifications } from '@/components/features/notifications/notifications';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
}

export function DashboardHeader({ title, subtitle, showNotifications = true }: DashboardHeaderProps) {
  return (
    <div className="bg-indigo-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-indigo-200">{subtitle}</p>}
          </div>
          {showNotifications && (
            <Notifications />
          )}
        </div>
      </div>
    </div>
  );
}
