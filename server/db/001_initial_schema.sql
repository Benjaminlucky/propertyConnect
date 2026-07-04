-- PropConnect NG — Initial Schema
-- Run this in: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Agent profiles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug              text UNIQUE NOT NULL,
  name              text NOT NULL,
  initials          text NOT NULL DEFAULT '',
  phone             text NOT NULL DEFAULT '',
  email             text NOT NULL DEFAULT '',
  persona           text NOT NULL DEFAULT 'agent',
  bio               text NOT NULL DEFAULT '',
  specialisation    text[] NOT NULL DEFAULT '{}',
  cities            text[] NOT NULL DEFAULT '{}',
  market_ids        text[] NOT NULL DEFAULT '{ng}',
  rating            numeric(3,1) NOT NULL DEFAULT 0,
  review_count      int NOT NULL DEFAULT 0,
  verification_tier text NOT NULL DEFAULT 'starter',
  verified          boolean NOT NULL DEFAULT false,
  joined_year       int NOT NULL DEFAULT EXTRACT(year FROM now())::int,
  years_active      int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Listings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id            bigserial PRIMARY KEY,
  market_id     text NOT NULL DEFAULT 'ng',
  category_slug text NOT NULL,
  title         text NOT NULL,
  neighbourhood text NOT NULL DEFAULT '',
  lga           text NOT NULL DEFAULT '',
  state         text NOT NULL DEFAULT '',
  price         numeric NOT NULL,
  period        text NOT NULL DEFAULT '',
  beds          int NOT NULL DEFAULT 0,
  baths         int NOT NULL DEFAULT 0,
  toilets       int NOT NULL DEFAULT 0,
  description   text NOT NULL DEFAULT '',
  agent_id      uuid REFERENCES agent_profiles(id) ON DELETE SET NULL,
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Listing EAV attributes (title doc, furnishing, year built, etc.) ──────────
CREATE TABLE IF NOT EXISTS listing_attributes (
  id         bigserial PRIMARY KEY,
  listing_id bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  key        text NOT NULL,
  value      text NOT NULL
);

-- ── Listing photos ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listing_photos (
  id         bigserial PRIMARY KEY,
  listing_id bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url        text NOT NULL,
  position   int NOT NULL DEFAULT 0
);

-- ── Enquiries (leads) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id         bigserial PRIMARY KEY,
  listing_id bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  mode       text NOT NULL,   -- whatsapp | viewing | message
  name       text NOT NULL,
  phone      text NOT NULL,
  message    text,
  score      int NOT NULL DEFAULT 0,
  status     text NOT NULL DEFAULT 'new',  -- new | contacted | viewing_booked | closed
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes for common query patterns ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS listings_market_category ON listings(market_id, category_slug);
CREATE INDEX IF NOT EXISTS listings_agent            ON listings(agent_id);
CREATE INDEX IF NOT EXISTS listings_state_lga        ON listings(state, lga);
CREATE INDEX IF NOT EXISTS listings_neighbourhood    ON listings(neighbourhood);
CREATE INDEX IF NOT EXISTS listings_status           ON listings(status);
CREATE INDEX IF NOT EXISTS enquiries_listing         ON enquiries(listing_id);
CREATE INDEX IF NOT EXISTS agent_profiles_slug       ON agent_profiles(slug);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER agent_profiles_updated_at
  BEFORE UPDATE ON agent_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE listings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles    ENABLE ROW LEVEL SECURITY;

-- Public can read active listings + their attributes + photos
CREATE POLICY "Public read active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public read listing attributes"
  ON listing_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.status = 'active'
    )
  );

CREATE POLICY "Public read listing photos"
  ON listing_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.status = 'active'
    )
  );

-- Public can read agent profiles
CREATE POLICY "Public read agent profiles"
  ON agent_profiles FOR SELECT
  USING (true);

-- Agents can insert/update/delete their own listings
CREATE POLICY "Agents manage own listings"
  ON listings FOR ALL
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- Agents manage their own attributes
CREATE POLICY "Agents manage own attributes"
  ON listing_attributes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.agent_id = auth.uid()
    )
  );

-- Agents manage their own photos
CREATE POLICY "Agents manage own photos"
  ON listing_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.agent_id = auth.uid()
    )
  );

-- Anyone can submit an enquiry
CREATE POLICY "Public insert enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (true);

-- Only the listing agent can read their enquiries
CREATE POLICY "Agents read own enquiries"
  ON enquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.agent_id = auth.uid()
    )
  );

-- Agents update status of their own enquiries
CREATE POLICY "Agents update own enquiry status"
  ON enquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.agent_id = auth.uid()
    )
  );

-- Agents manage their own profile
CREATE POLICY "Agents manage own profile"
  ON agent_profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
