-- Migration 004: Add church visibility settings
-- Allows churches to control whether they appear in public search

-- Add is_public column to churches table
-- Default to true for existing churches (maintain current behavior)
ALTER TABLE churches
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create index for efficient filtering of public churches
CREATE INDEX IF NOT EXISTS idx_churches_is_public ON churches(is_public);

-- Add helpful comment
COMMENT ON COLUMN churches.is_public IS 'Whether the church appears in public search. If false, only accessible via invite codes.';
