// Reusable badge component for status, kudos, etc.

import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'kudos' | 'status' | 'warning' | 'success' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-300',
  kudos: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  status: 'bg-blue-100 text-blue-700 border-blue-300',
  warning: 'bg-orange-100 text-orange-800 border-orange-300',
  success: 'bg-green-100 text-green-700 border-green-300',
  info: 'bg-purple-100 text-purple-800 border-purple-300',
};

export function Badge({ children, variant = 'default', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 ${variantStyles[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
