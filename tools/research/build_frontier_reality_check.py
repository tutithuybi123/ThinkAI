"""Build the deterministic, no-model-execution artifacts for ThinkAI-9di.

Reads the Eedi CSV directory only.  The 25-candidate oracle list is based on
TF-IDF cosine similarity over misconception names (word unigrams/bigrams and
character trigrams); it never uses ground truth at model-evaluation time.
"""
from __future__ import annotations

import csv
import math
import random
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "docs" / "eedi-mining-misconceptions-in-mathematics"
OUT = ROOT / "docs" / "research" / "frontier-reality-check"
SEED = 20260811
BUCKETS = [("1 occurrence", 1, 1), ("2 occurrences", 2, 2),
           ("3-4 occurrences", 3, 4), ("5-9 occurrences", 5, 9),
           ("10+ occurrences", 10, float("inf"))]


def read_csv(name):
    with (RAW / name).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def tokens(text):
    text = text.lower()
    words = re.findall(r"[a-z0-9]+", text)
    out = words + ["w:" + "_".join(words[i:i + 2]) for i in range(len(words) - 1)]
    normalized = " " + re.sub(r"\s+", " ", text) + " "
    out += ["c:" + normalized[i:i + 3] for i in range(max(0, len(normalized) - 2))]
    return out


def vectors(mapping):
    docs = {mid: tokens(row["MisconceptionName"]) for mid, row in mapping.items()}
    df = Counter(term for doc in docs.values() for term in set(doc))
    n = len(docs)
    result = {}
    for mid, doc in docs.items():
        tf = Counter(doc)
        vec = {term: (1 + math.log(count)) * math.log((n + 1) / (df[term] + 1)) + 1
               for term, count in tf.items()}
        norm = math.sqrt(sum(value * value for value in vec.values()))
        result[mid] = (vec, norm)
    return result


def cosine(a, b):
    av, an = a; bv, bn = b
    if len(av) > len(bv):
        av, bv = bv, av
    return sum(value * bv.get(term, 0) for term, value in av.items()) / (an * bn)


def bucket(freq):
    for name, lo, hi in BUCKETS:
        if lo <= freq <= hi:
            return name
    raise ValueError(freq)


def pick_cases(cases):
    """Choose 30 per frequency bucket while favouring label/subject/construct breadth."""
    grouped = defaultdict(list)
    for case in cases:
        grouped[case["frequency_bucket"]].append(case)
    chosen = []
    for label, _, _ in BUCKETS:
        pool = grouped[label]
        selected = []
        seen_labels = Counter(); seen_subjects = Counter(); seen_constructs = Counter()
        while pool and len(selected) < 30:
            pool.sort(key=lambda c: (seen_labels[c["ground_truth_id"]],
                                     seen_subjects[c["subject"]],
                                     seen_constructs[c["construct"]],
                                     c["question_id"], c["student_wrong_answer"]))
            item = pool.pop(0)
            selected.append(item)
            seen_labels[item["ground_truth_id"]] += 1
            seen_subjects[item["subject"]] += 1
            seen_constructs[item["construct"]] += 1
        chosen.extend(selected)
    return chosen


def esc(value):
    return value.replace("\r", " ").replace("\n", " ").strip()


