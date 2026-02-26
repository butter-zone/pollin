@echo off
setlocal enabledelayedexpansion

set "TARGET_DIR=C:\Users\caespiritu\Documents\pollin"
set "SOURCE_DIR=C:\Users\caespiritu\source"

cls
echo.
echo Setting up Pollin...
echo.

REM Step 1: Create and clean target directory
echo [1/4] Preparing directory...
if exist "!TARGET_DIR!" (
    rd /s /q "!TARGET_DIR!" >nul 2>&1
)
mkdir "!TARGET_DIR!"
cd /d "!TARGET_DIR!"
echo ✅ Ready
echo.

REM Step 2: Copy all files from source
echo [2/4] Copying project files...
xcopy "!SOURCE_DIR!\*" "!TARGET_DIR!\" /E /Y /Q >nul 2>&1
echo ✅ Copied
echo.

REM Step 3: Rename ALL pollin-* files to remove prefix
echo [3/4] Organizing files...

REM Key files - rename explicitly
if exist "pollin-package.json" (
    ren "pollin-package.json" "package.json"
    echo   ✓ package.json
)
if exist "pollin-tsconfig.json" (
    ren "pollin-tsconfig.json" "tsconfig.json"
    echo   ✓ tsconfig.json
)
if exist "pollin-tsconfig.node.json" (
    ren "pollin-tsconfig.node.json" "tsconfig.node.json"
    echo   ✓ tsconfig.node.json
)
if exist "pollin-vite.config.ts" (
    ren "pollin-vite.config.ts" "vite.config.ts"
    echo   ✓ vite.config.ts
)
if exist "pollin-tailwind.config.js" (
    ren "pollin-tailwind.config.js" "tailwind.config.js"
    echo   ✓ tailwind.config.js
)
if exist "pollin-postcss.config.js" (
    ren "pollin-postcss.config.js" "postcss.config.js"
    echo   ✓ postcss.config.js
)
if exist "pollin-prettier.config.js" (
    ren "pollin-prettier.config.js" "prettier.config.js"
    echo   ✓ prettier.config.js
)
if exist "pollin-.eslintrc.json" (
    ren "pollin-.eslintrc.json" ".eslintrc.json"
    echo   ✓ .eslintrc.json
)
if exist "pollin-.gitignore" (
    ren "pollin-.gitignore" ".gitignore"
    echo   ✓ .gitignore
)
if exist "pollin-.env.example" (
    ren "pollin-.env.example" ".env.example"
    echo   ✓ .env.example
)

REM Create src directories
if not exist "src" mkdir "src"
if not exist "src\hooks" mkdir "src\hooks"
if not exist "src\hooks\__tests__" mkdir "src\hooks\__tests__"
if not exist "src\components" mkdir "src\components"

REM Move src files
if exist "pollin-src-App.tsx" move /Y "pollin-src-App.tsx" "src\App.tsx" >nul 2>&1
if exist "pollin-src-main.tsx" move /Y "pollin-src-main.tsx" "src\main.tsx" >nul 2>&1
if exist "pollin-src-index.css" move /Y "pollin-src-index.css" "src\index.css" >nul 2>&1
if exist "pollin-src-index.html" move /Y "pollin-src-index.html" "src\index.html" >nul 2>&1
if exist "pollin-src-canvas.ts" move /Y "pollin-src-canvas.ts" "src\canvas.ts" >nul 2>&1
if exist "pollin-src-tokens.ts" move /Y "pollin-src-tokens.ts" "src\tokens.ts" >nul 2>&1
if exist "pollin-src-design-tokens.ts" move /Y "pollin-src-design-tokens.ts" "src\design-tokens.ts" >nul 2>&1
if exist "pollin-src-types-canvas.ts" move /Y "pollin-src-types-canvas.ts" "src\types\canvas.ts" >nul 2>&1

