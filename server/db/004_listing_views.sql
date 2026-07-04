-- PropConnect NG — Migration 004: listing views for analytics
-- Run in: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS listing_views (
  id         bigserial PRIMARY KEY,
  listing_id bigint NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_views_listing ON listing_views(listing_id, viewed_at DESC);

ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Anyone can record a view (anonymous, client-side)
CREATE POLICY "Public insert listing views"
  ON listing_views FOR INSERT
  WITH CHECK (true);

-- Agents read views only on their own listings
CREATE POLICY "Agents read own listing views"
  ON listing_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = listing_id AND l.agent_id = auth.uid()
    )
  );
