-- ============================================================================
-- MIGRATION 005: Offers + Bible Study boards, and schema/UI contract alignment
-- ============================================================================
-- WHY THIS MIGRATION EXISTS
--
-- The app ships six boards. The database could only store four of them:
--
--   board             | table(s) in the DB before 005
--   ------------------|------------------------------------------
--   Needs             | needs, need_volunteers          (OK)
--   Meal Trains       | meal_trains, meal_signups        (OK)
--   Physical Assets   | assets                          (OK)
--   Member Directory  | members + church_members        (OK)
--   Offers            | NONE  <-- the board had no table at all
--   Bible Study       | NONE  <-- the board had no table at all
--
-- `data/offers.ts` and `data/bible-study.ts` are mock files. Those two boards
-- rendered, filtered, and looked finished, and none of it could ever be read
-- from or written to a database. No migration fixes that on its own -- but it
-- is the first half of the fix: without these tables there is nothing for an
-- API route to talk to.
--
-- This migration also closes two schema/UI contract mismatches that would
-- have corrupted data the moment the Needs API went live:
--
--   1. `needs.category` was the enum need_category
--      ('practical','spiritual','financial','emotional','other'), while the
--      app's `NeedCategory` type and the NEED_CATEGORIES constant use the UI
--      labels ('Moving Help','Prayer Request','Childcare','Transportation',
--      'Home Repair','Event Help'). There was no mapping layer anywhere in
--      the codebase, so every category the UI can produce was unrepresentable
--      in the database. The column becomes TEXT with a CHECK constraint that
--      holds exactly the six UI labels.
--
--   2. `assets.category` and `meal_signups.meal_type` were free text with no
--      constraint, so 'Vehicle', 'truck' and 'Lunch' would all be accepted and
--      would then silently fail to match the UI's union types
--      (AssetType / MealSignup['meal']). Both get CHECK constraints holding
--      the exact legal values.
--
-- The `need_status` enum ('in_progress') vs the UI's NeedStatus
-- ('in-progress') is a pure formatting difference and is handled in the API
-- layer, not in the schema.
--
-- This migration is SELF-SUFFICIENT: it enables RLS on its own tables, installs
-- its own deny_client_access policies, and grants service_role explicitly on
-- its own tables. It therefore produces identical post-conditions whether it
-- runs BEFORE 004_rls_policies.sql (as it does in combined.sql) or AFTER it
-- (as it does in the file chain). That matters: 004's `GRANT ALL ON ALL
-- TABLES ... TO service_role` only covers tables that exist at the moment it
-- runs, so tables created afterwards would otherwise be unreachable to the
-- app's own API routes.
--
-- SAFE TO RUN: this schema has never been applied to a live database.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Offers board
-- ============================================================================
-- UI contract: lib/types/offer.ts
--   Offer.id            number   -> uuid PK (the API layer exposes a string)
--   Offer.providerId    string   -> provided_by (Clerk user id)
--   Offer.category      OfferCategory -> category (TEXT + CHECK)
--   Offer.availability  OfferAvailability -> availability (TEXT + CHECK)
--   Offer.isVerified    boolean  -> is_verified
--   Offer.campus        string   -> campus_id -> campuses.name
--
-- The category list below is `OfferCategory` from lib/types/offer.ts, verbatim.
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other'
    CHECK (category IN (
      'Moving Help', 'Childcare', 'Transportation', 'Home Repair',
      'Event Help', 'Skilled Labor', 'Equipment Rental', 'Other'
    )),
  availability TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'limited', 'unavailable')),
  availability_note TEXT,
  provided_by TEXT NOT NULL,                    -- Clerk user ID
  provided_by_name TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_church_campus ON offers(church_id, campus_id);
CREATE INDEX idx_offers_church_created ON offers(church_id, created_at DESC);

-- ============================================================================
-- SECTION 2: Bible Study board
-- ============================================================================
-- UI contract: lib/types/bible-study.ts
--   BibleStudyGroup.id            number -> uuid PK
--   BibleStudyGroup.leader        GroupLeader -> leader_id/leader_name/...
--   BibleStudyGroup.memberCount   number -> COUNT(bible_study_signups)
--   BibleStudyGroup.maxMembers    number | null -> max_members
--   BibleStudyGroup.isOpen        boolean -> is_open
--   BibleStudyGroup.tags          string[] -> tags
--
-- UI contract: lib/types/bible-study.ts
--   StudySession.id/date/topic/notes/attendance -> bible_study_sessions
--   GroupPost.id/groupId/author/content/likes  -> bible_study_posts
CREATE TABLE bible_study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  leader_id TEXT NOT NULL,                      -- Clerk user ID
  leader_name TEXT NOT NULL,
  leader_email TEXT,
  leader_phone TEXT,
  schedule TEXT,
  location TEXT,
  current_book TEXT,
  current_chapter TEXT,
  next_study_date DATE,
  max_members INTEGER,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bible_study_groups_church_campus
  ON bible_study_groups(church_id, campus_id);

CREATE TABLE bible_study_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,                        -- Clerk user ID
  user_name TEXT NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bible_study_signups_group_user_unique UNIQUE (group_id, user_id)
);

CREATE INDEX idx_bible_study_signups_group_id ON bible_study_signups(group_id);

CREATE TABLE bible_study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  topic TEXT NOT NULL,
  notes TEXT,
  attendance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bible_study_sessions_group_id ON bible_study_sessions(group_id);

CREATE TABLE bible_study_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,                      -- Clerk user ID
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bible_study_posts_group_id ON bible_study_posts(group_id);

-- ============================================================================
-- SECTION 3: Align the Needs board with the UI's category contract
-- ============================================================================
-- needs.category was need_category ('practical','spiritual','financial',
-- 'emotional','other'). The UI produces six different labels and there is no
-- mapping layer, so the column becomes TEXT constrained to the UI's values.
--
-- Order matters: convert to TEXT first (while the enum still exists and can
-- be cast), then drop the enum.

ALTER TABLE needs ALTER COLUMN category DROP DEFAULT;
ALTER TABLE needs ALTER COLUMN category TYPE TEXT USING category::text;
DROP TYPE need_category;

ALTER TABLE needs ADD CONSTRAINT needs_category_check
  CHECK (category IN (
    'Moving Help', 'Prayer Request', 'Childcare',
    'Transportation', 'Home Repair', 'Event Help'
  ));

-- ============================================================================
-- SECTION 4: Constrain the two remaining free-text columns
-- ============================================================================
-- AssetType (lib/types/member.ts): 'vehicle' | 'equipment' | 'tools' | 'business'
ALTER TABLE assets ADD CONSTRAINT assets_category_check
  CHECK (category IN ('vehicle', 'equipment', 'tools', 'business'));

-- MealSignup['meal'] (lib/types/meal-train.ts): 'lunch' | 'dinner' | 'breakfast'
ALTER TABLE meal_signups ADD CONSTRAINT meal_signups_meal_type_check
  CHECK (meal_type IN ('lunch', 'dinner', 'breakfast'));

-- ============================================================================
-- SECTION 5: updated_at triggers for the new tables
-- ============================================================================
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_study_groups_updated_at BEFORE UPDATE ON bible_study_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- bible_study_signups / _sessions / _posts are append-mostly and carry
-- created_at only, so they need no updated_at trigger.

-- ============================================================================
-- SECTION 6: RLS, client-access revocation, and service_role grants
-- ============================================================================
-- Same three locks as every other table in this schema:
--   1. RLS enabled
--   2. anon / authenticated have no table privileges
--   3. an explicit deny-all policy for those roles (defense in depth)
-- service_role bypasses RLS and keeps full access -- the app's own API routes
-- are the authorization boundary, via explicit church-scoped checks in code.
ALTER TABLE offers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_groups   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_signups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_posts    ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON offers               FROM anon, authenticated;
REVOKE ALL ON bible_study_groups   FROM anon, authenticated;
REVOKE ALL ON bible_study_signups  FROM anon, authenticated;
REVOKE ALL ON bible_study_sessions FROM anon, authenticated;
REVOKE ALL ON bible_study_posts    FROM anon, authenticated;

DROP POLICY IF EXISTS "deny_client_access" ON offers;
CREATE POLICY "deny_client_access" ON offers
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_client_access" ON bible_study_groups;
CREATE POLICY "deny_client_access" ON bible_study_groups
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_client_access" ON bible_study_signups;
CREATE POLICY "deny_client_access" ON bible_study_signups
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_client_access" ON bible_study_sessions;
CREATE POLICY "deny_client_access" ON bible_study_sessions
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_client_access" ON bible_study_posts;
CREATE POLICY "deny_client_access" ON bible_study_posts
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- Explicit, because 004's `GRANT ALL ON ALL TABLES` only covers the tables
-- that exist when 004 runs. When this migration runs AFTER 004 (file chain
-- order), these are the only statements that make the new tables reachable
-- from the app's API routes.
GRANT ALL ON offers               TO service_role;
GRANT ALL ON bible_study_groups   TO service_role;
GRANT ALL ON bible_study_signups  TO service_role;
GRANT ALL ON bible_study_sessions TO service_role;
GRANT ALL ON bible_study_posts    TO service_role;

-- ============================================================================
-- SECTION 7: Verification
-- ============================================================================
-- After applying, the five new tables should appear here:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN (
--   'offers','bible_study_groups','bible_study_signups',
--   'bible_study_sessions','bible_study_posts')
-- ORDER BY table_name;
--
-- And no client role should hold any privilege on them:
--
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee IN ('anon','authenticated') AND table_schema = 'public';
-- ============================================================================
