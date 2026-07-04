-- PropConnect NG — Migration 008
-- Agent reviews: submitted by buyers, auto-approved.
-- Trigger keeps agent_profiles.rating and review_count in sync.
-- Run in: Supabase → SQL Editor → New query → Run

CREATE TABLE IF NOT EXISTS reviews (
  id          bigserial PRIMARY KEY,
  agent_id    uuid NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  agent_slug  text NOT NULL,
  rating      int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  name        text NOT NULL,
  comment     text NOT NULL,
  approved    boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_agent_id   ON reviews(agent_id);
CREATE INDEX IF NOT EXISTS reviews_agent_slug ON reviews(agent_slug);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read approved reviews
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT
  USING (approved = true);

-- Authenticated agents read all their own reviews (incl. pending)
CREATE POLICY "Agent reads own reviews"
  ON reviews FOR SELECT
  USING (agent_id = auth.uid());

-- Anyone can submit a review (no auth required)
CREATE POLICY "Public submit review"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Trigger: keep agent_profiles.rating + review_count in sync
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE agent_profiles
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating::numeric), 1)
      FROM reviews
      WHERE agent_id = NEW.agent_id AND approved = true
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE agent_id = NEW.agent_id AND approved = true
    )
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_review_changed
  AFTER INSERT OR UPDATE OF approved ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_agent_rating();
