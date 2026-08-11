[CmdletBinding()]
param ()

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SessionsDir = Join-Path $RepoRoot "evidence\prompt-log\sessions"
$IndexCsvPath = Join-Path $RepoRoot "evidence\prompt-log\index.csv"

$files = Get-ChildItem -Path $SessionsDir -Filter "*.jsonl" -ErrorAction SilentlyContinue

$records = @()
if ($files.Count -gt 0) {
    foreach ($file in $files) {
        $lines = Get-Content $file.FullName
        foreach ($line in $lines) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            try {
                $obj = $line | ConvertFrom-Json
                $records += [ordered]@{
                    prompt_id         = $obj.prompt_id
                    timestamp         = $obj.timestamp
                    phase             = $obj.phase
                    source            = $obj.source
                    actor             = $obj.actor
                    agent             = if ($obj.agent) { $obj.agent } else { "" }
                    model             = if ($obj.model) { $obj.model } else { "" }
                    git_commit_after  = if ($obj.git_commit_after) { $obj.git_commit_after } else { "" }
                    raw_source_ref    = if ($obj.raw_source_ref) { $obj.raw_source_ref } else { "" }
                    notes             = if ($obj.notes) { $obj.notes } else { "" }
                }
            } catch {}
        }
    }
}

if ($records.Count -gt 0) {
    $records | Export-Csv -Path $IndexCsvPath -NoTypeInformation -Encoding UTF8
    Write-Host "Exported $($records.Count) record(s) to $IndexCsvPath"
} else {
    "prompt_id,timestamp,phase,source,actor,agent,model,git_commit_after,raw_source_ref,notes" | Set-Content -Path $IndexCsvPath -Encoding UTF8
    Write-Host "Exported empty index header to $IndexCsvPath"
}
