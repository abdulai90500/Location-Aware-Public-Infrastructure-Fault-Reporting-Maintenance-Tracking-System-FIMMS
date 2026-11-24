@echo off
echo ==============================================================================
echo Freetown Infrastructure Monitoring and Maintenance System (FIMMS)
echo Case Study: Western Area Urban, Freetown, Sierra Leone
echo ==============================================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "FIMMS Backend (FastAPI)" cmd /k "py -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Next.js Frontend on http://localhost:3000 ...
cd frontend
start "FIMMS Frontend (Next.js)" cmd /k "npm.cmd run dev"

echo.
echo ==============================================================================
echo Applications launched in separate windows!
echo - Frontend:  http://localhost:3000
echo - Backend:   http://localhost:8000
echo - API Docs:  http://localhost:8000/docs
echo.
echo DEMO CREDENTIALS (Password for all: Freetown2026!)
echo - Citizen:       citizen@freetown.gov.sl
echo - Administrator: admin@freetown.gov.sl
echo - Maintenance:   officer@freetown.gov.sl
echo - Supervisor:    supervisor@freetown.gov.sl
echo ==============================================================================
pause
