[CmdletBinding()]
param([Parameter(Mandatory = $true)][ValidateSet("SessionStart", "UserPromptSubmit")][string]$EventName, [string]$RepoRoot)

$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
function Read-HookInput {
    $memory = [IO.MemoryStream]::new(); try { [Console]::OpenStandardInput().CopyTo($memory); $bytes=$memory.ToArray() } finally { $memory.Dispose() }
    if($bytes.Length -ge 2 -and $bytes[0] -eq 255 -and $bytes[1] -eq 254){return [Text.Encoding]::Unicode.GetString($bytes,2,$bytes.Length-2)}
    if($bytes.Length -ge 2 -and $bytes[0] -eq 254 -and $bytes[1] -eq 255){return [Text.Encoding]::BigEndianUnicode.GetString($bytes,2,$bytes.Length-2)}
    if($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191){return [Text.UTF8Encoding]::new($false).GetString($bytes,3,$bytes.Length-3)}
    if($bytes.Length -gt 1 -and ($bytes | Where-Object {$_ -eq 0}).Count -gt ($bytes.Length / 4)){return [Text.Encoding]::Unicode.GetString($bytes)}
    return [Text.UTF8Encoding]::new($false).GetString($bytes)
}
$raw = Read-HookInput

function Get-Property($Object, [string[]]$Names) {
    foreach ($name in $Names) {
        if ($null -ne $Object -and $Object.PSObject.Properties[$name]) {
            $value = $Object.$name
            if ($null -ne $value -and "$value" -ne "") { return $value }
        }
    }
    return $null
}
function Redact-Secrets([string]$Text) {
    $types = [System.Collections.Generic.List[string]]::new()
    $valuePattern = '(?<value>[A-Za-z0-9._~+/-]{12,})'
    $result = [regex]::Replace($Text, "(?i)(Authorization\s*:\s*Bearer\s+)$valuePattern", {
        param($m) $types.Add("authorization_bearer"); return $m.Groups[1].Value + "[REDACTED_SECRET]"
    })
    $result = [regex]::Replace($result, '(?i)\b(sk-(?:test-|proj-)?)[A-Za-z0-9_-]{12,}\b', {
        param($m) $types.Add("provider_key"); return $m.Groups[1].Value + "[REDACTED_SECRET]"
    })
    $result = [regex]::Replace($result, '(?is)-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----.*?-----END (?:[A-Z ]*PRIVATE KEY)-----', {
        param($m) $types.Add("private_key"); return "[REDACTED_SECRET]"
    })
    $result = [regex]::Replace($result, "(?i)(?:\b(password|api[_-]?key|access[_-]?token|refresh[_-]?token|oauth[_-]?token|secret)\s*[:=]\s*)$valuePattern", {
        param($m) $types.Add("explicit_secret_assignment"); return $m.Groups[1].Value + "[REDACTED_SECRET]"
    })
    return [pscustomobject]@{ Text = $result; Types = @($types | Select-Object -Unique) }
}
function Write-Private([hashtable]$Event) {
    $session = if ($Event.session_id) { $Event.session_id } else { "unavailable" }
    $safeSession = $session -replace '[^A-Za-z0-9._-]', '_'
    $dir = Join-Path $RepoRoot "evidence\private\codex\hook-events\$safeSession"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $name = ((Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssfffffffZ") + "-" + [guid]::NewGuid().ToString("N") + ".json")
    $path = Join-Path $dir $name
    $json = $Event | ConvertTo-Json -Compress -Depth 6
    [IO.File]::WriteAllText($path, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
    return [pscustomobject]@{ Ref = ("evidence/private/codex/hook-events/$safeSession/$name"); Sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() }
}

$payload = $null; $parseError = $null
try { if ([string]::IsNullOrWhiteSpace($raw)) { throw "Hook provided no stdin payload." }; $payload = $raw | ConvertFrom-Json } catch { $parseError = $_.Exception.Message }
$sessionId = Get-Property $payload @("session_id", "sessionId")
$phase = Get-Property $payload @("phase")
$messageId = Get-Property $payload @("message_id", "messageId")
$parentId = Get-Property $payload @("parent_id", "parentId", "parent_session_id", "parentSessionId")
$agentId = Get-Property $payload @("agent_id", "agentId", "subagent_id", "subagentId")
$prompt = Get-Property $payload @("prompt")
$model = Get-Property $payload @("model", "model_name")
$provider = Get-Property $payload @("provider")
$harness = Get-Property $payload @("harness", "client", "client_name")
$reasoning = Get-Property $payload @("reasoning", "reasoning_effort", "reasoningEffort")
$status = "captured"; $safePrompt = $prompt; $notes = $null; $redactionTypes = @()
if ($EventName -eq "SessionStart") { $safePrompt = "SESSION_START: Codex hook observed"; $status = "session_start" }
elseif ($parseError) { $safePrompt = "PROMPT_CAPTURE_FAILED"; $status = "failed"; $notes = "Hook payload could not be parsed; exact prompt was not captured." }
elseif ([string]::IsNullOrWhiteSpace([string]$prompt)) { $safePrompt = "PROMPT_CAPTURE_MISSING"; $status = "missing_prompt"; $notes = "Codex hook payload did not expose a prompt field; exact prompt was not reconstructed." }
else {
    $redaction = Redact-Secrets ([string]$prompt)
    $safePrompt = $redaction.Text; $redactionTypes = @($redaction.Types)
    if ($redactionTypes.Count -gt 0) { $status = "redacted"; $notes = "Concrete credential-like substring(s) were replaced; surrounding visible text is preserved." }
}
$private = @{ event = $EventName; timestamp = (Get-Date).ToUniversalTime().ToString("o"); session_id = $sessionId; source_message_id = $messageId; capture_status = $status; prompt = $safePrompt; failure_reason = $notes }
$privateArtifact = Write-Private $private
$record = [ordered]@{ schema_version = 1; record_type = if ($status -eq "session_start") { "SESSION_START" } else { "PROMPT" }; timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"); phase = if ($phase) { $phase } else { "unavailable" }; source = "codex"; source_session_id = $sessionId; source_message_id = $messageId; parent_prompt_id = $null; supersedes_prompt_id = $null; recovery_of = $null; recovery_method = $null; recovered_exact = $null; runtime_parent_id = $parentId; runtime_agent_id = $agentId; actor = if ($agentId) { "subagent" } else { "user" }; agent = $null; model = $model; provider = $provider; harness = $harness; reasoning = $reasoning; prompt = $safePrompt; response_summary = $null; tools_used = @(); files_changed = @(); beads_ids = @(); git_commit_before = $null; git_commit_after = $null; raw_source_ref = $privateArtifact.Ref; raw_source_sha256 = $privateArtifact.Sha256; redacted = ($status -eq "redacted"); redaction_count = $redactionTypes.Count; redaction_types = $redactionTypes; capture_status = $status; notes = $notes }
$json = $record | ConvertTo-Json -Compress -Depth 8
$logSessionId = if ($sessionId) { "codex-$sessionId" } else { "codex-unavailable" }
& $PSCommandPath.Replace("codex-hook.ps1", "promptlog.ps1") append-record -RecordJson $json -SessionId $logSessionId -RepoRoot $RepoRoot
if ($LASTEXITCODE -ne 0) { throw "Prompt-log append failed." }
if ($status -eq "failed") { Write-Error "Codex prompt logging failure: $notes"; exit 1 }
