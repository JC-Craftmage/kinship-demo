-- Support Tickets Table
-- Run this migration to add support_tickets to your Supabase database

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

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_church_id ON support_tickets(church_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can see their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create own tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Church admins can view tickets for their church
CREATE POLICY "Admins can view church tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM church_members
      WHERE church_members.church_id = support_tickets.church_id
      AND church_members.user_id = auth.uid()::text
      AND church_members.role IN ('owner', 'overseer')
    )
  );

-- Comments table for ticket discussions (future enhancement)
-- CREATE TABLE support_comments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
--   user_id TEXT NOT NULL,
--   content TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );