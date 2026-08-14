# Candidate C — Crisis Claim-to-Source Triage

### The problem

During floods, storms and other emergencies, people receive forwarded screenshots, voice notes and posts whose location, time and status are unclear. Searching manually is slow, while treating a plausible message as verified can cause unsafe decisions or amplify misinformation. The IAEA documents how synthetic crisis imagery can erode trust and disrupt emergency communication ([IAEA](https://www.iaea.org/bulletin/artificial-intelligence-misinformation-and-emergency-communication)).

### Who experiences it

School/community safety coordinators, local volunteers and families who need to interpret a specific forwarded claim while official information is fragmented across updates. The system is not for autonomous emergency dispatch.

### Why current solutions are insufficient

Google Fact Check Explorer searches published fact checks and exposes a Claim Search API, but a new local crisis claim may have no fact check ([official API](https://toolbox.google.com/factcheck/apis)). General chatbots may answer without current authoritative evidence. Official alerts remain authoritative but users must extract the claim and reconcile its time/location with multiple notices.

### The idea

Given a forwarded screenshot, text or voice note, the system extracts explicit atomic claims—such as road, location, water level, closure and time—then searches a fixed allow-list of authoritative sources. It returns an evidence card: **confirmed**, **contradicted**, **outdated**, **location mismatch**, or **not confirmed**, each with quoted source, publication time and coverage boundary. It provides the official action channel and never converts “not found” into “false.”

### Why AI is necessary

The input is messy multimodal language with implicit places, relative times and multiple claims. AI is needed to transcribe, extract and semantically match those claims to differently worded official updates. Rules handle source allow-lists, time validity, geospatial bounds and safe output states.

### What makes it different

Closest products/categories are Google Fact Check Explorer, general fact-checking tools and CrisisFACTS temporal summarization. CrisisFACTS is an open TREC challenge for disaster-response temporal summaries and supplies gold fact lists ([official track](https://crisisfacts.github.io/)). C is narrower than a fact checker and more action-oriented than a summary: it binds one forwarded claim to dated/location-scoped official evidence and exposes absence/uncertainty.

### Example user flow

A coordinator receives a screenshot saying “the bridge near School X is closed tonight.” The system extracts bridge/location/time, finds an official district update referring to a different bridge and yesterday's closure, marks “location/time mismatch—do not treat as confirmed,” links the current official notice, and recommends calling the listed authority if travel is essential.

### 3-minute demo

Show three claims about one frozen historical event: confirmed, stale, and unsupported. A screenshot enters; OCR/AI extracts atomic claims; the evidence timeline highlights the exact authoritative sentence; time/location rules set the status; one ambiguous claim safely ends as “not confirmed.” Display the gold label and source beside each result.

### How we prove it works

Use frozen historical events. CrisisFACTS provides online data and gold-standard fact lists; DisFact reports over 40,000 disaster claim/document pairs with supporting/refuting evidence, but its repository licence must be verified before reuse ([CrisisFACTS](https://crisisfacts.github.io/), [DisFact paper](https://par.nsf.gov/servlets/purl/10578794)). Build held-out claims with published timestamps and locations. Measure claim-extraction F1, evidence retrieval recall@k, evidence precision, status accuracy, temporal/location mismatch accuracy, citation correctness, unsupported-confirmation rate and abstention. Compare with source-site search, Google Fact Check search and a generic grounded LLM.

### Data/setup needed

Initial testing uses historical public English disaster datasets, not live affected people. A Vietnamese pilot needs archived official Vietnamese notices and carefully translated/synthetic messages; exact reuse terms and coverage must be verified. No sensors or special hardware are required. Existing OCR, ASR, embeddings and LLM APIs should suffice; no training from scratch. A live demo must use frozen data to avoid implying operational readiness.

### Biggest risks

* Authoritative sources can be delayed, incomplete, changed or inaccessible.
* “Not confirmed” may be misread as false or safe.
* A missed urgent claim can cause harm; liability and trust burden are high.
* Historical US/English datasets may not transfer to Vietnamese local messages.
* Search plus a source list may provide most value for clean text.
* Strong deployment requires government/community coordination beyond a competition prototype.

### Competition potential

**7/10 (inference).** The need, AI role, evidence trail and demo are compelling; public benchmarks exist. It loses points for high-stakes harm, source latency, Vietnamese ground-truth work and limited deployability without institutional cooperation.

**Recommendation: KEEP FOR VALIDATION.**
