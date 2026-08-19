[CmdletBinding()]
param([string]$RepoRoot, [string]$OutputPath)
$ErrorActionPreference = "Stop"
if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path }
$EvidenceDir = Join-Path $RepoRoot "evidence"; $OutputFile = if ($OutputPath) { $OutputPath } else { Join-Path $EvidenceDir "preflight\checksums.sha256" }
$files = Get-ChildItem -Path $EvidenceDir -Recurse -File | Where-Object { $rel=$_.FullName.Substring($RepoRoot.Length+1).Replace("\","/"); $rel -ne "evidence/preflight/checksums.sha256" -and -not $rel.StartsWith("evidence/private/") -and -not $rel.EndsWith(".tmp") } | Sort-Object { $_.FullName.Substring($RepoRoot.Length+1).Replace("\","/") }
$lines = @("# SHA-256 Evidence Artifact Checksums", "# Deterministically generated; excludes this manifest and evidence/private/.")
foreach($file in $files){$hash=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant();$rel=$file.FullName.Substring($RepoRoot.Length+1).Replace("\","/");$lines += "$hash  $rel"}
[IO.Directory]::CreateDirectory((Split-Path -Parent $OutputFile)) | Out-Null
[IO.File]::WriteAllLines($OutputFile,$lines,[Text.UTF8Encoding]::new($false));Write-Host "Updated SHA-256 checksums for $($files.Count) artifact(s) in $OutputFile"
