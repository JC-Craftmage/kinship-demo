// Notifications Component - Shows unread count + notification panel
//
// The bell reads the caller's OWN inbox from `/api/notifications`. There is
// no fixture array in this file any more: the server owns the data, and the
// `demo` flag on the response is what tells the UI whether it is looking at
// sample content.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, X, MessageCircle, Heart, Award, Truck, UserPlus } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import type { AppNotification, NotificationType } from '@/lib/types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  demo: boolean;
  loading: boolean;
  error: string | null;
  acting: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: (id: string) => void;
  onClose: () => void;
}

function NotificationPanel({
  notifications,
  demo,
  loading,
  error,
  acting,
  onMarkRead,
  onMarkAllRead,
  onClear,
  onClose,
}: NotificationPanelProps) {
  const unread = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationType) => {
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
    if (Number.isNaN(date.getTime())) return '';
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
              disabled={acting}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 disabled:opacity-50"
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

      {demo && (
        <div
          role="status"
          className="mx-4 mt-3 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900"
        >
          Demo data &mdash; these are sample notifications, not real ones.
        </div>
      )}

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading notifications&hellip;</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const body = (
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
                        disabled={acting}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => onClear(notification.id)}
                      disabled={acting}
                      className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );

            const row = (
              <div
                className={`p-4 transition ${
                  notification.read
                    ? 'bg-white'
                    : 'bg-indigo-50'
                }`}
              >
                {body}
              </div>
            );

            return notification.actionUrl ? (
              <Link
                key={notification.id}
                href={notification.actionUrl}
                onClick={() => {
                  if (!notification.read) onMarkRead(notification.id);
                }}
                className="block hover:bg-indigo-100/60"
              >
                {row}
              </Link>
            ) : (
              <div key={notification.id}>{row}</div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    demo,
    loading,
    error,
    acting,
    markRead,
    markAllRead,
    dismiss,
  } = useNotifications();

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Notifications"
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
          demo={demo}
          loading={loading}
          error={error}
          acting={acting}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClear={dismiss}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
