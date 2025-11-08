-- Migration 005: Safety Team System
-- Comprehensive safety and security management for churches

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE safety_team_role AS ENUM ('team_leader', 'member');
CREATE TYPE safety_specialty AS ENUM ('medical', 'security', 'fire_safety', 'general');
CREATE TYPE incident_type AS ENUM ('medical', 'security', 'accident', 'fire', 'weather', 'other');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE alert_type AS ENUM ('emergency', 'urgent', 'info', 'drill');
CREATE TYPE protocol_category AS ENUM ('medical', 'fire', 'security', 'weather', 'evacuation', 'active_threat', 'other');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Safety Team Members
CREATE TABLE safety_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  team_role safety_team_role DEFAULT 'member',
  specialty safety_specialty DEFAULT 'general',
  certifications TEXT, -- e.g., "CPR, First Aid, AED"
  phone TEXT, -- Direct contact for emergencies
  is_active BOOLEAN DEFAULT TRUE,
  availability_notes TEXT,
  joined_team_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, user_id)
);

CREATE INDEX idx_safety_team_church ON safety_team_members(church_id);
CREATE INDEX idx_safety_team_active ON safety_team_members(church_id, is_active);

-- Safety Team Schedules
CREATE TABLE safety_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  safety_member_id UUID NOT NULL REFERENCES safety_team_members(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_type TEXT, -- "Sunday Service", "Wednesday Night", "Special Event"
  event_name TEXT,
  status schedule_status DEFAULT 'scheduled',
  notes TEXT,
  created_by TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_safety_schedules_church ON safety_schedules(church_id);
CREATE INDEX idx_safety_schedules_date ON safety_schedules(scheduled_date);
CREATE INDEX idx_safety_schedules_member ON safety_schedules(safety_member_id);

-- Incident Reports
CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  reported_by TEXT NOT NULL, -- Clerk user ID (admin/safety team)
  incident_type incident_type NOT NULL,
  severity incident_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT, -- "Main Sanctuary", "Parking Lot", etc.
  occurred_at TIMESTAMPTZ NOT NULL,
  people_involved TEXT, -- Names/descriptions
  witnesses TEXT,
  actions_taken TEXT NOT NULL,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  status incident_status DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_church ON incident_reports(church_id);
CREATE INDEX idx_incidents_date ON incident_reports(occurred_at);
CREATE INDEX idx_incidents_status ON incident_reports(status);
CREATE INDEX idx_incidents_severity ON incident_reports(severity);

-- Emergency Protocols
CREATE TABLE emergency_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category protocol_category NOT NULL,
  description TEXT,
  steps JSONB NOT NULL, -- Array of step objects: [{order: 1, action: "Call 911"}, ...]
  emergency_contacts JSONB, -- [{name: "Fire Dept", phone: "911"}, ...]
  is_default BOOLEAN DEFAULT FALSE, -- True for system-provided templates
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_by TEXT, -- Clerk user ID (null for defaults)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_protocols_church ON emergency_protocols(church_id);
CREATE INDEX idx_protocols_category ON emergency_protocols(category);
CREATE INDEX idx_protocols_active ON emergency_protocols(church_id, is_active);

-- Safety Team Alerts
CREATE TABLE safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  sent_by TEXT NOT NULL, -- Clerk user ID
  alert_type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  send_to_all_team BOOLEAN DEFAULT TRUE,
  specific_recipients JSONB, -- Array of user_ids if not sending to all
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional auto-hide after certain time
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_safety_alerts_church ON safety_alerts(church_id);
CREATE INDEX idx_safety_alerts_date ON safety_alerts(sent_at);

-- Alert Read Receipts (track who saw the alert)
CREATE TABLE safety_alert_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES safety_alerts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alert_id, user_id)
);

CREATE INDEX idx_alert_receipts_alert ON safety_alert_receipts(alert_id);
CREATE INDEX idx_alert_receipts_user ON safety_alert_receipts(user_id);

-- ============================================================================
-- DEFAULT EMERGENCY PROTOCOLS
-- Insert comprehensive, church-specific emergency procedures
-- ============================================================================

