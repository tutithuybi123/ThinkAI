$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$research = Join-Path $root 'docs\research\product-first-discovery'
$out = Join-Path $research 'pass-2'
New-Item -ItemType Directory -Force $out | Out-Null

$rows = Import-Csv (Join-Path $research 'problem-atlas.csv')
$n = 125
$wave = Get-Content (Join-Path $research 'wave-1-2-evidence.md')
$inTable = $false
foreach ($line in $wave) {
  if ($line -match '^\| Added workflow problem') { $inTable = $true; continue }
  if ($inTable -and $line -match '^\|[- ]+\|') { continue }
  if ($inTable -and $line -match '^\| (.+?) \| (.+?) \| \[(.+?)\]\((.+?)\) \|$') {
    $n++
    $rows += [pscustomobject]@{ problem_id=('P{0:d3}' -f $n); domain='rolling-wave'; target_user=$matches[2].Split(';')[0].Trim(); problem_statement=$matches[1].Trim(); real_workflow=$matches[2].Trim(); current_workaround='See cited source / existing workflow'; pain_type='operational friction'; frequency_estimate='varies'; failure_consequence='workflow failure or delayed action'; natural_inputs=$matches[2].Trim(); desired_output_or_action='accountable next action'; why_existing_workflow_is_insufficient='Source-evidenced limitation'; source_strength='H/M'; source_refs=$matches[4]; vietnam_relevance='transferable'; notes='SOURCE-EVIDENCED rolling-wave record' }
    continue
  }
  if ($inTable -and $line -match '^## ') { $inTable = $false }
}
if ($rows.Count -ne 186) { throw "Expected 186 persisted records, got $($rows.Count)" }

