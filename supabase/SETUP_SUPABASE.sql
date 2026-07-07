-- ============================================================
--  PaintForge — Supabase Setup Script
--  Run this in the Supabase SQL editor for a fresh instance.
--
--  Auth setup (dashboard, not SQL):
--    Authentication → Providers → Email → enable "Confirm email"
--    Authentication → Email Templates → update "Reset Password"
--      template to point to your live URL (e.g. paintforge.io)
-- ============================================================


-- ── 1. user_paints ────────────────────────────────────────────
--  One row per (user, paint). Upserted on every toggle/counter
--  change. Rows where all values are default are deleted to keep
--  the table lean.

CREATE TABLE IF NOT EXISTS user_paints (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paint_id      TEXT        NOT NULL,
  owned         BOOLEAN     DEFAULT FALSE,
  in_my_set     BOOLEAN     DEFAULT FALSE,
  extras        INTEGER     DEFAULT 0,
  target_count  INTEGER     DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, paint_id)
);

ALTER TABLE user_paints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own paints"
  ON user_paints FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_paints_user_idx ON user_paints (user_id);


-- ── 2. user_preferences ───────────────────────────────────────
--  One row per user (UNIQUE on user_id). Upserted on any UI
--  state change (collapse, filter, seen_how_to_use). Uses
--  onConflict:'user_id' in the app.
--
--  Array columns store JSON arrays of string keys, e.g.:
--    hidden_sections:   ["apWarpaints", "vallejoGameAir"]
--    brand_collapsed:   ["citadel", "scale75"]
--    line_collapsed:    ["v_gameair", "cit_disc"]
--    section_collapsed: ["mechaWeathering", "apDnDPrimer"]

CREATE TABLE IF NOT EXISTS user_preferences (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  hidden_sections   JSONB       DEFAULT '[]',
  brand_collapsed   JSONB       DEFAULT '[]',
  line_collapsed    JSONB       DEFAULT '[]',
  section_collapsed JSONB       DEFAULT '[]',
  seen_how_to_use   BOOLEAN     DEFAULT FALSE,
  active_filter     TEXT        DEFAULT 'all',
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);


-- ── Done ──────────────────────────────────────────────────────
--  Tables created. No seed data required — the paint catalog
--  lives in src/data/paints.js (client bundle) until the
--  Supabase migration sprint moves it to a paints table.