-- Medical Emergency Protocol
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Medical Emergency Response',
  'medical',
  'Standard procedure for responding to medical emergencies during services or events',
  '[
    {"order": 1, "action": "Assess the situation - determine severity and type of medical emergency"},
    {"order": 2, "action": "Call 911 immediately for serious emergencies (unconscious, chest pain, severe bleeding, difficulty breathing)"},
    {"order": 3, "action": "Locate and deploy church AED if cardiac emergency"},
    {"order": 4, "action": "Begin CPR if trained and person is unresponsive with no pulse"},
    {"order": 5, "action": "Send someone to meet emergency services at main entrance and guide them to victim"},
    {"order": 6, "action": "Clear area around victim - give them space and privacy"},
    {"order": 7, "action": "Assign someone to comfort family members and keep crowd calm"},
    {"order": 8, "action": "Do NOT move victim unless in immediate danger"},
    {"order": 9, "action": "Note time of incident and actions taken for report"},
    {"order": 10, "action": "After emergency: Fill out incident report and debrief with safety team"}
  ]',
  '[
    {"name": "Emergency Services", "phone": "911"},
    {"name": "Poison Control", "phone": "1-800-222-1222"}
  ]',
  true,
  1
FROM churches;

-- Fire Emergency Protocol
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Fire Emergency & Evacuation',
  'fire',
  'Procedures for fire emergencies and building evacuation',
  '[
    {"order": 1, "action": "Pull fire alarm immediately if you discover fire"},
    {"order": 2, "action": "Call 911 and report fire location in building"},
    {"order": 3, "action": "Announce evacuation calmly but firmly: ''Everyone please exit the building immediately''"},
    {"order": 4, "action": "Use nearest safe exit - DO NOT use elevators"},
    {"order": 5, "action": "Designated team members: Check restrooms and nursery areas"},
    {"order": 6, "action": "Assist elderly, disabled, and children to safety"},
    {"order": 7, "action": "Gather at designated assembly point (parking lot or safe distance)"},
    {"order": 8, "action": "Account for all staff, volunteers, and known attendees"},
    {"order": 9, "action": "Do NOT re-enter building until fire department gives all-clear"},
    {"order": 10, "action": "Team leader communicates with fire department and congregation"}
  ]',
  '[
    {"name": "Fire Department", "phone": "911"}
  ]',
  true,
  2
FROM churches;

-- Active Threat Protocol
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Active Threat / Intruder Response',
  'active_threat',
  'Run, Hide, Fight protocol for active threat situations',
  '[
    {"order": 1, "action": "RUN if there is an accessible escape path - leave belongings behind"},
    {"order": 2, "action": "Help others escape if possible, but do not wait for those who refuse"},
    {"order": 3, "action": "Call 911 when safe to do so"},
    {"order": 4, "action": "HIDE if evacuation is not possible - find a room that can be locked"},
    {"order": 5, "action": "Lock and barricade doors - use furniture to block entry"},
    {"order": 6, "action": "Turn off lights and silence cell phones"},
    {"order": 7, "action": "Hide behind large objects, spread out, remain quiet"},
    {"order": 8, "action": "FIGHT as an absolute last resort when your life is in imminent danger"},
    {"order": 9, "action": "Act with aggression, use improvised weapons, commit to your actions"},
    {"order": 10, "action": "When police arrive: Keep hands visible, follow all commands, remain calm"}
  ]',
  '[
    {"name": "Emergency Services", "phone": "911"}
  ]',
  true,
  3
FROM churches;

-- Severe Weather Protocol
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Severe Weather Response',
  'weather',
  'Procedures for tornadoes, severe storms, and weather emergencies',
  '[
    {"order": 1, "action": "Monitor weather alerts during services when severe weather is forecasted"},
    {"order": 2, "action": "If tornado warning issued: Announce shelter-in-place immediately"},
    {"order": 3, "action": "Move everyone to interior rooms/hallways on lowest level (away from windows)"},
    {"order": 4, "action": "Avoid auditoriums, gyms, and rooms with wide-span roofs"},
    {"order": 5, "action": "Have people crouch low, head down, protect head with hands"},
    {"order": 6, "action": "Keep everyone calm and quiet to hear updates"},
    {"order": 7, "action": "Do NOT go outside to check conditions"},
    {"order": 8, "action": "Wait for all-clear from weather service before resuming normal activities"},
    {"order": 9, "action": "Inspect building for damage before releasing congregation"},
    {"order": 10, "action": "If severe damage: Evacuate to safe location and account for all people"}
  ]',
  '[
    {"name": "National Weather Service", "phone": "Local weather radio"},
    {"name": "Emergency Services", "phone": "911"}
  ]',
  true,
  4
