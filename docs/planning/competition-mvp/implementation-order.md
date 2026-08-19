# Dependency-ordered implementation plan

> **Status: Historical v1.0 implementation order.** Do not execute; use the final v1.1 implementation plan.

This is dependency order only.

## Phase 0 — Freeze product target

**Entry:** team accepts v1.2 direction.  
**Outputs:** one micro-skill; content format; valid pair rubric; fixed intervention taxonomy; receipt rule; event schema; active/locked/hidden map; AI fallback policy; exact demo account story.  
**Exit:** every P0 decision can be represented without a generic “TBD.”

## Phase 1 — Core vertical slice

**Entry:** Phase 0 content/schema are approved.  
**Outputs:** Home → challenge → attempt/cannot-start → reviewed help → solve → isolated Transfer Quest → deterministic result → connection reveal → Capability Receipt → persisted event update.  
**Dependencies:** reviewed bank, event schema, deterministic scorer, isolation policy.  
**Exit / CORE FLOW STABLE:** every P0 interaction works end-to-end from a reset account; receipt is generated only from actual events; transfer context is isolated; pass and recovery paths work; no critical broken route.

## Phase 2 — Demo reliability

**Entry:** core flow stable.  
**Outputs:** seeded demo account, historical-labelled event, reset/recovery, retry states, deterministic fallback, content/API health indicator, core-path regression checks.  
**Dependencies:** persisted vertical slice.  
**Exit:** repeated demo path survives refresh/restart and has defined recovery for unavailable AI/network/backend.

## Phase 3 — Product completeness

**Entry:** demo path reliable.  
**Outputs:** polished Home/path, real capability history, compact audit view, navigation, honest locked items if any, loading/empty/error/success states, responsive intended demo layouts.  
**Exit / PRODUCT SHELL STABLE:** every visible navigation target resolves; every visible control works or is explicitly disabled; history reflects actual events; no placeholder/debug UI; locked items are few and truthful.

## Phase 4 — Product polish

**Entry:** shell stable.  
**Outputs:** receipt micro-animation, transitions, copy refinement, visual consistency, presentation accessibility.  
**Exit:** polish does not mask an unfinished function; signature moment is understandable without developer narration.

## Phase 5 — Optional only

Bounded live AI feedback, limited explanation check, or 2–3 future capability locks. Omit if they destabilize the deterministic core. Full teacher mode, broad adaptation, new subjects, diagnosis, and game economy remain future.

## DEMO READY gate

Declare only when the entire 3-minute story repeats on a reset account; live/seeded/historical data are distinguishable; fallback behavior is honest; receipt conditions are inspectable; there is no fake retention/mastery claim; and the product answers “why not ChatGPT plus another quiz?” through the interaction itself.
