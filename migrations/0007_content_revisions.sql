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
