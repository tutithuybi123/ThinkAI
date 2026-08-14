-- Canonical PostgreSQL store for immutable evidence and rebuildable read models.
CREATE TABLE content_snapshots (
  integrity_key TEXT PRIMARY KEY,
  snapshot JSONB NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_snapshots (
  session_id TEXT PRIMARY KEY,
  session_kind TEXT NOT NULL,
  content_integrity_key TEXT NOT NULL REFERENCES content_snapshots(integrity_key),
  snapshot JSONB NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence_events (
  sequence BIGSERIAL PRIMARY KEY,
  id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  challenge_session_id TEXT,
  transfer_session_id TEXT,
  skill_id TEXT NOT NULL,
  task_id TEXT,
  task_version TEXT,
  task_family_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  schema_version INTEGER NOT NULL CHECK (schema_version >= 1),
  scorer_version TEXT,
  policy_version TEXT,
  provenance TEXT NOT NULL,
  payload JSONB NOT NULL,
  CHECK (jsonb_typeof(payload) = 'object')
);
CREATE INDEX evidence_events_actor_sequence_idx ON evidence_events(actor_id, sequence);
CREATE INDEX evidence_events_correlation_sequence_idx ON evidence_events(correlation_id, sequence);

CREATE TABLE evidence_projections (
  actor_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  last_sequence BIGINT NOT NULL,
  last_occurred_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (actor_id, skill_id)
);

CREATE TABLE idempotency_records (
  operation_key TEXT PRIMARY KEY,
  request_fingerprint TEXT NOT NULL,
  result JSONB NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
