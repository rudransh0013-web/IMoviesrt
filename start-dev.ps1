Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Starting iMovies Cinema Booking System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Launching Server on http://localhost:5000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev"

Write-Host "Launching Client on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host ""
Write-Host "--------------------------------------------" -ForegroundColor Green
Write-Host "Both processes started in separate windows!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "- Seed API: POST http://localhost:5000/api/seed" -ForegroundColor White
Write-Host "--------------------------------------------" -ForegroundColor Green
