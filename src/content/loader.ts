import type { ContentBundle } from "./schema.js";
import { validateContentBundle, type ContentValidationIssue } from "./validator.js";

export class ContentLoadError extends Error {
  public constructor(public readonly issues: readonly ContentValidationIssue[], message = "Content bundle is not eligible for loading") {
    super(message);
    this.name = "ContentLoadError";
  }
}

export interface ContentLoadOptions {
  /** Only test code may opt in. Production repositories always keep this false. */
  allowStructuralTestFixture?: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

/** Strict loader boundary for authored content files before any repository may expose them. */
export function loadReviewedContentBundle(raw: unknown, options: ContentLoadOptions = {}): Readonly<ContentBundle> {
  if (!isRecord(raw) || !Array.isArray(raw.skills) || !Array.isArray(raw.taskFamilies) || !Array.isArray(raw.tasks) || !Array.isArray(raw.taskPairs) || !Array.isArray(raw.interventions)) {
    throw new ContentLoadError([{ path: "$", code: "INVALID_CONTRACT_VERSION", message: "must contain every content collection as an array" }]);
  }
  if (raw.fixtureProvenance !== "teacher_reviewed" && raw.fixtureProvenance !== "structural_test_only") {
    throw new ContentLoadError([{ path: "fixtureProvenance", code: "INVALID_REVIEW", message: "must declare content provenance" }]);
  }
  if (raw.fixtureProvenance === "structural_test_only" && !options.allowStructuralTestFixture) {
    throw new ContentLoadError([{ path: "fixtureProvenance", code: "INVALID_REVIEW", message: "structural test fixtures cannot load in production mode" }]);
  }

  const bundle = raw as unknown as ContentBundle;
  const result = validateContentBundle(bundle);
  if (!result.valid) throw new ContentLoadError(result.issues);
  return deepFreeze(bundle);
}
