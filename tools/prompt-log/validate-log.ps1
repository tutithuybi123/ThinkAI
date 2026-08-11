[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$Path
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$SessionsDir = Join-Path $RepoRoot "evidence\prompt-log\sessions"

if (-not $Path) {
    $Path = $SessionsDir
}

$FilesToValidate = @()
if (Test-Path $Path -PathType Leaf) {
    $FilesToValidate += (Get-Item $Path)
} elseif (Test-Path $Path -PathType Container) {
    $FilesToValidate += Get-ChildItem -Path $Path -Filter "*.jsonl"
}

if ($FilesToValidate.Count -eq 0) {
    Write-Host "No JSONL session log files found to validate."
    exit 0
}

$SeenPromptIds = @{}
$AllPromptIds = [System.Collections.Generic.HashSet[string]]::new()
$ParentRefsToValidate = @()
$Errors = @()

foreach ($file in $FilesToValidate) {
    $lines = Get-Content $file.FullName
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ([string]::IsNullOrWhiteSpace($line)) { continue }

        try {
            $obj = $line | ConvertFrom-Json
        } catch {
            $fileName = $file.Name
            $Errors += "File '$fileName' line $lineNum : Malformed JSON - $_"
            continue
        }

        # Check required fields
        $requiredFields = @("schema_version", "prompt_id", "timestamp", "phase", "source", "actor", "prompt")
        foreach ($field in $requiredFields) {
            if (-not $obj.PSObject.Properties[$field] -or [string]::IsNullOrWhiteSpace($obj.$field.ToString())) {
                $fileName = $file.Name
                $Errors += "File '$fileName' line $lineNum : Missing or empty required field '$field'"
            }
        }

        # Prompt ID Format Check (P000001)
        if ($obj.prompt_id -notmatch '^P[0-9]{6}$') {
            $fileName = $file.Name
            $Errors += "File '$fileName' line $lineNum : Invalid prompt_id format '$($obj.prompt_id)' (expected PXXXXXX)"
        } else {
            if ($SeenPromptIds.ContainsKey($obj.prompt_id)) {
                $fileName = $file.Name
                $Errors += "File '$fileName' line $lineNum : Duplicate prompt_id '$($obj.prompt_id)' (first seen in $($SeenPromptIds[$obj.prompt_id]))"
            } else {
                $fileName = $file.Name
                $SeenPromptIds[$obj.prompt_id] = "$($fileName):$($lineNum)"
                $null = $AllPromptIds.Add($obj.prompt_id)
            }
        }

        # ISO-8601 Timestamp Validation
        try {
            [DateTime]::Parse($obj.timestamp) | Out-Null
        } catch {
            $fileName = $file.Name
            $Errors += "File '$fileName' line $lineNum : Invalid ISO-8601 timestamp '$($obj.timestamp)'"
        }

        # Record parent prompt ID reference check
        if ($obj.parent_prompt_id) {
            $fileName = $file.Name
            $ParentRefsToValidate += @{
                File = $fileName
                Line = $lineNum
                ParentId = $obj.parent_prompt_id
            }
        }
    }
}

# Validate parent ID references
foreach ($ref in $ParentRefsToValidate) {
    if (-not $AllPromptIds.Contains($ref.ParentId)) {
        $Errors += "File '$($ref.File)' line $($ref.Line) : Parent prompt_id '$($ref.ParentId)' does not exist in any session log."
    }
}

if ($Errors.Count -gt 0) {
    Write-Host "❌ Validation FAILED with $($Errors.Count) error(s):" -ForegroundColor Red
    foreach ($err in $Errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "✅ Validation PASSED! All $($SeenPromptIds.Count) record(s) across $($FilesToValidate.Count) file(s) are valid." -ForegroundColor Green
    exit 0
}
