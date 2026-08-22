import { validateContentAggregate, type ContentAggregate } from "./v11-validator.js";
import { publishRevision, type ContentRevision } from "./lifecycle.js";
export function validatePublishableContent(aggregate: ContentAggregate): readonly string[] {
  const issues = validateContentAggregate(aggregate).map((issue) => issue.code);
  for (const node of aggregate.microSkills) { if (!node.pairs.length) issues.push("EMPTY_PUBLISHED_PAIR_BANK"); if(!node.practiceGate)issues.push("MISSING_PRACTICE_GATE"); else if(node.practiceGate.policyVersion!=="practice-gate/v1"||node.practiceGate.strategy!=="distinct-correct-count"||!Number.isInteger(node.practiceGate.requiredCorrectCount)||node.practiceGate.requiredCorrectCount<1||!Number.isInteger(node.practiceGate.maxPracticeItems)||node.practiceGate.maxPracticeItems<node.practiceGate.requiredCorrectCount)issues.push("INVALID_PRACTICE_GATE"); else if(node.pairs.length<node.practiceGate.maxPracticeItems)issues.push("INSUFFICIENT_PRACTICE_PAIR_BANK"); }
  return issues;
}
export function assertPublishableContent(aggregate: ContentAggregate): void { const issues = validatePublishableContent(aggregate); if (issues.length) throw new Error(`Content is not publishable: ${issues.join(",")}`); }
export function publishReviewedAggregate<T extends ContentAggregate>(revision: ContentRevision<T>): ContentRevision<T> { assertPublishableContent(revision.body); return publishRevision(revision); }
