# Layered Agent Memory System

This document explains how persistent knowledge, work tracking, and architectural decisions are layered across tools in the THINKAI KIDS repository.

---

## 1. The Multi-Layered Memory Model

To maintain reliable continuity across AI agent sessions without bloated context windows or fragmented state, project memory is structured into six distinct layers:

| Layer | Storage Location | Content & Purpose | Mutated By |
| :--- | :--- | :--- | :--- |
| **1. Operational Guidelines** | [`AGENTS.md`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/AGENTS.md) | Durable rules, safety constraints, coding principles | Human / Lead Agent |
| **2. Core Product & Arch** | [`docs/`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/docs/) | Product purpose, current scope, component architecture, dev workflows | Human / Lead Agent |
| **3. Architectural Decisions** | [`docs/decisions/`](file:///C:/Users/Tu/Desktop/DU%20AN/ThinkAI/docs/decisions/) | Immutable records of architectural choices (ADRs) | Human / Lead Agent |
| **4. Task & Work State** | `Beads` (`.beads/` via `bd`) | Task tracking, dependencies, blockers, small operational facts (`bd remember`) | **Lead Agent Only** |
| **5. Source Code & History** | `Git` (`.git/`) | Implementation history, exact code diffs, commit logs | Lead Agent / Developers |
| **6. Active Session Context** | Codex / AGY runtime | Transient conversational context for current task execution | Session Agent |

---

## 2. Policy on Semantic / Vector Memory Systems

> [!IMPORTANT]
> Automatic conversational vector memory systems (such as `claude-mem`, `codex-agent-mem`, Chroma, or external vector DBs) are **NOT** installed at this stage.

### Conditions for Considering Semantic Memory Later:

A dedicated semantic/session-memory system should be evaluated **ONLY** when all of the following conditions are met:
1. The project has accumulated dozens of sessions across multiple months.
2. Useful historical context cannot be easily located via Git logs, `docs/`, or `Beads`.
3. Agents repeatedly fail or regress because they cannot retrieve historical session details.
4. The added overhead, latency, and token consumption of a vector database are explicitly justified.

Until then, the 6-layer structured memory model above is complete, reliable, and overhead-free.
