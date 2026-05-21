# ============================================================
# PESCE Intelligence -- Start All Services
# Right-click this file -> "Run with PowerShell"
# OR open PowerShell and run: .\start-all.ps1
# ============================================================

$ROOT = "d:\games\PES placement PWA"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PESCE Intelligence -- Service Launcher  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Start Docker Desktop ──────────────────────────────────
$dockerDesktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
$dockerRunning = $false

try {
    $null = & docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "  [OK] Docker daemon already running" -ForegroundColor Green
    }
} catch {}

if (-not $dockerRunning) {
    if (Test-Path $dockerDesktop) {
        Write-Host "  [..] Starting Docker Desktop..." -ForegroundColor Yellow
        Start-Process $dockerDesktop
        Write-Host "       Waiting 60s for Docker daemon to initialise..." -ForegroundColor Gray
        Start-Sleep -Seconds 60
        Write-Host "  [OK] Docker Desktop started" -ForegroundColor Green
    } else {
        Write-Host "  [!!] Docker Desktop not found at: $dockerDesktop" -ForegroundColor Red
        Write-Host "       Please start Docker Desktop manually." -ForegroundColor Red
    }
}

# ── 2. Start FastAPI Backend ─────────────────────────────────
Write-Host "  [..] Starting FastAPI backend on :8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit", "-NoProfile", "-Command",
    "cd '$ROOT\Lango\Lango\Langraph'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# ── 3. Start Vite PWA Dev Server ─────────────────────────────
Write-Host "  [..] Starting Vite PWA dev server on :8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit", "-NoProfile", "-Command",
    "cd '$ROOT\pesce-insight-nexus-main\pesce-insight-nexus-main'; npm run dev"
) -WindowStyle Normal

# ── 4. Start Jenkins ─────────────────────────────────────────
Write-Host "  [..] Starting Jenkins on :9090..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit", "-NoProfile", "-Command",
    "`$env:JENKINS_HOME='$ROOT\jenkins-home'; java -jar '$ROOT\jenkins.war' --httpPort=9090"
) -WindowStyle Normal

Start-Sleep -Seconds 5

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Services are starting up:" -ForegroundColor White
Write-Host ""
Write-Host "  PWA Frontend  ->  http://localhost:8080" -ForegroundColor Green
Write-Host "  FastAPI Docs  ->  http://localhost:8001/docs" -ForegroundColor Green
Write-Host "  Jenkins       ->  http://localhost:9090" -ForegroundColor Green
Write-Host ""
Write-Host "  To run with Docker instead:" -ForegroundColor Gray
Write-Host "  cd '$ROOT'" -ForegroundColor Gray
Write-Host "  docker compose -f docker-compose.yml up --build -d" -ForegroundColor Gray
Write-Host "  (App at http://localhost:3000)" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Jenkins initial password (first run only):" -ForegroundColor Yellow
$pwFile = "$ROOT\jenkins-home\secrets\initialAdminPassword"
if (Test-Path $pwFile) {
    Write-Host "  $(Get-Content $pwFile)" -ForegroundColor White
} else {
    Write-Host "  (Jenkins already configured -- no password needed)" -ForegroundColor Gray
}
Write-Host ""
