-- ============================================================================
-- KINSHIP SEED DATA — one fully populated demo church
-- ============================================================================
-- Purpose: a brand-new Supabase project gives you 26 empty tables. That is a
-- terrible first impression for a pastor you are pitching, and it makes every
-- screen look broken (empty states, zero counts, no way to tell a working
-- feature from a missing one).
--
-- This file fills one church with realistic content across every board:
-- directory, needs, offers, assets, meal trains, kudos, life events, bible
-- study, notifications, join requests, questionnaires and support tickets.
--
-- HOW TO RUN
--   Supabase dashboard -> SQL Editor -> New query -> paste this file -> Run.
--   Run it AFTER combined.sql (or after the 9-file migration chain).
--   It is safe to run twice: every insert uses fixed ids and starts with
--   `ON CONFLICT (id) DO NOTHING`.
--
-- SAFETY
--   * Every row belongs to ONE demo church with a fixed id. Nothing touches a
--     real church's data.
--   * The demo church is named "Sample Church (DEMO DATA)" on purpose, so it
--     can never be mistaken for a real congregation.
--   * `user_demo_*` are PLACEHOLDER Clerk user ids. See seed-bind-owner.sql
--     at the end of this file to bind the owner to your real Clerk account.
--   * This file only INSERTs. It never alters the schema and never grants
--     anything to `anon`/`authenticated`.
--
-- Verified against a real Postgres engine by `npm run verify:seed`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Church + campuses
-- ----------------------------------------------------------------------------
INSERT INTO churches (id, name, description, owner_id, created_at, updated_at) VALUES
  ('11111111-1111-4111-8111-111111111111',
   'Sample Church (DEMO DATA)',
   'A demo congregation used to show what Kinship looks like when it is actually populated. Not a real church.',
   'user_demo_01', NOW() - INTERVAL '90 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO campuses (id, church_id, name, location, address, created_at, updated_at) VALUES
  ('22222222-2222-4222-8222-222222222221',
   '11111111-1111-4111-8111-111111111111', 'Main Campus', 'Downtown', '100 Example Ave, Sample City, WA',
   NOW() - INTERVAL '90 days', NOW()),
  ('22222222-2222-4222-8222-222222222222',
   '11111111-1111-4111-8111-111111111111', 'North Campus', 'Northside', '200 Example Rd, Sample City, WA',
   NOW() - INTERVAL '60 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- People
-- ----------------------------------------------------------------------------
INSERT INTO church_members (id, church_id, campus_id, user_id, role, joined_at, updated_at) VALUES
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_01', 'owner',    NOW() - INTERVAL '90 days', NOW()),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_02', 'overseer', NOW() - INTERVAL '85 days', NOW()),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'user_demo_03', 'moderator', NOW() - INTERVAL '70 days', NOW()),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_04', 'member',   NOW() - INTERVAL '60 days', NOW()),
  ('33333333-3333-4333-8333-333333333335', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'user_demo_05', 'member',   NOW() - INTERVAL '52 days', NOW()),
  ('33333333-3333-4333-8333-333333333336', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_06', 'member',   NOW() - INTERVAL '30 days', NOW()),
  ('33333333-3333-4333-8333-333333333337', '11111111-1111-4111-8111-111111111111', NULL,                            'user_demo_07', 'member',   NOW() - INTERVAL '14 days', NOW()),
  ('33333333-3333-4333-8333-333333333338', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'user_demo_08', 'member',   NOW() - INTERVAL '5 days',  NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO campus_overseers (id, church_member_id, campus_id, assigned_at) VALUES
  ('3a3a3a3a-3a3a-4a3a-8a3a-3a3a3a3a3a01', '33333333-3333-4333-8333-333333333332', '22222222-2222-4222-8222-222222222221', NOW() - INTERVAL '85 days'),
  ('3a3a3a3a-3a3a-4a3a-8a3a-3a3a3a3a3a02', '33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '70 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, user_id, name, email, avatar, phone, bio, job_title, company, skills, interests, seeking_work, looking_for_groups, created_at, updated_at) VALUES
  ('44444444-4444-4444-8444-444444444441', 'user_demo_01', 'Dana Whitfield',  'dana@example.com',   'DW', '555-0101', 'Pastor. Here to make sure nobody walks through the door alone.', 'Pastor',              'Sample Church', ARRAY['Leadership','Counseling'], ARRAY['Serving','Mercy'], false, ARRAY[]::TEXT[], NOW() - INTERVAL '90 days', NOW()),
  ('44444444-4444-4444-8444-444444444442', 'user_demo_02', 'Marcus Ellis',   'marcus@example.com', 'ME', '555-0102', 'Runs the welcome desk and the small groups.',                         'Overseer',            'Sample Church', ARRAY['Facilities','First Aid'], ARRAY['Outdoors'], false, ARRAY[]::TEXT[], NOW() - INTERVAL '85 days', NOW()),
  ('44444444-4444-4444-8444-444444444443', 'user_demo_03', 'Priya Raman',    'priya@example.com',  'PR', '555-0103', 'Coordinate communications and the newsletter.',                         'Communications Lead', 'Sample Church', ARRAY['Writing','Design'],    ARRAY['Community'], false, ARRAY[]::TEXT[], NOW() - INTERVAL '70 days', NOW()),
  ('44444444-4444-4444-8444-444444444444', 'user_demo_04', 'Tobias Reed',    'tobias@example.com', 'TR', '555-0104', 'Carpenter. Happy to lend a hand on a build day.',                     'Carpenter',           'Reed & Sons',   ARRAY['Carpentry','Trucking'], ARRAY['Woodworking'], true, ARRAY['Bible Study'], NOW() - INTERVAL '60 days', NOW()),
  ('44444444-4444-4444-8444-444444444445', 'user_demo_05', 'Naomi Okafor',   'naomi@example.com',  'NO', '555-0105', 'Nurse. Two kids at home, looking for flexible work.',                 'Registered Nurse',    'County Health', ARRAY['Nursing','First Aid'], ARRAY['Mentoring'], true, ARRAY[]::TEXT[], NOW() - INTERVAL '52 days', NOW()),
  ('44444444-4444-4444-8444-444444444446', 'user_demo_06', 'Eli Carpenter',  'eli@example.com',    'EC', '555-0106', 'Landscaper with a trailer and a chainsaw.',                           'Landscaper',          'Self-employed', ARRAY['Landscaping','Trucking'], ARRAY['Outdoors'], false, ARRAY[]::TEXT[], NOW() - INTERVAL '30 days', NOW()),
  ('44444444-4444-4444-8444-444444444447', 'user_demo_07', 'Sofia Marchetti','sofia@example.com',  'SM', '555-0107', 'Recently moved here. Looking to plug into a small group.',             'Photographer',         'Marchetti Studio', ARRAY['Photography'], ARRAY['Art'], true, ARRAY['Bible Study','Serving'], NOW() - INTERVAL '14 days', NOW()),
  ('44444444-4444-4444-8444-444444444448', 'user_demo_08', 'Jonah Kim',      'jonah@example.com',  'JK', '555-0108', 'Student. Shovels and ladder available.',                                'Student',             'Sample Church', ARRAY['Yard Work'], ARRAY['Music'], false, ARRAY[]::TEXT[], NOW() - INTERVAL '5 days', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO member_departures (id, church_id, user_id, user_name, role, reason, departed_at) VALUES
  ('55555555-5555-4555-8555-555555555551', '11111111-1111-4111-8111-111111111111', 'user_demo_09', 'Grant Mosely', 'member', 'Moved out of state', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Join requests + questionnaires
-- ----------------------------------------------------------------------------
INSERT INTO church_questionnaires (id, church_id, question, is_required, display_order, is_active, created_at) VALUES
  ('66666666-6666-4666-8666-666666666661', '11111111-1111-4111-8111-111111111111', 'Which campus do you attend?',        true,  1, true, NOW() - INTERVAL '80 days'),
  ('66666666-6666-4666-8666-666666666662', '11111111-1111-4111-8111-111111111111', 'How did you hear about us?',         false, 2, true, NOW() - INTERVAL '80 days'),
  ('66666666-6666-4666-8666-666666666663', '11111111-1111-4111-8111-111111111111', 'Anything we can do to help you settle in?', false, 3, true, NOW() - INTERVAL '80 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO join_requests (id, church_id, campus_id, user_id, user_name, user_email, user_photo, status, personal_note, created_at, updated_at, reviewed_by, reviewed_at, review_note) VALUES
  ('77777777-7777-4777-8777-777777777771', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_pending_01', 'Casey Nguyen', 'casey@example.com', 'CN', 'pending', 'Just moved here from out of state and looking for a church family.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL, NULL, NULL),
  ('77777777-7777-4777-8777-777777777772', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'user_demo_pending_02', 'Ruth Delgado', 'ruth@example.com', 'RD', 'pending', 'Retired and ready to serve somewhere.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, NULL, NULL),
  ('77777777-7777-4777-8777-777777777773', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_08', 'Jonah Kim', 'jonah@example.com', 'JK', 'approved', 'Been coming for a few months.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', 'user_demo_01', NOW() - INTERVAL '9 days', 'Welcome to the family.'),
  ('77777777-7777-4777-8777-777777777774', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_denied_01', 'Alex Trask', 'alex@example.com', 'AT', 'denied', 'Looking for a place to stay.', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days', 'user_demo_01', NOW() - INTERVAL '39 days', 'We do not operate a shelter at this time.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO join_request_responses (id, join_request_id, questionnaire_id, answer, created_at) VALUES
  ('88888888-8888-4888-8888-888888888881', '77777777-7777-4777-8777-777777777771', '66666666-6666-4666-8666-666666666661', 'Main Campus', NOW() - INTERVAL '2 days'),
  ('88888888-8888-4888-8888-888888888882', '77777777-7777-4777-8777-777777777771', '66666666-6666-4666-8666-666666666662', 'A neighbor invited me', NOW() - INTERVAL '2 days'),
  ('88888888-8888-4888-8888-888888888883', '77777777-7777-4777-8777-777777777771', '66666666-6666-4666-8666-666666666663', 'I need help with furniture and a vehicle.', NOW() - INTERVAL '2 days'),
  ('88888888-8888-4888-8888-888888888884', '77777777-7777-4777-8777-777777777772', '66666666-6666-4666-8666-666666666661', 'North Campus', NOW() - INTERVAL '1 day'),
  ('88888888-8888-4888-8888-888888888885', '77777777-7777-4777-8777-777777777772', '66666666-6666-4666-8666-666666666663', 'A meal train would be wonderful.', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO join_request_denials (id, church_id, user_id, denied_at, denied_by, reason) VALUES
  ('99999999-9999-4999-8999-999999999991', '11111111-1111-4111-8111-111111111111', 'user_demo_denied_01', NOW() - INTERVAL '39 days', 'user_demo_01', 'We do not operate a shelter at this time.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invite_codes (id, church_id, campus_id, code, created_by, expires_at, max_uses, current_uses, is_active, created_at) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'DEMO-2026-WELCOME', 'user_demo_01', NOW() + INTERVAL '60 days', 25, 3, true, NOW() - INTERVAL '30 days'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'DEMO-2026-NORTH',   'user_demo_02', NOW() + INTERVAL '60 days', 25, 1, true, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Needs board
-- ----------------------------------------------------------------------------
INSERT INTO needs (id, church_id, campus_id, title, description, category, urgency, status, posted_by, posted_by_name, deadline, volunteers_needed, created_at, updated_at) VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Need a truck to move a family of four', 'Moving from a storage unit on Saturday morning. Need a truck and two strong people.', 'Moving Help', 'high', 'open', 'user_demo_01', 'Dana Whitfield', CURRENT_DATE + 6, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Baby gate and a car seat', 'Expecting our third in March and could use a used car seat.', 'Childcare', 'medium', 'open', 'user_demo_07', 'Sofia Marchetti', CURRENT_DATE + 20, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Rides to the Thursday prayer meeting', 'Need a ride across town on Thursday evenings for the next month.', 'Transportation', 'medium', 'in_progress', 'user_demo_05', 'Naomi Okafor', CURRENT_DATE + 10, 2, NOW() - INTERVAL '9 days', NOW() - INTERVAL '3 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Repair a leaking kitchen faucet', 'Slow drip that is getting worse. Happy to trade for garden help.', 'Home Repair', 'low', 'fulfilled', 'user_demo_08', 'Jonah Kim', CURRENT_DATE - 12, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '14 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Childcare for the retreat Saturday', 'Two adults needed for the 9am to 2pm workday retreat.', 'Event Help', 'high', 'open', 'user_demo_02', 'Marcus Ellis', CURRENT_DATE + 12, 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Prayer for my mother''s surgery', 'She goes in Tuesday. Praying for a smooth procedure.', 'Prayer Request', 'high', 'open', 'user_demo_04', 'Tobias Reed', CURRENT_DATE + 4, 0, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO need_volunteers (id, need_id, user_id, user_name, message, status, volunteered_at) VALUES
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'user_demo_06', 'Eli Carpenter', 'I can drive Thursday evenings.', 'accepted', NOW() - INTERVAL '8 days'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'user_demo_02', 'Marcus Ellis', 'I can cover one week if needed.', 'pending', NOW() - INTERVAL '5 days'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'user_demo_04', 'Tobias Reed', 'Faucet is fixed. It was the cartridge.', 'completed', NOW() - INTERVAL '28 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Offers board
-- ----------------------------------------------------------------------------
INSERT INTO offers (id, church_id, campus_id, title, description, category, availability, availability_note, provided_by, provided_by_name, is_verified, created_at, updated_at) VALUES
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Truck and trailer for moving day', 'Pickup truck plus 16ft trailer. Can haul about 2 tons.', 'Transportation', 'available', 'Weekends, with a day of notice.', 'user_demo_04', 'Tobias Reed', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Childcare on Wednesday nights', 'I sit with two kids while their parents are at Bible study.', 'Childcare', 'limited', 'Wednesday 6:30-8:30pm only.', 'user_demo_03', 'Priya Raman', true, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd3', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'General home repair', 'Carpentry, drywall, basic plumbing and electrical.', 'Skilled Labor', 'available', 'Evenings after 6pm.', 'user_demo_04', 'Tobias Reed', true, NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd4', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Ladder and roof rack rental', 'Two extension ladders and a roof rack for a van.', 'Equipment Rental', 'unavailable', 'Out on loan until the end of the month.', 'user_demo_06', 'Eli Carpenter', false, NOW() - INTERVAL '35 days', NOW() - INTERVAL '6 days'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd5', '11111111-1111-4111-8111-111111111111', NULL, 'Landscaping help on Saturdays', 'Leaf removal, yard cleanup, hedge trimming.', 'Skilled Labor', 'available', 'Saturdays, weather permitting.', 'user_demo_06', 'Eli Carpenter', false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Assets board
-- ----------------------------------------------------------------------------
INSERT INTO assets (id, church_id, campus_id, owner_id, name, category, description, availability, image_url, created_at, updated_at) VALUES
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_04', 'Pickup Truck',        'vehicle',    '2008 Ford F-150. Tied up most weekdays.', 'Weekdays after 4pm', NULL, NOW() - INTERVAL '50 days', NOW() - INTERVAL '10 days'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'user_demo_04', 'Table Saw',            'tools',      'Portable table saw with a fresh blade.', 'Any day, ask first', NULL, NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3', '11111111-1111-4111-8111-111111111111', NULL,                            'user_demo_06', 'Chainsaw',             'equipment', '16 inch chainsaw. Chaps included.', 'Weekends', NULL, NOW() - INTERVAL '33 days', NOW() - INTERVAL '33 days'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee4', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'user_demo_06', 'Cargo Trailer',        'vehicle',    '6ft utility trailer with straps.', 'Any day', NULL, NOW() - INTERVAL '33 days', NOW() - INTERVAL '33 days'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5', '11111111-1111-4111-8111-111111111111', NULL,                            'user_demo_03', 'Camera Kit',           'equipment', 'DSLR with two lenses for church photos.', 'Sundays', NULL, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Meal trains
-- ----------------------------------------------------------------------------
INSERT INTO meal_trains (id, church_id, campus_id, recipient_name, recipient_situation, recipient_dietary, recipient_address, start_date, end_date, created_by, created_at, updated_at) VALUES
  ('ffffffff-ffff-4fff-8fff-fffffffffff1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'The Alvarez Family', 'Recovering from surgery, three mouths at home.', 'No pork', '412 Example St, Sample City, WA', CURRENT_DATE - 7, CURRENT_DATE + 21, 'user_demo_02', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff2', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Doreen Hobbs', 'Elderly and recovering from a fall.', 'Soft foods', '88 Example Ct, Sample City, WA', CURRENT_DATE - 3, CURRENT_DATE + 14, 'user_demo_03', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO meal_signups (id, meal_train_id, user_id, user_name, date, meal_type, status, notes, created_at) VALUES
  ('12121212-1212-4121-8121-121212121201', 'ffffffff-ffff-4fff-8fff-fffffffffff1', 'user_demo_05', 'Naomi Okafor',   CURRENT_DATE + 1,  'dinner',    'confirmed', 'Will bring a side dish.', NOW() - INTERVAL '3 days'),
  ('12121212-1212-4121-8121-121212121202', 'ffffffff-ffff-4fff-8fff-fffffffffff1', 'user_demo_04', 'Tobias Reed',    CURRENT_DATE + 2,  'lunch',     'confirmed', '', NOW() - INTERVAL '3 days'),
  ('12121212-1212-4121-8121-121212121203', 'ffffffff-ffff-4fff-8fff-fffffffffff1', 'user_demo_06', 'Eli Carpenter',  CURRENT_DATE + 3,  'dinner',    'pending',   'Confirming with work.', NOW() - INTERVAL '1 day'),
  ('12121212-1212-4121-8121-121212121204', 'ffffffff-ffff-4fff-8fff-fffffffffff1', 'user_demo_07', 'Sofia Marchetti',CURRENT_DATE + 4,  'breakfast', 'confirmed', 'Breakfast for the family.', NOW() - INTERVAL '1 day'),
  ('12121212-1212-4121-8121-121212121205', 'ffffffff-ffff-4fff-8fff-fffffffffff2', 'user_demo_03', 'Priya Raman',    CURRENT_DATE + 1,  'lunch',     'confirmed', '', NOW() - INTERVAL '2 days'),
  ('12121212-1212-4121-8121-121212121206', 'ffffffff-ffff-4fff-8fff-fffffffffff2', 'user_demo_08', 'Jonah Kim',      CURRENT_DATE + 2,  'dinner',    'delivered', 'Delivered Tuesday.', NOW() - INTERVAL '2 days'),
  ('12121212-1212-4121-8121-121212121207', 'ffffffff-ffff-4fff-8fff-fffffffffff2', 'user_demo_08', 'Jonah Kim',      CURRENT_DATE - 1,  'lunch',     'delivered', 'Delivered Monday.', NOW() - INTERVAL '3 days'),
  ('12121212-1212-4121-8121-121212121208', 'ffffffff-ffff-4fff-8fff-fffffffffff2', 'user_demo_05', 'Naomi Okafor',   CURRENT_DATE + 3,  'dinner',    'cancelled', 'Had a schedule conflict.', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Kudos
-- ----------------------------------------------------------------------------
INSERT INTO kudos (id, church_id, to_member_id, from_user_id, from_name, amount, reason, created_at) VALUES
  ('13131313-1313-4131-8131-131313131301', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444445', 'user_demo_01', 'Dana Whitfield', 5, 'Set up the meal train for Doreen in one hour.', NOW() - INTERVAL '2 days'),
  ('13131313-1313-4131-8131-131313131302', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444', 'user_demo_02', 'Marcus Ellis',   3, 'Fixed the faucet and refused payment.', NOW() - INTERVAL '5 days'),
  ('13131313-1313-4131-8131-131313131303', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444446', 'user_demo_03', 'Priya Raman',    4, 'Drove six people to the retreat.', NOW() - INTERVAL '8 days'),
  ('13131313-1313-4131-8131-131313131304', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444441', 'user_demo_01', 'Dana Whitfield', 2, 'Covered the welcome desk with no notice.', NOW() - INTERVAL '12 days'),
  ('13131313-1313-4131-8131-131313131305', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444448', 'user_demo_04', 'Tobias Reed',    1, 'Kept the yard tidy before the service.', NOW() - INTERVAL '16 days'),
  ('13131313-1313-4131-8131-131313131306', '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444447', 'user_demo_02', 'Marcus Ellis',   7, 'Coordinated childcare for three families at once.', NOW() - INTERVAL '21 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Life events
-- ----------------------------------------------------------------------------
INSERT INTO life_events (id, church_id, created_by_user_id, created_by_name, to_member_id, event_type, title, description, event_date, campus_id, created_at, updated_at) VALUES
  ('14141414-1414-4141-8141-141414141401', '11111111-1111-4111-8111-111111111111', 'user_demo_02', 'Marcus Ellis',  '44444444-4444-4444-8444-444444444447', 'baby',      'Baby shower for Sofia', 'She is due in March. Gifts and a meal train welcome.', CURRENT_DATE + 25, '22222222-2222-4222-8222-222222222221', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('14141414-1414-4141-8141-141414141402', '11111111-1111-4111-8111-111111111111', 'user_demo_03', 'Priya Raman',   '44444444-4444-4444-8444-444444444444', 'graduation','Tobias graduated', 'Celebrating a diploma and a job on the same week.', CURRENT_DATE - 9, '22222222-2222-4222-8222-222222222221', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
  ('14141414-1414-4141-8141-141414141403', '11111111-1111-4111-8111-111111111111', 'user_demo_01', 'Dana Whitfield','44444444-4444-4444-8444-444444444445', 'travel',    'Naomi to Portland for a week', 'Covering her shifts and rides while she is away.', CURRENT_DATE + 8, '22222222-2222-4222-8222-222222222222', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('14141414-1414-4141-8141-141414141404', '11111111-1111-4111-8111-111111111111', 'user_demo_01', 'Dana Whitfield','44444444-4444-4444-8444-444444444446', 'new-home',  'Eli and Jess moved in', 'Furniture and a hand with the heavy stuff.', CURRENT_DATE + 4, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO life_event_comments (id, life_event_id, author_user_id, author_name, body, created_at) VALUES
  ('15151515-1515-4151-8151-151515151501', '14141414-1414-4141-8141-141414141401', 'user_demo_05', 'Naomi Okafor',   'I can make dinner for the shower. Already on the calendar.', NOW() - INTERVAL '5 days'),
  ('15151515-1515-4151-8151-151515151502', '14141414-1414-4141-8141-141414141401', 'user_demo_04', 'Tobias Reed',    'I can build a crib if anyone has one to donate.', NOW() - INTERVAL '5 days'),
  ('15151515-1515-4151-8151-151515151503', '14141414-1414-4141-8141-141414141402', 'user_demo_01', 'Dana Whitfield','Proud of you. Come up after service and we will celebrate properly.', NOW() - INTERVAL '18 days'),
  ('15151515-1515-4151-8151-151515151504', '14141414-1414-4141-8141-141414141404', 'user_demo_06', 'Eli Carpenter',  'Truck is reserved for the move. Saturday works best for me.', NOW() - INTERVAL '20 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Bible study
-- ----------------------------------------------------------------------------
INSERT INTO bible_study_groups (id, church_id, campus_id, name, description, leader_id, leader_name, leader_email, leader_phone, schedule, location, current_book, current_chapter, next_study_date, max_members, is_open, tags, created_at, updated_at) VALUES
  ('16161616-1616-4161-8161-161616161601', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Thursday Evenings Study', 'A study through the Gospel of John.', 'user_demo_03', 'Priya Raman', 'priya@example.com', '555-0103', 'Thursdays 7:00 PM', 'Room 202', 'John', 8, CURRENT_DATE + 4, 12, true, ARRAY['Bible Study','Evening'], NOW() - INTERVAL '70 days', NOW() - INTERVAL '4 days'),
  ('16161616-1616-4161-8161-161616161602', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'New Parents Group', 'A gentle group for parents with young children.', 'user_demo_05', 'Naomi Okafor', 'naomi@example.com', '555-0105', 'Sundays 9:30 AM', 'North Campus Room 4', 'Philippians', 2, CURRENT_DATE + 8, 8, true, ARRAY['Parenting','Sunday'], NOW() - INTERVAL '25 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bible_study_signups (id, group_id, user_id, user_name, signed_up_at) VALUES
  ('17171717-1717-4171-8171-171717171701', '16161616-1616-4161-8161-161616161601', 'user_demo_04', 'Tobias Reed',    NOW() - INTERVAL '60 days'),
  ('17171717-1717-4171-8171-171717171702', '16161616-1616-4161-8161-161616161601', 'user_demo_08', 'Jonah Kim',      NOW() - INTERVAL '30 days'),
  ('17171717-1717-4171-8171-171717171703', '16161616-1616-4161-8161-161616161602', 'user_demo_07', 'Sofia Marchetti',NOW() - INTERVAL '14 days'),
  ('17171717-1717-4171-8171-171717171704', '16161616-1616-4161-8161-161616161602', 'user_demo_05', 'Naomi Okafor',   NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bible_study_sessions (id, group_id, session_date, topic, notes, attendance, created_at) VALUES
  ('18181818-1818-4181-8181-181818181801', '16161616-1616-4161-8161-161616161601', CURRENT_DATE - 7,  'Light and life',   'John 8. Discussion on walking in the light.', 8, NOW() - INTERVAL '7 days'),
  ('18181818-1818-4181-8181-181818181802', '16161616-1616-4161-8161-161616161601', CURRENT_DATE - 14, 'The narrow door', 'John 10. Nine came, seven stayed.', 7, NOW() - INTERVAL '14 days'),
  ('18181818-1818-4181-8181-181818181803', '16161616-1616-4161-8161-161616161602', CURRENT_DATE - 3,  'Peace in the home','Philippians 2. Practical ideas for calmer houses.', 5, NOW() - INTERVAL '3 days'),
  ('18181818-1818-4181-8181-181818181804', '16161616-1616-4161-8161-161616161601', CURRENT_DATE - 21, 'The good shepherd','John 9. Care over correction.', 9, NOW() - INTERVAL '21 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bible_study_posts (id, group_id, author_id, author_name, content, likes, created_at) VALUES
  ('19191919-1919-4191-8191-191919191901', '16161616-1616-4161-8161-161616161601', 'user_demo_03', 'Priya Raman',  'Reading through John 8 before Thursday. One question for us: what does "walking in the light" look like on a hard week?', 4, NOW() - INTERVAL '5 days'),
  ('19191919-1919-4191-8191-191919191902', '16161616-1616-4161-8161-161616161601', 'user_demo_08', 'Jonah Kim',    'The seven that stayed versus the nine. Still chewing on that one.', 2, NOW() - INTERVAL '3 days'),
  ('19191919-1919-4191-8191-191919191903', '16161616-1616-4161-8161-161616161602', 'user_demo_07', 'Sofia Marchetti','Peace in the home was the right title. Tuesday was a rough one.', 3, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, church_id, actor_user_id, actor_name, type, title, message, action_url, is_read, created_at) VALUES
  ('1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a01', 'user_demo_01', '11111111-1111-4111-8111-111111111111', 'user_demo_05', 'Naomi Okafor',   'join_request', 'New join request',   'Ruth Delgado asked to join North Campus.', '/join-requests', false, NOW() - INTERVAL '1 day'),
  ('1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a02', 'user_demo_01', '11111111-1111-4111-8111-111111111111', 'user_demo_02', 'Marcus Ellis',   'kudos',        'You got kudos',      'Naomi Okafor gave you 5 kudos.', '/kudos', false, NOW() - INTERVAL '2 days'),
  ('1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a03', 'user_demo_02', '11111111-1111-4111-8111-111111111111', 'user_demo_04', 'Tobias Reed',    'comment',      'New comment',        'Jonah Kim commented on the Tuesday shift.', '/meal-trains', false, NOW() - INTERVAL '2 days'),
  ('1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a04', 'user_demo_02', '11111111-1111-4111-8111-111111111111', 'user_demo_06', 'Eli Carpenter',  'meal_train',   'Meal train sign-up', 'Eli signed up for dinner on day 3.', '/meal-trains', true, NOW() - INTERVAL '3 days'),
  ('1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a05', 'user_demo_05', '11111111-1111-4111-8111-111111111111', 'user_demo_02', 'Marcus Ellis',   'mention',      'You were mentioned','Marcus mentioned you in the Thursday group.', '/bible-study', false, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Support tickets
-- ----------------------------------------------------------------------------
INSERT INTO support_tickets (id, user_id, church_id, category, subject, description, status, priority, assigned_to, created_at, updated_at) VALUES
  ('1b1b1b1b-1b1b-4b1b-8b1b-1b1b1b1b1b01', 'user_demo_07', '11111111-1111-4111-8111-111111111111', 'feature', 'Meal train reminders', 'Could the app remind volunteers the morning of their shift?', 'open', 'medium', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('1b1b1b1b-1b1b-4b1b-8b1b-1b1b1b1b1b02', 'user_demo_02', '11111111-1111-4111-8111-111111111111', 'issue',   'Invite code not working', 'The code for North Campus says expired after one use.', 'in_progress', 'high', 'user_demo_01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BINDING THE DEMO OWNER TO YOUR REAL CLERK ACCOUNT
-- ============================================================================
-- After you sign up in Clerk and have your real user id (Clerk Dashboard ->
-- Users -> your user -> user_2abc...), run this in the SQL Editor.
-- It makes YOU the owner of the demo church, so every board shows your own
-- rows as "mine" (your own needs, your own signups, your own kudos).
--
--   UPDATE members        SET user_id = 'user_YOUR_REAL_ID' WHERE user_id = 'user_demo_01';
--   UPDATE church_members SET user_id = 'user_YOUR_REAL_ID' WHERE user_id = 'user_demo_01';
--   UPDATE churches       SET owner_id = 'user_YOUR_REAL_ID' WHERE owner_id = 'user_demo_01';
--
-- For the full list of people to re-bind, see seed-bind-owner.sql.
-- ============================================================================
