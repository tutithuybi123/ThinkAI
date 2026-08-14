# Learning Evidence Ledger review

The listed states are neither mutually exclusive nor a clean ladder. A learner can have assisted success, independent familiar success, failed near transfer, and an unobserved delayed check simultaneously. A later failure should not erase prior success; it should make the current conclusion less certain and create a new observation.

## Recommended representation

Use an append-only event ledger plus a transparent derived summary—not one categorical state machine.

| Layer | Store/show |
|---|---|
| Event record | skill/item family/version, task condition, disclosed intervention IDs, response/rubric result, timestamp, scoring-version, review status |
| Derived internal summary | counts/recency by condition; optional calibrated probability only after data supports it |
| Student view | capability receipt + next action + plain uncertainty (“not checked in a new situation yet”) |
| Teacher view | events, task validity/review status, contradictory outcomes, evidence conditions—not a personality label |

Do not call a hidden probability “mastery” or expose a decimal. If a later probabilistic model is used, it must be calibrated on held-out delayed outcomes and show an uncertainty interval/abstention. [FACT] uncertainty-aware knowledge-tracing research concerns model uncertainty; it does not validate ThinkAI’s student-facing evidence representation ([AAAI 2025](https://ojs.aaai.org/index.php/AAAI/article/view/35007/37162)).

## Update policy

* An event does not downgrade identity; it may downgrade only a derived, time-qualified claim.
* “Retained” means “passed this delayed item at this interval,” never “will remember indefinitely.”
* Time decay should initially be a reminder/recheck policy, not an unvalidated score decay.
* “Fragile/conflicting” is a visible evidence condition, not a terminal level; prompt a next discriminating task.

This approach is stronger than a mastery percentage because it can be audited and falsified. It is weaker as a progress mechanic unless the student sees the concrete capability route, not raw evidence jargon.
