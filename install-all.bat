@echo off
echo ============================================
echo   Installing iMovies Dependencies
echo ============================================
echo.
echo [1/2] Installing Server dependencies...
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing server dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Installing Client dependencies...
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing client dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================
echo   Dependencies Installed Successfully!
echo   Run start-dev.bat to launch the app.
echo ============================================
pause
