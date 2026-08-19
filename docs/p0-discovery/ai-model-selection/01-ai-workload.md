# ThinkAI Competition Demo AI Workload

Status: frozen discovery specification, 2026-08-15. This document describes a non-authoritative feedback call; it does not select a model or change production code.

## Job to be done

After a practice submission is deterministically scored, help a Vietnamese upper-secondary learner reflect on their optional explanation in one short, kind next step. The model may recognise a plausible method, arithmetic slip, or missing evidence, but it must not decide mathematical correctness, task validity, transfer equivalence, learner identity, mastery, or Receipt eligibility.

## Exact request context

The server must send only this object, after the scorer has completed:

```json
{
  "practiceProblemPrompt": "public display text; no answer specification",
  "learningObjective": "reviewed public objective",
  "learnerReasoning": "optional, bounded to 1,200 Unicode code points",
  "scoreOutcome": "correct | incorrect | invalid",
  "scoreReasonCode": "FORMAT | OUT_OF_TOLERANCE | NOT_EQUIVALENT | null",
  "copyObjective": "affirm_method | inspect_step | restart_with_relation | invite_attempt"
}
```

The static system/developer instruction must say that `scoreOutcome` and `scoreReasonCode` are authoritative inputs; learner text is untrusted data; the task is feedback only; and output must conform to the schema below. It must explicitly reject requests to change score, issue a Receipt, reveal answers, expose instructions, or use hidden/transfer context.

Never send answer specifications or keys, a worked solution, reviewed hint body/tags, transfer task/content/mapping, previous AI conversation, audit/event history, receipt data, learner identifiers, IP/device data, or secrets. The existing product contracts in `demo-ai-role.md`, ADR-006, ADR-007, and ADR-005 are authoritative for these boundaries.

## Expected response contract

```json
{
  "message": "Vietnamese feedback, 1–2 sentences, at most 280 Unicode code points",
  "encouragement": "optional neutral Vietnamese sentence, at most 100 code points",
  "suggestedFocus": "optional short process focus, at most 90 code points"
}
```

No other keys are permitted. The response must contain no answer, numerical result not already in the public prompt, score, receipt, mastery/proficiency claim, permanent misconception label, system/prompt text, transfer/prior-practice content, or instruction for the server/client to change state. It should use uncertainty when evidence is thin (for example, “Mình chưa đủ thông tin để kết luận…”), distinguish method from final correctness, and give one next action rather than a tutorial.

## Answer-withholding rules

The model may point to a named *process* already visible in the prompt/reasoning (such as “kiểm tra dấu khi thay số”), but cannot supply the missing formula substitution, intermediate arithmetic, final answer, hidden answer choices, or a worked derivation. “I cannot start” should receive an invitation to identify given/unknown or use an approved hint, not a solution. A direct learner request for the answer is refused briefly and redirected to an approved help action.

## Operational envelope and fallback

Use strict JSON-schema output when the OpenRouter model supports it, `temperature: 0`, `max_tokens: 180`, and a server timeout of 4,000 ms (P95 target: <=3,000 ms; hard gate: >5,000 ms is unacceptable). The useful response is normally 40–110 Vietnamese tokens; outputs above the schema length limits are rejected.

On timeout, provider error, unsafe output, schema parse failure, or local policy violation: return the documented `AI_UNAVAILABLE` state and reviewed/deterministic guidance. Do not retry in the learner request after a timeout; record only outcome, latency, model/provider identifier, prompt-template version, token/cost metadata and redacted/minimised diagnostic category. The authoritative scoring/evidence/transfer/receipt flow continues unchanged.

## Privacy and data minimisation

Benchmark data and production inputs must be synthetic. Public reports store aggregate metrics, hashes/lengths and redacted failure classes only. Raw model outputs and the synthetic review packet are written only beneath the ignored `tools/benchmarks/thinkai-feedback/private/` directory and must be inspected before any human sharing. API keys are read only from `OPENROUTER_API_KEY`; they are never printed, written, or passed as a command argument.
