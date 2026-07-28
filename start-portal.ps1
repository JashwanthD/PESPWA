# ============================================================
# PESCE Intelligence -- Start Portal for Intranet
# ============================================================

$ROOT = "d:\games\PES placement PWA"

Write-Host "Starting FastAPI backend on :8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit", "-NoProfile", "-Command",
    "cd '$ROOT\Lango\Lango\Langraph'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"
) -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Vite PWA dev server on 0.0.0.0 (Accessible to network)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit", "-NoProfile", "-Command",
    "cd '$ROOT\pesce-insight-nexus-main\pesce-insight-nexus-main'; npm run dev -- --host 0.0.0.0"
) -WindowStyle Normal

Write-Host ""
Write-Host "Portal is live! Access it on your local network at:" -ForegroundColor Green
Write-Host "http://10.172.82.147:8080" -ForegroundColor Cyan
