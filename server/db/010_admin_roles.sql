-- PropConnect NG — Migration 010
-- Role-based access for the superadmin dashboard. Replaces the old shared
-- ADMIN_SECRET cookie gate with a real per-user role tied to Supabase auth.
-- Run in: Supabase → SQL Editor → New query → Run

ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'superadmin'));

CREATE INDEX IF NOT EXISTS agent_profiles_role ON agent_profiles(role);

-- ── One-time bootstrap ─────────────────────────────────────────────────────
-- Nobody has an elevated role yet. Run this once, substituting the email you
-- sign in with on the site, to promote your own account to superadmin:
--
--   UPDATE agent_profiles SET role = 'superadmin' WHERE email = 'bamidelebenjamin5@gmail.com';
--
-- Once you have a superadmin, further admins/superadmins can be promoted
-- from the dashboard itself (Superadmin → Admins tab) — this manual step is
-- only needed for the very first account.
