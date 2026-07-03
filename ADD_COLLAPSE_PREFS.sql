-- ============================================================
-- PaintForge — Add collapse state columns to user_preferences
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS brand_collapsed   TEXT[] DEFAULT '{}' NOT NULL,
  ADD COLUMN IF NOT EXISTS line_collapsed    TEXT[] DEFAULT '{}' NOT NULL,
  ADD COLUMN IF NOT EXISTS section_collapsed TEXT[] DEFAULT '{}' NOT NULL;

-- ============================================================