def main():
    train = read_csv("train.csv")
    mapping_rows = read_csv("misconception_mapping.csv")
    mapping = {row["MisconceptionId"]: row for row in mapping_rows}
    labels = []
    for row in train:
        for letter in "ABCD":
            mid = row[f"Misconception{letter}Id"].strip()
            if mid:
                labels.append(mid.split(".")[0])
    freq = Counter(labels)
    all_cases = []
    for row in train:
        for letter in "ABCD":
            mid = row[f"Misconception{letter}Id"].strip()
            if not mid:
                continue
            mid = mid.split(".")[0]
            all_cases.append({
                "question_id": row["QuestionId"], "distractor": letter,
                "construct": row["ConstructName"], "subject": row["SubjectName"],
                "question": row["QuestionText"], "correct_answer": row[f"Answer{row['CorrectAnswer']}Text"],
                "student_wrong_answer": row[f"Answer{letter}Text"], "ground_truth_id": mid,
                "ground_truth_name": mapping[mid]["MisconceptionName"], "label_frequency": freq[mid],
                "frequency_bucket": bucket(freq[mid]),
            })
    chosen = pick_cases(all_cases)
    vecs = vectors(mapping)
    rng = random.Random(SEED)
    for n, case in enumerate(chosen, 1):
        true = case["ground_truth_id"]
        ranked = sorted((cosine(vecs[true], vecs[mid]), mid) for mid in mapping if mid != true)
        negatives = [mid for _, mid in ranked[-24:]][::-1]
        candidates = [true] + negatives
        rng.shuffle(candidates)
        case["case_id"] = f"EEDI-{n:03d}"
        for i, mid in enumerate(candidates, 1):
            case[f"candidate_{i:02d}_id"] = mid
            case[f"candidate_{i:02d}_name"] = mapping[mid]["MisconceptionName"]
    OUT.mkdir(parents=True, exist_ok=True)
    fields = ["case_id", "question_id", "distractor", "construct", "subject", "question", "correct_answer",
              "student_wrong_answer", "ground_truth_id", "ground_truth_name", "label_frequency", "frequency_bucket"]
    for i in range(1, 26): fields += [f"candidate_{i:02d}_id", f"candidate_{i:02d}_name"]
    with (OUT / "cases.csv").open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields); writer.writeheader(); writer.writerows(chosen)
    freq_rows = sorted(freq.values())
    distribution = Counter(freq.values())
    used = Counter(c["ground_truth_id"] for c in all_cases)
    by_bucket = Counter(c["frequency_bucket"] for c in chosen)
    audit = f"""# Dataset audit

Generated from the read-only Kaggle Eedi files on {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}.

| Measure | Recomputed value |
|---|---:|
| Questions (`train.csv` rows) | {len(train):,} |
| Labeled incorrect-answer distractors | {len(labels):,} |
| Taxonomy size (`misconception_mapping.csv`) | {len(mapping):,} |
| Unique misconception labels used in train | {len(used):,} |
| Minimum / median / maximum label frequency | {min(freq_rows)} / {sorted(freq_rows)[len(freq_rows)//2]} / {max(freq_rows)} |

Frequency distribution (number of labels):

| Eedi train frequency | Labels |
|---|---:|
""" + "\n".join(f"| {name} | {sum(1 for v in freq.values() if lo <= v <= hi):,} |" for name, lo, hi in BUCKETS) + "\n\n" + """`cases.csv` contains one case for every labeled incorrect answer in the selected evaluation set, with QUESTION, CONSTRUCT, SUBJECT, CORRECT ANSWER, STUDENT WRONG ANSWER, and the preserved ground-truth fields. Ground-truth fields are strictly offline evaluation metadata and must not be included in an evaluated-model prompt.

Important: **Eedi-unseen/rare is not equivalent to LLM-unseen.** Frequency measures label occurrence in this train split, not whether the underlying mathematics was in a model’s pretraining data.
"""
    (OUT / "dataset-audit.md").write_text(audit, encoding="utf-8")
    design = f"""# Evaluation design

## Fixed data and sampling

The evaluation set has **{len(chosen)}** unique `QuestionId` + distractor cases: {', '.join(f'{name}: {by_bucket[name]}' for name, _, _ in BUCKETS)}. It spans {len({c['subject'] for c in chosen})} subjects, {len({c['construct'] for c in chosen})} constructs, and {len({c['ground_truth_id'] for c in chosen})} distinct ground-truth labels. Selection is deterministic (seed `{SEED}`) and prioritizes distinct misconception labels, subjects, and constructs within each Eedi-frequency bucket. It does not hand-pick failures.

## Oracle hard candidates

Each case has exactly 25 candidates: the true label plus the 24 highest-cosine non-true labels under deterministic TF-IDF cosine similarity over the public misconception *name* strings. Features are lower-cased word unigrams, word bigrams, and character trigrams. Candidate order is shuffled with `random.Random({SEED})`. Ground truth is used only while constructing the offline candidate set and is excluded from prompts.

This removes first-stage retrieval difficulty; it tests discrimination among semantically similar taxonomy descriptions. It does not establish full-taxonomy retrieval performance.

## Exact prompts

For each row, substitute the visible values in `cases.csv` but omit `ground_truth_*`, `label_frequency`, `frequency_bucket`, and all `candidate_*_id` fields. The candidate code is `candidate_01` through `candidate_25`.

### F — forced choice

```text
You are evaluating a mathematical-misconception diagnosis. Use only the information below. Select exactly one candidate; do not abstain. Return JSON only, with no markdown:
{{"case_id":"<case_id>","decision":"candidate_01"..."candidate_25","confidence":<integer 0-100>,"justification":"<one short observable justification>"}}

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
{{"case_id":"<case_id>","decision":"candidate_01"..."candidate_25" or "ABSTAIN","confidence":<integer 0-100>,"justification":"<one short observable justification>"}}

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
"""
    (OUT / "evaluation-design.md").write_text(design, encoding="utf-8")
    blocker = "Model execution not performed: the configured Codex CLI failed before inference with `failed to initialize in-process app-server client: Access is denied (os error 5)`. No project-configured, verifiable API model ID or endpoint was available."
    (OUT / "forced-choice-results.jsonl").write_text('{"status":"not_executed","reason":"' + blocker.replace('"', '\\"') + '"}\n', encoding="utf-8")
    (OUT / "abstention-results.jsonl").write_text('{"status":"not_executed","reason":"' + blocker.replace('"', '\\"') + '"}\n', encoding="utf-8")
    (OUT / "metrics.md").write_text("# Metrics\n\nNot computed: no model output exists. The planned measures are forced-choice Top-1; accuracy by frequency bucket; wrong, >=80, and >=90 confidence error counts; and mean confidence by correctness. For abstention: coverage, accepted-set accuracy, abstention rate, incorrect/high-confidence incorrect accepts, and a risk-coverage curve when output exists.\n", encoding="utf-8")
    (OUT / "failure-analysis.md").write_text("# Failure analysis\n\nNot performed: there are no model failures to inspect. On execution, independently review a stratified sample of incorrect accepted/forced predictions using: near-equivalent descriptions; insufficient question evidence; mathematical reasoning error; taxonomy ambiguity; understands error but wrong taxonomy mapping; candidate-set artifact; other/unclear. Preserve Eedi ground truth quantitatively and flag, rather than relabel, ambiguous ground truth.\n", encoding="utf-8")
    (OUT / "README.md").write_text("# Frontier model reality check — ThinkAI-9di\n\nThis is a diagnostic research experiment, not a product implementation. The raw Eedi directory was read only. `cases.csv` is a reproducible 150-case oracle-25 evaluation set; `evaluation-design.md` contains the exact prompts. `tools/research/build_frontier_reality_check.py` regenerates the selection and artifacts with fixed seed `20260811`. Results are intentionally unexecuted rather than fabricated because the configured inference runtime was inaccessible.\n\n## Execution record\n\n- Provider: not verifiable at runtime\n- Model ID: not verifiable at runtime\n- Reasoning setting: not exposed\n- Temperature/sampling: not exposed\n- Attempt timestamp: 2026-08-11T15:43Z\n- Blocker: Codex CLI stopped before inference while initializing its app-server client (`Access is denied`).\n", encoding="utf-8")
    (OUT / "conclusion.md").write_text("# Conclusion\n\n1. Whether a strong current reasoning model struggles is **not established**: no verified model ran.\n2. Repeatable high-confidence wrong diagnoses are **not established**.\n3. Whether abstention solves most of the problem is **not established**.\n4. Any relationship to Eedi label frequency is **not established**; the set is stratified to test it later. Eedi rarity is not LLM novelty.\n5. Reasoning versus retrieval is **not established**. This oracle-25 design isolates reasoning/discrimination; a later full-taxonomy run would test retrieval.\n6. A defensible problem remains unproven pending execution. The project direction should not advance on this incomplete evidence.\n\n**Final recommendation: KEEP A FOR ONE MORE EXPERIMENT**\n\nThe one experiment is the already-prepared, reproducible two-condition run with a verified strong model and a recorded runtime model ID/settings.\n", encoding="utf-8")
    print(f"Wrote {len(chosen)} cases; {len(labels)} labelled distractors; {len(mapping)} taxonomy labels; {len(used)} labels used.")


if __name__ == "__main__":
    main()
