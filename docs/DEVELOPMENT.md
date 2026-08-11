# THINKAI KIDS — Development Guide [PRE-FLIGHT DISCOVERY]

This document covers local setup, tool verification, and instructions for how AI agents (OpenAI Codex and Antigravity) should start and end sessions during Pre-flight Product Discovery.

---

## 1. Verified Tooling & Commands

### Task Management with Beads (`bd`)
```bash
bd ready                          # View ready discovery tasks
bd show <id>                      # View task details
bd update <id> --claim            # Claim task
bd close <id>                     # Close completed task
bd prime                          # Output AI-optimized workflow context
```

### External Documentation Lookup with Context7 (`ctx7`)
When current library or API signatures are uncertain, consult Context7 instead of guessing:

```bash
# Step 1: Resolve library name to a Context7-compatible library ID
ctx7 library <library-name> <query>
# Example: ctx7 library react "hooks"

# Step 2: Query documentation using the resolved library ID
ctx7 docs <libraryId> <query>
# Example: ctx7 docs /reactjs/react.dev "useEffect"
```

> [!WARNING]
> Do **NOT** use `ctx7 query`. The official CLI syntax requires `ctx7 library` and `ctx7 docs`.

### Agent Browser Automation with Playwright CLI (`playwright-cli`)
For interactive browser automation and UI verification:

```bash
# Open a browser session
playwright-cli open https://example.com

# Capture page snapshot for element references
playwright-cli snapshot

# Close the browser session
playwright-cli close
```

---

## 2. Pre-Flight Session Lifecycle for Future Codex Sessions

### START OF SESSION:

1. **Read Core Guidelines**: Read [`AGENTS.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/AGENTS.md).
2. **Inspect Pre-Flight Docs**: Review [`docs/PRODUCT.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/docs/PRODUCT.md) and [`docs/ARCHITECTURE.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/docs/ARCHITECTURE.md).
3. **Inspect Repository State**: Run `git status --porcelain=v1 -uall` and `git log -n 5`.
4. **Inspect Task State**: Run `bd ready` to check discovery tasks.
5. **Identify Concrete Task**: Pick one specific evaluation task.
6. **Formulate Plan**: Formulate a short evaluation plan.
7. **Use Subagents**: Delegate exploration tasks to `explorer` subagents.

### DURING WORK:

- Keep evaluation work focused without locking in premature architectural decisions.
- Use Context7 (`ctx7 library ...`) for documentation lookup.
- Use Playwright CLI (`playwright-cli open/snapshot/close`) for browser automation.

### END OF TASK:

1. **Inspect Diff**: Review `git status` to ensure no unexpected changes or secrets were added.
2. **Reviewer Check**: Request a `reviewer` subagent check for non-trivial changes.
3. **Update Task State**: Close or update the task in Beads (`bd close <id>`).
4. **Update Documentation**: Keep docs marked Draft / Evolving while evaluating choices.
