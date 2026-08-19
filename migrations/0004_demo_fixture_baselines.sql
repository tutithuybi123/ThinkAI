-- Immutable, explicit reset sources for synthetic demo profiles. The event JSON is
-- fixture data, never interpreted as live learner evidence until copied on reset.
CREATE TABLE demo_fixture_baselines (
  profile TEXT PRIMARY KEY CHECK (profile IN ('clean', 'history')),
  actor_id TEXT NOT NULL,
  fixture_version TEXT NOT NULL,
  events JSONB NOT NULL CHECK (jsonb_typeof(events) = 'array'),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
