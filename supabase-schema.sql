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
