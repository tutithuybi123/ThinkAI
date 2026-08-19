# Competition Demo completion plan — dependency ordered

> **Status: Historical v1.0 completion plan.** Do not execute; current execution authority is the final v1.1 implementation plan.

```mermaid
flowchart TD
  S[Independent scope review and scope lock] --> C[Teacher-reviewed content bundle]
  S --> A[Live AI adapter contract/provider]
  S --> F[API-backed frontend from UI handoff]
  C --> R[Real runtime fixture/seed]
  A --> E[AI safety/fallback tests]
  F --> B[Browser E2E]
  R --> B
  E --> B
  B --> D[Production-like demo acceptance + independent review]
```

Parallel after scope lock: teacher content review; server AI adapter (once credential/model is available); and frontend structural binding against frozen API view models. Do not activate a feature that lacks its dependency. The final gate requires all P0 nodes, then an independent full-stack review; it does not start Full Product expansion.
