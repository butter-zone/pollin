@echo off
setlocal enabledelayedexpansion

REM Master Setup Script - Does everything automatically
REM No user interaction needed except opening the link

set "SOURCE_DIR=C:\Users\caespiritu\source"
set "POLLIN_DIR=C:\Users\caespiritu\Documents\pollin-test"
set "GITHUB_REPO=https://github.com/butter-zone/pollin.git"

cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║            🎨 POLLIN - AUTOMATIC SETUP                      ║
echo ║                                                              ║
echo ║   Setting up your project for testing...                    ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Git is not installed or not in PATH
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo Then restart this script.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/ (LTS version)
    echo Then restart this script.
    pause
    exit /b 1
)

echo ✅ Git found
echo ✅ Node.js found
echo.

REM Step 1: Clean and create directory
echo [Step 1/6] Preparing directory...
if exist "!POLLIN_DIR!" (
    echo   Cleaning existing directory...
    rmdir /s /q "!POLLIN_DIR!" >nul 2>&1
)
mkdir "!POLLIN_DIR!"
echo ✅ Directory ready: !POLLIN_DIR!
echo.

REM Step 2: Clone repo
echo [Step 2/6] Cloning GitHub repository...
cd /d "!POLLIN_DIR!"
git clone "!GITHUB_REPO!" . >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to clone repository
    echo.
    echo Make sure you have git credentials configured:
    echo   git config --global user.name "Your Name"
    echo   git config --global user.email "your@email.com"
    pause
    exit /b 1
)
echo ✅ Repository cloned
echo.

REM Step 3: Copy project files
echo [Step 3/6] Copying project files from source...
xcopy "!SOURCE_DIR!\*" "!POLLIN_DIR!\" /E /Y /Q >nul 2>&1
echo ✅ Files copied
echo.

REM Step 4: Organize files
echo [Step 4/6] Organizing project structure...

REM Create src subdirectories
if not exist "src\hooks\__tests__" mkdir "src\hooks\__tests__"
if not exist "src\components" mkdir "src\components"

REM Move hooks
for %%f in (
    "pollin-src-hooks-useCanvasTransform.ts|src\hooks\useCanvasTransform.ts"
    "pollin-src-hooks-useHistory.ts|src\hooks\useHistory.ts"
    "pollin-src-hooks-useCanvasPersistence.ts|src\hooks\useCanvasPersistence.ts"
    "pollin-src-hooks-useCanvasReferences.ts|src\hooks\useCanvasReferences.ts"
    "pollin-src-hooks-useCanvas.ts|src\hooks\useCanvas.ts"
    "pollin-src-hooks-useDrawing.ts|src\hooks\useDrawing.ts"
) do (
    for /f "tokens=1,2 delims=|" %%a in ("%%f") do (
        if exist "%%a" move /Y "%%a" "%%b" >nul 2>&1
    )
)

REM Move test files
for %%f in (
    "pollin-src-hooks-__tests__-useCanvasTransform.test.ts|src\hooks\__tests__\useCanvasTransform.test.ts"
    "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts|src\hooks\__tests__\useCanvasPersistence.test.ts"
) do (
    for /f "tokens=1,2 delims=|" %%a in ("%%f") do (
        if exist "%%a" move /Y "%%a" "%%b" >nul 2>&1
    )
)

REM Move components
for %%f in (
    "pollin-src-components-CanvasAdvanced.tsx|src\components\CanvasAdvanced.tsx"
    "pollin-src-components-PersistencePanel.tsx|src\components\PersistencePanel.tsx"
    "pollin-src-components-ReferencePanel.tsx|src\components\ReferencePanel.tsx"
    "pollin-src-components-ControlPanel.tsx|src\components\ControlPanel.tsx"
    "pollin-src-components-Canvas.tsx|src\components\Canvas.tsx"
) do (
    for /f "tokens=1,2 delims=|" %%a in ("%%f") do (
        if exist "%%a" move /Y "%%a" "%%b" >nul 2>&1
    )
)

REM Move src files
for %%f in (
    "pollin-src-index.html|src\index.html"
    "pollin-src-index.css|src\index.css"
    "pollin-src-main.tsx|src\main.tsx"
    "pollin-src-App.tsx|src\App.tsx"
    "pollin-src-canvas.ts|src\canvas.ts"
    "pollin-src-tokens.ts|src\tokens.ts"
) do (
    for /f "tokens=1,2 delims=|" %%a in ("%%f") do (
        if exist "%%a" move /Y "%%a" "%%b" >nul 2>&1
    )
)

REM Move config files
for %%f in (
    "pollin-package.json|package.json"
    "pollin-tsconfig.json|tsconfig.json"
    "pollin-tsconfig.node.json|tsconfig.node.json"
    "pollin-vite.config.ts|vite.config.ts"
    "pollin-tailwind.config.js|tailwind.config.js"
    "pollin-postcss.config.js|postcss.config.js"
    "pollin-prettier.config.js|prettier.config.js"
    "pollin-.eslintrc.json|.eslintrc.json"
    "pollin-.gitignore|.gitignore"
    "pollin-.env.example|.env.example"
) do (
    for /f "tokens=1,2 delims=|" %%a in ("%%f") do (
        if exist "%%a" move /Y "%%a" "%%b" >nul 2>&1
    )
)

echo ✅ Files organized
echo.

REM Step 5: Install dependencies
echo [Step 5/6] Installing npm dependencies...
echo   This may take 2-3 minutes, please be patient...
echo.
call npm install --silent
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  npm install had some warnings, but continuing...
)
echo ✅ Dependencies installed
echo.

REM Step 6: Start dev server
echo [Step 6/6] Starting development server...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              ✅ SETUP COMPLETE!                             ║
echo ║                                                              ║
echo ║  Your Pollin canvas is starting...                          ║
echo ║                                                              ║
echo ║  📍 OPEN THIS LINK IN YOUR BROWSER:                         ║
echo ║                                                              ║
echo ║     👉  http://localhost:5173  👈                           ║
echo ║                                                              ║
echo ║  Then follow TESTING-CHECKLIST.md to test all features:     ║
echo ║  • Phase 1: Zoom, pan, grid, undo/redo                      ║
echo ║  • Phase 2: Save/load, autosave, export                     ║
echo ║  • Phase 3: Image import, transforms                        ║
echo ║                                                              ║
echo ║  When done testing, reply in the chat with feedback!        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Starting dev server in 3 seconds...
echo.
timeout /t 3 /nobreak

REM Start dev server
call npm run dev

REM If dev server exits, pause so user can see the output
pause
