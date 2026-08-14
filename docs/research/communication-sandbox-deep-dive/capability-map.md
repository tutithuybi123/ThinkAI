# Capability map

| Component | Current best practical method | What is reliable enough to show | Main boundary |
|---|---|---|---|
| English ASR/timestamps | Commercial ASR or strong pretrained ASR; retain token confidence | Transcript/timestamps subject to WER test | Accents/noise contaminate downstream grammar and rate |
| Vietnamese ASR/timestamps | Commercial/open pretrained ASR, test on held-out Vietnamese speech | Transcript plus timestamped delivery facts | Do not turn ASR uncertainty into a user fault |
| Script fidelity | Reference ASR + word alignment + normalized edit-distance DP; optional forced alignment | Omission/insertion/substitution/repetition candidates with audio anchors | ASR errors and valid paraphrase/self-correction need review state |
| Rate/pause/filler | VAD + timestamps + lexicon/ASR; acoustic cross-check | Counts/duration and where they occurred | “Too fast” is context/rubric-dependent |
| Pitch/energy | Praat/parselmouth or openSMILE features, voiced-frame handling | F0/energy summaries and contours | Not confidence, engagement or quality |
| English pronunciation | Microsoft PA or validated specialised model; reference/read-aloud scope | Assistive word/phoneme feedback; en-US prosody API | Needs human correlation and accent safeguards |
| Vietnamese pronunciation | No verified equivalent labelled learner benchmark/API | None as a score | Exclude from claims |
| Grammar | Transcript-aware LLM plus quoted transcript span, schema, repeatability checks | Suggestions, not grades | ASR contamination and dialect/register variation |
| Content/argument | Rubric-constrained LLM with retrieved source/script and evidence spans | Tentative observations | Not objective truth, fallacy, persuasiveness or debate winner |

## Signal classes

**A — objectively measurable:** recorded duration; voiced/silent intervals under stated thresholds; detected lexical filler/repetition; alignment operations; word count; ASR WER; deterministic output stability.

**B — measurable but context-dependent:** words/minute, pause placement, F0 range/contour, intensity, rhythm, self-correction, vocabulary diversity, content coverage. Show the fact and rubric/context; never map it automatically to “good.”

**C — subjective/unreliable as an automatic score:** confidence, charisma, engagement, persuasiveness, naturalness, debate quality, truth/fallacy, “native-like” speech. A model can offer a clearly labelled coaching suggestion, not a verified measurement.
