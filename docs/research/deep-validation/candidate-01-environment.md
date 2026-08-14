# Candidate 01 — Environmental observation data QA

**Status: BORDERLINE.** It can survive only as a narrow calibration/uncertainty study after real ground truth is secured.

## Problem and root cause

**Global evidence:** low-cost sensors drift and transfer poorly across deployments ([Malings et al., 2019](https://doi.org/10.5194/amt-12-903-2019); [Kang et al., 2022](https://doi.org/10.1016/j.scitotenv.2021.151769)). **Vietnam evidence:** WHO reports annual PM2.5 21 μg/m³ versus its 5 μg/m³ guideline ([WHO profile](https://cdn.who.int/media/docs/default-source/country-profiles/environmental-health/environmental-health-vnm-2024.pdf)); an ADB study links pre-exam PM2.5 with lower Vietnamese reading/math outcomes ([ADB](https://www.adb.org/publications/the-impacts-of-climate-change-and-air-pollution-on-children-s-education-outcomes-evidence-from-viet-nam)). **Local hypothesis:** a particular school/community sensor network has material QA defects; this is unproven.

Symptom: apparently precise readings. Root causes: calibration, humidity/temperature sensitivity, drift, placement, missingness, sampling bias. Existing workarounds: reference-grade stations, collocation, rule thresholds, manual review. Software is appropriate only for uncertainty/QA, not health advice.

## Prior-art attack and data

Prior art: PurpleAir, AirNow, OpenAQ, Sensor.Community, AirQo, Clarity, IQAir, AirCasting, Safecast, GLOBE Observer, EPA Air Sensor Toolbox. Difference must be an independently evaluated Vietnamese/local QA-or-uncertainty task, not a dashboard.

Dataset: [Vietnam Air Quality Data 2020](https://data.vietnam.opendevelopmentmekong.net/dataset/timelines-dataset-on-air-quality-in-vietnam), Open Development Mekong, CC-BY-SA, pollutant/station/time fields; OpenAQ/AirNow/CAMS only subject to their terms. A usable labeled set requires reference monitor collocation or independently adjudicated sensor-fault episodes. Child/household location data is unnecessary.

## AI necessity, evaluation, MVP reality

Non-AI baseline: calibration curve, reference comparison, robust statistics, threshold/rule anomaly detector. AI: time-series/fusion model that predicts uncertainty or fault category. **AI necessity 7/10 only if it improves held-out, cross-site fault/uncertainty performance.**

Experiment: input sensor/environment/time series; ground truth reference monitor or fault label; compare rules/statistical detector; test held-out time/site; metrics MAE, fault F1, calibration error, abstention; success requires meaningful improvement plus understandable failure flags. Biggest failure: no ground truth. MVP: data work medium; AI medium; frontend low; field validation high; no hardware required if open collocation data is found.

## What it does not prove

Better QA does not prove health improvement, route safety, or local need. Stakeholders: facilities staff/science teachers/community monitors. Ask when a reading was distrusted, what decision changed, how it was checked, and consequences of a false alarm/missed fault.
