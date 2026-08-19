[CmdletBinding()]
param()
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("thinkai-prompt-log-" + [guid]::NewGuid())
New-Item -ItemType Directory -Force -Path (Join-Path $tmp "evidence\prompt-log\sessions"), (Join-Path $tmp "evidence\private") | Out-Null
$hook = Join-Path $repo "tools\prompt-log\codex-hook.ps1"; $logger = Join-Path $repo "tools\prompt-log\promptlog.ps1"; $validator = Join-Path $repo "tools\prompt-log\validate-log.ps1"; $indexer=Join-Path $repo "tools\prompt-log\export-index.ps1"; $checksum=Join-Path $repo "tools\prompt-log\checksum.ps1"
function Assert-True($Value, [string]$Message) { if (-not $Value) { throw "ASSERTION FAILED: $Message" } }
function Invoke-Hook([hashtable]$Payload) { $old=$OutputEncoding; try { $OutputEncoding=[Text.UTF8Encoding]::new($false); $Payload | ConvertTo-Json -Compress | & powershell -NoProfile -ExecutionPolicy Bypass -File $hook -EventName UserPromptSubmit -RepoRoot $tmp | Out-Null } finally { $OutputEncoding=$old } }
function Unicode([int[]]$CodePoints) { return [string]::Concat(@($CodePoints | ForEach-Object { [char]$_ })) }
try {
    $exactPrompts=@(
        (Unicode @(0x48,0x69,0x1ec7,0x6e,0x20,0x74,0x1ea1,0x69,0x20,0x63,0x68,0x1b0,0x61,0x20,0x63,0xf3,0x20,0x41,0x50,0x49,0x20,0x68,0x61,0x79,0x20,0x67,0xec,0x20,0x63,0x1ea7,0x6e,0x20,0x63,0x1ea9,0x6e,0x20,0x74,0x68,0x1ead,0x6e,0x20,0x63,0x1ea3,0x2e)),
        (Unicode @(0x4b,0x68,0xf4,0x6e,0x67,0x20,0x111,0x1b0,0x1ee3,0x63,0x20,0x69,0x6e,0x20,0x41,0x50,0x49,0x20,0x6b,0x65,0x79,0x20,0x72,0x61,0x20,0x74,0x65,0x72,0x6d,0x69,0x6e,0x61,0x6c,0x2e)),
        (Unicode @(0x43,0x68,0x65,0x63,0x6b,0x20,0x4f,0x41,0x75,0x74,0x68,0x20,0x76,0xe0,0x20,0x74,0x6f,0x6b,0x65,0x6e,0x20,0x68,0x61,0x6e,0x64,0x6c,0x69,0x6e,0x67,0x2e)),
        (Unicode @(0x41,0x50,0x49,0x20,0x6b,0x65,0x79,0x20,0x68,0x69,0x1ec7,0x6e,0x20,0x63,0x68,0x1b0,0x61,0x20,0x111,0x1b0,0x1ee3,0x63,0x20,0x63,0x1ea5,0x75,0x20,0x68,0xec,0x6e,0x68,0x2e)),
        (Unicode @(0x43,0x1eed,0x61,0x20,0x70,0x68,0x69,0xea,0x6e,0x20,0x111,0x103,0x6e,0x67,0x20,0x6e,0x68,0x1ead,0x70,0x20,0x2014,0x20,0x6b,0x69,0x1ec3,0x6d,0x20,0x74,0x72,0x61,0x20,0x70,0x72,0x6f,0x6d,0x70,0x74,0x20,0x74,0x69,0x1ebf,0x6e,0x67,0x20,0x56,0x69,0x1ec7,0x74))
    )
    foreach($prompt in $exactPrompts){Invoke-Hook @{prompt=$prompt;session_id='unicode';message_id=[guid]::NewGuid().ToString();phase='test';model='synthetic-model';provider='synthetic-provider';harness='synthetic-harness'}}
    $file=Join-Path $tmp 'evidence\prompt-log\sessions\codex-unicode.jsonl';$records=@([IO.File]::ReadAllLines($file,[Text.UTF8Encoding]::new($false))|ConvertFrom-Json)
    for($i=0;$i -lt $exactPrompts.Count;$i++){Assert-True ($records[$i].prompt -ceq $exactPrompts[$i]) "descriptive or Vietnamese prompt $i was changed";Assert-True ($records[$i].capture_status -eq 'captured') "descriptive prompt $i was not captured"}
    Assert-True (-not (([IO.File]::ReadAllBytes($file))[0..2] -join ',' -eq '239,187,191')) 'canonical writer emitted a UTF-8 BOM'
    Assert-True ($records[0].model -eq 'synthetic-model' -and $records[0].provider -eq 'synthetic-provider' -and $records[0].harness -eq 'synthetic-harness') 'runtime metadata was not captured'

    $bearer='TEST_SECRET_VALUE_ABC123';Invoke-Hook @{prompt="Use Authorization: Bearer $bearer";session_id='secret';phase='test'}
    $providerKey='sk-test-FAKE_PROVIDER_CREDENTIAL_123456';Invoke-Hook @{prompt="provider key: $providerKey";session_id='secret';phase='test'}
    $pem="-----BEGIN PRIVATE KEY-----`nFAKE_PRIVATE_KEY_MATERIAL_123456`n-----END PRIVATE KEY-----";Invoke-Hook @{prompt="Install this key: $pem";session_id='secret';phase='test'}
    $secretFile=Join-Path $tmp 'evidence\prompt-log\sessions\codex-secret.jsonl';$secretRecords=@([IO.File]::ReadAllLines($secretFile,[Text.UTF8Encoding]::new($false))|ConvertFrom-Json)
    Assert-True ($secretRecords[0].capture_status -eq 'redacted') 'Bearer credential did not receive redacted status'
    Assert-True ($secretRecords[0].prompt -eq 'Use Authorization: Bearer [REDACTED_SECRET]') 'Bearer credential replacement did not preserve surrounding text'
    Assert-True ($secretRecords[1].prompt -eq 'provider key: sk-test-[REDACTED_SECRET]' -and $secretRecords[1].capture_status -eq 'redacted') 'provider-shaped credential was not redacted'
    Assert-True ($secretRecords[2].prompt -eq 'Install this key: [REDACTED_SECRET]' -and $secretRecords[2].capture_status -eq 'redacted') 'private key was not redacted'
    $allGenerated=Get-ChildItem $tmp -Recurse -File | Get-Content -Raw
    foreach($fixture in @($bearer,$providerKey,'FAKE_PRIVATE_KEY_MATERIAL_123456')){Assert-True (-not $allGenerated.Contains($fixture)) 'synthetic secret leaked to generated evidence'}
    Assert-True (@($secretRecords|Where-Object {$_.raw_source_sha256}).Count -eq 3) 'raw source SHA-256 linkage missing'

    @{session_id='dedupe'} | ConvertTo-Json -Compress | & powershell -NoProfile -ExecutionPolicy Bypass -File $hook -EventName SessionStart -RepoRoot $tmp | Out-Null
    @{session_id='dedupe'} | ConvertTo-Json -Compress | & powershell -NoProfile -ExecutionPolicy Bypass -File $hook -EventName SessionStart -RepoRoot $tmp | Out-Null
    $starts=Get-ChildItem (Join-Path $tmp 'evidence\prompt-log\sessions') -Filter *.jsonl | Get-Content | ConvertFrom-Json | Where-Object {$_.capture_status -eq 'session_start' -and $_.source_session_id -eq 'dedupe'};Assert-True (@($starts).Count -eq 1) 'duplicate SESSION_START was appended'
    & powershell -NoProfile -ExecutionPolicy Bypass -File $indexer -RepoRoot $tmp | Out-Null; & powershell -NoProfile -ExecutionPolicy Bypass -File $checksum -RepoRoot $tmp | Out-Null
    & powershell -NoProfile -ExecutionPolicy Bypass -File $validator -RepoRoot $tmp
    Assert-True ($LASTEXITCODE -eq 0) 'validator did not accept the synthetic evidence root'
    Assert-True ((git -C $repo check-ignore evidence/private/codex/hook-events/example.json) -match 'evidence/private/') 'private evidence is not gitignored'
    Write-Host 'PASS: exact Unicode capture, concrete-only redaction, private leak prevention, metadata, raw linkage, session-start dedupe, index, checksums, and validation.'
} finally { if(Test-Path $tmp){Remove-Item -LiteralPath $tmp -Recurse -Force} }
