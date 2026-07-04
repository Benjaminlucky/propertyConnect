-- PropConnect NG — Migration 009
-- Support OAuth sign-in (Google/Facebook): these providers don't know the
-- user's persona (agent/landlord/developer/shortlet/commercial), so we track
-- whether it's been explicitly chosen and prompt for it post-login if not.
-- Run in: Supabase → SQL Editor → New query → Run

ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS persona_confirmed boolean NOT NULL DEFAULT false;

-- Backfill: every existing row got here through the email/password signup
-- flow, which already asks for persona explicitly — mark them confirmed so
-- current users are never re-prompted.
UPDATE agent_profiles SET persona_confirmed = true WHERE persona_confirmed = false;

-- ── Update signup trigger to stamp persona_confirmed ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _name    text;
  _slug    text;
  _initials text;
BEGIN
  _name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- slug: kebab-case name + 6-char uid suffix to guarantee uniqueness
  _slug := LOWER(REGEXP_REPLACE(_name, '[^a-z0-9]+', '-', 'g'))
           || '-' || LEFT(NEW.id::text, 6);

  -- initials: first letter of first + last word
  _initials := UPPER(LEFT(split_part(_name, ' ', 1), 1))
               || UPPER(LEFT(split_part(_name, ' ', 2), 1));

  INSERT INTO agent_profiles (id, slug, name, initials, email, persona, persona_confirmed, market_ids)
  VALUES (
    NEW.id,
    _slug,
    _name,
    _initials,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'persona', 'agent'),
    (NEW.raw_user_meta_data->>'persona' IS NOT NULL),
    ARRAY['ng']
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
