Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Installing iMovies Dependencies" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Installing Server dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\server"
npm install

Write-Host ""
Write-Host "[2/2] Installing Client dependencies..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\client"
npm install

Set-Location "$PSScriptRoot"
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Dependencies Installed Successfully!" -ForegroundColor Green
Write-Host "  Run .\start-dev.ps1 or .\start-dev.bat" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
