// Demo mode — the explicit switch that lets the app show fixture data.
//
// The rules this file exists to enforce:
//
//   1. Demo mode is OFF unless the environment explicitly turns it on.
//      Nothing about the app's shape turns it on implicitly.
//   2. Only the server reads the switch. The browser never decides whether
//      it is looking at fake data — the server says so in the response and
//      the UI shows the banner because of that.
//   3. While demo mode is on, writes are refused, so fixture data can never
//      land in a real church's database.
//
// Why the switch is deliberately NOT a `NEXT_PUBLIC_*` variable: a public
// env var is baked into the client bundle at build time, so the client's idea
// of "demo" can drift from the server's actual state — and the one thing that
// must never happen is the client believing it is showing real data when it
// is not (or the reverse).

import 'server-only';

import { NextResponse } from 'next/server';

export const DEMO_MODE_ENV = 'KINSHIP_DEMO_MODE';

/**
 * True only when `KINSHIP_DEMO_MODE` is explicitly set to "true".
 * Every other value — unset, "1", "yes", "false", "" — means OFF.
 */
export function isDemoMode(): boolean {
  const raw = process.env.KINSHIP_DEMO_MODE;
  if (!raw) return false;
  return raw.trim().toLowerCase() === 'true';
}

/**
 * Guard for write endpoints. Returns a 403 response when demo mode is on, or
 * null when the write may proceed.
 */
export function demoWriteBlocked(): NextResponse | null {
  if (!isDemoMode()) return null;
  return NextResponse.json(
    {
      error:
        'Demo mode is on — this is a read-only demo, so nothing was written.',
      demo: true,
    },
    { status: 403 },
  );
}
