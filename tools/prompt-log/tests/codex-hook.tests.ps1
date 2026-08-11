[CmdletBinding()]
param()
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("thinkai-prompt-log-" + [guid]::NewGuid())
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "evidence\prompt-log\sessions") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "evidence\private") | Out-Null
$hook = Join-Path $repo "tools\prompt-log\codex-hook.ps1"
$logger = Join-Path $repo "tools\prompt-log\promptlog.ps1"
$validator = Join-Path $repo "tools\prompt-log\validate-log.ps1"
function Assert-True($Value, [string]$Message) { if (-not $Value) { throw "ASSERTION FAILED: $Message" } }
function Invoke-Hook([hashtable]$Payload) { $Payload | ConvertTo-Json -Compress | & powershell -NoProfile -ExecutionPolicy Bypass -File $hook -EventName UserPromptSubmit -RepoRoot $tmp }
try {
    Invoke-Hook @{ prompt = "EXACT_PROMPT_TEST"; session_id = "test-session"; message_id = "m1"; phase = "test" }
    $file = Join-Path $tmp "evidence\prompt-log\sessions\codex-test-session.jsonl"
    $records = @(Get-Content $file | ConvertFrom-Json)
    Assert-True ($records[0].prompt -eq "EXACT_PROMPT_TEST") "exact prompt was not preserved"
    Assert-True ($records[0].source_session_id -eq "test-session") "exposed session ID was not recorded"

    Invoke-Hook @{ prompt = "Authorization: Bearer this-is-a-secret-token"; session_id = "test-session" }
    $records = @(Get-Content $file | ConvertFrom-Json)
    Assert-True ($records[-1].capture_status -eq "blocked_secret" -and $records[-1].prompt -eq "PROMPT_CAPTURE_BLOCKED_SECRET") "secret block was not visible and sanitized"
    Assert-True (-not ((Get-Content (Join-Path $tmp "evidence\private\codex\hook-events\test-session.jsonl")) -match "this-is-a-secret-token")) "secret reached private evidence"

    Invoke-Hook @{ session_id = "test-session" }
    $records = @(Get-Content $file | ConvertFrom-Json)
    Assert-True ($records[-1].capture_status -eq "missing_prompt") "missing prompt was not visible"

    & powershell -NoProfile -ExecutionPolicy Bypass -File $logger correct -Prompt "CORRECTED_PROMPT" -SupersedesPromptId $records[0].prompt_id -SessionId "codex-test-session" -RepoRoot $tmp | Out-Null
    $records = @(Get-Content $file | ConvertFrom-Json)
    Assert-True ($records[-1].supersedes_prompt_id -eq $records[0].prompt_id) "correction did not supersede original"

    $jobs = 1..12 | ForEach-Object { $n = $_; Start-Job -ScriptBlock { param($h,$r,$t,$i) @{ prompt = "CONCURRENT_$i"; session_id = "concurrent"; phase = "test" } | ConvertTo-Json -Compress | & powershell -NoProfile -ExecutionPolicy Bypass -File $h -EventName UserPromptSubmit -RepoRoot $t } -ArgumentList $hook,$repo,$tmp,$n }
    $jobs | Wait-Job | Receive-Job | Out-Null; $jobs | Remove-Job
    $all = Get-ChildItem (Join-Path $tmp "evidence\prompt-log\sessions") -Filter *.jsonl | Get-Content | ConvertFrom-Json
    Assert-True (@($all.prompt_id | Select-Object -Unique).Count -eq @($all).Count) "concurrent writers created duplicate prompt IDs"
    Assert-True (@($all | Where-Object { $_.prompt -like "CONCURRENT_*" }).Count -eq 12) "concurrent writers lost records"

    & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -Path (Join-Path $repo "evidence\prompt-log\sessions")
    & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -Path (Join-Path $tmp "evidence\prompt-log\sessions")
    Assert-True ((git -C $repo check-ignore evidence/private/codex/hook-events/example.jsonl) -match "evidence/private/") "private evidence is not gitignored"
    Write-Host "PASS: exact capture, concurrency, secret blocking, missing prompt, correction, backward compatibility, validation, and private ignore."
} finally { if (Test-Path $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force } }
