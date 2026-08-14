# Evaluation design

## Fixed data and sampling

The evaluation set has **150** unique `QuestionId` + distractor cases: 1 occurrence: 30, 2 occurrences: 30, 3-4 occurrences: 30, 5-9 occurrences: 30, 10+ occurrences: 30. It spans 73 subjects, 101 constructs, and 150 distinct ground-truth labels. Selection is deterministic (seed `20260811`) and prioritizes distinct misconception labels, subjects, and constructs within each Eedi-frequency bucket. It does not hand-pick failures.

## Oracle hard candidates

Each case has exactly 25 candidates: the true label plus the 24 highest-cosine non-true labels under deterministic TF-IDF cosine similarity over the public misconception *name* strings. Features are lower-cased word unigrams, word bigrams, and character trigrams. Candidate order is shuffled with `random.Random(20260811)`. Ground truth is used only while constructing the offline candidate set and is excluded from prompts.

This removes first-stage retrieval difficulty; it tests discrimination among semantically similar taxonomy descriptions. It does not establish full-taxonomy retrieval performance.

## Exact prompts

For each row, substitute the visible values in `cases.csv` but omit `ground_truth_*`, `label_frequency`, `frequency_bucket`, and all `candidate_*_id` fields. The candidate code is `candidate_01` through `candidate_25`.

### F — forced choice

```text
You are evaluating a mathematical-misconception diagnosis. Use only the information below. Select exactly one candidate; do not abstain. Return JSON only, with no markdown:
{"case_id":"<case_id>","decision":"candidate_01"..."candidate_25","confidence":<integer 0-100>,"justification":"<one short observable justification>"}

QUESTION: <question>
CONSTRUCT: <construct>
SUBJECT: <subject>
CORRECT ANSWER: <correct_answer>
STUDENT WRONG ANSWER: <student_wrong_answer>
CANDIDATES:
candidate_01: <candidate_01_name>
...
candidate_25: <candidate_25_name>
```

### A — abstention allowed

```text
You are evaluating a mathematical-misconception diagnosis. Use only the information below. Choose a misconception only when the available evidence is sufficient. If multiple explanations remain genuinely plausible or the evidence is insufficient, return ABSTAIN. Return JSON only, with no markdown:
{"case_id":"<case_id>","decision":"candidate_01"..."candidate_25" or "ABSTAIN","confidence":<integer 0-100>,"justification":"<one short observable justification>"}

QUESTION: <question>
CONSTRUCT: <construct>
SUBJECT: <subject>
CORRECT ANSWER: <correct_answer>
STUDENT WRONG ANSWER: <student_wrong_answer>
CANDIDATES:
candidate_01: <candidate_01_name>
...
candidate_25: <candidate_25_name>
```

No hidden chain-of-thought is requested or retained. Only the JSON response is evidence.
