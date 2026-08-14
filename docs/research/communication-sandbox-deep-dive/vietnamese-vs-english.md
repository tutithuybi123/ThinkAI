# Vietnamese vs English

| Feature | English feasibility | Vietnamese feasibility | Evidence | Recommendation |
|---|---:|---:|---|---|
| ASR/transcript/timestamps | Medium–high after local WER test | Medium–high after local WER test | Public ASR data exist; errors vary by accent/noise | Include with uncertainty display |
| Script fidelity | High for a fixed text | High for a fixed text | Alignment is language-agnostic once transcript quality is tested | Include, allow paraphrase review |
| Duration/pause/filler/repetition | High as measurement | High as measurement | Deterministic/VAD methods | Include facts, not value judgment |
| English word/phoneme pronunciation | Medium–high for targeted read speech | N/A | Microsoft PA, SpeechOcean762 | English-only, assistive |
| Prosody/stress/rhythm score | Medium only for en-US targeted scope | Low | Microsoft limits prosody to en-US; no Vietnamese-labelled benchmark found | English exploratory; exclude Vietnamese score |
| Grammar feedback | Medium, transcript-limited | N/A | LLMs can explain detected spans but no automatic truth | Suggestions only |
| Presentation content coverage | Medium with supplied rubric/script | Medium with supplied rubric/script | Semantic matching needs teacher rubric | Cite evidence, allow disagreement |
| Argument components | Low–medium in constrained English text | Low in oral Vietnamese | Argument mining is schema/domain-bound [S05] | Do not score debate quality |

## Decision

English is viable for a **narrow read-aloud/pronunciation assistant**, but it is commercially crowded. Vietnamese is viable for **transparent rehearsal evidence**, not for pronunciation/prosody grading. Do not use one shared “communication score.”
