[CmdletBinding()]
param([string]$Path, [string]$RepoRoot, [switch]$SkipDerived)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
$SessionsDir = Join-Path $RepoRoot "evidence\prompt-log\sessions"
if (-not $Path) { $Path = $SessionsDir }
$files = if (Test-Path $Path -PathType Leaf) { @(Get-Item $Path) } elseif (Test-Path $Path -PathType Container) { @(Get-ChildItem $Path -Filter "*.jsonl") } else { @() }
$errors=[Collections.Generic.List[string]]::new();$warnings=[Collections.Generic.List[string]]::new();$seen=@{};$records=@();$refs=@()
function Has-Bom($file) { $bytes=[IO.File]::ReadAllBytes($file.FullName); return $bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191 }
foreach($file in $files | Sort-Object Name) {
    $isHistoricalBomException = $RepoRoot -eq (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path -and $file.Name -eq "session-20260811-080509.jsonl"
    if(Has-Bom $file) { if($isHistoricalBomException){$warnings.Add("Historical BOM preserved append-only: $($file.Name)")}else{$errors.Add("Canonical JSONL must be UTF-8 without BOM: $($file.Name)")} }
    $lineNo=0; foreach($line in [IO.File]::ReadAllLines($file.FullName,[Text.UTF8Encoding]::new($false))){$lineNo++;if([string]::IsNullOrWhiteSpace($line)){continue};try{$obj=$line|ConvertFrom-Json}catch{$errors.Add("$($file.Name):$lineNo malformed JSON");continue}
        foreach($field in @('schema_version','prompt_id','timestamp','phase','source','actor','prompt')){if(-not $obj.PSObject.Properties[$field] -or $null -eq $obj.$field -or ($obj.$field -is [string] -and [string]::IsNullOrWhiteSpace($obj.$field))){$errors.Add("$($file.Name):$lineNo missing $field")}}
        if($obj.prompt_id -notmatch '^P[0-9]{6}$'){$errors.Add("$($file.Name):$lineNo invalid prompt ID")}elseif($seen.ContainsKey($obj.prompt_id)){$errors.Add("$($file.Name):$lineNo duplicate prompt ID $($obj.prompt_id)")}else{$seen[$obj.prompt_id]="$($file.Name):$lineNo"}
        try{[DateTimeOffset]::Parse($obj.timestamp)|Out-Null}catch{$errors.Add("$($file.Name):$lineNo invalid timestamp")}
        foreach($name in @('parent_prompt_id','supersedes_prompt_id','recovery_of')){if($obj.PSObject.Properties[$name] -and $obj.$name){$refs += [pscustomobject]@{id=$obj.$name;where="$($file.Name):$lineNo"}}}
        if($obj.capture_status -eq 'redacted' -and ($obj.redacted -ne $true -or $obj.redaction_count -lt 1 -or @($obj.redaction_types).Count -lt 1)){$errors.Add("$($file.Name):$lineNo invalid redaction metadata")}
        if($obj.capture_status -eq 'captured' -and $obj.PSObject.Properties['redacted'] -and $obj.redacted -eq $true){$errors.Add("$($file.Name):$lineNo captured record cannot be marked redacted")}
        if($obj.record_type -eq 'PROMPT_RECOVERY' -and (-not $obj.recovery_of -or $obj.recovered_exact -ne $true)){$errors.Add("$($file.Name):$lineNo invalid recovery record")}
        $records += $obj
    }
}
foreach($ref in $refs){if(-not $seen.ContainsKey($ref.id)){$errors.Add("$($ref.where) references unknown prompt ID $($ref.id)")}}
$starts=$records|Where-Object {$_.capture_status -eq 'session_start'}|Group-Object source_session_id|Where-Object {$_.Name -and $_.Count -gt 1};foreach($start in $starts){$warnings.Add("Historical duplicate SESSION_START preserved for source_session_id $($start.Name): $($start.Count)")}
$rawDir=Join-Path $RepoRoot 'evidence\private\codex\hook-events'
if(Test-Path $rawDir){
    $rawEvents=@();foreach($rawFile in Get-ChildItem $rawDir -Recurse -File | Where-Object {$_.Extension -in @('.json','.jsonl')}){foreach($rawLine in [IO.File]::ReadAllLines($rawFile.FullName,[Text.UTF8Encoding]::new($false))){if([string]::IsNullOrWhiteSpace($rawLine)){continue};try{$rawEvents += $rawLine|ConvertFrom-Json}catch{$errors.Add("Private hook artifact is not valid JSON: $($rawFile.Name)")}}}
    $rawCounts=@{};foreach($event in $rawEvents|Where-Object {$_.event -eq 'UserPromptSubmit'}){$key="$($event.session_id)|$($event.capture_status)";$rawCounts[$key]=1+([int]$rawCounts[$key])}
    $canonicalCounts=@{};foreach($record in $records|Where-Object {$_.source -eq 'codex' -and $_.capture_status -ne 'session_start' -and $_.raw_source_ref}){$key="$($record.source_session_id)|$($record.capture_status)";$canonicalCounts[$key]=1+([int]$canonicalCounts[$key])}
    foreach($key in @($rawCounts.Keys+$canonicalCounts.Keys|Select-Object -Unique)){if($rawCounts[$key] -ne $canonicalCounts[$key]){$errors.Add("Raw UserPromptSubmit accounting mismatch for $key (raw=$($rawCounts[$key]), canonical=$($canonicalCounts[$key]))")}}
}

if(-not $SkipDerived -and $Path -eq $SessionsDir){
    $index=Join-Path $RepoRoot 'evidence\prompt-log\index.csv';$expectedIndex=Join-Path ([IO.Path]::GetTempPath()) ('thinkai-index-'+[guid]::NewGuid()+'.csv')
    try { & (Join-Path $PSScriptRoot 'export-index.ps1') -RepoRoot $RepoRoot -OutputPath $expectedIndex | Out-Null; if(-not(Test-Path $index)){$errors.Add('Missing derived index.csv')}elseif(([Convert]::ToBase64String([IO.File]::ReadAllBytes($index))) -cne ([Convert]::ToBase64String([IO.File]::ReadAllBytes($expectedIndex)))){$errors.Add('Stale index: bytes differ from deterministic canonical rebuild')} } finally {if(Test-Path $expectedIndex){Remove-Item -LiteralPath $expectedIndex -Force}}
    $manifest=Join-Path $RepoRoot 'evidence\preflight\checksums.sha256'
    if(-not(Test-Path $manifest)){$errors.Add('Missing checksum manifest')}else{
        $manifestPaths=@{};foreach($line in Get-Content $manifest){if($line -match '^([a-f0-9]{64})  (.+)$'){$relative=$matches[2];$manifestPaths[$relative]=$matches[1];$absolute=Join-Path $RepoRoot ($relative.Replace('/','\'));if(-not(Test-Path $absolute)){$errors.Add("Checksum entry missing file: $relative")}elseif((Get-FileHash -LiteralPath $absolute -Algorithm SHA256).Hash.ToLowerInvariant() -ne $matches[1]){$errors.Add("Checksum mismatch: $relative")}}}
        $covered=Get-ChildItem (Join-Path $RepoRoot 'evidence') -Recurse -File | Where-Object {$r=$_.FullName.Substring($RepoRoot.Length+1).Replace('\','/');$r -ne 'evidence/preflight/checksums.sha256' -and -not $r.StartsWith('evidence/private/') -and -not $r.EndsWith('.tmp')} | ForEach-Object {$_.FullName.Substring($RepoRoot.Length+1).Replace('\','/')}
        if((@($covered|Sort-Object) -join ',') -ne (@($manifestPaths.Keys|Sort-Object) -join ',')){$errors.Add('Stale checksum coverage: manifest paths differ from covered evidence files')}
    }
}
if($warnings.Count){$warnings|ForEach-Object{Write-Host "WARN: $_" -ForegroundColor Yellow}}
if($errors.Count){Write-Host "Validation FAILED with $($errors.Count) error(s):" -ForegroundColor Red;$errors|ForEach-Object{Write-Host " - $_" -ForegroundColor Red};exit 1}
Write-Host "Validation PASSED: $($records.Count) record(s), $($files.Count) file(s)." -ForegroundColor Green
