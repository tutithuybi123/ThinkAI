# Frontier reality check

## What already works out of the box

Frontier realtime models provide low-latency spoken interaction; OpenAI documents voice-to-voice interaction and tone/inflection processing ([S11](https://developers.openai.com/api/docs/guides/realtime-conversations)). An LLM can read a transcript, identify a stated grammar issue, summarize a rubric and roleplay an opponent. Combined with commercial ASR and Microsoft PA for English, a large portion of the proposed experience is available without training.

That does **not** establish reliable assessment. It does not provide validated Vietnamese pronunciation/prosody, robust transcript accuracy under every accent/noise condition, or a trustworthy verdict on confidence, argument quality, truth, or persuasiveness.

## Small executed transcript-only check (not a speech benchmark)

On 2026-08-12, the configured native runtime (`gpt-5.6-terra`, read-only, default reasoning effort) received the identical Vietnamese transcript/rubric three times. The transcript deliberately omitted both “problem impact” and the required “concrete school implementation step,” and contained one filler/repetition. This was not an audio, ASR, pronunciation, or learning test.

All three runs identified the filler/repetition and suggested adding problem impact. However, outputs disagreed about whether that missing item belonged in `omissions` (run 1) or `uncertainty` (runs 2–3), and **none identified the missing implementation step**. All three also failed the requested typed JSON contract: fields that required evidence-bearing objects were returned as strings in at least one field. This small, non-generalizable check demonstrates the exact risk the architecture must address: an LLM can make plausible observations but is not a stable rubric evaluator or reliable structured-output source without validation, schema enforcement and human ground truth. Prompt/execution provenance is retained by the repository prompt log; no raw voice data were used.

## Execution status

No speech API credentials, lawful controlled audio set, or human annotations were available in this pass; therefore no model/audio benchmark is claimed. A previously existing repository experiment uses a different mathematical task and cannot be transferred as communication evidence. No fabricated calls or numbers are included.

## Exact reproducible test protocol

Create 30 consented/synthetic *non-minor* clips per language or use public lawful data, balanced across scripted omissions/insertion/substitution/repetition/self-correction, fillers, pauses and noise. Freeze reference text and independent annotations. Run two ASRs, DP alignment and VAD. Score each operation against annotation. For English, run PA and compute correlation/MAE to SpeechOcean762 human labels before product claims.

For 20 frozen presentation/debate transcripts with a teacher-written analytic rubric, run the same frontier evaluator at least three times with temperature/version logged. Score JSON validity, category agreement, evidence-span precision and model–teacher agreement. Include counterexamples: a deliberate rhetorical pause, a regional accent, valid paraphrase, an unsupported but eloquent claim, and an ASR error. The system must surface uncertainty/abstain rather than grade them confidently.
