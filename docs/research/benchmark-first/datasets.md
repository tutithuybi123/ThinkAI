# Benchmark-first dataset gates

| Candidate | Dataset/source | Ground truth | Status |
|---|---|---|---|
| A | Eedi Kaggle competition | distractor/question → misconception mapping; MAP@25 reported | **CONDITIONAL** — files, displayed license, rules, and redistribution need logged-in verification |
| B | DocLayNet, PubLayNet, PubTables-1M | layout/table labels only | **FAIL** for semantic accessibility |
| C | ViHallu lead | reported response-level Vietnamese triples | **CONDITIONAL** — primary download/license/evidence labels unverified |
| D | AQ-SPEC + EPA AQS | AQ-SPEC reports collocation; EPA provides reference data | **FAIL** — no raw lawful paired export or documented join demonstrated |

No candidate is called dataset-ready until its row’s conditional checks are completed.

## A data-access audit

The public [Eedi competition page](https://www.kaggle.com/competitions/eedi-mining-misconceptions-in-mathematics/data) identifies a misconception-ranking task. Eedi's [retrospective](https://www.eedi.com/news/from-wrong-answers-to-real-insights-how-we-used-a-kaggle-challenge-to-map-student-misconceptions) describes one correct option and three distractors per diagnostic question. Neither recovered primary page exposed the authenticated file inventory or schema. Exact filenames, counts, taxonomy nesting, test-label availability, full rules, reuse conditions, attribution, and redistribution are therefore **HUMAN VERIFICATION REQUIRED**. A displayed page-level licence is not treated as the complete controlling terms.

## D pairing audit

[AQ-SPEC](https://www.aqmd.gov/aq-spec) documents low-cost sensor field/laboratory evaluation, and its [PM summary](http://www.aqmd.gov/aq-spec/evaluations/criteria-pollutants/summary-pm) describes comparison to reference/equivalent instruments. [EPA AirData](https://aqs.epa.gov/aqsweb/airdata/download_files.html) provides reference-monitor files and monitor metadata. Recovered evidence does not demonstrate a downloadable AQ-SPEC table with low-cost device ID, reference value, synchronized timestamp, site key, pollutant units, covariates, and dataset-specific reuse terms. Thus a lawful paired `sensor + reference + same/validly collocated time/site` table is **not proven constructible** from AQ-SPEC+AQS.
