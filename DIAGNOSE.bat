@echo off
setlocal enabledelayedexpansion

set "TARGET_DIR=C:\Users\caespiritu\Documents\pollin"

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║         POLLIN DIAGNOSTIC & SETUP                      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if folder exists
echo [CHECK 1/5] Checking if pollin folder exists...
if exist "!TARGET_DIR!" (
    echo ✅ Folder exists: !TARGET_DIR!
) else (
    echo ❌ Folder does NOT exist
    echo.
    echo Creating it now...
    mkdir "!TARGET_DIR!"
    echo ✅ Created
)
echo.

REM Check if package.json exists
echo [CHECK 2/5] Checking if package.json exists...
if exist "!TARGET_DIR!\package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json NOT found - copying files...
    xcopy "C:\Users\caespiritu\source\*" "!TARGET_DIR!\" /E /Y /Q >nul 2>&1
    echo ✅ Files copied
)
echo.

REM Check Node.js
echo [CHECK 3/5] Checking if Node.js is installed...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set "NODE_VER=%%i"
    echo ✅ Node.js found: !NODE_VER!
) else (
    echo ❌ Node.js NOT found
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo.

REM Check npm
echo [CHECK 4/5] Checking if npm is installed...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do set "NPM_VER=%%i"
    echo ✅ npm found: !NPM_VER!
) else (
    echo ❌ npm NOT found
    pause
    exit /b 1
)
echo.

REM Check if node_modules exists
echo [CHECK 5/5] Checking if dependencies are installed...
cd /d "!TARGET_DIR!"
if exist "node_modules" (
    echo ✅ Dependencies already installed
) else (
    echo ❌ Dependencies NOT installed
    echo.
    echo Installing now... this will take 2-3 minutes
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ⚠️  Some warnings during install, but continuing...
    )
)
echo.

REM Try to start dev server
echo ╔════════════════════════════════════════════════════════╗
echo ║  All checks passed! Starting dev server...             ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Waiting 5 seconds before starting...
timeout /t 5 /nobreak
echo.
echo Starting: npm run dev
echo.
call npm run dev

REM If we get here, dev server exited
echo.
echo ⚠️  Dev server stopped. Check for errors above.
pause
