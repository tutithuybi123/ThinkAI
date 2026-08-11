# AGENTS.md — THINKAI Operating Instructions for AI Agents

Welcome to **THINKAI**. This repository is configured for collaborative development between human developers, OpenAI Codex (via `codex-acp`), and Antigravity AI agents.

---

## 1. Primary Mission & Product Focus

- **MVP Target**: This repository hosts the **THINKAI KIDS** competition MVP.
- **Pragmatic Execution**: Prioritize a simple, working, and testable MVP over speculative or overly complex architecture.
- **Safety & Privacy**: 
  - **NEVER** use real child or student personal data. Use synthetic test data only.
  - **NEVER** expose secrets, API keys, or machine-specific paths in commits or documentation.
  - Do **NOT** integrate paid external services without explicit approval.

---

## 2. Core Engineering Principles

1. **Inspect Before Modifying**: Thoroughly inspect existing code, schemas, and tests before making edits.
2. **Small Verifiable Increments**: Make small, incremental changes. Test each change immediately.
3. **Preserve Working Behavior**: Do not break existing functionality. Maintain test coverage.
4. **Honest Test Results**: Never hide, comment out, or delete failing tests to fake success. Fix the underlying root cause.
5. **Mandatory Post-Edit Verification**: Always run relevant tests, linting, typechecking, or build checks after meaningful code changes.
6. **Documentation & Context7**: When working with external libraries, frameworks, or APIs whose current behavior is uncertain, consult **Context7** or primary official documentation instead of guessing.

---

## 3. Task Management & Work State (Beads Policy)

- **Single Source of Work State**: Work tasks, dependencies, and operational memory are managed via **Beads** (`bd`).
- **Lead Agent Authority**: **ONLY THE LEAD AGENT** mutates Beads task state (`bd create`, `bd close`, `bd update`, `bd state`).
- **Subagent Role**: Subagents (e.g. `explorer`, `reviewer`) inspect tasks and report findings to the Lead agent, but must **NOT** independently mutate task state unless explicitly delegated task ownership.
- **Durable Facts**: Use `bd remember` for small, persistent operational facts that do not belong in `AGENTS.md` or ADRs.
- **Task Updating**: Always update task state in Beads after completing meaningful work items.

---

## 4. Subagents & Delegation

- **Role Definitions**:
  - `explorer`: Read-only code exploration, symbol tracing, and architecture mapping.
  - `reviewer`: Read-only review of correctness, security, data privacy, test completeness, and regression risk.
- **No Concurrent Edits**: Avoid launching subagents that edit overlapping files simultaneously.
- **Lead Accountability**: The Lead agent remains strictly responsible for final code integration, verification, and commit decisions.

---

## 5. UI Verification & Web Testing

- **Browser Automation**: Use **Playwright** (`tests/e2e/`) to verify important UI flows and user interactions.
- **Console & Network Inspection**: Always inspect browser console errors and network failures when debugging UI bugs.
- **Artifact Protection**: Never commit temporary screenshots, video recordings, or authenticated browser storage.

---

## 6. Architecture & ADRs

- **Architectural Documentation**: Document all major decisions in `docs/decisions/` using the lightweight ADR format.
- **No Fake ADRs**: Only write ADRs for decisions that have actually been discussed and agreed upon.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->
