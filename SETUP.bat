@echo off
setlocal enabledelayedexpansion

REM Set up Pollin project in Documents\pollin
set "SOURCE_DIR=C:\Users\caespiritu\source"
set "POLLIN_DIR=C:\Users\caespiritu\Documents\pollin"

echo.
echo ╔════════════════════════════════════════════╗
echo ║   POLLIN SETUP SCRIPT FOR WINDOWS          ║
echo ╚════════════════════════════════════════════╝
echo.

REM Step 1: Create directory
echo [1/5] Creating pollin directory...
if not exist "!POLLIN_DIR!" (
    mkdir "!POLLIN_DIR!"
    echo ✅ Created: !POLLIN_DIR!
) else (
    echo ✅ Directory exists: !POLLIN_DIR!
)
echo.

REM Step 2: Copy files
echo [2/5] Copying files from source...
xcopy "!SOURCE_DIR!\*" "!POLLIN_DIR!\" /E /Y /Q >nul 2>&1
echo ✅ Files copied
echo.

REM Step 3: Navigate to directory
cd /d "!POLLIN_DIR!"
echo [3/5] Organizing files...

REM Create src subdirectories
if not exist "src\hooks\__tests__" mkdir "src\hooks\__tests__"
if not exist "src\components" mkdir "src\components"

REM Move hooks
if exist "pollin-src-hooks-useCanvasTransform.ts" move /Y "pollin-src-hooks-useCanvasTransform.ts" "src\hooks\useCanvasTransform.ts" >nul 2>&1
if exist "pollin-src-hooks-useHistory.ts" move /Y "pollin-src-hooks-useHistory.ts" "src\hooks\useHistory.ts" >nul 2>&1
if exist "pollin-src-hooks-useCanvasPersistence.ts" move /Y "pollin-src-hooks-useCanvasPersistence.ts" "src\hooks\useCanvasPersistence.ts" >nul 2>&1
if exist "pollin-src-hooks-useCanvasReferences.ts" move /Y "pollin-src-hooks-useCanvasReferences.ts" "src\hooks\useCanvasReferences.ts" >nul 2>&1
if exist "pollin-src-hooks-useCanvas.ts" move /Y "pollin-src-hooks-useCanvas.ts" "src\hooks\useCanvas.ts" >nul 2>&1
if exist "pollin-src-hooks-useDrawing.ts" move /Y "pollin-src-hooks-useDrawing.ts" "src\hooks\useDrawing.ts" >nul 2>&1

REM Move test files
if exist "pollin-src-hooks-__tests__-useCanvasTransform.test.ts" move /Y "pollin-src-hooks-__tests__-useCanvasTransform.test.ts" "src\hooks\__tests__\useCanvasTransform.test.ts" >nul 2>&1
if exist "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts" move /Y "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts" "src\hooks\__tests__\useCanvasPersistence.test.ts" >nul 2>&1

REM Move components
if exist "pollin-src-components-CanvasAdvanced.tsx" move /Y "pollin-src-components-CanvasAdvanced.tsx" "src\components\CanvasAdvanced.tsx" >nul 2>&1
if exist "pollin-src-components-PersistencePanel.tsx" move /Y "pollin-src-components-PersistencePanel.tsx" "src\components\PersistencePanel.tsx" >nul 2>&1
if exist "pollin-src-components-ReferencePanel.tsx" move /Y "pollin-src-components-ReferencePanel.tsx" "src\components\ReferencePanel.tsx" >nul 2>&1
if exist "pollin-src-components-ControlPanel.tsx" move /Y "pollin-src-components-ControlPanel.tsx" "src\components\ControlPanel.tsx" >nul 2>&1
if exist "pollin-src-components-Canvas.tsx" move /Y "pollin-src-components-Canvas.tsx" "src\components\Canvas.tsx" >nul 2>&1

REM Move src files
if exist "pollin-src-index.html" move /Y "pollin-src-index.html" "src\index.html" >nul 2>&1
if exist "pollin-src-index.css" move /Y "pollin-src-index.css" "src\index.css" >nul 2>&1
if exist "pollin-src-main.tsx" move /Y "pollin-src-main.tsx" "src\main.tsx" >nul 2>&1
if exist "pollin-src-App.tsx" move /Y "pollin-src-App.tsx" "src\App.tsx" >nul 2>&1
if exist "pollin-src-canvas.ts" move /Y "pollin-src-canvas.ts" "src\canvas.ts" >nul 2>&1
if exist "pollin-src-tokens.ts" move /Y "pollin-src-tokens.ts" "src\tokens.ts" >nul 2>&1

REM Move root config files
if exist "pollin-package.json" move /Y "pollin-package.json" "package.json" >nul 2>&1
if exist "pollin-tsconfig.json" move /Y "pollin-tsconfig.json" "tsconfig.json" >nul 2>&1
if exist "pollin-tsconfig.node.json" move /Y "pollin-tsconfig.node.json" "tsconfig.node.json" >nul 2>&1
if exist "pollin-vite.config.ts" move /Y "pollin-vite.config.ts" "vite.config.ts" >nul 2>&1
if exist "pollin-tailwind.config.js" move /Y "pollin-tailwind.config.js" "tailwind.config.js" >nul 2>&1
if exist "pollin-postcss.config.js" move /Y "pollin-postcss.config.js" "postcss.config.js" >nul 2>&1
if exist "pollin-prettier.config.js" move /Y "pollin-prettier.config.js" "prettier.config.js" >nul 2>&1
if exist "pollin-.eslintrc.json" move /Y "pollin-.eslintrc.json" ".eslintrc.json" >nul 2>&1
if exist "pollin-.gitignore" move /Y "pollin-.gitignore" ".gitignore" >nul 2>&1
if exist "pollin-.env.example" move /Y "pollin-.env.example" ".env.example" >nul 2>&1

echo ✅ Files organized
echo.

REM Step 4: Install dependencies
echo [4/5] Installing dependencies... ^(this may take 2-3 minutes^)
call npm install
echo ✅ Dependencies installed
echo.

REM Step 5: Start dev server
echo [5/5] Starting dev server...
echo.
echo ╔════════════════════════════════════════════╗
echo ║  ✅ SETUP COMPLETE!                        ║
echo ║                                            ║
echo ║  Dev server starting...                    ║
echo ║  Open your browser to:                     ║
echo ║                                            ║
echo ║  👉 http://localhost:5173                  ║
echo ║                                            ║
echo ║  Use TESTING-CHECKLIST.md to test all     ║
echo ║  features (save it or keep it open)       ║
echo ║                                            ║
echo ╚════════════════════════════════════════════╝
echo.

call npm run dev

pause
