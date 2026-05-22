# Builds the PWA and pushes to gh-pages branch.
# Use: .\deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "→ Build com BASE_PATH=/rotina-ale ..." -ForegroundColor Cyan
$env:BASE_PATH = "/rotina-ale"
npm run build
if (-not (Test-Path "build\.nojekyll")) { New-Item -ItemType File "build\.nojekyll" | Out-Null }

Write-Host "→ Switching to gh-pages branch ..." -ForegroundColor Cyan
$current = (git rev-parse --abbrev-ref HEAD).Trim()
$tempDir = Join-Path $env:TEMP "rotina-ale-build-$(Get-Random)"
Move-Item "build" $tempDir

git checkout gh-pages
Get-ChildItem -Force | Where-Object { $_.Name -notin @('.git', 'node_modules', '.svelte-kit') } | Remove-Item -Recurse -Force
Copy-Item -Path "$tempDir\*" -Destination "." -Recurse -Force
Copy-Item -Path "$tempDir\.nojekyll" -Destination ".nojekyll" -Force
Remove-Item $tempDir -Recurse -Force

git add -A
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "deploy: $date" --allow-empty
git push origin gh-pages

git checkout $current
Write-Host "✓ Deployed. https://aleapc.github.io/rotina-ale/" -ForegroundColor Green
