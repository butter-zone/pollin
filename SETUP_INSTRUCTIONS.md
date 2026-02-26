# Pollin Setup Instructions

## Option 1: Automated Setup (Recommended for Windows)

1. Open Command Prompt or PowerShell
2. Run the setup script from `C:\Users\caespiritu\source\`:

```cmd
setup-pollin.bat
```

This will:
- Clone the Pollin repo (if not already cloned)
- Create directory structure
- Copy all project files
- Run `npm install`

Then start the dev server:
```bash
npm run dev
```

---

## Option 2: Manual Setup (Step-by-Step)

### 1. Clone Repository
```bash
cd C:\Users\caespiritu
git clone https://github.com/butter-zone/pollin.git
cd pollin
```

### 2. Create Directory Structure
```bash
mkdir public
mkdir src\components
mkdir src\hooks
mkdir src\design
mkdir src\types
```

### 3. Copy Files

Copy from `C:\Users\caespiritu\source\` → `pollin/` directory:

**Root files** (rename, removing `pollin-` prefix):
```
pollin-package.json → package.json
pollin-tsconfig.json → tsconfig.json
pollin-tsconfig.node.json → tsconfig.node.json
pollin-vite.config.ts → vite.config.ts
pollin-tailwind.config.js → tailwind.config.js
pollin-prettier.config.js → prettier.config.js
pollin-.eslintrc.json → .eslintrc.json
pollin-.gitignore → .gitignore
pollin-postcss.config.js → postcss.config.js
pollin-.env.example → .env.example
```

**Documentation** (rename, removing `pollin-` prefix):
```
pollin-README.md → README.md
pollin-AGENTS.md → AGENTS.md
pollin-SECURITY.md → SECURITY.md
pollin-ACCESSIBILITY.md → ACCESSIBILITY.md
pollin-CONTRIBUTING.md → CONTRIBUTING.md
pollin-DESIGN-TOKENS.md → DESIGN-TOKENS.md
pollin-GOVERNANCE.md → GOVERNANCE.md
```

**Source files** (rename, removing `pollin-src-` prefix and replace `/` with `\`):
```
pollin-public-index.html → public/index.html
pollin-src-main.tsx → src/main.tsx
pollin-src-App.tsx → src/App.tsx
pollin-src-index.css → src/index.css
pollin-src-components-Canvas.tsx → src/components/Canvas.tsx
pollin-src-components-ControlPanel.tsx → src/components/ControlPanel.tsx
pollin-src-components-index.ts → src/components/index.ts
pollin-src-hooks-useCanvas.ts → src/hooks/useCanvas.ts
pollin-src-hooks-useDrawing.ts → src/hooks/useDrawing.ts
pollin-src-design-tokens.ts → src/design/tokens.ts
pollin-src-types-canvas.ts → src/types/canvas.ts
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Dev Server
```bash
npm run dev
```

---

## Verification Checklist

After `npm run dev` starts, you should see:

- ✅ Vite dev server running on `http://localhost:5173`
- ✅ Browser opens automatically
- ✅ Dark canvas area (left side)
- ✅ Control panel (right side) with:
  - 🎨 Drawing toggle button
  - Tool selector (pen/eraser/select)
  - Line width slider
  - Color picker
  - Preset color buttons
  - Clear Canvas button
- ✅ "Pollin" title in top-left with tagline

---

## Test Drawing

1. Click **🎨 Drawing** button (should turn blue)
2. Click and drag on canvas to draw
3. Change colors and line width
4. Clear and repeat
5. Verify smooth drawing with no lag

---

## Troubleshooting

### Port 5173 in use
```bash
npm run dev -- --port 5174
```

### Module errors
Ensure all directories exist: `src/`, `src/components/`, `src/hooks/`, `src/design/`, `src/types/`, `public/`

### npm install fails
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then retry

### ESLint errors
```bash
npm run lint:fix
```

### Prettier formatting
```bash
npm run format
```

---

## Next Steps

Once dev server is running and drawing works:

1. ✅ Test all control panel features
2. ✅ Verify accessibility (Tab through controls, check focus states)
3. ✅ Check that colors and line widths update in real-time
4. → Plan additional features (design system import, collaboration, etc.)

---

## Project Structure

```
pollin/
├── src/
│   ├── App.tsx              # Main app layout
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles + Tailwind
│   ├── components/
│   │   ├── Canvas.tsx       # Drawing surface
│   │   ├── ControlPanel.tsx # Floating UI panel
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCanvas.ts     # State management
│   │   └── useDrawing.ts    # Canvas event handling
│   ├── design/
│   │   └── tokens.ts        # Design tokens
│   └── types/
│       └── canvas.ts        # TypeScript types
├── public/
│   └── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── SECURITY.md
├── ACCESSIBILITY.md
├── AGENTS.md
├── CONTRIBUTING.md
├── DESIGN-TOKENS.md
├── GOVERNANCE.md
└── README.md
```

---

Questions? Check documentation files or test with `npm run dev`.
