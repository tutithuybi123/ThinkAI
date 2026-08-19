# Full Product PRD

## Users and job

Initial user: Vietnamese secondary learner using AI for mathematics who needs independent readiness, not faster answers. Teacher/content reviewer is a supporting user. The product must be useful at the moment a learner wonders whether an AI-assisted solve transfers to a different form.

## Functional outcome

For each approved skill family, ThinkAI stores attempts, reviewed help exposures, scored practice/transfer results, connection reveal, receipt and later retrieval events. It derives plain-language summaries from facts without claiming unobserved mastery.

## Multi-skill behavior

Skills are separate, versioned families. A learner may hold evidence across chapters; no global ability score is derived. Next actions use only observed evidence and approved policy. Cross-subject support requires subject-specific reviewed content and scoring before activation.

## Evidence lifecycle and recovery

| Trigger | Facts retained | Learner-visible conclusion | Allowed next action | Forbidden claim/action |
|---|---|---|---|---|
| Repeated failed transfer | all attempts, exposures and scores remain append-only | `Dạng mới này cần thêm một lần luyện.` | review the approved connection, return to practice, later reviewed alternate pair | erase practice success; infer inability or personality |
| Failure after an earlier receipt | earlier receipt and later failure coexist | `Bạn đã từng vận dụng được; ở lần gần nhất kết quả chưa ổn định.` | show both timestamps; recovery practice or scheduled retry | revoke/overwrite the receipt; say the learner never knew it |
| Delayed pass | previous events plus delayed score | `Bạn đã làm lại được sau [interval].` | preserve interval-qualified evidence and offer next reviewed goal | say permanently remembered/mastered |
| Delayed failure | previous events plus delayed score | `Lần quay lại này cần ôn thêm.` | neutral review/retry action | downgrade identity, delete earlier pass, invent decay percentage |
| External learning reported | explicit source/self-report event only | `Bạn đã ghi nhận việc học ngoài ThinkAI; chưa kiểm tra trong ThinkAI.` | invite a new reviewed independent challenge | treat report as independent proof or receipt eligibility |

## Safety and truthfulness

No punishment for hints, no chain-of-thought requirement, minimal personal data, no permanent identity labels, corrected facts remain auditable, and seed/demo provenance remains visible.
