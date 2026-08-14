# Research sources and provenance

Counts are conservative and refer to distinct sources actually reviewed in this pass: **18 web/official evidence pages**, **18 core scholarly/policy records**, **20 official competition projects**, and **at least 24 named products/research systems** (some overlap). Links in the other reports are the source-level citations.

## Tier 1 / primary and official

- [PNAS high-school GenAI field experiment](https://doi.org/10.1073/pnas.2422633122)
- [US Department of Education AI report](https://www.ed.gov/sites/ed/files/documents/ai-report/ai-report.pdf)
- [UNESCO GenAI guidance](https://unesdoc.unesco.org/ark:/48223/pf0000386693)
- [WHO adolescent mental health](https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health), [WHO adolescent health](https://www.who.int/health-topics/adolescent-health), [WHO Europe HBSC](https://www.who.int/europe/news/item/25-09-2024-teens--screens-and-mental-health)
- [WHO urban health](https://www.who.int/news-room/fact-sheets/detail/urban-health), [children/environment](https://www.who.int/health-topics/children-environmental-health), [climate](https://www.who.int/health-topics/climate-change), [assistive technology](https://www.who.int/news-room/fact-sheets/detail/assistive-technology)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Society for Science ISEF 2025 awards archive](https://www.societyforscience.org/press-release/regeneron-isef-2025-full-awards)

## Scholarly identifiers

The DOI-linked literature map records were bibliographically cross-checked against publisher/Crossref-style metadata where available. Official scholarly API endpoints configured in the skill: [OpenAlex](https://docs.openalex.org/), [Semantic Scholar Academic Graph](https://api.semanticscholar.org/api-docs/), [Crossref](https://api.crossref.org/).

## Tooling provenance

- Official Exa MCP: [exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server), hosted endpoint configured read-only with search/fetch only.
- Official Tavily skills: [tavily-ai/skills](https://github.com/tavily-ai/skills); skills and CLI installed, execution authentication deferred rather than storing credentials.
- All introduced tooling and source classes are recorded append-only in `evidence/preflight/` manifests. Automatic prompt logging remains configured through existing Codex hooks.

## Uncertainty rules followed

Product feature claims are volatile and treated as medium confidence. Competition award pages establish award/title/scope, not effect sizes. Local Vietnamese need, deployment feasibility, stakeholder preference, and data access were not established by international web research and require human validation.

## Phase 2 extension

Phase 2 source-level citations and dataset conditions are maintained next to each candidate in `deep-validation/`; this preserves the Phase 1 record rather than overwriting it. Key additions include WHO Viet Nam, ADB Vietnam air-quality research, W3C ACT/Matterhorn, ClaimReview/ClaimsKG, Open Development Mekong AQ data, and four individually documented ISEF ProjectBoard abstracts. Candidate papers are DOI-linked in their respective files; no paper lacking required details is used for a quantitative claim.

## Phase 2 tooling verification

On 2026-08-11, Tavily CLI 0.1.6 browser OAuth completed after a Windows-specific launcher repair (`npx` → `npx.cmd` in the installed CLI). With UTF-8 console output enabled, `tvly search`, `tvly extract`, and `tvly research --model mini` each completed successfully against the public OpenAlex documentation. This proves tooling availability only; it does not strengthen any candidate claim.

## Phase 3.5 gate sources

- [Eedi Kaggle competition data page](https://www.kaggle.com/competitions/eedi-mining-misconceptions-in-mathematics/data) — public task page only; authenticated file inventory, full terms, and legal reuse details are unverified.
- [Eedi competition retrospective](https://www.eedi.com/news/from-wrong-answers-to-real-insights-how-we-used-a-kaggle-challenge-to-map-student-misconceptions) — task framing and publicly described winner approaches; not evidence of a novelty gap.
- [South Coast AQMD AQ-SPEC](https://www.aqmd.gov/aq-spec) and [PM evaluation summary](http://www.aqmd.gov/aq-spec/evaluations/criteria-pollutants/summary-pm) — collocation/evaluation context, not a verified paired downloadable dataset.
- [EPA AQS AirData downloads](https://aqs.epa.gov/aqsweb/airdata/download_files.html) — reference-monitor data source, not low-cost sensor measurements.

These entries document the Phase 3.5 recovery boundary: no raw Eedi data were downloaded and no AQ-SPEC+AQS paired table was created.
