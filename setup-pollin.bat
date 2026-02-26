@echo off
REM Pollin Setup Script - Windows
REM Run this from C:\Users\caespiritu\source\ directory

echo.
echo ========================================
echo Pollin Local Setup Script
echo ========================================
echo.

REM Navigate to home
cd C:\Users\caespiritu

REM Check if pollin directory exists
if not exist "pollin" (
    echo Cloning Pollin repository...
    git clone https://github.com/butter-zone/pollin.git
    if errorlevel 1 (
        echo ERROR: Could not clone repository. Check git credentials.
        exit /b 1
    )
) else (
    echo Pollin directory already exists. Skipping clone.
)

cd pollin

REM Create directory structure
echo Creating directory structure...
if not exist "public" mkdir public
if not exist "src" mkdir src
if not exist "src\components" mkdir src\components
if not exist "src\hooks" mkdir src\hooks
if not exist "src\design" mkdir src\design
if not exist "src\types" mkdir src\types

REM Copy files from source directory
echo Copying project files...
set SOURCE=C:\Users\caespiritu\source

REM Root config files
copy "%SOURCE%\pollin-package.json" "package.json" >nul 2>&1
copy "%SOURCE%\pollin-tsconfig.json" "tsconfig.json" >nul 2>&1
copy "%SOURCE%\pollin-tsconfig.node.json" "tsconfig.node.json" >nul 2>&1
copy "%SOURCE%\pollin-vite.config.ts" "vite.config.ts" >nul 2>&1
copy "%SOURCE%\pollin-tailwind.config.js" "tailwind.config.js" >nul 2>&1
copy "%SOURCE%\pollin-prettier.config.js" "prettier.config.js" >nul 2>&1
copy "%SOURCE%\pollin-.eslintrc.json" ".eslintrc.json" >nul 2>&1
copy "%SOURCE%\pollin-.gitignore" ".gitignore" >nul 2>&1
copy "%SOURCE%\pollin-postcss.config.js" "postcss.config.js" >nul 2>&1
copy "%SOURCE%\pollin-.env.example" ".env.example" >nul 2>&1

REM Documentation files
copy "%SOURCE%\pollin-README.md" "README.md" >nul 2>&1
copy "%SOURCE%\pollin-AGENTS.md" "AGENTS.md" >nul 2>&1
copy "%SOURCE%\pollin-SECURITY.md" "SECURITY.md" >nul 2>&1
copy "%SOURCE%\pollin-ACCESSIBILITY.md" "ACCESSIBILITY.md" >nul 2>&1
copy "%SOURCE%\pollin-CONTRIBUTING.md" "CONTRIBUTING.md" >nul 2>&1
copy "%SOURCE%\pollin-DESIGN-TOKENS.md" "DESIGN-TOKENS.md" >nul 2>&1
copy "%SOURCE%\pollin-GOVERNANCE.md" "GOVERNANCE.md" >nul 2>&1

REM Public files
copy "%SOURCE%\pollin-public-index.html" "public\index.html" >nul 2>&1

REM Source files
copy "%SOURCE%\pollin-src-main.tsx" "src\main.tsx" >nul 2>&1
copy "%SOURCE%\pollin-src-App.tsx" "src\App.tsx" >nul 2>&1
copy "%SOURCE%\pollin-src-index.css" "src\index.css" >nul 2>&1

REM Components
copy "%SOURCE%\pollin-src-components-Canvas.tsx" "src\components\Canvas.tsx" >nul 2>&1
copy "%SOURCE%\pollin-src-components-ControlPanel.tsx" "src\components\ControlPanel.tsx" >nul 2>&1
copy "%SOURCE%\pollin-src-components-index.ts" "src\components\index.ts" >nul 2>&1

REM Hooks
copy "%SOURCE%\pollin-src-hooks-useCanvas.ts" "src\hooks\useCanvas.ts" >nul 2>&1
copy "%SOURCE%\pollin-src-hooks-useDrawing.ts" "src\hooks\useDrawing.ts" >nul 2>&1

REM Design & Types
copy "%SOURCE%\pollin-src-design-tokens.ts" "src\design\tokens.ts" >nul 2>&1
copy "%SOURCE%\pollin-src-types-canvas.ts" "src\types\canvas.ts" >nul 2>&1

echo ✓ Files copied successfully

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the dev server, run:
echo   npm run dev
echo.
echo The app will open at http://localhost:5173
echo.
