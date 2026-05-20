#!/usr/bin/env pwsh
# ─────────────────────────────────────────────────────────────
# PESCE Intelligence — Start All Services
# Run this from: d:\games\PES placement PWA\
# ─────────────────────────────────────────────────────────────

$ROOT = "d:\games\PES placement PWA"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PESCE Intelligence — Service Launcher  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 1. Start Docker Desktop ───────────────────────────────────
$dockerDesktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
$dockerRunning = $false
try {
    docker info 2>$null | Out-Null
    $dockerRunning = $true
    Write-Host "  ✅ Docker daemon already running" -ForegroundColor Green
} catch {}

if (-not $dockerRunning) {
    Write-Host "  🐳 Starting Docker Desktop..." -ForegroundColor Yellow
    Start-Process $dockerDesktop
    Write-Host "     Waiting 60s for Docker daemon..." -ForegroundColor Gray
    Start-Sleep -Seconds 60
}

# ── 2. Start FastAPI Backend ──────────────────────────────────
Write-Host "  🐍 Starting FastAPI backend on :8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "cd '$ROOT\Lango\Lango\Langraph'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"
) -WindowStyle Minimized

Start-Sleep -Seconds 3

# ── 3. Start PWA Dev Server ────────────────────────────────────
Write-Host "  ⚡ Starting Vite PWA dev server on :8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "cd '$ROOT\pesce-insight-nexus-main\pesce-insight-nexus-main'; npm run dev"
) -WindowStyle Minimized

# ── 4. Start Jenkins ───────────────────────────────────────────
Write-Host "  🔧 Starting Jenkins on :9090..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoProfile", "-Command",
    "`$env:JENKINS_HOME='$ROOT\jenkins-home'; java -jar '$ROOT\jenkins.war' --httpPort=9090"
) -WindowStyle Minimized

Start-Sleep -Seconds 5

# ── Summary ────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Services starting up:" -ForegroundColor White
Write-Host "  🌐 PWA Frontend  → http://localhost:8080" -ForegroundColor Green
Write-Host "  🐍 FastAPI API   → http://localhost:8001/docs" -ForegroundColor Green
Write-Host "  🔧 Jenkins       → http://localhost:9090" -ForegroundColor Green
Write-Host ""
Write-Host "  To run with Docker instead:" -ForegroundColor Gray
Write-Host "  cd '$ROOT'" -ForegroundColor Gray
Write-Host "  docker compose up --build -d" -ForegroundColor Gray
Write-Host "  (App at http://localhost:3000)" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
