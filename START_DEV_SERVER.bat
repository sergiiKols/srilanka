@echo off
echo ============================================
echo Starting Astro Dev Server
echo ============================================
echo.

REM Проверка Node.js
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

echo.
echo Starting dev server...
echo Open in browser: http://localhost:4321/test-tenant-form
echo.
echo Press Ctrl+C to stop
echo.

node node_modules\astro\astro.js dev

pause
