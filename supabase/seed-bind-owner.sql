-- ============================================================================
-- KINSHIP — BIND THE DEMO OWNER TO YOUR REAL CLERK ACCOUNT
-- ============================================================================
-- Run this ONCE, in the Supabase SQL Editor, AFTER seed.sql.
--
-- WHY
--   The seed uses placeholder Clerk user ids (`user_demo_01` ... `user_demo_08`)
--   because Clerk user ids only exist once real accounts are created. Until you
--   bind yourself, the app has no way to know that YOU are the church owner, so
--   every "mine" flag on every board stays empty and the demo feels like a
--   stranger's data.
--
-- HOW TO FIND YOUR CLERK USER ID
--   1. Sign up in the app (or open Clerk Dashboard -> Users -> your user).
--   2. Copy the id. It looks like `user_2abcDEFghiJKLmnOPqrSTu` and always
--      starts with `user_`.
--
-- HOW TO USE
--   Replace `user_REPLACE_WITH_YOUR_CLERK_ID` below with your real id
--   (replace ALL occurrences), then run this file.
--
-- SCOPE
--   This only re-points the seeded demo rows at your account. It changes no
--   schema, grants nothing, and touches no other church.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PART 1 — make YOU the owner of the demo church
-- ---------------------------------------------------------------------------
UPDATE churches
   SET owner_id = 'user_REPLACE_WITH_YOUR_CLERK_ID'
 WHERE owner_id = 'user_demo_01';

UPDATE church_members
   SET user_id = 'user_REPLACE_WITH_YOUR_CLERK_ID',
       role   = 'owner'
 WHERE user_id = 'user_demo_01';

UPDATE members
   SET user_id = 'user_REPLACE_WITH_YOUR_CLERK_ID'
 WHERE user_id = 'user_demo_01';

-- ---------------------------------------------------------------------------
-- PART 2 — optional: take over the other demo people
-- ---------------------------------------------------------------------------
-- You do NOT need these. They only exist so the demo has a full-looking roster.
-- If you want to demo as several people (e.g. "show me the member view"),
-- create real Clerk accounts for them first, then run one of these:
--
--   UPDATE members        SET user_id = 'user_REAL_ID_FOR_MARCUS'  WHERE user_id = 'user_demo_02';
--   UPDATE church_members SET user_id = 'user_REAL_ID_FOR_MARCUS'  WHERE user_id = 'user_demo_02';
--   -- and the same for user_demo_03 ... user_demo_08
--
-- ---------------------------------------------------------------------------
-- PART 3 — verify it took
-- ---------------------------------------------------------------------------
-- Expect: one row, owner_id = your id, name = 'Sample Church (DEMO DATA)'
SELECT c.owner_id, c.name, cm.role, m.email
  FROM churches c
  LEFT JOIN church_members cm ON cm.user_id = c.owner_id
  LEFT JOIN members        m  ON m.user_id  = c.owner_id
 WHERE c.id = '11111111-1111-4111-8111-111111111111';
