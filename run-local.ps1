# ==============================================================================
# Freetown Infrastructure Monitoring and Maintenance System (FIMMS)
# Case Study: Western Area Urban, Freetown, Sierra Leone
# ==============================================================================

Write-Host "Starting FIMMS Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "py -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Starting FIMMS Frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm.cmd run dev"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "FIMMS Application Launched!" -ForegroundColor Yellow
Write-Host "Frontend Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "FastAPI Swagger:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "DEMO CREDENTIALS (Password for all: Freetown2026!)" -ForegroundColor Cyan
Write-Host " - Citizen:       citizen@freetown.gov.sl"
Write-Host " - Administrator: admin@freetown.gov.sl"
Write-Host " - Maintenance:   officer@freetown.gov.sl"
Write-Host " - Supervisor:    supervisor@freetown.gov.sl"
Write-Host "==================================================================" -ForegroundColor Yellow
