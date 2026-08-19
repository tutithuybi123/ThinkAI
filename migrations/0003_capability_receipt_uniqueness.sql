-- A receipt is unique for one learner, qualifying transfer-score fact and policy.
-- Evidence remains the canonical history; this index prevents concurrent distinct
-- idempotency keys from attempting a second product claim.
CREATE TABLE capability_receipts (
  receipt_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  transfer_scored_event_id TEXT NOT NULL REFERENCES evidence_events(id),
  policy_version TEXT NOT NULL,
  issued_event_id TEXT NOT NULL UNIQUE REFERENCES evidence_events(id),
  issued_at TIMESTAMPTZ NOT NULL,
  UNIQUE (actor_id, transfer_scored_event_id, policy_version)
);