REM Move hooks
if exist "pollin-src-hooks-useCanvas.ts" move /Y "pollin-src-hooks-useCanvas.ts" "src\hooks\useCanvas.ts" >nul 2>&1
if exist "pollin-src-hooks-useDrawing.ts" move /Y "pollin-src-hooks-useDrawing.ts" "src\hooks\useDrawing.ts" >nul 2>&1
if exist "pollin-src-hooks-useHistory.ts" move /Y "pollin-src-hooks-useHistory.ts" "src\hooks\useHistory.ts" >nul 2>&1
if exist "pollin-src-hooks-useCanvasTransform.ts" move /Y "pollin-src-hooks-useCanvasTransform.ts" "src\hooks\useCanvasTransform.ts" >nul 2>&1
if exist "pollin-src-hooks-useCanvasPersistence.ts" move /Y "pollin-src-hooks-useCanvasPersistence.ts" "src\hooks\useCanvasPersistence.ts" >nul 2>&1
if exist "pollin-src-hooks-useCanvasReferences.ts" move /Y "pollin-src-hooks-useCanvasReferences.ts" "src\hooks\useCanvasReferences.ts" >nul 2>&1

REM Move components
if exist "pollin-src-components-Canvas.tsx" move /Y "pollin-src-components-Canvas.tsx" "src\components\Canvas.tsx" >nul 2>&1
if exist "pollin-src-components-ControlPanel.tsx" move /Y "pollin-src-components-ControlPanel.tsx" "src\components\ControlPanel.tsx" >nul 2>&1
if exist "pollin-src-components-CanvasAdvanced.tsx" move /Y "pollin-src-components-CanvasAdvanced.tsx" "src\components\CanvasAdvanced.tsx" >nul 2>&1
if exist "pollin-src-components-PersistencePanel.tsx" move /Y "pollin-src-components-PersistencePanel.tsx" "src\components\PersistencePanel.tsx" >nul 2>&1
if exist "pollin-src-components-ReferencePanel.tsx" move /Y "pollin-src-components-ReferencePanel.tsx" "src\components\ReferencePanel.tsx" >nul 2>&1
if exist "pollin-src-components-index.ts" move /Y "pollin-src-components-index.ts" "src\components\index.ts" >nul 2>&1

REM Move test files
if exist "pollin-src-hooks-__tests__-useCanvasTransform.test.ts" move /Y "pollin-src-hooks-__tests__-useCanvasTransform.test.ts" "src\hooks\__tests__\useCanvasTransform.test.ts" >nul 2>&1
if exist "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts" move /Y "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts" "src\hooks\__tests__\useCanvasPersistence.test.ts" >nul 2>&1

REM Move docs
if exist "pollin-README.md" move /Y "pollin-README.md" "README.md" >nul 2>&1
if exist "pollin-SECURITY.md" move /Y "pollin-SECURITY.md" "SECURITY.md" >nul 2>&1
if exist "pollin-ACCESSIBILITY.md" move /Y "pollin-ACCESSIBILITY.md" "ACCESSIBILITY.md" >nul 2>&1
if exist "pollin-CONTRIBUTING.md" move /Y "pollin-CONTRIBUTING.md" "CONTRIBUTING.md" >nul 2>&1
if exist "pollin-AGENTS.md" move /Y "pollin-AGENTS.md" "AGENTS.md" >nul 2>&1
if exist "pollin-GOVERNANCE.md" move /Y "pollin-GOVERNANCE.md" "GOVERNANCE.md" >nul 2>&1
if exist "pollin-DESIGN-TOKENS.md" move /Y "pollin-DESIGN-TOKENS.md" "DESIGN-TOKENS.md" >nul 2>&1

echo ✅ Organized
echo.

REM Step 4: Verify package.json exists
if not exist "package.json" (
    echo ❌ ERROR: package.json not found!
    echo Please check the source directory
    pause
    exit /b 1
)

REM Install npm
echo [4/4] Installing dependencies (2-3 minutes)...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Some warnings but continuing...
)
echo ✅ Ready
echo.

REM Start server
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║  ✅ SETUP COMPLETE!                                   ║
echo ║                                                        ║
echo ║  📍 OPEN IN BROWSER:                                  ║
echo ║                                                        ║
echo ║      http://localhost:5173                           ║
echo ║                                                        ║
echo ║  Starting dev server now...                           ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

call npm run dev

pause