FROM churches;

-- Child Safety / Lost Child Protocol
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Lost or Missing Child',
  'security',
  'Immediate response for lost, missing, or potentially abducted child',
  '[
    {"order": 1, "action": "Get detailed description: name, age, clothing, last seen location"},
    {"order": 2, "action": "Immediately alert all safety team members via radio/text"},
    {"order": 3, "action": "Lock down all exits - position team at every door (no one leaves)"},
    {"order": 4, "action": "Announce discreetly to staff (do NOT use PA system to avoid panic)"},
    {"order": 5, "action": "Search all rooms, restrooms, closets, and play areas"},
    {"order": 6, "action": "Check video footage if cameras available"},
    {"order": 7, "action": "If child not found in 10 minutes: Call 911 immediately"},
    {"order": 8, "action": "Provide police with description, photo if available, and search details"},
    {"order": 9, "action": "Keep parents calm and with designated staff member"},
    {"order": 10, "action": "After recovery: Document incident and review child check-in procedures"}
  ]',
  '[
    {"name": "Local Police", "phone": "911"},
    {"name": "Non-Emergency Police", "phone": "Check local number"}
  ]',
  true,
  5
FROM churches;

-- Security Threat / Suspicious Behavior
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Suspicious Person or Behavior',
  'security',
  'Handling suspicious individuals or threatening behavior',
  '[
    {"order": 1, "action": "Trust your instincts - if something feels wrong, report it"},
    {"order": 2, "action": "Discreetly notify safety team leader immediately"},
    {"order": 3, "action": "Observe and document: description, location, behavior, what was said"},
    {"order": 4, "action": "Do NOT confront alone - use buddy system, maintain distance"},
    {"order": 5, "action": "Approach calmly if safe: ''Hi, welcome to our church. Can I help you find something?''"},
    {"order": 6, "action": "If person is threatening or refuses to leave: Call 911"},
    {"order": 7, "action": "Politely but firmly: ''I need to ask you to leave. The police are on their way''"},
    {"order": 8, "action": "Evacuate nearby rooms if person becomes aggressive"},
    {"order": 9, "action": "Never touch or physically restrain unless immediate threat to life"},
    {"order": 10, "action": "Document incident thoroughly and ban from property if necessary"}
  ]',
  '[
    {"name": "Local Police", "phone": "911"},
    {"name": "Non-Emergency Police", "phone": "Check local number"}
  ]',
  true,
  6
FROM churches;

-- Medical - Choking Response
INSERT INTO emergency_protocols (church_id, title, category, description, steps, emergency_contacts, is_default, display_order)
SELECT
  id as church_id,
  'Choking Emergency',
  'medical',
  'Heimlich maneuver and choking response procedures',
  '[
    {"order": 1, "action": "Ask: ''Are you choking? Can you speak?'' - if they cannot speak, they are choking"},
    {"order": 2, "action": "Send someone to call 911 immediately"},
    {"order": 3, "action": "Perform Heimlich maneuver if trained: stand behind, wrap arms around waist"},
    {"order": 4, "action": "Make a fist above navel, grasp fist with other hand"},
    {"order": 5, "action": "Give quick, upward thrusts until object is expelled"},
    {"order": 6, "action": "For infants under 1 year: use back blows and chest thrusts (NOT Heimlich)"},
    {"order": 7, "action": "If person becomes unconscious: lower to ground and begin CPR"},
    {"order": 8, "action": "Check mouth between CPR cycles to see if object is visible/removable"},
    {"order": 9, "action": "Continue CPR until paramedics arrive"},
    {"order": 10, "action": "Even if successful: encourage person to seek medical evaluation"}
  ]',
  '[
    {"name": "Emergency Services", "phone": "911"}
  ]',
  true,
  7
FROM churches;

COMMENT ON TABLE safety_team_members IS 'Church safety and security team members with specialties';
COMMENT ON TABLE safety_schedules IS 'Safety team member scheduling for services and events';
COMMENT ON TABLE incident_reports IS 'Security and safety incident documentation (admin only)';
COMMENT ON TABLE emergency_protocols IS 'Emergency response procedures and protocols';
COMMENT ON TABLE safety_alerts IS 'Alerts and communications to safety team members';
