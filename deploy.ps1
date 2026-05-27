# Builds the PWA and pushes to gh-pages branch.
# Use: .\deploy.ps1
#
# Uses a dedicated git worktree at ../.rotina-gh-pages so we never
# switch branches in the main checkout — eliminates checkout-conflict
# bugs that previously caused gh-pages content to be committed to main.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$worktreePath = (Resolve-Path "..").Path + "\.rotina-gh-pages"
$buildPath = Join-Path $PSScriptRoot "build"

Write-Host "→ Build com BASE_PATH=/rotina-ale ..." -ForegroundColor Cyan
$env:BASE_PATH = "/rotina-ale"
npm run build
if (-not (Test-Path "build\.nojekyll")) { New-Item -ItemType File "build\.nojekyll" | Out-Null }

Write-Host "→ Preparing gh-pages worktree at $worktreePath ..." -ForegroundColor Cyan

# Make sure we have the latest gh-pages from origin
git fetch origin gh-pages 2>&1 | Out-Null

# Remove any leftover worktree from a prior failed run
if (Test-Path $worktreePath) {
    git worktree remove --force $worktreePath 2>&1 | Out-Null
    if (Test-Path $worktreePath) { Remove-Item $worktreePath -Recurse -Force }
}

# Create a fresh worktree pointing at gh-pages
git worktree add -B gh-pages $worktreePath origin/gh-pages

# Wipe everything except .git in the worktree
Get-ChildItem $worktreePath -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force

# Copy build output
Copy-Item -Path "$buildPath\*" -Destination $worktreePath -Recurse -Force
Copy-Item -Path "$buildPath\.nojekyll" -Destination (Join-Path $worktreePath ".nojekyll") -Force

# Write a minimal .gitignore for the gh-pages branch (kept on that branch only)
@"
node_modules
.svelte-kit
*.log
"@ | Set-Content (Join-Path $worktreePath ".gitignore")

# Commit and push from inside the worktree
Push-Location $worktreePath
try {
    git add -A
    $date = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "deploy: $date" --allow-empty
    git push origin gh-pages
}
finally {
    Pop-Location
}

# Clean up
git worktree remove --force $worktreePath
if (Test-Path $worktreePath) { Remove-Item $worktreePath -Recurse -Force -ErrorAction SilentlyContinue }

Write-Host "✓ Deployed. https://aleapc.github.io/rotina-ale/" -ForegroundColor Green
