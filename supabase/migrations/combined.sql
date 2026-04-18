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

CREATE TRIGGER update_join_requests_updated_at BEFORE UPDATE ON join_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_church_questionnaires_updated_at BEFORE UPDATE ON church_questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE — Schema is ready
-- ============================================================================
