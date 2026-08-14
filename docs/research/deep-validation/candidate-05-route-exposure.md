# Candidate 05 — Privacy-minimal school-route exposure evidence

**Status: BORDERLINE.**

Vietnam air-quality evidence is strong, but personal exposure is broader than routes. A 64-child HCMC personal-monitoring study reports median 25 μg/m³ and important road/motorbike/indoor exposures ([manuscript](https://research-repository.griffith.edu.au/server/api/core/bitstreams/4410359f-c73c-4683-9772-139b75c685fb/content)). A 1,033-child HCMC study found area PM2.5 differences but no significant area symptom difference—important null evidence ([study](https://jhsmr.org/index.php/jhsmr/article/view/1024)).

Prior art: Google Maps, Waze, Apple Maps, IQAir, AirVisual, Plume Labs, BreezoMeter, Airly, AirQo, AirCasting. Data: OpenStreetMap, Vietnam AQ 2020, CAMS; Hanoi modeling already used OSM/CAMS and flags sparse traffic data ([paper](https://doi.org/10.1016/j.envres.2023.116497)).

Non-AI: transparent dispersion/exposure model plus route scoring. AI requires demonstrably lower held-out exposure-estimation error or better uncertainty estimates. Ground truth: non-personal reference/mobile monitor traces; metrics MAE, calibration, route-ranking agreement; do not make health recommendations. **AI necessity 4/10.** Privacy: no continuous child GPS; optional ephemeral route alternatives only. Kill if no local monitor validation or it implies safety/health advice.
