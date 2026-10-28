-- ============================================================================
-- KINSHIP DATABASE SCHEMA — ALL MIGRATIONS COMBINED
-- Run this entire file once in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 001: Initial Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE church_role AS ENUM ('owner', 'overseer', 'moderator', 'member');
CREATE TYPE need_category AS ENUM ('practical', 'spiritual', 'financial', 'emotional', 'other');
CREATE TYPE need_urgency AS ENUM ('low', 'medium', 'high');
CREATE TYPE need_status AS ENUM ('open', 'in_progress', 'fulfilled', 'cancelled');
CREATE TYPE meal_signup_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');
CREATE TYPE volunteer_status AS ENUM ('pending', 'accepted', 'completed', 'declined');

-- Churches table
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_churches_owner_id ON churches(owner_id);

-- Campuses table
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_campuses_church_id ON campuses(church_id);

-- Church members table
CREATE TABLE church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  role church_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, user_id)
);
CREATE INDEX idx_church_members_church_id ON church_members(church_id);
CREATE INDEX idx_church_members_user_id ON church_members(user_id);
CREATE INDEX idx_church_members_campus_id ON church_members(campus_id);

-- Campus overseers
CREATE TABLE campus_overseers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_member_id UUID NOT NULL REFERENCES church_members(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_member_id, campus_id)
);
CREATE INDEX idx_campus_overseers_campus_id ON campus_overseers(campus_id);

-- Invite codes
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_church_campus ON invite_codes(church_id, campus_id);

-- Members (user profiles)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  bio TEXT,
  job_title TEXT,
  company TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  seeking_work BOOLEAN DEFAULT FALSE,
  looking_for_groups TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_members_user_id ON members(user_id);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  availability TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_assets_church_campus ON assets(church_id, campus_id);
CREATE INDEX idx_assets_owner_id ON assets(owner_id);

-- Meal trains
CREATE TABLE meal_trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_situation TEXT NOT NULL,
  recipient_dietary TEXT,
  recipient_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_meal_trains_church_campus ON meal_trains(church_id, campus_id);

-- Meal signups
CREATE TABLE meal_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_train_id UUID NOT NULL REFERENCES meal_trains(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  status meal_signup_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_train_id, date)
);
CREATE INDEX idx_meal_signups_meal_train_id ON meal_signups(meal_train_id);

-- Needs
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category need_category NOT NULL,
  urgency need_urgency DEFAULT 'medium',
  status need_status DEFAULT 'open',
  posted_by TEXT NOT NULL,
  posted_by_name TEXT NOT NULL,
  deadline DATE,
  volunteers_needed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_needs_church_campus ON needs(church_id, campus_id);
CREATE INDEX idx_needs_status ON needs(status);

-- Need volunteers
CREATE TABLE need_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT,
  status volunteer_status DEFAULT 'pending',
  volunteered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_need_volunteers_need_id ON need_volunteers(need_id);

-- Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON churches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campuses_updated_at BEFORE UPDATE ON campuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_church_members_updated_at BEFORE UPDATE ON church_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_trains_updated_at BEFORE UPDATE ON meal_trains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_needs_updated_at BEFORE UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 002: Location Fields
-- ============================================================================

ALTER TABLE campuses
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_campuses_location ON campuses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_campuses_zip ON campuses(zip_code);

-- ============================================================================
-- MIGRATION 003: Join Request System
-- ============================================================================

CREATE TYPE join_request_status AS ENUM ('pending', 'approved', 'denied', 'withdrawn');

CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_photo TEXT,
  status join_request_status DEFAULT 'pending',
  personal_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  UNIQUE(church_id, user_id, status)
);
CREATE INDEX idx_join_requests_church_id ON join_requests(church_id);
CREATE INDEX idx_join_requests_status ON join_requests(status);
CREATE INDEX idx_join_requests_user_id ON join_requests(user_id);

CREATE TABLE church_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_church_questionnaires_church_id ON church_questionnaires(church_id);

CREATE TABLE join_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  join_request_id UUID NOT NULL REFERENCES join_requests(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES church_questionnaires(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_join_request_responses_request_id ON join_request_responses(join_request_id);

CREATE TABLE join_request_denials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  denied_at TIMESTAMPTZ DEFAULT NOW(),
  denied_by TEXT NOT NULL,
  reason TEXT
);
CREATE INDEX idx_join_request_denials_church_user ON join_request_denials(church_id, user_id);

CREATE TABLE member_departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role church_role NOT NULL,
  reason TEXT,
  departed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_member_departures_church_id ON member_departures(church_id);

-- ============================================================================
-- MIGRATION 002: Support Tickets
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  church_id UUID REFERENCES churches(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('faq', 'issue', 'feature', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_church_id ON support_tickets(church_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

CREATE TRIGGER update_join_requests_updated_at BEFORE UPDATE ON join_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_church_questionnaires_updated_at BEFORE UPDATE ON church_questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 004: RLS Hardening + Access Revocation
-- ============================================================================
-- Kinship does NOT use Supabase Auth. Authentication is handled by Clerk and
-- every database read/write goes through Next.js API routes holding the
-- service_role key. The browser never talks to Supabase directly.
--
-- The service_role BYPASSES row level security, so RLS is NOT the
-- authorization boundary for the app's own API routes. That boundary is the
-- explicit, church-scoped authorization in `lib/supabase/queries.ts`.
-- This migration makes the database match that architecture:
--   - RLS is ENABLED on every table (no table is left wide open).
--   - `anon` and `authenticated` have their table/sequence/function
--     privileges REVOKED, so a leaked anon key is inert.
--   - Explicit deny-all policies are added for those roles as defense in
--     depth, in case privileges are ever restored by mistake.
--   - `service_role` keeps full access (it has BYPASSRLS).

-- Precondition check. `anon` and `authenticated` are provisioned by Supabase.
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

-- Drop the broken auth.uid() policies (Clerk ids are TEXT, auth.uid() is a UUID).
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view church tickets" ON support_tickets;

-- Revoke client access.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM anon;
REVOKE CREATE ON SCHEMA public FROM authenticated;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Explicit deny-all policies for the client roles (defense in depth).
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
-- ============================================================================
-- MIGRATION 005: Offers + Bible Study boards, and schema/UI contract alignment
-- ============================================================================
-- Applied after MIGRATION 004 so that combined.sql runs in the same order as the
-- file chain. 005 is self-sufficient: it enables RLS on its own tables, revokes
-- client access on them, installs deny_client_access policies, and grants
-- service_role explicitly (004's GRANT only covers tables that existed when it ran).
-- Full rationale lives in supabase/migrations/005_offers_and_bible_study.sql.

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

-- DONE — Schema is ready
-- ============================================================================
