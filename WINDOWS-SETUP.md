# Windows Setup — Copy & Run (3 Steps)

## 📍 First: Open PowerShell

Press `Win + X` and select **Windows PowerShell** (or search for PowerShell)

## 🚀 Step 1: Navigate to Your Pollin Repo

```powershell
cd C:\path\to\your\pollin
```

**Example:** If your repo is at `C:\Users\caespiritu\code\pollin`, type:
```powershell
cd C:\Users\caespiritu\code\pollin
```

(Replace with your actual pollin directory path)

## 📦 Step 2: Copy All Files from Source

Paste this entire command into PowerShell and press Enter:

```powershell
Copy-Item "C:\Users\caespiritu\source\*" -Destination . -Recurse -Force
```

**What it does:**
- Copies all 39 files from source to your repo
- Keeps folder structure
- Overwrites existing files

**Wait for it to complete** (should be instant)

## 🏗️ Step 3: Rename & Organize Files

Paste this entire script into PowerShell and press Enter:

```powershell
# Create src subdirectories
New-Item -ItemType Directory -Path "src\hooks\__tests__" -Force | Out-Null
New-Item -ItemType Directory -Path "src\components" -Force | Out-Null

# Move hooks
if (Test-Path "pollin-src-hooks-useCanvasTransform.ts") {
    Move-Item "pollin-src-hooks-useCanvasTransform.ts" "src\hooks\useCanvasTransform.ts" -Force
}
if (Test-Path "pollin-src-hooks-useHistory.ts") {
    Move-Item "pollin-src-hooks-useHistory.ts" "src\hooks\useHistory.ts" -Force
}
if (Test-Path "pollin-src-hooks-useCanvasPersistence.ts") {
    Move-Item "pollin-src-hooks-useCanvasPersistence.ts" "src\hooks\useCanvasPersistence.ts" -Force
}
if (Test-Path "pollin-src-hooks-useCanvasReferences.ts") {
    Move-Item "pollin-src-hooks-useCanvasReferences.ts" "src\hooks\useCanvasReferences.ts" -Force
}

# Move components
if (Test-Path "pollin-src-components-CanvasAdvanced.tsx") {
    Move-Item "pollin-src-components-CanvasAdvanced.tsx" "src\components\CanvasAdvanced.tsx" -Force
}
if (Test-Path "pollin-src-components-PersistencePanel.tsx") {
    Move-Item "pollin-src-components-PersistencePanel.tsx" "src\components\PersistencePanel.tsx" -Force
}
if (Test-Path "pollin-src-components-ReferencePanel.tsx") {
    Move-Item "pollin-src-components-ReferencePanel.tsx" "src\components\ReferencePanel.tsx" -Force
}
if (Test-Path "pollin-src-components-ControlPanel.tsx") {
    Move-Item "pollin-src-components-ControlPanel.tsx" "src\components\ControlPanel.tsx" -Force
}
if (Test-Path "pollin-src-components-Canvas.tsx") {
    Move-Item "pollin-src-components-Canvas.tsx" "src\components\Canvas.tsx" -Force
}

# Move test files
if (Test-Path "pollin-src-hooks-__tests__-useCanvasTransform.test.ts") {
    Move-Item "pollin-src-hooks-__tests__-useCanvasTransform.test.ts" "src\hooks\__tests__\useCanvasTransform.test.ts" -Force
}
if (Test-Path "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts") {
    Move-Item "pollin-src-hooks-__tests__-useCanvasPersistence.test.ts" "src\hooks\__tests__\useCanvasPersistence.test.ts" -Force
}

# Move other src files
if (Test-Path "pollin-src-hooks-useCanvas.ts") {
    Move-Item "pollin-src-hooks-useCanvas.ts" "src\hooks\useCanvas.ts" -Force
}
if (Test-Path "pollin-src-hooks-useDrawing.ts") {
    Move-Item "pollin-src-hooks-useDrawing.ts" "src\hooks\useDrawing.ts" -Force
}
if (Test-Path "pollin-src-index.html") {
    Move-Item "pollin-src-index.html" "src\index.html" -Force
}
if (Test-Path "pollin-src-index.css") {
    Move-Item "pollin-src-index.css" "src\index.css" -Force
}
if (Test-Path "pollin-src-main.tsx") {
    Move-Item "pollin-src-main.tsx" "src\main.tsx" -Force
}
if (Test-Path "pollin-src-App.tsx") {
    Move-Item "pollin-src-App.tsx" "src\App.tsx" -Force
}
if (Test-Path "pollin-src-canvas.ts") {
    Move-Item "pollin-src-canvas.ts" "src\canvas.ts" -Force
}
if (Test-Path "pollin-src-tokens.ts") {
    Move-Item "pollin-src-tokens.ts" "src\tokens.ts" -Force
}

# Rename root config files
if (Test-Path "pollin-package.json") {
    Move-Item "pollin-package.json" "package.json" -Force
}
if (Test-Path "pollin-tsconfig.json") {
    Move-Item "pollin-tsconfig.json" "tsconfig.json" -Force
}
if (Test-Path "pollin-tsconfig.node.json") {
    Move-Item "pollin-tsconfig.node.json" "tsconfig.node.json" -Force
}
if (Test-Path "pollin-vite.config.ts") {
    Move-Item "pollin-vite.config.ts" "vite.config.ts" -Force
}
if (Test-Path "pollin-tailwind.config.js") {
    Move-Item "pollin-tailwind.config.js" "tailwind.config.js" -Force
}
if (Test-Path "pollin-postcss.config.js") {
    Move-Item "pollin-postcss.config.js" "postcss.config.js" -Force
}
if (Test-Path "pollin-prettier.config.js") {
    Move-Item "pollin-prettier.config.js" "prettier.config.js" -Force
}
if (Test-Path "pollin-.eslintrc.json") {
    Move-Item "pollin-.eslintrc.json" ".eslintrc.json" -Force
}
if (Test-Path "pollin-.gitignore") {
    Move-Item "pollin-.gitignore" ".gitignore" -Force
}
if (Test-Path "pollin-.env.example") {
    Move-Item "pollin-.env.example" ".env.example" -Force
}

Write-Host "✅ All files organized!" -ForegroundColor Green
```

**Wait for completion** (should be instant)

## 🎯 Step 4: Install Dependencies

```powershell
npm install
```

**This will take 1-3 minutes.** Wait for it to finish.

## 🚀 Step 5: Start Dev Server

```powershell
npm run dev
```

**You'll see output like:**
```
  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

## 🌐 Open Your Browser

**Click or copy-paste this URL into your browser:**
```
http://localhost:5173
```

🎉 **You should see your Pollin canvas!**

---

## ✅ Now Test

Open the file in your repo:
```
TESTING-CHECKLIST.md
```

Follow the checklist to test:
- ✅ Phase 1: Zoom, pan, grid, undo/redo
- ✅ Phase 2: Save/load, autosave, export
- ✅ Phase 3: Image import, transforms

---

## 🆘 If Something Fails

### Error: "npm: The term 'npm' is not recognized"
**You need Node.js installed.** Download from https://nodejs.org/ (use LTS version)

### Error: "Copy-Item: No match found"
**The source folder path might be wrong.** Verify `C:\Users\caespiritu\source\` exists and has files

### Error during `npm install`
```powershell
npm cache clean --force
rm -r node_modules
npm install
```

### Dev server won't start
```powershell
# Try a different port
npm run dev -- --port 3000
```

---

## 📞 All Set?

When dev server is running at `http://localhost:5173`, you're ready to test!

**Reply when you see the canvas** ✨
