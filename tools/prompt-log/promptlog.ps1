[CmdletBinding()]
param (
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet("new-session", "append", "close-session")]
    [string]$Action,

    [Parameter(Mandatory = $false)]
    [string]$Prompt,

    [Parameter(Mandatory = $false)]
    [string]$Actor = "user",

    [Parameter(Mandatory = $false)]
    [string]$Source = "antigravity",

    [Parameter(Mandatory = $false)]
    [string]$Phase = "preflight",

    [Parameter(Mandatory = $false)]
    [string]$SessionId,

    [Parameter(Mandatory = $false)]
    [string]$ParentPromptId,

    [Parameter(Mandatory = $false)]
    [string]$Notes,

    [Parameter(Mandatory = $false)]
    [string]$ResponseSummary
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SessionsDir = Join-Path $RepoRoot "evidence\prompt-log\sessions"

if (-not (Test-Path $SessionsDir)) {
    New-Item -ItemType Directory -Path $SessionsDir -Force | Out-Null
}

function Get-GitHead {
    try {
        $gitSha = git -C $RepoRoot rev-parse HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $gitSha) {
            return $gitSha.Trim()
        }
    } catch {}
    return $null
}

function Get-NextPromptId {
    $existingFiles = Get-ChildItem -Path $SessionsDir -Filter "*.jsonl" -ErrorAction SilentlyContinue
    $maxNum = 0
    foreach ($file in $existingFiles) {
        $lines = Get-Content $file.FullName
        foreach ($line in $lines) {
            if ($line -match '"prompt_id"\s*:\s*"P([0-9]{6})"') {
                $num = [int]$matches[1]
                if ($num -gt $maxNum) { $maxNum = $num }
            }
        }
    }
    $next = $maxNum + 1
    return ("P{0:D6}" -f $next)
}

function Get-ActiveSessionFile {
    if ($SessionId) {
        $target = Join-Path $SessionsDir "$SessionId.jsonl"
        if (Test-Path $target) { return $target }
    }
    $files = Get-ChildItem -Path $SessionsDir -Filter "*.jsonl" | Sort-Object CreationTime -Descending
    if ($files.Count -gt 0) {
        return $files[0].FullName
    }
    return $null
}

$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$GitCommit = Get-GitHead

switch ($Action) {
    "new-session" {
        $dateStr = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
        $newSessionId = "session-$dateStr"
        $filePath = Join-Path $SessionsDir "$newSessionId.jsonl"
        $promptId = Get-NextPromptId
        
        $record = [ordered]@{
            schema_version     = 1
            prompt_id          = $promptId
            timestamp          = $Timestamp
            phase              = $Phase
            source             = $Source
            source_session_id  = $newSessionId
            source_message_id  = $null
            parent_prompt_id   = $null
            actor              = "system"
            agent              = $null
            model              = $null
            provider           = $null
            harness            = $null
            prompt             = "SESSION_START: $newSessionId initialized"
            response_summary   = $null
            tools_used         = @()
            files_changed      = @()
            beads_ids          = @()
            git_commit_before  = $GitCommit
            git_commit_after   = $GitCommit
            raw_source_ref     = $null
            raw_source_sha256  = $null
            redacted           = $false
            notes              = if ($Notes) { $Notes } else { "Session initialized" }
        }

        $jsonStr = $record | ConvertTo-Json -Compress
        Add-Content -Path $filePath -Value $jsonStr -Encoding UTF8
        Write-Host "New session created: $filePath (Prompt ID: $promptId)"
    }

    "append" {
        if ([string]::IsNullOrWhiteSpace($Prompt)) {
            Write-Error "Action 'append' requires a non-empty -Prompt argument."
            exit 1
        }
        $sessionFile = Get-ActiveSessionFile
        if (-not $sessionFile) {
            Write-Error "No active session file found. Run 'new-session' first."
            exit 1
        }
        $promptId = Get-NextPromptId

        $record = [ordered]@{
            schema_version     = 1
            prompt_id          = $promptId
            timestamp          = $Timestamp
            phase              = $Phase
            source             = $Source
            source_session_id  = (Get-Item $sessionFile).BaseName
            source_message_id  = $null
            parent_prompt_id   = if ($ParentPromptId) { $ParentPromptId } else { $null }
            actor              = $Actor
            agent              = $null
            model              = $null
            provider           = $null
            harness            = $null
            prompt             = $Prompt
            response_summary   = if ($ResponseSummary) { $ResponseSummary } else { $null }
            tools_used         = @()
            files_changed      = @()
            beads_ids          = @()
            git_commit_before  = $GitCommit
            git_commit_after   = $GitCommit
            raw_source_ref     = $null
            raw_source_sha256  = $null
            redacted           = $false
            notes              = if ($Notes) { $Notes } else { $null }
        }

        $jsonStr = $record | ConvertTo-Json -Compress
        Add-Content -Path $sessionFile -Value $jsonStr -Encoding UTF8
        Write-Host "Appended record $promptId to $sessionFile"
    }

    "close-session" {
        $sessionFile = Get-ActiveSessionFile
        if (-not $sessionFile) {
            Write-Error "No active session file found to close."
            exit 1
        }
        $promptId = Get-NextPromptId

        $record = [ordered]@{
            schema_version     = 1
            prompt_id          = $promptId
            timestamp          = $Timestamp
            phase              = $Phase
            source             = $Source
            source_session_id  = (Get-Item $sessionFile).BaseName
            source_message_id  = $null
            parent_prompt_id   = $null
            actor              = "system"
            agent              = $null
            model              = $null
            provider           = $null
            harness            = $null
            prompt             = "SESSION_CLOSE: $(Get-Item $sessionFile).BaseName closed"
            response_summary   = $null
            tools_used         = @()
            files_changed      = @()
            beads_ids          = @()
            git_commit_before  = $GitCommit
            git_commit_after   = $GitCommit
            raw_source_ref     = $null
            raw_source_sha256  = $null
            redacted           = $false
            notes              = if ($Notes) { $Notes } else { "Session closed cleanly" }
        }

        $jsonStr = $record | ConvertTo-Json -Compress
        Add-Content -Path $sessionFile -Value $jsonStr -Encoding UTF8
        Write-Host "Closed session with record $promptId in $sessionFile"
    }
}
