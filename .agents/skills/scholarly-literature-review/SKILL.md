---
name: scholarly-literature-review
description: Evidence-first scholarly literature review for competition problem discovery using official OpenAlex, Semantic Scholar, Crossref, and arXiv sources.
---

# Scholarly Literature Review

Use this skill to investigate a problem space, not to justify a preselected solution. Do not invent papers, authors, findings, identifiers, or citations.

## Sources and roles

1. **OpenAlex** — search works, related works, cited works, open-access and full-text metadata: <https://docs.openalex.org/>.
2. **Semantic Scholar Academic Graph API** — papers, references, citations, recommendations, authors, and venues: <https://api.semanticscholar.org/api-docs/>.
3. **Crossref REST API** — DOI and bibliographic verification: <https://api.crossref.org/>.
4. **arXiv** — original preprints when relevant; label these as preprints, not peer reviewed.

Use official APIs or original publisher/venue pages. Never obtain copyrighted full text illegally; use metadata, abstracts, lawful open-access copies, and publisher pages.

## Method

1. Frame the uncertain claim as a question, then create at least three independent English queries using synonyms, mechanisms, populations, and negative terms.
2. Search both recent work (normally 2023–present) and older seminal work. Do not assume citation count proves quality.
3. Find reviews/meta-analyses and at least one primary study where feasible. Follow backward references and forward citations from the most useful studies.
4. Look explicitly for null, contradictory, replication, implementation-barrier, and equity/safety findings.
5. Verify important bibliographic fields with Crossref or a publisher page. Clearly distinguish peer-reviewed papers, technical reports, and preprints.
6. Record weak, unavailable, or conflicting evidence plainly. Do not cherry-pick evidence supporting a desired idea.

## Required record for each important paper

| Field | Record |
|---|---|
| Title | Exact title |
| Authors | As verified |
| Year / venue | Publication year and venue |
| Stable IDs | DOI, OpenAlex ID, Semantic Scholar ID where available |
| Research question | What was tested or investigated |
| Method / sample | Design, participants/data, setting |
| Key finding | Bounded by the study design |
| Limitations | Bias, external validity, measurement, replication, conflicts |
| Relevance | What it changes about problem discovery |
| URLs | Specific source URLs |

## Reporting rules

- Separate **FACT**, **EVIDENCE**, **INFERENCE**, **HYPOTHESIS**, and **IDEA**.
- Cite sources next to consequential claims, retaining URLs/DOIs.
- Treat a product claim, a preprint, and a randomized trial as different evidence levels.
- Do not equate “AI can generate an answer” with a demonstrated beneficial outcome.
