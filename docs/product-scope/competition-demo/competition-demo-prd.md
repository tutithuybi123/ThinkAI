# Competition Demo PRD

> **Status: Historical v1.0 PRD.** Current Competition Demo product authority is `competition-demo-v1.1-amendment.md`; preserve this document for v1.0 audit only.

## Product statement

In three minutes, a judge can use a real Vietnamese learner flow to see that a correct assisted answer is not the whole story: ThinkAI records reviewed help exposure, asks the learner to use the same mathematical relation in a reviewed changed representation, verifies it deterministically, and issues an honest evidence-backed `Xác nhận kỹ năng`.

## Canonical story

1. Open **Trang chủ** as the clean synthetic learner and continue one Grade-10 mathematics micro-skill.
2. In **Bài luyện**, submit an initial attempt or `Chưa biết bắt đầu`; request `Xem gợi ý`.
3. Submit the practice answer. The server deterministically scores it and records events.
4. A real server-side AI call then receives bounded learner reasoning plus the deterministic score and returns schema-validated, labelled feedback; the bridge says the practice problem was solved, not that the skill is mastered. The reviewed hint remains the reliable help body; fallback says AI is unavailable rather than pretending it was live.
5. Enter **Thử vận dụng**, an isolated new representation with no practice answer/hint/reveal leakage and no available hint.
6. Submit the transfer answer; server scoring unlocks reviewed **Reveal mối liên hệ**.
7. Receive **Xác nhận kỹ năng** with observed conditions and unknown delayed status. View **Tiến độ**, and optional restricted audit detail.

## Demo P0

* real approved Grade-10 micro-skill bundle: 6–10 teacher-reviewed task pairs if feasible, three reviewed interventions per active practice task, deterministic answer/rubric and authored connection mapping;
* real server-side AI reasoning-feedback call in normal demo path, structured output validation, provider/model/prompt provenance, timeout/malformed/provider-failure fallback, no authoritative effect;
* API-backed Vietnamese UI for Home, practice, bridge, transfer intro/workspace, reveal, receipt, progress and presenter audit/reset;
* existing PostgreSQL/backend contracts reused without policy duplication;
* browser E2E through real HTTP/runtime, signed session, persistence/resume and reset;
* visible seed/history label; no fake retention, teacher review, AI output or learning gain.

## Demo P1

Responsive polish, a compact Học path, richer history, deploy to selected host, and presenter reset UI. They cannot replace P0 proof.

## Explicit exclusions

Multi-skill/multi-subject activation, broad adaptive path, diagnosis, teacher LMS, game economy, personal profiles, external-learning verification, live AI-generated tasks/hints, and learning-gain claims.