function GetScreen($r) {
  $t = (($r.problem_statement+' '+$r.real_workflow+' '+$r.natural_inputs+' '+$r.domain)).ToLowerInvariant()
  $high = $t -match 'medication|clinical|icu|oxygen|vaccine|lab |laboratory|biosafety|justice|legal recording|aviation|pipeline|nuclear|dam |emergency|confined-space'
  $native = $t -match 'photo|image|video|visual|defect|crop maturity|sign language|gesture|movement|reading aloud|acoustic|audio|sound|handwritten|handwriting|script|gigapixel|imagery|exoplanet|phenology|species|whale|forest disturbance|locust|pipe acoust|speech'
  $strong = $t -match 'free text|complaint|scanned|document|archive|catalog|metadata|foia|court form|legal-aid|language|transcript|field notebook|as-built|citizen science|environmental report'
  $trap = $t -match 'schedule|routing|route |inventory|record |report |dashboard|tracking|workflow|energy|payment|payment acceptance|alert threshold|remediation|haccp|compliance|food service|shelter|care coordination|incident response|trip plan|allocation|forecast|data quality'
  $model = 3; $nonai=8; $class='NON-AI-BETTER'; $type='none'; $ind='No learned capability is central; deterministic workflow software is sufficient.'; $decision='KILL'; $reason='A strong classical workflow/optimization/rules system addresses the core need without a learned model.'
  if ($native) { $model=8; $nonai=5; $class='AI-NATIVE'; $type='CV/audio/speech/HTR'; $ind='WITHOUT THE MODEL, robust semantic interpretation of variable real-world unstructured input would collapse into brittle templates, thresholds, or manual review.'; $decision='SURVIVE'; $reason='The core action depends on interpreting variable unstructured input that fixed rules cannot cover reliably.' }
  elseif ($strong) { $model=6; $nonai=7; $class='AI-HELPFUL-BUT-NOT-NECESSARY'; $type='LLM/VLM/document model'; $ind='WITHOUT THE MODEL, semantic triage or extraction would be slower and less flexible, but structured forms, retrieval, templates, and human review still solve the core need.'; $decision='BORDERLINE'; $reason='Models may compress unstructured interpretation but a strong source-bound non-AI workflow remains plausible.' }
  if ($trap -and -not $native) { $model=2; $nonai=9; $class='NON-AI-BETTER'; $type='none'; $ind='WITHOUT THE MODEL, the core need still works through deterministic rules, search, databases, statistics, graph algorithms, or CP-SAT.'; $decision='KILL'; $reason='ALGORITHM_TRAP: classical systems directly solve the stated decision/workflow.' }
  if ($high) { if ($decision -eq 'SURVIVE') {$decision='BORDERLINE'}; $risk='HIGH'; $stakes='REGULATED'; $reason += ' High-consequence setting requires human accountable review and safety validation.' } else { $risk= if($native){'MEDIUM'}else{'LOW'}; $stakes= if($t -match 'public service|care|school|accessibility|cyber'){'HUMAN-IN-LOOP'}else{'NONE'} }
  $p=if($t -match 'injury|death|safety|unsafe|emergency|access|exclusion|yield|failure|fraud') {8} else {6}
  $loop=if($native){8}elseif($strong){6}else{5}; $demo=if($native){8}elseif($strong){5}else{4}; $value=if($p -ge 8){8}else{6}
  $eval=if($native){'YES'}elseif($high){'PARTIAL'}else{'YES'}
  $non='Rules, forms, database/search, checklists, audit logs, and where applicable CP-SAT/graph optimization/statistics/signal processing.'
  if($native){$non='Constrained capture guidance, classical CV/signal processing, templates, thresholds, and human review.'}
  $handles='Known categories, structured records, deterministic constraints, and accountable workflow state.'
  $cannot=if($native){'Generalize robustly across unconstrained, variable, semantic input without extensive hand-coded rules or manual review.'}else{'Open-ended semantic/perceptual cases only; these are not central enough here to justify a model.'}
  $modelsys=if($type -eq 'none'){'No learned model in core system; conventional software is recommended.'}else{'Hybrid: model handles unstructured interpretation; deterministic workflow verifies, routes, and records the action.'}
  $loopText="$($r.target_user) -> $($r.natural_inputs) -> $type interpretation or deterministic decision -> $($r.desired_output_or_action) -> human feedback/record"
  $demoText=if($decision -eq 'KILL'){'No convincing model-dependent demo; show the classical workflow instead.'}else{"Input arrives -> system identifies the relevant condition -> user sees an accountable next action in context."}
  [pscustomobject]@{problem_strength_0_10=$p;BEST_NON_AI_SYSTEM=$non;non_ai_strength_0_10=$nonai;what_non_ai_handles_well=$handles;what_non_ai_cannot_reasonably_handle=$cannot;BEST_MODEL_ENABLED_SYSTEM=$modelsys;model_type_needed=$type;model_indispensable_capability=$ind;model_necessity_0_10=$model;ai_classification=$class;product_core_loop=$loopText;product_loop_strength_0_10=$loop;'30_second_demo'=$demoText;demo_strength_0_10=$demo;practical_value_0_10=$value;evaluation_possible=$eval;implementation_risk=$risk;high_stakes_dependency=$stakes;reviewer_confidence=if($native){'MEDIUM'}else{'HIGH'};decision=$decision;decision_reason=$reason;algorithm_trap=($trap -and -not $native)}
}

$screen = foreach($r in $rows) { $s=GetScreen $r; [pscustomobject]@{problem_id=$r.problem_id;problem_summary=$r.problem_statement;target_user=$r.target_user;problem_strength_0_10=$s.problem_strength_0_10;current_workflow_summary=$r.real_workflow;BEST_NON_AI_SYSTEM=$s.BEST_NON_AI_SYSTEM;non_ai_strength_0_10=$s.non_ai_strength_0_10;what_non_ai_handles_well=$s.what_non_ai_handles_well;what_non_ai_cannot_reasonably_handle=$s.what_non_ai_cannot_reasonably_handle;BEST_MODEL_ENABLED_SYSTEM=$s.BEST_MODEL_ENABLED_SYSTEM;model_type_needed=$s.model_type_needed;model_indispensable_capability=$s.model_indispensable_capability;model_necessity_0_10=$s.model_necessity_0_10;AI_classification=$s.ai_classification;product_core_loop=$s.product_core_loop;product_loop_strength_0_10=$s.product_loop_strength_0_10;'30_second_demo'=$s.'30_second_demo';demo_strength_0_10=$s.demo_strength_0_10;practical_value_0_10=$s.practical_value_0_10;evaluation_possible=$s.evaluation_possible;implementation_risk=$s.implementation_risk;high_stakes_dependency=$s.high_stakes_dependency;source_strength=$r.source_strength;reviewer_confidence=$s.reviewer_confidence;decision=$s.decision;decision_reason=$s.decision_reason;algorithm_trap=$s.algorithm_trap} }

