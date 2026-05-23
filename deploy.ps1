# Builds the PWA and pushes to gh-pages branch.
# Use: .\deploy.ps1
#
# Strategy: build into ./build, stash to TEMP, switch to gh-pages,
# wipe tracked files (keeping node_modules untracked), copy build/ in,
# add ONLY the build artifacts (not node_modules), commit, push.

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

# Remove all tracked files from the index (without touching working tree files
# like node_modules / .svelte-kit), then delete only the previously tracked
# files from disk. node_modules stays put and is ignored from git.
git rm -r --cached . | Out-Null
git ls-files | ForEach-Object { if (Test-Path $_) { Remove-Item $_ -Force -ErrorAction SilentlyContinue } }

Copy-Item -Path "$tempDir\*" -Destination "." -Recurse -Force
Copy-Item -Path "$tempDir\.nojekyll" -Destination ".nojekyll" -Force
Remove-Item $tempDir -Recurse -Force

# Write a .gitignore on gh-pages to keep node_modules and source out of the branch
@"
node_modules
.svelte-kit
src
.claude
.github
.tmp-pdf
*.config.*
package*.json
tsconfig.json
README.md
deploy.ps1
.gitignore
"@ | Set-Content ".gitignore"

git add .nojekyll .gitignore 404.html index.html manifest.webmanifest favicon.svg apple-touch-icon.png icon-192.png icon-512.png icon-512-maskable.png registerSW.js sw.js workbox-*.js _app diagrams dia metodo nutricao semana 2>$null

$date = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "deploy: $date" --allow-empty
git push origin gh-pages

git checkout $current
Write-Host "✓ Deployed. https://aleapc.github.io/rotina-ale/" -ForegroundColor Green
