'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Heart, Handshake, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FabMenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

const FAB_ITEMS: FabMenuItem[] = [
  {
    label: 'Post a Need',
    icon: Heart,
    href: '/needs',
    description: 'Ask for help from your community',
  },
  {
    label: 'Post an Offer',
    icon: Handshake,
    href: '/offers',
    description: 'Share what you can give',
  },
  {
    label: 'Post an Asset',
    icon: Truck,
    href: '/assets',
    description: 'List equipment to share',
  },
];

export function FloatingActionButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div ref={menuRef} className="fixed bottom-24 right-4 z-50">
      {/* Backdrop */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          aria-label="Close menu"
        />
      )}

      {/* Menu Items */}
      <div
        className={`flex flex-col gap-2 mb-2 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
        }`}
      >
        {FAB_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.href)}
              className="group flex items-center gap-3 bg-white text-gray-700 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all min-w-[200px] text-left"
              style={{ animationDelay: isOpen ? '0ms' : '0ms' }}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition">
                <Icon size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-700 rotate-45 hover:bg-gray-800'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Create new post'}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </button>
    </div>
  );
}
