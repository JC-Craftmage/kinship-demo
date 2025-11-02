-- Kinship Database Schema Migration
-- Version: 001
-- Description: Initial schema with churches, campuses, members, and role-based access

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE church_role AS ENUM ('owner', 'overseer', 'moderator', 'member');
CREATE TYPE need_category AS ENUM ('practical', 'spiritual', 'financial', 'emotional', 'other');
CREATE TYPE need_urgency AS ENUM ('low', 'medium', 'high');
CREATE TYPE need_status AS ENUM ('open', 'in_progress', 'fulfilled', 'cancelled');
CREATE TYPE meal_signup_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');
CREATE TYPE volunteer_status AS ENUM ('pending', 'accepted', 'completed', 'declined');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Churches table
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL, -- Clerk user ID
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

-- Church members table (roles and membership)
CREATE TABLE church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  role church_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, user_id)
);

CREATE INDEX idx_church_members_church_id ON church_members(church_id);
CREATE INDEX idx_church_members_user_id ON church_members(user_id);
CREATE INDEX idx_church_members_campus_id ON church_members(campus_id);

-- Campus overseers (assignment table for overseers managing specific campuses)
CREATE TABLE campus_overseers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_member_id UUID NOT NULL REFERENCES church_members(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_member_id, campus_id)
);

CREATE INDEX idx_campus_overseers_campus_id ON campus_overseers(campus_id);

-- Invite codes table
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL, -- Clerk user ID
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
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
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

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  owner_id TEXT NOT NULL, -- Clerk user ID
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

-- Meal trains table
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
  created_by TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_trains_church_campus ON meal_trains(church_id, campus_id);

-- Meal signups table
CREATE TABLE meal_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_train_id UUID NOT NULL REFERENCES meal_trains(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  status meal_signup_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_train_id, date)
);

CREATE INDEX idx_meal_signups_meal_train_id ON meal_signups(meal_train_id);

-- Needs table
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category need_category NOT NULL,
  urgency need_urgency DEFAULT 'medium',
  status need_status DEFAULT 'open',
  posted_by TEXT NOT NULL, -- Clerk user ID
  posted_by_name TEXT NOT NULL,
  deadline DATE,
  volunteers_needed INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_needs_church_campus ON needs(church_id, campus_id);
CREATE INDEX idx_needs_status ON needs(status);

-- Need volunteers table
CREATE TABLE need_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_name TEXT NOT NULL,
  message TEXT,
  status volunteer_status DEFAULT 'pending',
  volunteered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_need_volunteers_need_id ON need_volunteers(need_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers for updated_at columns
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_overseers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE need_volunteers ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be added in a future migration
-- For now, disable RLS for development (IMPORTANT: Enable in production!)
ALTER TABLE churches DISABLE ROW LEVEL SECURITY;
ALTER TABLE campuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE church_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE campus_overseers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_trains DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_signups DISABLE ROW LEVEL SECURITY;
ALTER TABLE needs DISABLE ROW LEVEL SECURITY;
ALTER TABLE need_volunteers DISABLE ROW LEVEL SECURITY;
