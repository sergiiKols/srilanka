@echo off
echo ============================================
echo STARTING DEV SERVER WITH ERROR LOGGING
echo ============================================
echo.

cd /d "%~dp0"

echo Killing old node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting Astro dev server...
echo.

node node_modules\astro\astro.js dev

echo.
echo ============================================
echo Server stopped. Press any key to close.
pause
