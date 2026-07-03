-- ============================================================
-- PaintForge — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Main paint inventory table
CREATE TABLE IF NOT EXISTS user_paints (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paint_id      TEXT        NOT NULL,
  owned         BOOLEAN     DEFAULT false NOT NULL,
  in_my_set     BOOLEAN     DEFAULT false NOT NULL,
  extras        INTEGER     DEFAULT 0 NOT NULL,
  target_count  INTEGER     DEFAULT 0 NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, paint_id)
);

-- Row Level Security — users only see their own data
ALTER TABLE user_paints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON user_paints
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_paints_user_id ON user_paints(user_id);

-- ============================================================
-- AFTER running this SQL:
-- Go to: Authentication → Providers → Email
-- Turn OFF "Confirm email" for easier MVP testing
-- You can turn it back on later
-- ============================================================