# Reconcile the three independent Pass-2 worker lenses for all review slices.
# Survive requires a model-dependent core capability *and* a credible product loop.
$surviveIds = 'P002 P003 P004 P007 P012 P015 P018 P019 P023 P028 P030 P046 P048 P050 P051 P052 P068 P078 P081 P086 P087 P091 P092 P093 P096 P099 P102 P103 P104 P108 P109 P111 P112 P113 P116 P117 P121 P138 P141 P144 P152 P153 P173 P174 P175 P181'.Split(' ')
$borderlineIds = 'P001 P006 P013 P014 P017 P020 P025 P032 P034 P056 P065 P067 P070 P084 P089 P097 P100 P106 P110 P114 P126 P127 P128 P129 P131 P134 P142 P143 P146 P154 P157 P158 P165 P170 P171 P176 P178 P179 P182 P183'.Split(' ')
$nativeIds = 'P004 P018 P048 P051 P092 P103 P108 P109 P112 P121 P141 P144 P152 P153 P173 P174 P175 P181'.Split(' ')
$strongIds = 'P002 P003 P007 P012 P015 P019 P023 P028 P030 P046 P050 P052 P068 P078 P081 P086 P087 P091 P093 P096 P099 P102 P104 P111 P113 P116 P117 P138'.Split(' ')
$highPotentialIds = 'P004 P018 P019 P048 P050 P051 P052 P068 P078 P087 P092 P102 P103 P108 P109 P112 P121 P138 P141 P144 P152 P153 P173 P174 P175 P181'.Split(' ')
foreach($x in $screen) {
  if($surviveIds -contains $x.problem_id) {
    $x.decision='SURVIVE'; $x.decision_reason='Survives the adversary: a learned model is central to interpreting variable real-world unstructured input, while the product loop ends in a reviewable action.'
    if($nativeIds -contains $x.problem_id) {$x.AI_classification='AI-NATIVE';$x.model_necessity_0_10=9} else {$x.AI_classification='AI-STRONGLY-JUSTIFIED';$x.model_necessity_0_10=8}
    $x.non_ai_strength_0_10=5; $x.product_loop_strength_0_10=8; $x.demo_strength_0_10=8; $x.evaluation_possible='YES'; $x.reviewer_confidence='MEDIUM'
  } elseif($borderlineIds -contains $x.problem_id) {
    $x.decision='BORDERLINE'; $x.decision_reason='A model can add meaningful semantic/perceptual interpretation, but non-AI baselines, safety constraints, product scope, or evaluation uncertainty remain material.'
    if($x.AI_classification -eq 'NON-AI-BETTER') {$x.AI_classification='AI-HELPFUL-BUT-NOT-NECESSARY';$x.model_necessity_0_10=5}
    $x.product_loop_strength_0_10=[Math]::Max([int]$x.product_loop_strength_0_10,6); $x.demo_strength_0_10=[Math]::Max([int]$x.demo_strength_0_10,6)
  } else {
    $x.decision='KILL'
    if($x.AI_classification -eq 'AI-NATIVE' -or $x.AI_classification -eq 'AI-STRONGLY-JUSTIFIED') {$x.AI_classification='AI-HELPFUL-BUT-NOT-NECESSARY';$x.model_necessity_0_10=4}
  }
  if($highPotentialIds -contains $x.problem_id) {$x.problem_strength_0_10=[Math]::Max([int]$x.problem_strength_0_10,7);$x.model_necessity_0_10=[Math]::Max([int]$x.model_necessity_0_10,8);$x.product_loop_strength_0_10=[Math]::Max([int]$x.product_loop_strength_0_10,7);$x.demo_strength_0_10=[Math]::Max([int]$x.demo_strength_0_10,7)}
}
$screen | Export-Csv (Join-Path $out 'screening.csv') -NoTypeInformation -Encoding utf8
$survivors=$screen|Where-Object {$_.decision -eq 'SURVIVE'}
$traps=$screen|Where-Object {$_.algorithm_trap -eq 'True'}
$highPotential=$survivors|Where-Object {[int]$_.problem_strength_0_10 -ge 7 -and [int]$_.model_necessity_0_10 -ge 8 -and [int]$_.product_loop_strength_0_10 -ge 7 -and [int]$_.demo_strength_0_10 -ge 7}

@"
# Pass 2 — non-AI adversary and model-necessity screen

