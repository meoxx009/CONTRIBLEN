# ContribShield OSS — Copy Documentation Script
# Destination: C:\Users\ezyre\Documents\24 OCT\DOCS

$Destination = "C:\Users\ezyre\Documents\24 OCT\DOCS"
$SourceDir = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ContribShield OSS — Documentation Sync" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Source: $SourceDir"
Write-Host "Target: $Destination"

try {
    if (-not (Test-Path -Path $Destination)) {
        Write-Host "Creating target directory: $Destination" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }

    $mdFiles = Get-ChildItem -Path $SourceDir -Filter "*.md" -File
    Write-Host "`nCopying $($mdFiles.Count) documentation files..." -ForegroundColor Green

    foreach ($file in $mdFiles) {
        $targetFile = Join-Path $Destination $file.Name
        Copy-Item -Path $file.FullName -Destination $targetFile -Force
        Write-Host "  ✓ Copied: $($file.Name)" -ForegroundColor DarkGray
    }

    # Also copy SQL migrations if present
    $sqlDir = Join-Path $SourceDir "supabase\migrations"
    if (Test-Path -Path $sqlDir) {
        $targetSql = Join-Path $Destination "migrations"
        if (-not (Test-Path -Path $targetSql)) {
            New-Item -ItemType Directory -Path $targetSql -Force | Out-Null
        }
        Copy-Item -Path "$sqlDir\*" -Destination $targetSql -Recurse -Force
        Write-Host "  ✓ Copied database migrations" -ForegroundColor DarkGray
    }

    Write-Host "`n=========================================" -ForegroundColor Green
    Write-Host "✓ All documentation successfully synced to $Destination" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
} catch {
    Write-Error "Failed to copy documentation: $_"
}
