# Candidate 03 — Accessible-material fidelity auditing

**Status: BORDERLINE; generic checker is eliminated.**

W3C says automated evaluation assists rather than replaces human assessment ([ACT rules](https://www.w3.org/WAI/standards-guidelines/act/report/testcases/)). The [Matterhorn Protocol](https://pdfa.org/download-area/publications/Matterhorn-Protocol-1-1.pdf) lists 136 PDF/UA failure conditions, 87 automatable and 47 usually requiring human judgement. Vietnamese school-material prevalence is unknown.

Prior art: Acrobat Checker, PAC 2024, axesPDF, CommonLook, PAVE, Equidox, SensusAccess, Anthology Ally, WAVE, axe-core, Siteimprove, Deque. Datasets: W3C ACT JSON expected results; [PDF Accessibility Benchmark](https://github.com/Anukriti12/PDF-Accessibility-Benchmark), 125 expert-labelled documents; [accompanying paper](https://dl.acm.org/doi/10.1145/3663547.3746380). Scholarly caution: tagged-PDF semantics are technically difficult ([Mittelbach 2025](https://doi.org/10.1145/3704268.3749107)), not evidence an LLM auditor improves access.

Non-AI baseline: parser/PDF-UA/WCAG tools. AI only for Vietnamese reading order, table/formula semantics, or alt-text adequacy. Evaluate blind expert/screen-reader labels on a bounded lawful corpus: recall, false-positive cost, calibration/abstention, reviewer time against PAC/Acrobat. **AI necessity 6/10 conditional.** Kill if no co-designed harm/corpus or no semantic improvement over existing checkers. No child data is required.
