# D — Environmental sensor calibration / uncertainty

## Gate status

- **Data gate: FAIL for the proposed AQ-SPEC + EPA AQS dataset.** EPA AirData provides reference-monitor data, not low-cost sensor inputs. AQ-SPEC confirms field collocation studies, but this recovery did not identify a standard raw export or documented lawful join with low-cost measurement, reference value, matching timestamp/site/device keys, covariates, and reuse terms.
- **Novelty gate: FAIL.** Site/device transfer, uncertainty, calibration, and abstention already have close prior art; without a verified paired data asset there is no benchmark contribution.

## Primary-source data audit

| Requirement | Primary evidence / result |
|---|---|
| AQ-SPEC scope | [AQ-SPEC](https://www.aqmd.gov/aq-spec) evaluates low-cost sensors in field/laboratory conditions; pollutants include PM2.5, PM10, O3, CO, NO, NO2, VOC, black carbon, and ultrafine particles |
| Reference comparison | [AQ-SPEC summary](http://www.aqmd.gov/aq-spec/evaluations/criteria-pollutants/summary-pm) says field sensors are compared with traditional federal reference/equivalent instruments, typically for a specific 30–60-day period |
| EPA source | [EPA AirData](https://aqs.epa.gov/aqsweb/airdata/download_files.html) offers reference-monitor hourly/daily/annual files, site/monitor tables, parameters, and API access |
| Paired raw export | **NOT DEMONSTRATED** |
| Timestamp/site/device identifiers in a documented common join | **NOT DEMONSTRATED** |
| Meteorological covariates / missingness schema | **NOT DEMONSTRATED** for a selected raw AQ-SPEC export |
| Reuse/license | AQ-SPEC materials are informational; dataset-specific reuse terms **NOT DEMONSTRATED** |

Therefore a lawful table of `low-cost measurement + reference measurement + validly collocated same time/site` has **not** been proven for AQ-SPEC+AQS. Reports and collocation statements are not a reproducible benchmark.

## Closest prior art / novelty attack

| Work | Year / venue | Dataset/task | Method / metric | Already solves | Does not solve |
|---|---|---|---|---|---|
| [In-field Calibration Transfer](https://zhouzimu.github.io/paper/ubicomp19-cheng.pdf) | 2019, UbiComp | air-quality network transfer | transfer without target collocation | calibration transfer | does not make AQ-SPEC+AQS a dataset |
| [AQ-SPEC/EPA algorithm guidance](https://www.aqmd.gov/docs/default-source/aq-spec/resources-page/air-quality-sensors-and-data-adjustment-algorithms.pdf) | official guidance | sensor adjustment | warns about drift, humidity, cross-sensitivity, covariates | known calibration risks | an open paired benchmark |
| 2023–26 transfer/UQ records | **UNAVAILABLE / NEEDS RE-VERIFICATION** | N/A | N/A | no direct current-year record is relied on here | a verified AQ-SPEC benchmark or a current method gap |

## One falsifiable research question — only if a new lawful paired dataset is obtained

**Can a site-and-device-held-out calibrated interval plus abstention rule maintain nominal coverage and reduce false-safe predictions compared with linear correction and RF/XGBoost?**

| Element | Definition |
|---|---|
| Hypothesis | interval/abstention system improves coverage and worst-site safety under transfer |
| Ground truth | synchronized reference-grade measurement |
| Baselines | manufacturer/linear correction; RF/XGBoost |
| Primary metric | coverage at target interval width on site/device-held-out test |
| Secondary metrics | MAE/RMSE/R², calibration error, worst-site error, abstention rate |
| Fault metric | only if explicit labels or documented non-leaking synthetic faults exist |
| Split | by site, device, and time; never random rows |
| Ablations | covariates, calibration model, uncertainty method, abstention threshold |

No first experiment estimate is valid for AQ-SPEC+AQS because data assembly is unproven. D may be reopened only after a named raw paired dataset with explicit terms and multiple device/site units is downloaded and audited. Interview dependency is NONE; its dataset gate—not interviews—kills it.
