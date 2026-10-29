'use client';

// Life Events - loads the celebrations for the caller's church and posts new
// ones through the authenticated API route.
//
// The browser never talks to Supabase directly. It calls `/api/life-events`,
// which derives the church from the caller's own membership and refuses a
// member or campus from another church.

import { useCallback, useMemo, useState } from 'react';
import { useBoardData, BoardEnvelope } from './use-board-data';
import { LifeEvent, LifeEventType } from '@/lib/types';

export interface ShareEventInput {
  type: LifeEventType;
  title: string;
  description: string;
  date: string;
  toMemberId?: string;
  campusId?: string;
}

export interface ShareEventResult {
  ok: boolean;
  error?: string;
}

export interface CommentResult {
  ok: boolean;
  error?: string;
}

export function useLifeEvents() {
  const { data, loading, error, refresh } = useBoardData<{ events: LifeEvent[] } & BoardEnvelope>(
    '/api/life-events'
  );
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const events = useMemo(() => data?.events ?? [], [data]);

  const shareEvent = useCallback(
    async (input: ShareEventInput): Promise<ShareEventResult> => {
      setSharing(true);
      setShareError(null);

      try {
        const response = await fetch('/api/life-events', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          const message = body?.error ?? `Request failed (${response.status})`;
          setShareError(message);
          return { ok: false, error: message };
        }

        // The feed changed, so reload it.
        await refresh();
        return { ok: true };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Failed to share life news';
        setShareError(message);
        return { ok: false, error: message };
      } finally {
        setSharing(false);
      }
    },
    [refresh]
  );

  const addComment = useCallback(
    async (eventId: string, text: string): Promise<CommentResult> => {
      setCommenting(true);
      setCommentError(null);

      try {
        const response = await fetch(`/api/life-events/${eventId}/comments`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          const message = body?.error ?? `Request failed (${response.status})`;
          setCommentError(message);
          return { ok: false, error: message };
        }

        // The feed changed, so reload it. The server is the source of truth
        // for comments too, so there is no optimistic append here.
        await refresh();
        return { ok: true };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Failed to post comment';
        setCommentError(message);
        return { ok: false, error: message };
      } finally {
        setCommenting(false);
      }
    },
    [refresh]
  );

  return {
    events,
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
    sharing,
    shareError,
    shareEvent,
    commenting,
    commentError,
    addComment,
    clearShareError: () => setShareError(null),
    clearCommentError: () => setCommentError(null),
  };
}
