// Notifications Component - Shows unread count + notification panel

'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, X, MessageCircle, Heart, Award, Truck, UserPlus } from 'lucide-react';

interface Notification {
  id: number;
  type: 'kudos' | 'meal_train' | 'asset_request' | 'join_request' | 'comment' | 'mention';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'kudos',
    title: 'You received kudos!',
    message: 'Sarah Johnson gave you 3 kudos for "Helped with moving"',
    timestamp: '2026-04-18T10:30:00',
    read: false,
    avatar: '👩',
  },
  {
    id: 2,
    type: 'meal_train',
    title: 'New meal train signup',
    message: 'Mike Chen signed up to bring dinner for the Thompson family',
    timestamp: '2026-04-18T09:15:00',
    read: false,
    avatar: '👨',
  },
  {
    id: 3,
    type: 'asset_request',
    title: 'Asset request approved',
    message: 'Your request to borrow the Kubota Tractor was approved!',
    timestamp: '2026-04-17T16:45:00',
    read: true,
    avatar: '👴',
  },
  {
    id: 4,
    type: 'join_request',
    title: 'New join request',
    message: 'Emily Davis wants to join First Church',
    timestamp: '2026-04-17T14:20:00',
    read: true,
    avatar: '👩',
  },
  {
    id: 5,
    type: 'comment',
    title: 'New comment',
    message: 'Robert Chen commented on your life event: "What a beautiful blessing!"',
    timestamp: '2026-04-17T11:00:00',
    read: true,
    avatar: '👴',
  },
];

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onClear: (id: number) => void;
  onClose: () => void;
}

function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClear, onClose }: NotificationPanelProps) {
  const unread = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'kudos': return <Award size={18} className="text-yellow-500" />;
      case 'meal_train': return <Heart size={18} className="text-rose-500" />;
      case 'asset_request': return <Truck size={18} className="text-green-500" />;
      case 'join_request': return <UserPlus size={18} className="text-blue-500" />;
      case 'comment': return <MessageCircle size={18} className="text-indigo-500" />;
      default: return <Bell size={18} className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-gray-600" />
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 transition ${
                notification.read
                  ? 'bg-white'
                  : 'bg-indigo-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar/Icon */}
                <div className="relative">
                  {notification.avatar ? (
                    <span className="text-2xl">{notification.avatar}</span>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                  )}
                  {!notification.read && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    {!notification.read && (
                      <button
                        onClick={() => onMarkRead(notification.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => onClear(notification.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t bg-gray-50 rounded-b-xl">
          <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClear = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell size={22} className={isOpen ? 'text-indigo-600' : 'text-gray-600'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClear={handleClear}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
