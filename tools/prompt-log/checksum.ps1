[CmdletBinding()]
param ()

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$EvidenceDir = Join-Path $RepoRoot "evidence"
$OutputFile = Join-Path $EvidenceDir "preflight\checksums.sha256"

$FilesToHash = Get-ChildItem -Path $EvidenceDir -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($RepoRoot.Path.Length + 1).Replace("\", "/")
    # Exclude checksums file itself, private storage dir, index.csv, and temp files
    $rel -ne "evidence/preflight/checksums.sha256" -and
    -not $rel.StartsWith("evidence/private/") -and
    -not $rel.EndsWith(".tmp")
} | Sort-Object FullName

$lines = @("# SHA-256 Evidence Artifact Checksums", "# Generated at: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')")
foreach ($file in $FilesToHash) {
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash.ToLower()
    $relPath = $file.FullName.Substring($RepoRoot.Path.Length + 1).Replace("\", "/")
    $lines += "$hash  $relPath"
}

$lines | Set-Content -Path $OutputFile -Encoding UTF8
Write-Host "Updated SHA-256 checksums for $($FilesToHash.Count) artifact(s) in $OutputFile"
