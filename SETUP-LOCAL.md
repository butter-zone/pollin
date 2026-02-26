# 🚀 Getting Started — Copy Files & Test Locally

You have everything ready in `C:\Users\caespiritu\source\`. Here's how to get it into your local pollin repo and start testing.

## Step 1: Set Up Your Local Repo

If you don't already have your Pollin repo cloned locally:

```bash
# Clone your private GitHub repo
git clone https://github.com/YOUR-USERNAME/pollin.git
cd pollin
```

## Step 2: Copy All Files from Source

Copy all files from `C:\Users\caespiritu\source\` to your local pollin directory:

### On Windows (PowerShell):
```powershell
# Navigate to your pollin repo
cd C:\path\to\your\pollin

# Copy all files (adjust source path as needed)
Copy-Item "C:\Users\caespiritu\source\*" -Destination . -Recurse -Force
```

### On Windows (Command Prompt):
```cmd
cd C:\path\to\your\pollin
xcopy "C:\Users\caespiritu\source\*" . /E /Y
```

### On Mac/Linux:
```bash
cd /path/to/your/pollin
cp -r /mnt/c/Users/caespiritu/source/* .
```

## Step 3: File Organization (Important!)

After copying, you'll have files like `pollin-src-hooks-useCanvasTransform.ts`.

**You need to rename/move them to the correct structure:**

```bash
# Create directory structure if it doesn't exist
mkdir -p src/hooks src/components src/__tests__

# Move files to correct locations (examples):
mv pollin-src-hooks-useCanvasTransform.ts src/hooks/useCanvasTransform.ts
mv pollin-src-hooks-useHistory.ts src/hooks/useHistory.ts
mv pollin-src-components-CanvasAdvanced.tsx src/components/CanvasAdvanced.tsx
# ... and so on for other src files
```

**Alternative: Easier Rename Script**

Create a file `rename-files.bat` in your pollin directory and run it:

```batch
@echo off
REM Rename and move Phase 1 files
ren "pollin-src-hooks-useCanvasTransform.ts" "useCanvasTransform.ts"
move /Y "useCanvasTransform.ts" "src\hooks\"

ren "pollin-src-hooks-useHistory.ts" "useHistory.ts"
move /Y "useHistory.ts" "src\hooks\"

REM ... add more as needed
```

## Step 4: Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The dev server will start at `http://localhost:5173` (or similar).

**Open that URL in your browser** ← **This is your link!**

## Step 5: Start Testing

Open `TESTING-CHECKLIST.md` in your repo and follow the checklist:

1. ✅ Test Phase 1 features (zoom, pan, grid, undo/redo)
2. ✅ Test Phase 2 features (save/load, export, autosave)
3. ✅ Test Phase 3 features (image import, transforms)

---

## Quick File Mapping Reference

```
pollin-src-hooks-useCanvasTransform.ts        → src/hooks/useCanvasTransform.ts
pollin-src-hooks-useHistory.ts                → src/hooks/useHistory.ts
pollin-src-components-CanvasAdvanced.tsx      → src/components/CanvasAdvanced.tsx
pollin-src-hooks-useCanvasPersistence.ts      → src/hooks/useCanvasPersistence.ts
pollin-src-components-PersistencePanel.tsx    → src/components/PersistencePanel.tsx
pollin-src-hooks-useCanvasReferences.ts       → src/hooks/useCanvasReferences.ts
pollin-src-components-ReferencePanel.tsx      → src/components/ReferencePanel.tsx
pollin-src-hooks-__tests__-*.test.ts          → src/hooks/__tests__/
pollin-package.json                           → package.json
pollin-tsconfig.json                          → tsconfig.json
pollin-vite.config.ts                         → vite.config.ts
pollin-tailwind.config.js                     → tailwind.config.js
[... and all other root-level files ...]
```

---

## Troubleshooting

### npm install fails
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Dev server won't start
```bash
# Make sure you have Node.js 16+ installed
node --version

# Try running on a different port
npm run dev -- --port 3000
```

### Tests failing
```bash
# Make sure all files are in correct locations
# Run tests to see which are failing
npm run test

# Then check PHASE-*-REVIEW.md files for test guidance
```

---

## Once You're Up & Running

1. **Open http://localhost:5173** in your browser
2. **Test using TESTING-CHECKLIST.md** (step-by-step)
3. **Report any bugs or feedback**
4. **Approve when satisfied** → I'll provide git commands to commit

---

## Questions?

- **How do I run a specific test?** → `npm run test -- useCanvasTransform.test.ts`
- **How do I lint the code?** → `npm run lint`
- **How do I format code?** → `npm run format`
- **Where are the docs?** → Check `PHASE-*-REVIEW.md` files in your repo

---

**That's it!** Once dev server is running, you're ready to test. 🚀

Let me know when you have any issues or when you're ready to start testing!
