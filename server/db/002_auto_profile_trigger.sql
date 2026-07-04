-- PropConnect NG — Migration 002
-- Auto-create agent_profiles row on every Supabase signup,
-- and backfill any existing auth users who are missing one.
-- Run in: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Trigger function ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _name    text;
  _slug    text;
  _initials text;
BEGIN
  _name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- slug: kebab-case name + 6-char uid suffix to guarantee uniqueness
  _slug := LOWER(REGEXP_REPLACE(_name, '[^a-z0-9]+', '-', 'g'))
           || '-' || LEFT(NEW.id::text, 6);

  -- initials: first letter of first + last word
  _initials := UPPER(LEFT(split_part(_name, ' ', 1), 1))
               || UPPER(LEFT(split_part(_name, ' ', 2), 1));

  INSERT INTO agent_profiles (id, slug, name, initials, email, persona, market_ids)
  VALUES (
    NEW.id,
    _slug,
    _name,
    _initials,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'persona', 'agent'),
    ARRAY['ng']
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ── Attach trigger to auth.users ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Backfill existing users missing a profile row ─────────────────────────────
INSERT INTO agent_profiles (id, slug, name, initials, email, persona, market_ids)
SELECT
  u.id,
  LOWER(REGEXP_REPLACE(
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    '[^a-z0-9]+', '-', 'g'
  )) || '-' || LEFT(u.id::text, 6)                                          AS slug,

  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))      AS name,

  UPPER(LEFT(split_part(
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    ' ', 1), 1))
  || UPPER(LEFT(split_part(
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    ' ', 2), 1))                                                             AS initials,

  u.email,
  COALESCE(u.raw_user_meta_data->>'persona', 'agent')                        AS persona,
  ARRAY['ng']                                                                 AS market_ids

FROM auth.users u
LEFT JOIN agent_profiles ap ON ap.id = u.id
WHERE ap.id IS NULL
ON CONFLICT (id) DO NOTHING;
