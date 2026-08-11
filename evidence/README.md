# THINKAI KIDS — Competition Evidence & Provenance

This directory hierarchy houses the competition evidence, prompt logging schema, preflight manifests, and provenance tracking for **THINKAI KIDS**.

---

## Architecture Overview

```
evidence/
├── README.md                 # Overview of competition evidence system
├── PRIVATE_STORAGE.md        # Tracked policy for local un-tracked raw logs
├── preflight/                # Preflight timeline, tooling manifests, & checksums
│   ├── README.md
│   ├── timeline.md           # Truthful preflight timeline
│   ├── tooling-manifest.yaml # Verified tools & intentional non-installations
│   ├── source-manifest.jsonl # Classified preflight sources & availability
│   └── checksums.sha256     # SHA-256 integrity checksums
├── prompt-log/               # Public, append-only normalized prompt records
│   ├── README.md
│   ├── schema.json           # JSON Schema (v1) for prompt log records
│   ├── index.csv             # Derived CSV index for human inspection
│   └── sessions/             # Append-only JSONL prompt logs per session
└── private/                  # GIT-IGNORED: Local un-redacted raw storage
```

---

## Key Provenance Policies

1. **Append-Only Integrity**: Canonical JSONL session logs in `evidence/prompt-log/sessions/` are append-only. History is never rewritten.
2. **Faithful Provenance**: Prompts and visible AI exchanges are captured truthfully. Missing historical logs are explicitly marked `unavailable`; they are **NEVER** reconstructed or fabricated.
3. **Privacy First**: Sensitive data and raw logs stay exclusively inside `evidence/private/`, which is ignored by `.gitignore`.
