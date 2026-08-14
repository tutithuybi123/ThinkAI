# Prosody and pronunciation

## Methods

Use VAD/ASR timestamps for rate and pauses; [Praat/parselmouth](https://parselmouth.readthedocs.io/) or [openSMILE](https://audeering.github.io/opensmile/) for F0, intensity and voiced-frame features; optionally DTW only when a pedagogically appropriate reference recording exists. Such tools measure acoustic properties, not public-speaking merit. F0 is affected by speaker, age, gender, microphone and linguistic tone; Vietnamese tone makes a naive “more pitch variation is better” rule especially invalid.

English targeted assessment is materially more mature. Microsoft documents scripted and unscripted scores, word/phoneme feedback and an **en-US-only** prosody feature ([S10](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)). The SpeechOcean762 dataset supplies five expert annotations for 5,000 Mandarin-L1 English read sentences ([S07](https://huggingface.co/datasets/mispeech/speechocean762)). That supports an assistive English read-aloud feature, not universal accent grading or spontaneous-presentation certification.

Vietnamese presentation can safely report pause timing, repetitions, reference-script alignment and acoustics. This pass found no verified public Vietnamese learner-speech corpus with human word/phoneme/prosody ratings suitable to validate a pronunciation grade. **Recommendation: do not display a Vietnamese pronunciation, stress, rhythm or prosody score.**

## Responsible feedback pattern

Say: “A 1.2 s silence occurred after this phrase; listen and decide whether it was intentional.” Do not say: “Your pause proves low confidence.” Provide the audio/transcript anchor, ASR confidence, threshold and an opt-out. Distinguish intelligibility/correctness from a stylistic preference; accept valid English varieties and Vietnamese regional varieties.
