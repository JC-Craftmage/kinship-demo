// Bottom tab navigation component

'use client';

import { Home, Users, HandHeart, ChefHat, Truck } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'needs', label: 'Needs', icon: HandHeart },
    { id: 'mealtrains', label: 'Meals', icon: ChefHat },
    { id: 'assets', label: 'Assets', icon: Truck },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-around py-3">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              currentView === id ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
