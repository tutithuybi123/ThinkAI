-- Server-owned synthetic identities retain their active session across runtime
-- instances. Rotation invalidates a cookie everywhere without trusting clients.
CREATE TABLE synthetic_actor_sessions (
  actor_id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('learner', 'presenter', 'auditor')),
  current_session_id TEXT,
  generation BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
