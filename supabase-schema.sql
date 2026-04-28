-- ============================================
-- Corper Confessions - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text            TEXT NOT NULL CHECK (char_length(text) >= 20 AND char_length(text) <= 280),
  reactions_cry   INTEGER DEFAULT 0 NOT NULL,
  reactions_laugh INTEGER DEFAULT 0 NOT NULL,
  reactions_dead  INTEGER DEFAULT 0 NOT NULL,
  is_approved     BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast sorting
CREATE INDEX IF NOT EXISTS idx_confessions_approved_hot
  ON confessions(is_approved, reactions_cry DESC);

CREATE INDEX IF NOT EXISTS idx_confessions_approved_new
  ON confessions(is_approved, created_at DESC);

-- 3. Row Level Security
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved confessions
CREATE POLICY "Public read approved" ON confessions
  FOR SELECT USING (is_approved = true);

-- Anyone can insert
CREATE POLICY "Public insert" ON confessions
  FOR INSERT WITH CHECK (true);

-- Anyone can update reactions only (not is_approved or text)
CREATE POLICY "Public update reactions" ON confessions
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Only service role can delete
CREATE POLICY "Service role only delete" ON confessions
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================
-- ADD THIS if you already ran the schema before
-- Atomic reaction adjustment (increment or decrement)
-- ============================================
CREATE OR REPLACE FUNCTION adjust_reaction(
  p_id          UUID,
  p_col         TEXT,
  p_adjustment  INTEGER
)
RETURNS void AS $$
BEGIN
  IF p_col = 'reactions_cry' THEN
    UPDATE confessions
    SET reactions_cry = GREATEST(0, reactions_cry + p_adjustment)
    WHERE id = p_id;
  ELSIF p_col = 'reactions_laugh' THEN
    UPDATE confessions
    SET reactions_laugh = GREATEST(0, reactions_laugh + p_adjustment)
    WHERE id = p_id;
  ELSIF p_col = 'reactions_dead' THEN
    UPDATE confessions
    SET reactions_dead = GREATEST(0, reactions_dead + p_adjustment)
    WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
