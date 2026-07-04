-- PropConnect NG — Migration 005: agent verification submissions
-- Run in: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS verification_submissions (
  id           bigserial PRIMARY KEY,
  agent_id     uuid NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
  step_id      text NOT NULL CHECK (step_id IN ('nin','bvn','face','cac','rean','photo')),
  status       text NOT NULL DEFAULT 'review'
               CHECK (status IN ('review','approved','rejected')),
  data         jsonb,          -- nin_number | bvn_number | rean_number | file_url
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at  timestamptz,
  UNIQUE (agent_id, step_id)   -- one active submission per step per agent
);

CREATE INDEX IF NOT EXISTS vsub_agent ON verification_submissions(agent_id);

ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

-- Agents read and manage only their own submissions
CREATE POLICY "Agents manage own verification"
  ON verification_submissions FOR ALL
  USING  (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- ── When a submission is approved, update agent_profiles tier/verified ────────
-- Run this trigger so approvals auto-promote the agent tier.
CREATE OR REPLACE FUNCTION sync_agent_tier()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _done int;
BEGIN
  -- Count approved steps for this agent
  SELECT COUNT(*) INTO _done
  FROM verification_submissions
  WHERE agent_id = NEW.agent_id AND status = 'approved';

  UPDATE agent_profiles SET
    verification_tier = CASE
      WHEN _done >= 6 THEN 'gold'
      WHEN _done >= 4 THEN 'silver'
      WHEN _done >= 3 THEN 'bronze'
      ELSE 'starter'
    END,
    verified = (_done >= 3),
    updated_at = now()
  WHERE id = NEW.agent_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_verification_approved ON verification_submissions;
CREATE TRIGGER on_verification_approved
  AFTER INSERT OR UPDATE OF status ON verification_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION sync_agent_tier();
