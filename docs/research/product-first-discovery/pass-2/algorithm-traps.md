# Algorithm traps

These are useful problem areas, not failures of the underlying users. They are flagged because a serious non-AI system meets the core need more reliably or directly. The full flagged set is recorded in [screening.csv](screening.csv).

| Problem | Stronger classical alternative |
|---|---|
| P010 Commune evacuation planning | GIS, hazard rules, resource allocation and CP-SAT/vehicle routing. |
| P011 Reservoir flood operations | Hydrological models, operating-rule curves and stochastic optimization. |
| P016 Road-space allocation | Travel-demand simulation and multi-objective optimization. |
| P029 Informal-waste collection plan | Vehicle routing, knapsack/load constraints and safety checklists. |
| P033 Seafood traceability | QR/lot identifiers, append-only ledger, scan checkpoints and audits. |
| P037 Disaster support priority | Vulnerability registry, GIS reachability and dispatch optimization. |
| P041 Health-data re-entry | Interoperability APIs, schema mapping and a master patient index. |
| P058 Restricted truck trips | Time-dependent shortest-path routing with regulatory geofences. |
| P061 Last-mile fragmented drops | Vehicle-routing problem with time windows, batching and GPS dispatch. |
| P065 Factory energy management | Historian/control charts, regression baselines and engineering review. |
| P074 Repeated family assessments | Portable consented profile, shared schema and reusable forms. |
| P085 Interpreter booking | Calendar/skills database plus bipartite matching or CP-SAT. |
| P088 Multi-school SLP schedule | CP-SAT over travel, service and compliance constraints. |
| P122 Household meal planning | Inventory, expiry rules, recipe database and menu optimization. |
| P136 Vaccine cold-chain excursions | Calibrated temperature thresholds, inventory links and SOP quarantine. |

Common trap patterns: routing, scheduling, compliance, ledger/traceability, inventory, known-threshold alerts, and record interoperability. A model may still operate at an unstructured-input boundary, but it is not the core product capability here.
