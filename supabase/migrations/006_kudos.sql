-- ============================================================================
-- MIGRATION 006: Kudos board
-- ============================================================================
-- WHY THIS MIGRATION EXISTS
--
-- The Kudos board was the last board with no table behind it. `MOCK_KUDOS_FEED`
-- lived in the page component itself and `Member.kudos` was hard-coded to 0
-- in `lib/board-mappers.ts`, so the leaderboard and the feed were fiction:
-- nothing could be given, nothing could be counted, and the numbers did not
-- agree with each other.
--
-- This migration creates the table the board needs. The API route
-- (`app/api/kudos/route.ts`) is the authorization boundary: it derives the
-- church from the caller's membership and refuses a kudos whose recipient is
-- not a member of that same church.
--
-- Schema notes:
--   * `to_member_id` -> members.id. The recipient's church is not stored on
--     `members` (membership lives in `church_members`), so "same church" is
--     enforced in the route, not by a foreign key.
--   * `from_user_id` is a Clerk user id (TEXT), matching `members.user_id`
--     and `church_members.user_id`.
--   * `from_name` is denormalized on purpose: the feed must still render a
--     giver who has since left, and the app has no other way to name them.
--   * `amount` is constrained to 1..10, which is exactly what the UI can
--     produce. Anything outside that range is a bug, not a value.
--
-- SELF-SUFFICIENT: like 005, this migration enables RLS on its own table,
-- revokes client access, installs its own deny-all policy, and grants
-- service_role explicitly. It produces identical post-conditions whether it
-- runs BEFORE 004_rls_policies.sql (as it does in combined.sql) or AFTER it
-- (as it does in the file chain).
--
-- SAFE TO RUN: this schema has never been applied to a live database.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Kudos table
-- ============================================================================
-- UI contract: lib/types/kudos.ts
--   KudosEntry.id           string -> uuid PK
--   KudosEntry.toMemberId   string -> to_member_id (members.id)
--   KudosEntry.memberName   string -> resolved from members.name at read time
--   KudosEntry.memberAvatar string -> resolved from members.avatar at read time
--   KudosEntry.fromName     string -> from_name
--   KudosEntry.reason       string -> reason
--   KudosEntry.amount       number -> amount (1..10)
--   KudosEntry.createdAt    string -> created_at
--   KudosEntry.campus       string -> resolved from church_members.campus_id
CREATE TABLE kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL,                  -- Clerk user ID
  from_name TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL DEFAULT 1
    CHECK (amount BETWEEN 1 AND 10),
  reason TEXT NOT NULL DEFAULT ''
    CHECK (char_length(reason) <= 200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- The feed reads one church, newest first.
CREATE INDEX idx_kudos_church_created ON kudos(church_id, created_at DESC);
-- The leaderboard sums the amounts a member has received.
CREATE INDEX idx_kudos_church_member ON kudos(church_id, to_member_id);

-- ============================================================================
-- SECTION 2: RLS, client-access revocation, and service_role grants
-- ============================================================================
-- Same three locks as every other table in this schema:
--   1. RLS enabled
--   2. anon / authenticated have no table privileges
--   3. an explicit deny-all policy for those roles (defense in depth)
-- service_role bypasses RLS and keeps full access -- the app's own API routes
-- are the authorization boundary, via explicit church-scoped checks in code.
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON kudos FROM anon, authenticated;

DROP POLICY IF EXISTS "deny_client_access" ON kudos;
CREATE POLICY "deny_client_access" ON kudos
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Explicit, because 004's `GRANT ALL ON ALL TABLES` only covers the tables
-- that exist when 004 runs. When this migration runs AFTER 004 (file chain
-- order), this is the statement that makes the table reachable from the app's
-- API routes.
GRANT ALL ON kudos TO service_role;

-- ============================================================================
-- SECTION 3: Verification
-- ============================================================================
-- After applying, the new table should appear here:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'kudos';
--
-- And no client role should hold any privilege on it:
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee IN ('anon','authenticated')
--   AND table_schema = 'public' AND table_name = 'kudos';
-- ============================================================================
