/** Policy/version constants are cited by future persisted facts; do not rename casually. */
export const CONTENT_CONTRACT_VERSION = "content-contract-v1" as const;
export const EVIDENCE_EVENT_SCHEMA_VERSION = 1 as const;
export const SCORING_POLICY_VERSION = "score-v1" as const;
export const RECEIPT_POLICY_VERSION = "receipt-v1" as const;
export const PACKAGE_A_FIXTURE_VERSION = "fixture-contract-v1" as const;

export const PROVENANCE_VALUES = ["live", "seeded_demo", "historical_seed", "correction"] as const;
export type Provenance = (typeof PROVENANCE_VALUES)[number];
