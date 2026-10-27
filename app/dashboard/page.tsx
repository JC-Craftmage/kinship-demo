import { redirect } from 'next/navigation';

/**
 * Legacy alias.
 *
 * Clerk was configured with NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
 * and NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard, but the dashboard route
 * group lives at (dashboard)/home -> /home. Anyone landing on /dashboard was
 * getting a hard 404 right after authenticating.
 *
 * The env vars are now /home (see .env.local and AUTH_SETUP.md), but this
 * redirect stays so any deployment still carrying the old value - or a stale
 * Clerk dashboard setting - lands on the real dashboard instead of a 404.
 */
export default function DashboardAliasPage() {
  redirect('/home');
}
