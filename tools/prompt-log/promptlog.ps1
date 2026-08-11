[CmdletBinding()]
param (
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet("new-session", "append", "append-record", "correct", "close-session")]
    [string]$Action,
    [string]$Prompt,
    [string]$Actor = "user",
    [string]$Source = "antigravity",
    [string]$Phase = "preflight",
    [string]$SessionId,
    [string]$ParentPromptId,
    [string]$SupersedesPromptId,
    [string]$Notes,
    [string]$ResponseSummary,
    [string]$RecordJson,
    [string]$RepoRoot
)

$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
$SessionsDir = Join-Path $RepoRoot "evidence\prompt-log\sessions"

function Get-GitHead {
    try { $sha = git -C $RepoRoot rev-parse HEAD 2>$null; if ($LASTEXITCODE -eq 0 -and $sha) { return $sha.Trim() } } catch {}
    return $null
}
function Get-MutexName {
    $bytes = [Text.Encoding]::UTF8.GetBytes($RepoRoot.ToLowerInvariant())
    $hash = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    return "ThinkAI-PromptLog-" + ([BitConverter]::ToString($hash).Replace("-", "").Substring(0, 24))
}
function Invoke-WithLogLock([scriptblock]$Body) {
    $mutex = [Threading.Mutex]::new($false, (Get-MutexName))
    try {
        if (-not $mutex.WaitOne([TimeSpan]::FromSeconds(30))) { throw "Timed out waiting for the prompt-log writer lock." }
        & $Body
    } finally {
        try { $mutex.ReleaseMutex() } catch {}
        $mutex.Dispose()
    }
}
function Get-NextPromptIdLocked {
    $max = 0
    Get-ChildItem -Path $SessionsDir -Filter "*.jsonl" -ErrorAction SilentlyContinue | ForEach-Object {
        Select-String -Path $_.FullName -Pattern '"prompt_id"\s*:\s*"P([0-9]{6})"' -AllMatches | ForEach-Object {
            foreach ($m in $_.Matches) { $n = [int]$m.Groups[1].Value; if ($n -gt $max) { $max = $n } }
        }
    }
    return ("P{0:D6}" -f ($max + 1))
}
function Write-JsonLineLocked([string]$FilePath, [object]$Record) {
    $line = $Record | ConvertTo-Json -Compress -Depth 8
    $utf8 = [Text.UTF8Encoding]::new($false)
    $stream = [IO.FileStream]::new($FilePath, [IO.FileMode]::Append, [IO.FileAccess]::Write, [IO.FileShare]::Read)
    try { $writer = [IO.StreamWriter]::new($stream, $utf8); try { $writer.WriteLine($line); $writer.Flush() } finally { $writer.Dispose() } } finally { $stream.Dispose() }
}
function New-BaseRecord([string]$PromptText) {
    return [ordered]@{
        schema_version = 1; prompt_id = $null; timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        phase = $Phase; source = $Source; source_session_id = $SessionId; source_message_id = $null
        parent_prompt_id = $ParentPromptId; supersedes_prompt_id = $SupersedesPromptId; runtime_parent_id = $null; runtime_agent_id = $null
        actor = $Actor; agent = $null; model = $null; provider = $null; harness = $null; prompt = $PromptText
        response_summary = $ResponseSummary; tools_used = @(); files_changed = @(); beads_ids = @()
        git_commit_before = (Get-GitHead); git_commit_after = (Get-GitHead); raw_source_ref = $null; raw_source_sha256 = $null
        redacted = $false; capture_status = "captured"; notes = $Notes
    }
}
function Get-SessionFileLocked {
    if ($SessionId) {
        $safe = $SessionId -replace '[^A-Za-z0-9._-]', '_'
        return (Join-Path $SessionsDir "$safe.jsonl")
    }
    $latest = Get-ChildItem -Path $SessionsDir -Filter "*.jsonl" -ErrorAction SilentlyContinue | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if ($latest) { return $latest.FullName }
    return (Join-Path $SessionsDir ("session-" + (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss") + ".jsonl"))
}

if (-not (Test-Path $SessionsDir)) { New-Item -ItemType Directory -Path $SessionsDir -Force | Out-Null }

Invoke-WithLogLock {
    switch ($Action) {
        "append-record" {
            if ([string]::IsNullOrWhiteSpace($RecordJson)) { throw "append-record requires -RecordJson." }
            $record = $RecordJson | ConvertFrom-Json
            if (-not $record.PSObject.Properties["prompt"] -or [string]::IsNullOrWhiteSpace([string]$record.prompt)) { throw "append-record requires a non-empty prompt." }
            $record | Add-Member -NotePropertyName prompt_id -NotePropertyValue (Get-NextPromptIdLocked) -Force
            if (-not $record.PSObject.Properties["timestamp"] -or -not $record.timestamp) { $record | Add-Member -NotePropertyName timestamp -NotePropertyValue ((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")) -Force }
            if (-not $record.PSObject.Properties["schema_version"]) { $record | Add-Member -NotePropertyName schema_version -NotePropertyValue 1 }
            $target = Get-SessionFileLocked
            Write-JsonLineLocked $target $record
            Write-Output $record.prompt_id
        }
        "new-session" {
            if (-not $SessionId) { $SessionId = "session-" + (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss") }
            $record = New-BaseRecord "SESSION_START: $SessionId initialized"; $record.prompt_id = Get-NextPromptIdLocked; $record.actor = "system"
            if (-not $record.notes) { $record.notes = "Session initialized" }; Write-JsonLineLocked (Get-SessionFileLocked) $record; Write-Output $record.prompt_id
        }
        "append" {
            if ([string]::IsNullOrWhiteSpace($Prompt)) { throw "Action 'append' requires a non-empty -Prompt." }
            $record = New-BaseRecord $Prompt; $record.prompt_id = Get-NextPromptIdLocked; Write-JsonLineLocked (Get-SessionFileLocked) $record; Write-Output $record.prompt_id
        }
        "correct" {
            if ([string]::IsNullOrWhiteSpace($Prompt) -or [string]::IsNullOrWhiteSpace($SupersedesPromptId)) { throw "correct requires -Prompt and -SupersedesPromptId." }
            $record = New-BaseRecord $Prompt; $record.prompt_id = Get-NextPromptIdLocked; $record.actor = "system"; $record.capture_status = "correction"
            if (-not $record.notes) { $record.notes = "Append-only correction record" }; Write-JsonLineLocked (Get-SessionFileLocked) $record; Write-Output $record.prompt_id
        }
        "close-session" {
            $record = New-BaseRecord "SESSION_CLOSE: $SessionId closed"; $record.prompt_id = Get-NextPromptIdLocked; $record.actor = "system"; $record.capture_status = "session_close"
            if (-not $record.notes) { $record.notes = "Session closed cleanly" }; Write-JsonLineLocked (Get-SessionFileLocked) $record; Write-Output $record.prompt_id
        }
    }
}
exit 0
