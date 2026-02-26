@echo off
REM Fresh setup - creates folder and installs everything

setlocal enabledelayedexpansion

set "TARGET_DIR=C:\Users\caespiritu\Documents\pollin"
set "SOURCE_DIR=C:\Users\caespiritu\source"

cls
echo.
echo Creating Pollin folder and setting up project...
echo.

REM Create the folder
if not exist "!TARGET_DIR!" (
    mkdir "!TARGET_DIR!"
    echo ✅ Created folder: !TARGET_DIR!
) else (
    echo ✅ Folder already exists
)

REM Copy all source files
echo.
echo Copying files...
xcopy "!SOURCE_DIR!\*" "!TARGET_DIR!\" /E /Y /Q >nul 2>&1
echo ✅ Files copied

REM Organize files in the target directory
cd /d "!TARGET_DIR!"
echo.
echo Organizing project structure...

REM Create directories
if not exist "src\hooks\__tests__" mkdir "src\hooks\__tests__"
if not exist "src\components" mkdir "src\components"

REM Move files
for %%f in (pollin-src-hooks-*.ts) do (
    set "fname=%%~nf"
    set "fname=!fname:pollin-src-hooks-=!"
    if not "!fname:__tests__=!"=="!fname!" (
        move /Y "%%f" "src\hooks\__tests__\!fname!" >nul 2>&1
    ) else (
        move /Y "%%f" "src\hooks\!fname!" >nul 2>&1
    )
)

for %%f in (pollin-src-components-*.tsx) do (
    set "fname=%%~nf"
    set "fname=!fname:pollin-src-components-=!"
    move /Y "%%f" "src\components\!fname!" >nul 2>&1
)

for %%f in (pollin-src-*.tsx pollin-src-*.ts pollin-src-*.css pollin-src-*.html) do (
    set "fname=%%~nf"
    set "fname=!fname:pollin-src-=!"
    if exist "%%f" move /Y "%%f" "src\!fname!" >nul 2>&1
)

for %%f in (pollin-package.json pollin-tsconfig.json pollin-vite.config.ts pollin-tailwind.config.js pollin-postcss.config.js pollin-prettier.config.js pollin-.eslintrc.json pollin-.gitignore pollin-.env.example pollin-tsconfig.node.json) do (
    set "newname=%%~nf"
    set "newname=!newname:pollin-=!"
    if exist "%%f" move /Y "%%f" "!newname!" >nul 2>&1
)

echo ✅ Files organized

REM Install npm
echo.
echo Installing npm packages (this will take 2-3 minutes)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️ There were some warnings, but continuing...
)

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║  ✅ SETUP COMPLETE!                                   ║
echo ║                                                        ║
echo ║  Your Pollin project is ready at:                     ║
echo ║  !TARGET_DIR!
echo ║                                                        ║
echo ║  Starting dev server...                               ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Start dev server
call npm run dev

pause
