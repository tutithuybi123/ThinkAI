[CmdletBinding()]
param([string]$RepoRoot, [string]$OutputPath)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
$SessionsDir = Join-Path $RepoRoot "evidence\prompt-log\sessions"
$IndexCsvPath = if ($OutputPath) { $OutputPath } else { Join-Path $RepoRoot "evidence\prompt-log\index.csv" }
$records = foreach ($file in Get-ChildItem -Path $SessionsDir -Filter "*.jsonl" | Sort-Object Name) {
    $line = 0
    foreach ($text in [IO.File]::ReadAllLines($file.FullName, [Text.UTF8Encoding]::new($false))) {
        $line++; if ([string]::IsNullOrWhiteSpace($text)) { continue }
        try { $obj = $text | ConvertFrom-Json } catch { throw "Cannot derive index: $($file.Name):$line is not valid JSON." }
        [pscustomobject][ordered]@{ prompt_id=$obj.prompt_id; timestamp=$obj.timestamp; record_type=if($obj.record_type){$obj.record_type}else{"PROMPT"}; capture_status=$obj.capture_status; phase=$obj.phase; source=$obj.source; actor=$obj.actor; agent=if($obj.agent){$obj.agent}else{""}; model=if($obj.model){$obj.model}else{""}; provider=if($obj.provider){$obj.provider}else{""}; harness=if($obj.harness){$obj.harness}else{""}; git_commit_after=if($obj.git_commit_after){$obj.git_commit_after}else{""}; raw_source_ref=if($obj.raw_source_ref){$obj.raw_source_ref}else{""}; notes=if($obj.notes){$obj.notes}else{""} }
    }
}
$csv = @($records | Sort-Object @{Expression={ [int]($_.prompt_id -replace '^P','') }}, timestamp | ConvertTo-Csv -NoTypeInformation)
[IO.File]::WriteAllLines($IndexCsvPath, $csv, [Text.UTF8Encoding]::new($false))
Write-Host "Exported $($records.Count) record(s) to $IndexCsvPath"
