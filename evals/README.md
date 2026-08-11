# THINKAI KIDS — AI Evaluation Framework

This directory contains evaluation guidelines and test suites for assessing the AI pipeline (hint engine, tutoring logic, safety guardrails) in **THINKAI KIDS**.

---

## 1. Evaluation Scope & Goals

When the AI pipeline is implemented, evaluations must systematically cover:

1. **Answer Leakage**: Ensure hints guide the student step-by-step without revealing full direct solutions upfront.
2. **Structured Output / Schema Validity**: Verify that JSON responses strictly adhere to defined schemas.
3. **Hint Level Compliance**: Check that requested hint levels (e.g. Level 1: Conceptual vs Level 3: Calculation) match output granularity.
4. **Unsafe Response Handling**: Confirm safety filters block inappropriate, adult, or harmful inputs.
5. **Prompt Injection / Adversarial Robustness**: Test resistance against jailbreak attempts and system prompt overrides.
6. **Deterministic Fallback Behavior**: Ensure graceful fallback to static safety hints if LLM responses fail or time out.
7. **Latency Benchmark**: Track hint response time (< 2s target).
8. **Model / Prompt Regression**: Prevent degradation when updating system prompts or switching LLM providers.

---

## 2. Evaluation Tooling (Future Integration)

- **Promptfoo**: Recommended evaluation harness when multi-prompt testing is enabled.
- **Custom JSON Evaluators**: Programmatic schema validation tests integrated into standard unit tests (`npm test`).

---

## 3. Policy on Evaluation Data

- Use **synthetic benchmark datasets** only.
- Never store or log real student conversations or PII in test suites or evaluation dumps.
