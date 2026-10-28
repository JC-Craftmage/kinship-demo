'use client';

// Shared fetch-and-hold helper for the dashboard boards.
//
// The browser never talks to Supabase directly — it calls the authenticated
// Next.js API routes under `app/api/*`, which scope every read to the
// caller's own church.

import { useCallback, useEffect, useState } from 'react';

export interface BoardState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBoardData<T>(path: string): BoardState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(path, {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${response.status})`);
      }

      setData((await response.json()) as T);
    } catch (cause) {
      setData(null);
      setError(cause instanceof Error ? cause.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
