'use client';

// Kudos — loads the recognition feed for the caller's church and writes new
// kudos through the authenticated API route.
//
// The browser never talks to Supabase directly. It calls `/api/kudos`, which
// derives the church from the caller's own membership and refuses a kudos
// whose recipient is not in that church.

import { useCallback, useMemo, useState } from 'react';
import { useBoardData, BoardEnvelope } from './use-board-data';
import { KudosEntry } from '@/lib/types';

export interface GiveKudosResult {
  ok: boolean;
  error?: string;
}

export function useKudos() {
  const { data, loading, error, refresh } = useBoardData<{ kudos: KudosEntry[] } & BoardEnvelope>(
    '/api/kudos'
  );
  const [giving, setGiving] = useState(false);
  const [giveError, setGiveError] = useState<string | null>(null);

  const kudos = useMemo(() => data?.kudos ?? [], [data]);

  const giveKudos = useCallback(
    async (toMemberId: string, reason: string, amount: number): Promise<GiveKudosResult> => {
      setGiving(true);
      setGiveError(null);

      try {
        const response = await fetch('/api/kudos', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toMemberId, reason, amount }),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          const message = body?.error ?? `Request failed (${response.status})`;
          setGiveError(message);
          return { ok: false, error: message };
        }

        // The feed and the leaderboard both changed, so reload both.
        await refresh();
        return { ok: true };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Failed to give kudos';
        setGiveError(message);
        return { ok: false, error: message };
      } finally {
        setGiving(false);
      }
    },
    [refresh]
  );

  return {
    kudos,
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
    giving,
    giveError,
    giveKudos,
    clearGiveError: () => setGiveError(null),
  };
}