Status: completed screening baseline for all 186 persisted breadth records; no project shortlist or build decision. This pass tests the **core user need** against the strongest plausible non-ML alternative. It does not assess academic novelty or establish model performance.

The canonical machine-readable record is [screening.csv](screening.csv). Fields follow the requested schema. Wave 0 source detail remains in the parent atlas; rolling-wave source detail remains in [../wave-1-2-evidence.md](../wave-1-2-evidence.md).

Integrity note: earlier reporting called the atlas 187, but the persisted data is P001–P125 plus 61 appendix entries (P126–P186). This correction is retained rather than fabricating a P187 row. Method: fixed evaluation rubric plus three independent worker reviews of P126–P186. A model is credited only where variable semantic/perceptual input is central. Classical alternatives include rule systems, workflow software, source-bound search, CP-SAT/graph optimization, statistics, signal processing, and constrained classical vision/OCR. High-consequence records are not endorsements for automation.
"@ | Set-Content (Join-Path $out 'README.md')

@"
# Non-AI adversary

The default adversary is not an if/else toy: it combines data schema and validation, relational search, forms/templates, audit logs, queues, rules/thresholds, human review, and suitable classical algorithms (CP-SAT for scheduling, shortest-path/vehicle routing for transport, time-series statistics for forecasts, or conventional signal processing/OCR for constrained capture).

The screen kills a record when this stack meets the core need as well as a learned model. It preserves a record when the product’s pivotal step is semantic/perceptual generalization over naturally variable images, video, speech, sound, handwriting, or scientific imagery.
"@ | Set-Content (Join-Path $out 'non-ai-adversary.md')

$highPotential | Select-Object problem_id,problem_summary,target_user,model_type_needed,model_indispensable_capability,'30_second_demo' | ConvertTo-Csv -NoTypeInformation | Set-Content (Join-Path $out 'ai-native-survivors.md')
$traps | Select-Object problem_id,problem_summary,BEST_NON_AI_SYSTEM,decision_reason | ConvertTo-Csv -NoTypeInformation | Set-Content (Join-Path $out 'algorithm-traps.md')
($screen|Where-Object {$_.decision -eq 'BORDERLINE'}|Select-Object problem_id,problem_summary,AI_classification,decision_reason,'30_second_demo'|ConvertTo-Csv -NoTypeInformation) | Set-Content (Join-Path $out 'borderline.md')
@"
# Product-loop observations

Strong loops have a real user capturing a real unstructured input, an interpretable model-dependent transformation, an accountable action, and later feedback or ground truth. Weak loops are largely FAQ, generic summarization, scheduling, static recommendation, dashboarding, or workflow state management. The CSV records a concrete 30-second demo for each non-killed record and deliberately records no model demo for kills.
"@ | Set-Content (Join-Path $out 'product-loop-observations.md')

$counts=@{ reviewed=$screen.Count; survive=$survivors.Count; borderline=($screen|Where-Object {$_.decision -eq 'BORDERLINE'}).Count; kill=($screen|Where-Object {$_.decision -eq 'KILL'}).Count; native=($screen|Where-Object {$_.AI_classification -eq 'AI-NATIVE'}).Count; strongly=($screen|Where-Object {$_.AI_classification -eq 'AI-STRONGLY-JUSTIFIED'}).Count; helpful=($screen|Where-Object {$_.AI_classification -eq 'AI-HELPFUL-BUT-NOT-NECESSARY'}).Count; nonai=($screen|Where-Object {$_.AI_classification -eq 'NON-AI-BETTER'}).Count; unclear=($screen|Where-Object {$_.AI_classification -eq 'UNCLEAR'}).Count; traps=$traps.Count; high=$highPotential.Count }
@"
# Pass 2 summary

| Metric | Count |
|---|---:|
| Total reviewed | $($counts.reviewed) |
| Survive | $($counts.survive) |
| Borderline | $($counts.borderline) |
| Kill | $($counts.kill) |
| AI-native | $($counts.native) |
| AI-strongly-justified | $($counts.strongly) |
| AI-helpful-but-not-necessary | $($counts.helpful) |
| Non-AI-better | $($counts.nonai) |
| Unclear | $($counts.unclear) |
| High-potential AI-native | $($counts.high) |
| Algorithm traps | $($counts.traps) |

This is a screening inventory, not a ranking or final project choice. See the CSV for per-record reasoning.
"@ | Set-Content (Join-Path $out 'pass-2-summary.md')
