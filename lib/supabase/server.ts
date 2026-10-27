// Server-only Supabase client using the service role key.
//
// IMPORTANT: The service role bypasses row level security. Every API route is
// therefore responsible for authenticating the caller (Clerk) and enforcing
// church-scoped authorization before touching the database. See
// `lib/supabase/queries.ts` for the shared authorization helpers.
//
// `import 'server-only'` makes bundlers throw if this module is ever pulled
// into a client bundle, which keeps the service role key off the browser.

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL');
}

if (!serviceRoleKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
