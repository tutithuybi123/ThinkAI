# Private Evidence & Raw Log Storage Policy

This document describes the design and rules for the local `evidence/private/` storage directory.

---

## 1. Storage Isolation

- **Directory Path**: `evidence/private/`
- **Git Tracking Status**: **STRICTLY IGNORED** via `.gitignore`.
- **Purpose**: Local storage area for raw, un-redacted session transcripts, full visible AI exchanges, network captures, and local development logs that may contain raw environment references or sensitive context.

---

## 2. Privacy & Data Safety Rules

1. **Zero Secret Commits**: Un-redacted logs, API keys, bearer tokens, OAuth tokens, session cookies, passwords, and authorization headers must **NEVER** leave `evidence/private/`.
2. **Zero Student/Child Personal Data**: Real child/student PII must never be recorded anywhere in the workspace.
3. **Public Evidence Coupling**:
   - The public, tracked layer (`evidence/prompt-log/` and `evidence/preflight/`) contains normalized, privacy-redacted records, hashes (SHA-256), timestamps, and metadata.
   - Every normalized prompt record links to its raw artifact in `evidence/private/` via `raw_source_ref` and `raw_source_sha256` without exposing raw secrets.

---

## 3. Directory Layout in `evidence/private/` (Local Only)

```
evidence/private/
├── raw-transcripts/      # Un-redacted original conversation exports (JSONL / MD)
├── network-captures/     # Optional local network/HTTP payload captures
└── session-dumps/        # Raw session state snapshots
```
