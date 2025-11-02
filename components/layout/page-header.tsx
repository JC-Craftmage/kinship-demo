// Reusable page header component

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  color?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
  color = 'from-indigo-500 to-purple-600'
}: PageHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white p-6 shadow-lg`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
