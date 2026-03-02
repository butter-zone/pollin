# Pollin

A web-based creative canvas for cross-pollinating design ideas, bringing together sketches, references, design systems, and UI concepts into a single, fluid workspace.

Inspired by tools like Stitch and Pencil, Pollin bridges the gap between exploration and production-ready UI.

## What Pollin Enables

🌱 **Cross-Pollinated Canvas**
- Spatial, freeform canvas for mixing ideas, references, and UI concepts
- Drag, cluster, and remix thoughts visually—no rigid frames required

🔗 **Connect Design Systems**
- Link or paste Figma files, libraries, and design system URLs
- Treat connected systems as live sources of truth, not static screenshots

✏️ **Sketch → UI**
- Freeform inking and sketching directly on the canvas
- Convert rough sketches into higher-fidelity UI components
- Progress naturally from napkin sketch → wireframe → polished interface

🖼 **Reference-Driven UI Creation**
- Drag and drop image references directly onto the canvas
- Right-click or prompt actions like "Make this" or "Turn this into UI"
- Translate visual inspiration into usable UI patterns

## Why Pollin

Pollin is not a whiteboard, and it's not a design tool replacement.
It's the connective tissue between inspiration, systems, and execution.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/butter-zone/pollin.git
cd pollin

# Install dependencies
npm install

# Configure environment (see below)
cp .env.example .env

# Start dev server
npm run dev
```

The app will open at `http://localhost:5173`

### Environment Setup

Pollin uses environment variables for LLM-powered UI generation and optional integrations. Copy the example file and add your keys:

```bash
cp .env.example .env
```

| Variable | Required | Description | Get it at |
|----------|----------|-------------|-----------|
| `VITE_OPENAI_API_KEY` | One of these | OpenAI API key (GPT models) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `VITE_ANTHROPIC_API_KEY` | One of these | Anthropic API key (Claude models) | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `VITE_CONVERSION_API_URL` | No | Remote conversion API endpoint | Defaults to `http://localhost:3000` |
| `VITE_FIGMA_TOKEN` | No | Figma personal access token for file import | [figma.com/developers/api](https://www.figma.com/developers/api#access-tokens) |

> **No keys?** The app runs in **mock mode** — all generation produces placeholder UI trees so you can explore the full workflow without an API key.

> **Security:** `.env` is git-ignored. Never commit API keys. See `SECURITY.md`.

### Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run lint      # Check code with ESLint
npm run lint:fix  # Auto-fix linting issues
npm run format    # Format code with Prettier
npm run test      # Run unit tests with Vitest
```

## Project Structure

```
pollin/
├── src/
│   ├── components/        # React components (Canvas, ControlPanel)
│   ├── hooks/            # Custom hooks (useCanvas, useDrawing)
│   ├── design/           # Design tokens and system
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.js        # Prettier configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── SECURITY.md           # Security standards (Cybersecurity, OPSEC, PERSEC)
├── ACCESSIBILITY.md      # Accessibility standards (WCAG AA)
├── AGENTS.md             # Rules for AI agents
├── CONTRIBUTING.md       # Contributing guidelines
├── DESIGN-TOKENS.md      # Design token documentation
├── GOVERNANCE.md         # How standards evolve
└── package.json          # Dependencies and scripts
```

## Standards

Pollin is built with strong standards for quality, security, and accessibility.

### Security

See `SECURITY.md` for baseline security expectations:
- **Cybersecurity** — Protecting systems
- **OPSEC** — Protecting information and behaviors
- **PERSEC** — Protecting people

### Accessibility

See `ACCESSIBILITY.md` for WCAG AA compliance:
- Semantic HTML and keyboard navigation
- Visible focus states and color contrast
- Screen reader support
- No color-only feedback

### Design System

See `DESIGN-TOKENS.md` for token definitions:
- Color roles (surface, accent)
- Typography scale
- Spacing scale
- Shadows and elevation

### Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Fast build tool and dev server
- **TailwindCSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Canvas API** — Drawing surface
- **ESLint + Prettier** — Code quality

## Design Philosophy

- Design is nonlinear
- Ideas grow better together
- Systems should enable creativity, not constrain it
- Accessibility and security are non-negotiable
- Long-term maintainability over short-term trends

## Status

🚧 **Early-stage exploration and prototyping**  
📐 **Design-system-first mindset**  
♿ **Accessibility-aware by default**

## Control Panel Inspiration

The canvas includes a floating control panel by [Josh Puckett's DialKit](https://joshpuckett.me/dialkit), allowing real-time tuning of:
- Drawing tools (pen, eraser, select)
- Line width and color
- Canvas parameters

## Roadmap

- [ ] MVP canvas with sketching
- [ ] Floating control panel for tool tuning
- [ ] Design system reference integration
- [ ] Figma file import
- [ ] Collaboration features
- [ ] Export and persistence
- [ ] Mobile support

## License

MIT — See LICENSE file

## Questions?

Open an issue or discussion. See `GOVERNANCE.md` for how decisions are made.
