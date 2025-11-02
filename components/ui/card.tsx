// Reusable card container component

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export function Card({ children, onClick, className = '', hover = false }: CardProps) {
  const baseStyles = 'bg-white rounded-xl shadow';
  const hoverStyles = hover ? 'hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-indigo-200' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
    >
      {children}
    </div>
  );
}
