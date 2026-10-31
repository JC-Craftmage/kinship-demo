-- ============================================================================
-- MIGRATION 008: Notifications
-- ============================================================================
-- WHY THIS MIGRATION EXISTS
--
-- The notification bell rendered a hard-coded array (`MOCK_NOTIFICATIONS`)
-- that lived inside the client component. Nothing could ever arrive, nothing
-- could be read, and the unread badge was fiction. It was the last piece of
-- invented data in the app.
--
-- Notifications are the one feed in Kinship that is NOT church-scoped: a
-- notification belongs to exactly one person. The API route
-- (`app/api/notifications/route.ts`) is the authorization boundary and it
-- scopes every read and write by the caller's own Clerk user id.
--
-- Schema notes:
--   * `user_id` is a Clerk user id (TEXT), matching `members.user_id` and
--     `church_members.user_id`.
--   * `church_id` is nullable on purpose. A notification can survive the
--     deletion of the church that produced it (for example a kickoff notice),
--     and a personal notification (a mention) may never have had one. The
--     foreign key is ON DELETE SET NULL, never CASCADE -- losing the church
--     must not delete the user's inbox.
--   * `type` is constrained to the six kinds the UI can render. An unknown
--     type is a bug, not a value.
--   * `is_read` rather than `read`: the same word as a column name makes
--     every generated query read like a keyword.
--   * `actor_user_id` / `actor_name` name whoever caused the notification.
--     The name is denormalized on purpose: the inbox must still render the
--     person who caused it after they have left the church.
--
-- SELF-SUFFICIENT: like 005, 006 and 007, this migration enables RLS on its
-- own table, revokes client access, installs its own deny-all policy, and
-- grants service_role explicitly. It produces identical post-conditions
-- whether it runs BEFORE 004_rls_policies.sql (as it does in combined.sql) or
-- AFTER it (as it does in the file chain).
--
-- SAFE TO RUN: this schema has never been applied to a live database.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Notifications table
-- ============================================================================
-- UI contract: lib/types/notifications.ts
--   AppNotification.id          string -> uuid PK
--   AppNotification.type        string -> type
--   AppNotification.title       string -> title
--   AppNotification.message     string -> message
--   AppNotification.timestamp   string -> created_at
--   AppNotification.read        boolean -> is_read
--   AppNotification.avatar      string -> resolved from members.avatar
--   AppNotification.actionUrl   string -> action_url
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,                         -- Clerk user ID (recipient)
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  actor_user_id TEXT NOT NULL DEFAULT '',        -- Clerk user ID (who caused it)
  actor_name TEXT NOT NULL DEFAULT '',           -- denormalized, survives deletion
  type TEXT NOT NULL
    CHECK (type IN (
      'kudos', 'meal_train', 'asset_request', 'join_request', 'comment', 'mention'
    )),
  title TEXT NOT NULL DEFAULT ''
    CHECK (char_length(title) <= 120),
  message TEXT NOT NULL DEFAULT ''
    CHECK (char_length(message) <= 300),
  action_url TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The bell shows one user's notifications, newest first.
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
-- The unread badge counts only what has not been read.
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- ============================================================================
-- SECTION 2: RLS, client-access revocation, and service_role grants
-- ============================================================================
-- Same three locks as every other table in this schema:
--   1. RLS enabled
--   2. anon / authenticated have no table privileges
--   3. an explicit deny-all policy for those roles (defense in depth)
-- service_role bypasses RLS and keeps full access -- the app's own API routes
-- are the authorization boundary, via explicit user-scoped checks in code.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON notifications FROM anon, authenticated;

DROP POLICY IF EXISTS "deny_client_access" ON notifications;
CREATE POLICY "deny_client_access" ON notifications
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Explicit, because 004's `GRANT ALL ON ALL TABLES` only covers the tables
-- that exist when 004 runs. When this migration runs AFTER 004 (file chain
-- order), this is the statement that makes the table reachable from the app's
-- API routes.
GRANT ALL ON notifications TO service_role;

-- ============================================================================
-- SECTION 3: Verification
-- ============================================================================
-- After applying, the new table should appear here:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'notifications';
--
-- And no client role should hold any privilege on it:
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee IN ('anon','authenticated')
--   AND table_schema = 'public' AND table_name = 'notifications';
-- ============================================================================
