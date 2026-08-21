CREATE TABLE content_revisions (
  revision_id TEXT PRIMARY KEY,
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('DRAFT','IN_REVIEW','APPROVED','PUBLISHED','DEPRECATED')),
  body JSONB NOT NULL,
  body_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX content_revisions_published_idx ON content_revisions (lifecycle, revision_id);
CREATE TABLE published_micro_skills (
  micro_skill_id TEXT PRIMARY KEY,
  revision_id TEXT NOT NULL UNIQUE REFERENCES content_revisions(revision_id),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE content_episode_exposures (
  actor_id TEXT NOT NULL,
  micro_skill_revision_id TEXT NOT NULL REFERENCES content_revisions(revision_id),
  independent_attempt_ordinal INTEGER NOT NULL CHECK (independent_attempt_ordinal >= 0),
  pair_id TEXT NOT NULL,
  pair_version TEXT NOT NULL,
  transfer_task_id TEXT NOT NULL,
  transfer_task_version TEXT NOT NULL,
  exposed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_id,micro_skill_revision_id,independent_attempt_ordinal,pair_id,pair_version)
);
