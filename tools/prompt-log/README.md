# PowerShell Prompt Log Utilities

This directory contains PowerShell scripts for managing append-only prompt logs, validating log structures, exporting indexes, and generating SHA-256 evidence checksums.

---

## Command Reference

### 1. `promptlog.ps1`
Manages session creation, append-only prompt recording, and session closing events.

```powershell
# Create new session log file
.\tools\prompt-log\promptlog.ps1 new-session -Source "antigravity" -Phase "preflight"

# Append a prompt record
.\tools\prompt-log\promptlog.ps1 append -Prompt "Evaluate architecture choices" -Actor "user" -Source "codex"

# Close session (appends a close-session summary record without modifying past lines)
.\tools\prompt-log\promptlog.ps1 close-session -Notes "Completed evaluation task"
```

### 2. `validate-log.ps1`
Validates JSONL session logs, record/recovery references, redaction metadata, UTF-8/BOM policy, index equivalence, and checksum equivalence. It never rewrites evidence.

```powershell
.\tools\prompt-log\validate-log.ps1
```

### Codex hook validation

Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\prompt-log\tests\codex-hook.tests.ps1` before enabling changes. It uses only synthetic prompts and an isolated temporary evidence root. After it passes, submit one harmless marker through Codex, then run `export-index.ps1`, `checksum.ps1`, and `validate-log.ps1`.

### 3. `export-index.ps1`
Generates `evidence/prompt-log/index.csv` from all canonical JSONL session logs.

```powershell
.\tools\prompt-log\export-index.ps1
```

### 4. `checksum.ps1`
Generates deterministic SHA-256 hashes for tracked evidence artifacts in `evidence/preflight/checksums.sha256`. The manifest itself and `evidence/private/` are excluded.

```powershell
.\tools\prompt-log\checksum.ps1
```
