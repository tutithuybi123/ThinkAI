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
Validates JSONL session logs against structural rules, prompt ID uniqueness, timestamp validity, and parent ID references.

```powershell
.\tools\prompt-log\validate-log.ps1
```

### 3. `export-index.ps1`
Generates `evidence/prompt-log/index.csv` from all canonical JSONL session logs.

```powershell
.\tools\prompt-log\export-index.ps1
```

### 4. `checksum.ps1`
Generates SHA-256 hashes for tracked evidence artifacts in `evidence/preflight/checksums.sha256`.

```powershell
.\tools\prompt-log\checksum.ps1
```
