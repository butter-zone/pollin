# Pollin - Local Setup Instructions

## Quick Start

Since I can't directly set up files on your local machine, follow these steps:

### 1. Clone Your Repo
```bash
cd C:\Users\caespiritu
git clone https://github.com/butter-zone/pollin.git
cd pollin
```

### 2. Copy Project Files
Copy the content from the files below into your local `pollin` directory, creating the structure shown.

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Dev Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## Directory Structure

```
pollin/
├── public/
│   └── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Canvas.tsx
│   │   ├── ControlPanel.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCanvas.ts
│   │   └── useDrawing.ts
│   ├── design/
│   │   └── tokens.ts
│   └── types/
│       └── canvas.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── prettier.config.js
├── .eslintrc.json
├── .gitignore
└── .env.example
```

---

## File Contents

Below are all the files you need to create. Copy each section into its corresponding file.
