-- Reset is permitted only for the synthetic clean-demo account. The audit is
-- durable and separate from learner evidence, so a presenter reset never
-- pretends to be a learning observation.
CREATE TABLE demo_reset_audit (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT NOT NULL,
  reset_by TEXT NOT NULL,
  fixture_version TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
