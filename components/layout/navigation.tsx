// Bottom tab navigation component

'use client';

import { Home, Users, HandHeart, ChefHat, Truck, User, LogOut } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { user } = useUser();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'needs', label: 'Needs', icon: HandHeart },
    { id: 'mealtrains', label: 'Meals', icon: ChefHat },
    { id: 'assets', label: 'Assets', icon: Truck },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* User info bar */}
        {user && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8'
                    }
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {user.firstName || user.username || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation tabs */}
        <div className="flex justify-around py-3">
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
    </div>
  );
}
