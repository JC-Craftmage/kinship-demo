-- ============================================================================
-- MIGRATION 007: Life Events board
-- ============================================================================
-- WHY THIS MIGRATION EXISTS
--
-- The Life Events page was the last screen in the app that shipped fiction
-- with no way to make it real: `MOCK_EVENTS` lived in the page component,
-- `handleCreate()` pushed a new event into React state and nowhere else, and
-- the reactions and comments on screen were literals. A pastor watching a
-- demo would see four weddings and a baptism that no church had ever
-- posted, and there was no table to post one into.
--
-- This migration creates the table the page needs. The API route
-- (`app/api/life-events/route.ts`) is the authorization boundary: it derives
-- the church from the caller's membership, and the comments route
-- (`app/api/life-events/[id]/comments/route.ts`) refuses to attach a comment
-- to an event that does not belong to that church.
--
-- Schema notes:
--   * `to_member_id` -> members.id, nullable. A life event can be about the
--     church ("our new building opened") without being about one member.
--   * `created_by_user_id` / `created_by_name` are denormalized on purpose:
--     the feed must still name someone who has since left the church.
--   * `event_type` is CHECKed to the six types the UI can produce. Anything
--     else is a bug, not a value.
--   * `event_date` is the day being celebrated; `created_at` is when it was
--     posted. The feed sorts by event_date so the celebrations read in
--     calendar order.
--
-- SELF-SUFFICIENT: like 005 and 006, this migration enables RLS on its own
-- tables, revokes client access, installs its own deny-all policy, and
-- grants service_role explicitly. It produces identical post-conditions
-- whether it runs BEFORE or AFTER 004_rls_policies.sql: in the file chain it
-- runs last, and in combined.sql it is appended after 006 (so also after
-- 004). The explicit GRANT statements below are what make the tables
-- reachable from the app's API routes either way.
--
-- SAFE TO RUN: this schema has never been applied to a live database.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Life events
-- ============================================================================
-- UI contract: lib/types/life-events.ts
--   LifeEvent.id          string -> uuid PK
--   LifeEvent.type        string -> event_type ('baby' | 'birthday' | ...)
--   LifeEvent.title       string -> title
--   LifeEvent.description string -> description
--   LifeEvent.date        string -> event_date (YYYY-MM-DD)
--   LifeEvent.memberName  string -> resolved from members.name at read time
--   LifeEvent.memberAvatar string -> resolved from members.avatar at read time
--   LifeEvent.campus      string -> resolved from campuses.name at read time
--   LifeEvent.comments    LifeEventComment[] -> life_event_comments
CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  created_by_user_id TEXT NOT NULL,                 -- Clerk user ID
  created_by_name TEXT NOT NULL DEFAULT '',
  to_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('baby', 'birthday', 'wedding', 'new-home', 'graduation', 'travel')),
  title TEXT NOT NULL
    CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT NOT NULL DEFAULT ''
    CHECK (char_length(description) <= 300),
  event_date DATE NOT NULL,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- The feed reads one church, newest celebration first.
CREATE INDEX idx_life_events_church_date ON life_events(church_id, event_date DESC, created_at DESC);

-- ============================================================================
-- SECTION 2: Comments on a life event
-- ============================================================================
-- UI contract: lib/types/life-events.ts
--   LifeEventComment.id         string -> uuid PK
--   LifeEventComment.authorName  string -> author_name
--   LifeEventComment.text        string -> body
--   LifeEventComment.time        string -> created_at
CREATE TABLE life_event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_event_id UUID NOT NULL REFERENCES life_events(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL,                    -- Clerk user ID
  author_name TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL
    CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- The detail modal reads one event's comments, oldest first.
CREATE INDEX idx_life_event_comments_event ON life_event_comments(life_event_id, created_at ASC);

-- ============================================================================
-- SECTION 3: RLS, client-access revocation, and service_role grants
-- ============================================================================
-- Same three locks as every other table in this schema:
--   1. RLS enabled
--   2. anon / authenticated have no table privileges
--   3. an explicit deny-all policy for those roles (defense in depth)
-- service_role bypasses RLS and keeps full access -- the app's own API routes
-- are the authorization boundary, via explicit church-scoped checks in code.
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_event_comments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON life_events FROM anon, authenticated;
REVOKE ALL ON life_event_comments FROM anon, authenticated;

DROP POLICY IF EXISTS "deny_client_access" ON life_events;
CREATE POLICY "deny_client_access" ON life_events
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_client_access" ON life_event_comments;
CREATE POLICY "deny_client_access" ON life_event_comments
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Explicit, because 004's `GRANT ALL ON ALL TABLES` only covers the tables
-- that exist when 004 runs. When this migration runs AFTER 004 (file chain
-- order), this is the statement that makes the tables reachable from the
-- app's API routes.
GRANT ALL ON life_events TO service_role;
GRANT ALL ON life_event_comments TO service_role;

-- ============================================================================
-- SECTION 4: Verification
-- ============================================================================
-- After applying, the new tables should appear here:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('life_events', 'life_event_comments');
--
-- And no client role should hold any privilege on them:
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee IN ('anon','authenticated')
--   AND table_schema = 'public'
--   AND table_name IN ('life_events', 'life_event_comments');
-- ============================================================================
