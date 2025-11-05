-- Migration: Join Request System with Questionnaires
-- Version: 003
-- Description: Add tables for church join requests, questionnaires, and responses

-- Request status enum
CREATE TYPE join_request_status AS ENUM ('pending', 'approved', 'denied', 'withdrawn');

-- Join requests table
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

-- Church questionnaires (questions churches ask prospective members)
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

-- Join request responses (answers to questionnaire)
CREATE TABLE join_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  join_request_id UUID NOT NULL REFERENCES join_requests(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES church_questionnaires(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_join_request_responses_request_id ON join_request_responses(join_request_id);

-- Request denial history (track repeat denials for anti-spam)
CREATE TABLE join_request_denials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  denied_at TIMESTAMPTZ DEFAULT NOW(),
  denied_by TEXT NOT NULL,
  reason TEXT
);

CREATE INDEX idx_join_request_denials_church_user ON join_request_denials(church_id, user_id);

-- Member departures log (for admin visibility when members leave)
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

-- Triggers for updated_at
CREATE TRIGGER update_join_requests_updated_at BEFORE UPDATE ON join_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_church_questionnaires_updated_at BEFORE UPDATE ON church_questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now (can be enabled later for enhanced security)
ALTER TABLE join_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE church_questionnaires DISABLE ROW LEVEL SECURITY;
ALTER TABLE join_request_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE join_request_denials DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_departures DISABLE ROW LEVEL SECURITY;
