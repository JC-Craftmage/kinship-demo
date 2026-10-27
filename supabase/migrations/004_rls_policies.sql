-- ============================================================================
-- MIGRATION 004: RLS Hardening + Access Revocation
-- ============================================================================
-- WHY THIS MIGRATION EXISTS
--
-- Kinship does NOT use Supabase Auth. Authentication is handled by Clerk,
-- and every database read/write goes through Next.js API routes that hold the
-- service_role key. The browser never talks to Supabase directly.
--
-- That means:
--   1. The `anon` and `authenticated` roles have NO legitimate use in this app.
--   2. The policies written in 002_support_tickets.sql used `auth.uid()`,
--      which returns a Supabase Auth uid (a UUID). Clerk user ids are TEXT
--      values like `user_2abc...`. Those policies could never match anything,
--      so they provided zero real protection.
--   3. The service_role BYPASSES row level security, so RLS is NOT the
--      authorization boundary for the app's own API routes. The boundary is
--      the explicit, church-scoped authorization in `lib/supabase/queries.ts`.
--      Every API route authenticates with Clerk and verifies church role
--      before touching a row.
--
-- THIS MIGRATION makes the database match that architecture:
--   - RLS is ENABLED on every table (no table is left wide open).
--   - `anon` and `authenticated` have their table/sequence/function privileges
--     REVOKED, so a leaked anon key is useless.
--   - Explicit deny-all policies are still added for `anon`/`authenticated` as
--     defense in depth, in case privileges are ever restored by mistake.
--   - `service_role` keeps full access (it has BYPASSRLS).
--
-- SAFE TO RUN: this schema has never been applied to a live database. Running
-- it before the first deploy means the database is correct from day one.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Enable RLS on every table
-- ============================================================================

-- Precondition check. `anon` and `authenticated` are provisioned by Supabase.
-- If they are missing, the REVOKE statements in Section 3 and the policies in
-- Section 4 would fail with a cryptic error, so fail early and clearly.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    RAISE EXCEPTION
      'Supabase roles anon/authenticated are missing. This migration expects a Supabase project.';
  END IF;
END $$;

ALTER TABLE churches              ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_overseers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE members               ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_trains           ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_signups          ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE need_volunteers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_request_denials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_departures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets       ENABLE ROW LEVEL SECURITY;

-- Belt-and-braces: catch any table added later that wasn't listed above.
DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = false
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.relname);
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 2: Drop the broken auth.uid() policies
-- ============================================================================
-- These could never match a Clerk user id, so they were misleading. They are
-- replaced by explicit deny-all policies in Section 4.

DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view church tickets" ON support_tickets;

-- ============================================================================
-- SECTION 3: Revoke client access
-- ============================================================================
-- The browser never calls Supabase. Revoking the privileges makes a leaked
-- anon key (or a leaked NEXT_PUBLIC_SUPABASE_ANON_KEY) completely inert.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- Functions default to EXECUTE for PUBLIC, which would re-grant the revoke
-- above. Take it away from PUBLIC and hand it back explicitly to service_role
-- only. Trigger functions are checked for EXECUTE at CREATE TRIGGER time, not
-- at fire time, so the existing updated_at triggers keep working.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Stop anonymous roles from creating objects in the public schema.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM anon;
REVOKE CREATE ON SCHEMA public FROM authenticated;

-- Keep schema usage limited to the roles that need it.
GRANT USAGE ON SCHEMA public TO service_role;

-- service_role keeps unrestricted access (it has BYPASSRLS).
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Also cover anything created later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- ============================================================================
-- SECTION 4: Explicit deny-all policies for client roles
-- ============================================================================
-- Defense in depth. Even if privileges are accidentally restored later, RLS
-- still refuses to hand a single row to a browser-side client.
--
-- service_role bypasses RLS, so the app's own API routes are unaffected: their
-- authorization lives in `lib/supabase/queries.ts`, not here.

DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "deny_client_access" ON public.%I', tbl.relname);
    EXECUTE format(
      'CREATE POLICY "deny_client_access" ON public.%I '
      'FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      tbl.relname
    );
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 5: Verification
-- ============================================================================
-- Run this block after applying the migration. It should report zero tables
-- with RLS disabled.
--
-- SELECT c.relname AS table_without_rls
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = false;
--
-- And confirm the client roles hold no table privileges:
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee IN ('anon', 'authenticated') AND table_schema = 'public';
-- ============================================================================
