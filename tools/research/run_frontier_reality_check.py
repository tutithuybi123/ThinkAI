"""Execute ThinkAI-9di's existing oracle-25 set using isolated native Codex batches.

The script never sends evaluator-side fields to the model. It refuses to run
if its serialized prompt contains a prohibited field name.
"""
from __future__ import annotations

import csv, json, os, shutil, statistics, subprocess, sys, tempfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "research" / "frontier-reality-check"
CASES = OUT / "cases.csv"
MODEL = "gpt-5.6-terra"
PROVIDER = "codex-pooler-ws"
BATCH_SIZE = 5
FORBIDDEN = ("ground_truth", "correct_candidate_index", "expected_answer", '"label"')


def load_cases():
    with CASES.open(encoding="utf-8", newline="") as f:
        cases = list(csv.DictReader(f))
    if len(cases) != 150 or len({c["case_id"] for c in cases}) != 150:
        raise RuntimeError("Integrity failure: cases must contain 150 distinct case IDs.")
    buckets = Counter(c["frequency_bucket"] for c in cases)
    expected = {"1 occurrence": 30, "2 occurrences": 30, "3-4 occurrences": 30,
                "5-9 occurrences": 30, "10+ occurrences": 30}
    if buckets != expected:
        raise RuntimeError(f"Integrity failure: unexpected frequency buckets: {buckets}")
    for case in cases:
        candidates = [case[f"candidate_{i:02d}_id"] for i in range(1, 26)]
        if len(set(candidates)) != 25 or candidates.count(case["ground_truth_id"]) != 1:
            raise RuntimeError(f"Integrity failure in {case['case_id']}: candidates are not 25 unique with one truth.")
    return cases


def visible_case(case):
    return {
        "case_id": case["case_id"], "question": case["question"], "construct": case["construct"],
        "subject": case["subject"], "correct_answer": case["correct_answer"],
        "student_wrong_answer": case["student_wrong_answer"],
        "candidates": [{"id": f"candidate_{i:02d}", "description": case[f"candidate_{i:02d}_name"]}
                       for i in range(1, 26)],
    }


def build_prompt(cases, abstention, reminder=False):
    shape = '"candidate_XX" or "ABSTAIN"' if abstention else '"candidate_XX"'
    policy = ("Select a misconception only when the evidence is sufficient. If multiple explanations remain genuinely plausible or evidence is insufficient, return ABSTAIN."
              if abstention else "Select exactly one candidate for every case. ABSTAIN is not allowed.")
    payload = {"cases": [visible_case(c) for c in cases]}
    serialized = json.dumps(payload, ensure_ascii=False)
    if any(term in serialized.lower() for term in FORBIDDEN):
        raise RuntimeError("FAIL CLOSED: prohibited evaluator-side ground-truth field appeared in outbound prompt payload.")
    reminder_text = " This is a formatting retry: output valid JSON only." if reminder else ""
    return f'''You are evaluating mathematical-misconception diagnoses. Each case is independent. Use only the visible case data. {policy}
Return ONLY a valid JSON array containing exactly one object per supplied case and no markdown.
Each object must have exactly these keys: case_id, decision, confidence, justification.
decision must be {shape}; confidence must be an integer from 0 through 100; justification must be a short observable explanation and must not include hidden reasoning. Do not discuss the experiment, aggregate results, or candidate correctness.{reminder_text}

{serialized}'''


def invoke(prompt):
    with tempfile.TemporaryDirectory(prefix="thinkai-eval-") as tmp:
        command = ["codex", "exec", "--ephemeral", "--json", "--sandbox", "read-only", "--color", "never",
                   "--skip-git-repo-check", "-C", tmp, "-"]
        completed = subprocess.run(command, input=prompt, capture_output=True, text=True, encoding="utf-8",
                                   timeout=300)
    events = []
    for line in completed.stdout.splitlines():
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    messages = [event.get("item", {}).get("text", "") for event in events
                if event.get("type") == "item.completed" and event.get("item", {}).get("type") == "agent_message"]
    return completed.returncode, "\n".join(messages), completed.stderr, completed.stdout


def parse_answer(text, expected_ids, abstention):
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        return None
    if not isinstance(value, list) or len(value) != len(expected_ids): return None
    parsed = {}
    for item in value:
        if not isinstance(item, dict) or set(item) != {"case_id", "decision", "confidence", "justification"}: return None
        cid, decision, confidence, justification = item.values()
        if cid not in expected_ids or cid in parsed or not isinstance(confidence, int) or not 0 <= confidence <= 100 or not isinstance(justification, str): return None
        valid = decision == "ABSTAIN" if abstention else False
        valid = valid or (isinstance(decision, str) and decision in {f"candidate_{i:02d}" for i in range(1, 26)})
        if not valid or (decision == "ABSTAIN" and not abstention): return None
        parsed[cid] = item
    return parsed if set(parsed) == set(expected_ids) else None


