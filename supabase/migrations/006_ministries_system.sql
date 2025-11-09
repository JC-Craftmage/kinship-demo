-- ================================================================
-- KINSHIP: Ministries Management System Migration
-- ================================================================
-- This migration creates the complete ministries system including:
-- - Core ministries management
-- - Ministry volunteers and roles
-- - Ministry scheduling with calendar support
-- - Children's ministry with age groups
-- - Worship team with instruments
-- - Special ministries (Celebrate Recovery, Singles, Single Parents)
-- ================================================================

-- Ministry Categories ENUM
CREATE TYPE ministry_category AS ENUM (
  'childrens',
  'worship',
  'sound',
  'security',
  'cafe',
  'celebrate_recovery',
  'singles',
  'single_parents',
  'other'
);

-- Ministry Volunteer Role ENUM
CREATE TYPE ministry_role_type AS ENUM (
  'leader',
  'coordinator',
  'volunteer',
  'staff'
);

-- Ministry Schedule Status ENUM
CREATE TYPE ministry_schedule_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no_show'
);

-- Service Type ENUM (for scheduling)
CREATE TYPE service_type AS ENUM (
  'sunday_morning',
  'sunday_evening',
  'wednesday',
  'saturday',
  'special_event',
  'other'
);

-- Worship Instrument ENUM
CREATE TYPE worship_instrument AS ENUM (
  'vocals',
  'lead_vocals',
  'background_vocals',
  'acoustic_guitar',
  'electric_guitar',
  'bass_guitar',
  'drums',
  'keys',
  'piano',
  'violin',
  'cello',
  'trumpet',
  'saxophone',
  'other'
);

-- ================================================================
-- CORE MINISTRIES TABLE
-- ================================================================
CREATE TABLE ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category ministry_category NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE, -- Pre-populated ministries
  leader_user_id TEXT, -- Clerk user ID of ministry leader
  contact_email TEXT,
  contact_phone TEXT,
  meeting_info TEXT, -- Regular meeting times/location
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, name)
);

CREATE INDEX idx_ministries_church ON ministries(church_id);
CREATE INDEX idx_ministries_category ON ministries(category);
CREATE INDEX idx_ministries_active ON ministries(is_active);

-- ================================================================
-- MINISTRY ROLES TABLE
-- ================================================================
CREATE TABLE ministry_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Worship Leader", "Sound Engineer", "Nursery Coordinator"
  description TEXT,
  role_type ministry_role_type DEFAULT 'volunteer',
  requirements TEXT, -- e.g., "CPR certified", "Experience with ProPresenter"
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ministry_roles_ministry ON ministry_roles(ministry_id);

-- ================================================================
-- MINISTRY VOLUNTEERS TABLE
-- ================================================================
CREATE TABLE ministry_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  role_id UUID REFERENCES ministry_roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  availability_notes TEXT, -- e.g., "Available 1st & 3rd Sundays"
  background_check_date DATE,
  training_completed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ministry_id, user_id)
);

CREATE INDEX idx_ministry_volunteers_ministry ON ministry_volunteers(ministry_id);
CREATE INDEX idx_ministry_volunteers_user ON ministry_volunteers(user_id);
CREATE INDEX idx_ministry_volunteers_active ON ministry_volunteers(is_active);

-- ================================================================
-- MINISTRY SCHEDULES TABLE
-- ================================================================
CREATE TABLE ministry_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES ministry_volunteers(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  service_type service_type DEFAULT 'other',
  service_name TEXT, -- e.g., "Morning Worship", "Youth Night"
  role_assignment TEXT, -- Specific role for this schedule, e.g., "Lead Guitar"
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  status ministry_schedule_status DEFAULT 'scheduled',
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ministry_schedules_ministry ON ministry_schedules(ministry_id);
CREATE INDEX idx_ministry_schedules_volunteer ON ministry_schedules(volunteer_id);
CREATE INDEX idx_ministry_schedules_date ON ministry_schedules(scheduled_date);
CREATE INDEX idx_ministry_schedules_status ON ministry_schedules(status);

-- ================================================================
-- CHILDREN'S MINISTRY AGE GROUPS TABLE
-- ================================================================
CREATE TABLE childrens_age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Nursery", "Preschool", "K-2nd Grade"
  description TEXT,
  min_age INTEGER, -- Minimum age in months
  max_age INTEGER, -- Maximum age in months
  grade_level TEXT, -- e.g., "K-2", "3-5", "6-8"
  room_location TEXT,
  max_capacity INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_childrens_age_groups_ministry ON childrens_age_groups(ministry_id);
CREATE INDEX idx_childrens_age_groups_active ON childrens_age_groups(is_active);

-- ================================================================
-- WORSHIP TEAM INSTRUMENTS TABLE
-- ================================================================
CREATE TABLE worship_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES ministry_volunteers(id) ON DELETE CASCADE,
  primary_instrument worship_instrument NOT NULL,
  secondary_instruments worship_instrument[], -- Array of additional instruments
  skill_level TEXT, -- e.g., "Beginner", "Intermediate", "Advanced", "Professional"
  can_lead BOOLEAN DEFAULT FALSE, -- Can lead worship
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(volunteer_id)
);

CREATE INDEX idx_worship_team_volunteer ON worship_team_members(volunteer_id);
CREATE INDEX idx_worship_team_instrument ON worship_team_members(primary_instrument);

