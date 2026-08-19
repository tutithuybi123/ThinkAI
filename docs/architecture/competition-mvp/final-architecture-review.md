# Final architecture review

> **Status: Completed historical verification of the v1.0 architecture freeze.** It remains evidence for the preserved backend core, not approval of v1.1 extensions.

## Red-team answers

1. **Can the deterministic backend core operate without live LLM?** Yes. Fixed reviewed hints, reviewed transfer pairs, deterministic score, event store, receipt and reset remain safe. The later frozen `competition-demo-v1.0` additionally requires a live bounded AI feedback normal path.
2. **What disappears when AI is unavailable?** The live labelled reasoning-feedback layer. The learner still receives approved hints and deterministic feedback; UI must say AI feedback is temporarily unavailable. This is resilience behaviour, not the normal Competition Demo story.
3. **Can client forge a receipt?** Not if server owns receipt eligibility, session relation, event append and unique receipt issuance. A browser can only render a returned receipt.
4. **Can old hint/solution context leak into Thử vận dụng?** The contract prevents product leakage through a separate session/DTO/AI input/reveal gate. Tests must enforce this; it cannot prevent human memory.
5. **Can historical evidence be distinguished from seeded demo data?** Yes: provenance is on events/receipts, with separate `demo-history` profile and student/audit labels.
6. **Can content be replaced without code change?** Yes if it satisfies the versioned content/answer-spec/review contract. Unsupported scoring type is rejected rather than patched in UI.
7. **Can scoring change without corrupting old evidence?** Yes: scores cite scoring/answer-spec version and corrections append new events.
8. **Can later failure coexist with earlier success?** Yes. Both remain events; summaries are time-qualified projections.
9. **Can a user resume after refresh?** Yes, server reconstructs session/projection from persisted data; client draft is only convenience.
10. **Can demo reset deterministically?** Yes, only for `demo-clean`, transactionally reseeded from a fixture version and audited.
11. **Can malformed AI corrupt evidence?** No. AI is schema-validated and non-authoritative; errors return fallback without score/state mutation.
12. **Does frontend implement hidden product logic?** No. It presents server view models and commands; state eligibility, selection, score and receipt remain server-owned.
13. **Is any architecture included only for future scope?** Only the `Actor` abstraction and generic IDs lightly permit later auth/content; there is no future platform infrastructure.
14. **Highest-risk dependency?** The teacher-reviewed task-pair bank. Architecture can enforce review/versioning but cannot make a weak pair valid. A weak pair reduces Thử vận dụng to an ordinary second question.
15. **Can coding agents work independently?** Yes. AF-01–AF-10 are ratified; agents still need shared DTO ownership as stated in the dependency graph.
16. **What must not change casually?** Event/provenance semantics, reviewed-pair/version contract, isolation boundary, receipt policy/server ownership and mutation idempotency.

## Remaining decisions that cannot be invented

* Exact micro-skill, teacher-approved pairs, hint wording and scoring answer forms.
* Chosen deployment host and actual secrets/identity for a live environment.
* Which provider/model/prompt version supplies the required bounded live AI feedback for the Competition Demo; deterministic fallback remains safe but cannot replace the normal path.
These are content/operations decisions, not reasons to delay the architecture-defined backend core once fixture placeholders are accepted.

## Verdict

> **ARCHITECTURE FREEZE: APPROVED — implementation may begin from package A, subject to the reviewed-content gate.**

The architecture is intentionally narrow: one server-backed evidence loop with replaceable content. It is **not** ready to claim learning gain, multi-skill adaptation or long-term scheduling.
