---
name: handoff-to-codex
description: Pre-flight checklist and workspace validation skill before handing off work to OpenAI Codex.
---

# Handoff to Codex Workflow Skill

Use this skill when preparing to transition active workspace development from Antigravity to OpenAI Codex (`codex-acp`).

---

## Pre-Flight Checklist

Before handing off control to Codex, complete the following verification steps:

1. **Check Git Status**:
   ```bash
   git status
   ```
   Ensure `git status` is clean or has well-understood uncommitted changes. No temporary noise or scratch files should be left behind.

2. **Verify Operating Guidelines**:
   Confirm [`AGENTS.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/AGENTS.md) is current and reflects any newly added policies.

3. **Verify Architectural Documentation**:
   Ensure [`docs/PRODUCT.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/docs/PRODUCT.md) and [`docs/ARCHITECTURE.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/docs/ARCHITECTURE.md) accurately describe the current baseline.

4. **Verify Work State in Beads**:
   ```bash
   bd ready
   bd list
   ```
   Ensure active tasks, blockers, and recent progress are up to date in Beads.

5. **Secrets & Privacy Audit**:
   Confirm no real API keys, credentials, or child PII have been added to tracked files.

6. **Build & Test Baseline**:
   Verify that tests or build commands pass cleanly if implemented:
   ```bash
   npm test
   npm run build
   ```

---

## Handoff Summary Output

When handoff verification passes, provide a concise summary for the incoming Codex session:
- **Active Task**: Next ready issue from `bd ready`.
- **Known Blockers**: Any active blockers recorded in Beads or docs.
- **Verification Status**: Test/build result status.
- **Starting Command**: Recommended initial command for Codex (e.g. `bd ready`).
