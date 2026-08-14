# Architectures without training

| Option | Accuracy / latency | Cost/reproducibility | Vietnamese / 6-hour resilience | Verdict |
|---|---|---|---|---|
| A. API-heavy: realtime API + commercial pronunciation + LLM | Fastest interaction; strongest English PA | Recurring cost/vendor dependency; limited reproducibility | Vietnamese PA gap remains; credentials/network risk | Good demo prototype only |
| B. Hybrid: ASR + local alignment/VAD/acoustics + LLM semantic suggestions | Strong for objective facts; moderate semantics | Moderate cost, auditable facts, model swap possible | Works for Vietnamese delivery; can degrade gracefully | **Recommended** |
| C. Mostly open/pretrained: local ASR + signal processing + open LLM | More control/offline possibility | Highest integration/test burden; hardware/model variance | Vietnamese ASR possible; realtime/semantic quality uncertain | Not for a time-limited school round |

Recommended separation: simulator (scenario/persona/difficulty) emits a recording and task contract; evaluator produces an evidence ledger; adaptation consumes only accepted, stable measures. Put all LLM feedback behind a typed schema with source transcript spans, uncertainty and abstention. Do not use an LLM for values a timestamp or deterministic alignment can calculate.

No fine-tuning is indicated now. First establish whether ASR/alignment and a narrow rubric fail on a fixed test set. Fine-tuning only becomes a question after a named bottleneck and lawful labels exist.
