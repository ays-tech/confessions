-- ============================================
-- Corper Confessions - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text          TEXT NOT NULL CHECK (char_length(text) >= 20 AND char_length(text) <= 280),
  tag           TEXT NOT NULL,
  batch         TEXT NOT NULL,
  reactions_cry   INTEGER DEFAULT 0,
  reactions_laugh INTEGER DEFAULT 0,
  reactions_dead  INTEGER DEFAULT 0,
  is_approved   BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast sorting
CREATE INDEX IF NOT EXISTS idx_confessions_approved ON confessions(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_tag ON confessions(tag, is_approved);

-- 3. Atomic reaction increment function
CREATE OR REPLACE FUNCTION increment_reaction(confession_id UUID, reaction_col TEXT)
RETURNS void AS $$
BEGIN
  IF reaction_col = 'reactions_cry' THEN
    UPDATE confessions SET reactions_cry = reactions_cry + 1 WHERE id = confession_id;
  ELSIF reaction_col = 'reactions_laugh' THEN
    UPDATE confessions SET reactions_laugh = reactions_laugh + 1 WHERE id = confession_id;
  ELSIF reaction_col = 'reactions_dead' THEN
    UPDATE confessions SET reactions_dead = reactions_dead + 1 WHERE id = confession_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Row Level Security
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved confessions
CREATE POLICY "Public read approved" ON confessions
  FOR SELECT USING (is_approved = true);

-- Anyone can insert (your API handles validation)
CREATE POLICY "Public insert" ON confessions
  FOR INSERT WITH CHECK (true);

-- Only service role can update/delete (for moderation)
CREATE POLICY "Service role only update" ON confessions
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role only delete" ON confessions
  FOR DELETE USING (auth.role() = 'service_role');
