'use client';

// Notifications — loads the caller's own inbox and marks / dismisses items
// through the authenticated API route.
//
// The browser never talks to Supabase directly. It calls `/api/notifications`,
// which scopes every read and write to the caller's own Clerk user id. The
// client also cannot CREATE a notification: the server puts one in the box
// when the real thing happens.

import { useCallback, useMemo, useState } from 'react';
import { useBoardData, BoardEnvelope } from './use-board-data';
import type { AppNotification } from '@/lib/types';

interface NotificationsResponse extends BoardEnvelope {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface NotificationActionResult {
  ok: boolean;
  error?: string;
}

export function useNotifications() {
  const { data, loading, error, refresh } = useBoardData<NotificationsResponse>(
    '/api/notifications'
  );
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const notifications = useMemo(() => data?.notifications ?? [], [data]);
  const unreadCount = useMemo(() => data?.unreadCount ?? 0, [data]);

  const request = useCallback(
    async (method: 'PATCH' | 'DELETE', body: Record<string, unknown>): Promise<NotificationActionResult> => {
      setActing(true);
      setActionError(null);

      try {
        const response = await fetch('/api/notifications', {
          method,
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message = payload?.error ?? `Request failed (${response.status})`;
          setActionError(message);
          return { ok: false, error: message };
        }

        // The server is the source of truth for read state, so the list is
        // reloaded rather than patched locally.
        await refresh();
        return { ok: true };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Request failed';
        setActionError(message);
        return { ok: false, error: message };
      } finally {
        setActing(false);
      }
    },
    [refresh]
  );

  const markRead = useCallback(
    (id: string) => request('PATCH', { id }),
    [request]
  );

  const markAllRead = useCallback(
    () => request('PATCH', { all: true }),
    [request]
  );

  const dismiss = useCallback(
    (id: string) => request('DELETE', { id }),
    [request]
  );

  return {
    notifications,
    unreadCount,
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
    acting,
    actionError,
    markRead,
    markAllRead,
    dismiss,
    clearActionError: () => setActionError(null),
  };
}
