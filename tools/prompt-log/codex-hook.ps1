[CmdletBinding()]
param([Parameter(Mandatory = $true)][ValidateSet("SessionStart", "UserPromptSubmit")][string]$EventName, [string]$RepoRoot)

$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
$raw = [Console]::In.ReadToEnd()
function Get-Property($Object, [string[]]$Names) { foreach ($name in $Names) { if ($null -ne $Object -and $Object.PSObject.Properties[$name]) { $value = $Object.$name; if ($null -ne $value -and "$value" -ne "") { return $value } } }; return $null }
function Test-Secret([string]$Text) {
    if ([string]::IsNullOrWhiteSpace($Text)) { return $false }
    return $Text -match '(?is)(authorization\s*[:=]|bearer\s+[a-z0-9._~-]{12,}|(?:api[_-]?key|access[_-]?token|refresh[_-]?token|oauth[_-]?token|password|secret)\s*[:=]|-----BEGIN (?:[A-Z ]*PRIVATE KEY|CERTIFICATE)-----|\b[A-Za-z_][A-Za-z0-9_]*\s*=\s*[^\r\n]{12,})'
}
function Write-Private([hashtable]$Event) {
    $dir = Join-Path $RepoRoot "evidence\private\codex\hook-events"; New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $eventSession = if ($Event.session_id) { $Event.session_id } else { "unavailable" }
    $name = ($eventSession -replace '[^A-Za-z0-9._-]', '_') + ".jsonl"; $path = Join-Path $dir $name
    $bytes = [Text.Encoding]::UTF8.GetBytes($RepoRoot.ToLowerInvariant()); $hash = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    $mutex = [Threading.Mutex]::new($false, "ThinkAI-PromptLog-" + ([BitConverter]::ToString($hash).Replace("-", "").Substring(0, 24)))
    try {
        if (-not $mutex.WaitOne([TimeSpan]::FromSeconds(30))) { throw "Timed out waiting for the prompt-log writer lock." }
        $privateLine = $Event | ConvertTo-Json -Compress -Depth 6
        $stream = [IO.FileStream]::new($path, [IO.FileMode]::Append, [IO.FileAccess]::Write, [IO.FileShare]::Read)
        try { $writer = [IO.StreamWriter]::new($stream, [Text.UTF8Encoding]::new($false)); try { $writer.WriteLine($privateLine); $writer.Flush() } finally { $writer.Dispose() } } finally { $stream.Dispose() }
    } finally { try { $mutex.ReleaseMutex() } catch {}; $mutex.Dispose() }
    return ("evidence/private/codex/hook-events/" + $name)
}

$payload = $null; $parseError = $null
try { if ([string]::IsNullOrWhiteSpace($raw)) { throw "Hook provided no stdin payload." }; $payload = $raw | ConvertFrom-Json } catch { $parseError = $_.Exception.Message }
$sessionId = Get-Property $payload @("session_id", "sessionId")
$phase = Get-Property $payload @("phase")
$messageId = Get-Property $payload @("message_id", "messageId")
$parentId = Get-Property $payload @("parent_id", "parentId", "parent_session_id", "parentSessionId")
$agentId = Get-Property $payload @("agent_id", "agentId", "subagent_id", "subagentId")
$prompt = Get-Property $payload @("prompt")
$status = "captured"; $safePrompt = $prompt; $notes = $null
if ($EventName -eq "SessionStart") { $safePrompt = "SESSION_START: Codex hook observed"; $status = "session_start" }
elseif ($parseError) { $safePrompt = "PROMPT_CAPTURE_FAILED"; $status = "failed"; $notes = "Hook payload could not be parsed; exact prompt was not captured." }
elseif ([string]::IsNullOrWhiteSpace([string]$prompt)) { $safePrompt = "PROMPT_CAPTURE_MISSING"; $status = "missing_prompt"; $notes = "Codex hook payload did not expose a prompt field; exact prompt was not reconstructed." }
elseif (Test-Secret ([string]$prompt)) { $safePrompt = "PROMPT_CAPTURE_BLOCKED_SECRET"; $status = "blocked_secret"; $notes = "Capture blocked because the submitted prompt matched the secret-safety filter; prompt content was not stored." }

$private = @{ event = $EventName; timestamp = (Get-Date).ToUniversalTime().ToString("o"); session_id = $sessionId; source_message_id = $messageId; capture_status = $status; prompt = if ($status -eq "captured") { $prompt } else { $null }; failure_reason = $notes }
$privateRef = Write-Private $private
$record = [ordered]@{ schema_version = 1; timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"); phase = if ($phase) { $phase } else { "unavailable" }; source = "codex"; source_session_id = $sessionId; source_message_id = $messageId; parent_prompt_id = $null; supersedes_prompt_id = $null; runtime_parent_id = $parentId; runtime_agent_id = $agentId; actor = if ($agentId) { "subagent" } else { "user" }; agent = $null; model = $null; provider = $null; harness = $null; prompt = $safePrompt; response_summary = $null; tools_used = @(); files_changed = @(); beads_ids = @(); git_commit_before = $null; git_commit_after = $null; raw_source_ref = $privateRef; raw_source_sha256 = $null; redacted = ($status -ne "captured"); capture_status = $status; notes = $notes }
$json = $record | ConvertTo-Json -Compress -Depth 8
$logSessionId = if ($sessionId) { "codex-$sessionId" } else { "codex-unavailable" }
& $PSCommandPath.Replace("codex-hook.ps1", "promptlog.ps1") append-record -RecordJson $json -SessionId $logSessionId -RepoRoot $RepoRoot
if ($LASTEXITCODE -ne 0) { throw "Prompt-log append failed." }
if ($status -eq "failed") { Write-Error "Codex prompt logging failure: $notes"; exit 1 }
