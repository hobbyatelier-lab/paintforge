-- ============================================================
-- PaintForge — Add User Preferences Table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  hidden_sections TEXT[]    DEFAULT '{}' NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_preferences" ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- ============================================================
