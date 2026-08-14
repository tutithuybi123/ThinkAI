# Data audit

| Dataset | Language/task/size | Labels | Access/license status | Can evaluate | Cannot evaluate |
|---|---|---|---|---|---|
| [SpeechOcean762](https://huggingface.co/datasets/mispeech/speechocean762) | English read-aloud; 5,000 sentences, Mandarin L1 children/adults | Five expert phone/word/sentence accuracy, stress, completeness, fluency, prosody annotations | Dataset card states Apache-2.0; verify release before download | Human-score correlation/MAE for its scope | Vietnamese, live conversation, presentation/debate, broad fairness |
| [L2-ARCTIC](https://psi.engr.tamu.edu/l2-arctic-corpus/) | 24 non-native English speakers reading prompts | Manual phone-error annotation | Public project; reuse terms not verified in this pass | Accent/phone-error experiments | Product efficacy; Vietnamese; broad generalization |
| [Mozilla Common Voice](https://commonvoice.mozilla.org/en/datasets) Vietnamese | Vietnamese read speech/ASR | Transcripts/metadata, release-dependent | Must record chosen release licence/terms before use | Vietnamese ASR WER | Pronunciation, fluency, prosody, argument quality |
| VIVOS | Vietnamese read speech, often cited ~15h/65 speakers | ASR transcript | **Unverified current authoritative licence** | Candidate only | Do not use until verified |
| [Persuasive Essays](https://doi.org/10.1162/COLI_a_00295) | 402 English essays | Claims/premises/relations | Research availability, terms not verified here | Argument component benchmark if terms allow | Spoken/debate quality, Vietnamese |
| ISLE/CSLU accented corpora | English L2 speech | Various | Restricted/paid research distribution | Possible research baseline with permission | MVP-ready open data |

No dataset becomes “lawful/ready” merely because a download exists. Before any use, record exact version, licence, source URL, intended purpose, age/consent implications and redistribution restriction. Do not upload minor voices or retain raw voice without consent and retention controls.
