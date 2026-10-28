@echo off
echo ============================================
echo   Starting iMovies Cinema Booking System
echo ============================================
echo.
echo Launching Server on http://localhost:5000 ...
start "iMovies Server (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"

echo Launching Client on http://localhost:5173 ...
start "iMovies Client (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo --------------------------------------------
echo Server and Client processes launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo - Seed API: POST http://localhost:5000/api/seed
echo --------------------------------------------
echo.
pause