-- ================================================================
-- INSERT DEFAULT MINISTRIES FOR ALL CHURCHES
-- ================================================================
-- These are created for every church when they sign up

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Children''s Ministry',
  'childrens',
  'Sunday school, nursery, and children''s programs for all ages',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Worship Team',
  'worship',
  'Musicians, vocalists, and worship leaders for services',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Sound Team',
  'sound',
  'Audio engineers and technical support for services',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Security Team',
  'security',
  'Safety and security for services and events',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Cafe Ministry',
  'cafe',
  'Hospitality and refreshments before and after services',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Celebrate Recovery',
  'celebrate_recovery',
  'Christ-centered recovery program for hurts, habits, and hang-ups',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Singles Ministry',
  'singles',
  'Community and fellowship for single adults',
  true
FROM churches;

INSERT INTO ministries (church_id, name, category, description, is_default)
SELECT
  id as church_id,
  'Single Parents Ministry',
  'single_parents',
  'Support and community for single parents and their families',
  true
FROM churches;

-- ================================================================
-- INSERT DEFAULT CHILDREN'S AGE GROUPS
-- ================================================================
-- Create default age groups for all Children's Ministries

INSERT INTO childrens_age_groups (ministry_id, name, description, min_age, max_age, grade_level, display_order)
SELECT
  m.id as ministry_id,
  'Nursery',
  'Infants and toddlers',
  0,
  35, -- 0-35 months (0-2 years)
  'Infants - 2 years',
  1
FROM ministries m
WHERE m.category = 'childrens';

INSERT INTO childrens_age_groups (ministry_id, name, description, min_age, max_age, grade_level, display_order)
SELECT
  m.id as ministry_id,
  'Preschool',
  'Preschool aged children',
  36,
  59, -- 3-4 years
  'Ages 3-4',
  2
FROM ministries m
WHERE m.category = 'childrens';

INSERT INTO childrens_age_groups (ministry_id, name, description, min_age, max_age, grade_level, display_order)
SELECT
  m.id as ministry_id,
  'Kindergarten',
  'Kindergarten students',
  60,
  71, -- 5 years
  'Kindergarten',
  3
FROM ministries m
WHERE m.category = 'childrens';

INSERT INTO childrens_age_groups (ministry_id, name, description, min_age, max_age, grade_level, display_order)
SELECT
  m.id as ministry_id,
  'Elementary (1st-2nd)',
  'First and second grade',
  72,
  95, -- 6-7 years
  '1st - 2nd Grade',
  4
FROM ministries m
WHERE m.category = 'childrens';

INSERT INTO childrens_age_groups (ministry_id, name, description, min_age, max_age, grade_level, display_order)
SELECT
  m.id as ministry_id,
  'Elementary (3rd-5th)',
  'Third through fifth grade',
  96,
  143, -- 8-11 years
  '3rd - 5th Grade',
  5
FROM ministries m
WHERE m.category = 'childrens';

-- ================================================================
-- INSERT DEFAULT MINISTRY ROLES
-- ================================================================
-- Default roles for each ministry type

-- Children's Ministry Roles
INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Director',
  'Oversees all children''s ministry programs',
  'leader',
  1
FROM ministries m WHERE m.category = 'childrens';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, requirements, display_order)
SELECT
  m.id as ministry_id,
  'Teacher',
  'Teaches Sunday school classes',
  'volunteer',
  'Background check required',
  2
FROM ministries m WHERE m.category = 'childrens';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, requirements, display_order)
SELECT
  m.id as ministry_id,
  'Helper',
  'Assists with classroom activities',
  'volunteer',
  'Background check required',
  3
FROM ministries m WHERE m.category = 'childrens';

-- Worship Team Roles
INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Worship Leader',
  'Leads worship services',
  'leader',
  1
FROM ministries m WHERE m.category = 'worship';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Musician',
  'Plays instruments during worship',
  'volunteer',
  2
FROM ministries m WHERE m.category = 'worship';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Vocalist',
  'Sings during worship services',
  'volunteer',
  3
FROM ministries m WHERE m.category = 'worship';

-- Sound Team Roles
INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Audio Director',
  'Oversees all audio and tech',
  'leader',
  1
FROM ministries m WHERE m.category = 'sound';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Sound Engineer',
  'Runs soundboard during services',
  'volunteer',
  2
FROM ministries m WHERE m.category = 'sound';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'ProPresenter Operator',
  'Manages lyrics and media presentation',
  'volunteer',
  3
FROM ministries m WHERE m.category = 'sound';

-- Cafe Ministry Roles
INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Cafe Coordinator',
  'Oversees cafe operations',
  'coordinator',
  1
FROM ministries m WHERE m.category = 'cafe';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Barista',
  'Prepares and serves coffee and drinks',
  'volunteer',
  2
FROM ministries m WHERE m.category = 'cafe';

INSERT INTO ministry_roles (ministry_id, name, description, role_type, display_order)
SELECT
  m.id as ministry_id,
  'Server',
  'Serves refreshments to guests',
  'volunteer',
  3
FROM ministries m WHERE m.category = 'cafe';

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE ministries IS 'Core ministries table with predefined and custom ministries for each church';
COMMENT ON TABLE ministry_roles IS 'Roles within each ministry (leader, coordinator, volunteer, staff)';
COMMENT ON TABLE ministry_volunteers IS 'Church members assigned to ministries with specific roles';
COMMENT ON TABLE ministry_schedules IS 'Scheduling system for ministry volunteers with calendar support';
COMMENT ON TABLE childrens_age_groups IS 'Configurable age groups for children''s ministry';
COMMENT ON TABLE worship_team_members IS 'Extended information for worship team including instruments';