def run_condition(cases, abstention):
    label = "abstention" if abstention else "forced-choice"
    results_path = OUT / ("abstention-results.jsonl" if abstention else "forced-choice-results.jsonl")
    raw_path = OUT / f"{label}-native-raw-output.jsonl"
    results, raws = [], []
    for start in range(0, len(cases), BATCH_SIZE):
        batch = cases[start:start + BATCH_SIZE]; expected = [c["case_id"] for c in batch]
        parsed = None
        for attempt in range(2):
            prompt = build_prompt(batch, abstention, reminder=attempt == 1)
            rc, message, stderr, stdout = invoke(prompt)
            raws.append({"condition": label, "batch_index": start // BATCH_SIZE + 1, "attempt": attempt + 1,
                         "timestamp": datetime.now(timezone.utc).isoformat(), "return_code": rc,
                         "raw_model_output": message, "stderr": stderr, "runtime_events": stdout})
            parsed = parse_answer(message, expected, abstention) if rc == 0 else None
            if parsed is not None: break
        for case in batch:
            if parsed is None:
                results.append({"case_id": case["case_id"], "decision": "EXECUTION_ERROR", "confidence": None,
                                "justification": "Batch response failed structural validation after one formatting retry.",
                                "condition": label, "model": MODEL, "provider": PROVIDER})
            else:
                item = parsed[case["case_id"]]
                results.append({**item, "condition": label, "model": MODEL, "provider": PROVIDER})
        print(f"{label}: batch {start // BATCH_SIZE + 1}/{(len(cases) + BATCH_SIZE - 1) // BATCH_SIZE} complete", flush=True)
    with results_path.open("w", encoding="utf-8") as f:
        for row in results: f.write(json.dumps(row, ensure_ascii=False) + "\n")
    with raw_path.open("w", encoding="utf-8") as f:
        for row in raws: f.write(json.dumps(row, ensure_ascii=False) + "\n")
    return results


def metrics(cases, forced, abstained):
    truth = {c["case_id"]: f"candidate_{next(i for i in range(1, 26) if c[f'candidate_{i:02d}_id'] == c['ground_truth_id']):02d}" for c in cases}
    bucket = {c["case_id"]: c["frequency_bucket"] for c in cases}
    def correct(row): return row["decision"] == truth[row["case_id"]]
    def forced_summary(rows):
        executable = [r for r in rows if r["decision"] != "EXECUTION_ERROR"]
        good = [r for r in executable if correct(r)]; bad = [r for r in executable if not correct(r)]
        return {"executed": len(executable), "top1": len(good) / len(executable) if executable else None, "wrong": len(bad),
                "wrong80": sum(r["confidence"] >= 80 for r in bad), "wrong90": sum(r["confidence"] >= 90 for r in bad),
                "mean_correct_confidence": statistics.mean(r["confidence"] for r in good) if good else None,
                "mean_wrong_confidence": statistics.mean(r["confidence"] for r in bad) if bad else None,
                "buckets": {b: sum(correct(r) for r in executable if bucket[r["case_id"]] == b) / sum(bucket[r["case_id"]] == b for r in executable) for b in ["1 occurrence", "2 occurrences", "3-4 occurrences", "5-9 occurrences", "10+ occurrences"]}}
    def abstain_summary(rows):
        executable = [r for r in rows if r["decision"] != "EXECUTION_ERROR"]
        accepted = [r for r in executable if r["decision"] != "ABSTAIN"]; good = [r for r in accepted if correct(r)]; bad = [r for r in accepted if not correct(r)]
        return {"executed": len(executable), "coverage": len(accepted) / len(executable) if executable else None,
                "abstention_rate": sum(r["decision"] == "ABSTAIN" for r in executable) / len(executable) if executable else None,
                "accepted_accuracy": len(good) / len(accepted) if accepted else None, "wrong_accepted": len(bad),
                "high_confidence_wrong_accepted": sum(r["confidence"] >= 80 for r in bad),
                "buckets": {b: (sum(correct(r) for r in accepted if bucket[r["case_id"]] == b) / sum(bucket[r["case_id"]] == b for r in accepted) if sum(bucket[r["case_id"]] == b for r in accepted) else None) for b in ["1 occurrence", "2 occurrences", "3-4 occurrences", "5-9 occurrences", "10+ occurrences"]}}
    return {"forced": forced_summary(forced), "abstention": abstain_summary(abstained)}


if __name__ == "__main__":
    cases = load_cases()
    forced = run_condition(cases, abstention=False)
    abstained = run_condition(cases, abstention=True)
    (OUT / "execution-metrics.json").write_text(json.dumps(metrics(cases, forced, abstained), indent=2), encoding="utf-8")
