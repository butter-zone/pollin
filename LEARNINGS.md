# Learnings

Notes on what worked, what didn't, and what we'd carry forward — compiled from building Pollin over Feb 25–28, 2026.

---

## Starting lean

The initial scaffold came with ~50 extra files — setup scripts, phase review docs, governance templates, unused components. The first real move was deleting all of it. That single cleanup commit removed more code than the rest of the project would ever contain.

**Takeaway:** Start with less. Boilerplate that "might be useful later" creates noise now. It's easier to add a doc when you need it than to maintain 15 you don't.

---

## Refs over state for real-time interaction

Canvas drawing needs to track pointer position, drag origins, panning state, and shape previews — all of which change on every `pointermove` event. Storing these in `useState` would trigger a React re-render per pixel moved.

The solution: keep all transient interaction state in `useRef` and only push committed objects through `dispatch`. Rendering is scheduled explicitly via `requestAnimationFrame`, not driven by React's reconciliation.

**Takeaway:** React's reactive model is great for UI, but for high-frequency interactions (drawing, dragging, animations), refs + manual RAF scheduling avoids the render tax entirely.

---

## Snapshot undo is simple until it isn't

We chose full-state snapshots for undo/redo (capped at 50). This is dead simple — push the current `{objects, selectedIds}` before every mutation, pop to restore. No command pattern, no inverse operations.

The gotcha: `onUpdateObject` fires during drag, so moving an object across the canvas can push dozens of snapshots in a single gesture. A "begin/end transaction" pattern or debounce would tighten this up.

**Takeaway:** Full-snapshot undo trades memory for correctness. It's the right first choice for a prototype, but plan for coalescing rapid mutations before it gets expensive.

---

## OKLCH was worth the migration

We moved the entire color system from hex to OKLCH (`oklch(L C H)`). The payoff:

- **Perceptually uniform** — adjusting lightness actually looks like adjusting lightness, unlike HSL
- **Surface hierarchy** — five surface levels step cleanly from 0.145 → 0.32 lightness without muddy middle tones
- **Consistent accent** — the accent blue `oklch(0.67 0.185 55)` holds across backgrounds

The migration touched both CSS custom properties and the TypeScript design tokens file.

**Takeaway:** OKLCH is the right default for dark UI color systems. The perceptual uniformity pays off in systematic surface/border scales.

---

## Magnetic grid dots: the detail that sells it

The grid isn't just visual — dots within a 5-cell radius of the cursor pull toward it, grow up to 2.2×, and brighten from 0.15 → 0.55 opacity using smoothstep easing (`t² × (3 - 2t)`). Non-magnetic dots are batched into a single `beginPath()/fill()` call; only magnetic dots need individual styling.

One bug: dots at viewport edges would clip when magnetically displaced outward. Fixed by insetting the grid bounds by `0.5 × gridSize`.

**Takeaway:** Small ambient polish (breathing grids, magnetic attraction) creates a feeling of craft that's disproportionate to the implementation effort. Batch the common case; individualize only what needs it.

---

## Prompt-first, draw-second

The default panel mode is the LLM prompt, not the drawing tools. Selecting a drawing tool auto-switches to draw mode; returning to prompt mode resets to the select tool. This makes the AI prompt the front door and drawing a deliberate side quest.

**Takeaway:** Let the UX default reflect the product thesis. If the vision is AI-assisted design, make the AI the starting point, not a buried feature.

---

## Mock APIs with real structure

The conversion service (`convertToUI`, `generateFromPrompt`) is wired to hit a real endpoint via `VITE_CONVERSION_API_URL`, but falls back to mock responses with simulated latency (1500–1800ms). This means the full prompt → generation → result UX loop works without a backend.

**Takeaway:** Stub at the service layer, not the UI. The app exercises real loading states, error handling, and result rendering without a server.

---

## CSS custom properties over CSS-in-JS

All theming runs through CSS custom properties (`--c-bg`, `--c-surface-1`, `--c-accent`, `--dur`, `--ease`). Components use hand-written CSS with namespace prefixes (`dk-*` for DialKit controls, `pp-*` for prompt panel, `cv-*` for conversion, `ctx-*` for context menu).

At ~1700 lines, a single `index.css` covers everything. It works fine at this scale but would benefit from splitting by feature if the project grows.

**Takeaway:** CSS custom properties + namespaced classes give you fast, debuggable, zero-runtime theming. Skip CSS-in-JS until you need dynamic per-instance styling.

---

## Speech-to-text needs a fallback story

Web Speech API isn't universally available. The hook detects `SpeechRecognition` / `webkitSpeechRecognition`, handles interim vs final transcripts, and maps error codes to actionable messages. For unsupported browsers, it suggests Handy as a system-level alternative.

**Takeaway:** Browser APIs with spotty support need explicit detection, graceful degradation, and a suggested alternative — not just a disabled button.

---

## Discriminated unions pay for themselves

Canvas objects use a `kind` discriminant (`'stroke' | 'rect' | 'ellipse' | 'line' | 'image'`). Every rendering path, hit test, and bounds calculation is an exhaustive `switch` on `kind`. TypeScript catches missing cases at compile time.

**Takeaway:** For any type that fans out into different shapes, use discriminated unions. The compiler does the bookkeeping for you.

---

## Accessibility from day one

`role="toolbar"`, `role="menu"`, `role="switch"`, `aria-pressed`, `aria-label`, `aria-checked` throughout. Visible focus states. Keyboard shortcuts for every tool. It's not WCAG AAA, but the foundations are wired in from the first commits, not bolted on later.

**Takeaway:** Adding `aria-*` attributes as you build costs almost nothing. Retrofitting them later costs a lot.

---

## GSAP over CSS for choreographed motion

CSS transitions/keyframes work for isolated A→B animations but fall apart when you need sequencing, staggered timing, or physics-like easing. We moved quote cycling and logo hover effects to GSAP — the API (`gsap.to`, `gsap.fromTo`, `timeline`) maps directly to the animation intent instead of wrestling with `@keyframes` percentages.

The logo hover is a good example: eight SVG circles scatter outward on mouseEnter with randomized angles and distances, then float back with `elastic.out` easing on mouseLeave. Doing this in CSS would require 8 individual keyframes with hardcoded values. GSAP makes it a loop.

**Takeaway:** Use CSS for simple hover/transition states. Reach for GSAP when animations need randomization, sequencing, or physics-based easing.

---

## Clamp animation bounds, not just positions

The logo scatter initially pushed circles outside the SVG viewBox, causing visual cropping. The fix: clamp each circle's `cx` and `cy` by its own radius (`max(r, min(viewBoxWidth - r, cx))`), not just by the viewBox edges. This ensures no circle edge extends past the boundary.

**Takeaway:** When animating elements with area (circles, rects), bounds-checking must account for the element's size, not just its center point.

---

## Progressive reasoning steps sell latency

AI generation has a perceived wait time problem. We added 5 progressive reasoning steps (Analyzing → Classifying → Theming → Layout → Rendering) that fire during the mock generation delay. Each step appears with a brief label and contextual detail. The same total wait time *feels* shorter because the user sees continuous progress.

**Takeaway:** Break opaque waits into visible micro-steps. Even if the steps are cosmetic, showing progress dramatically improves perceived performance.

---

## Default tool state must match default panel mode

A subtle bug: the default panel was `'prompt'` mode but the default active tool was `'pen'`. Clicking the canvas after generation tried to draw instead of select. Fixed by aligning the initial tool to `'select'`, and auto-switching to `'select'` after image placement.

**Takeaway:** Verify that initial state combinations make sense together. Defaults that were set independently can conflict when the app's modes interact.

---

## Prune deps before they calcify

The second cleanup pass caught: `framer-motion` (zero imports), `tailwindcss` + `postcss` + `autoprefixer` (no utility classes used — only the CSS reset), an unused `design-tokens.ts`, a dead barrel file, and a `terser` minifier reference without the package installed. Total: 831 lines removed across 10 files.

The Tailwind removal was notable — it had been carried since scaffold, providing only a CSS reset that we replaced with 15 lines of hand-written reset. Three npm packages and two config files for 15 lines of functionality.

**Takeaway:** Audit deps regularly. Packages carried from scaffolding accumulate config surface area that outlasts their usefulness. If you're only using a framework for its reset, you don't need the framework.

---

## QuadTree spatial indexing pays off immediately

Hit testing was O(n) — reverse-scan every object on every click. Replaced with a custom QuadTree (20,000×20,000 world bounds, depth 8, 8 items per leaf). `syncSpatialIndex()` lazily rebuilds when the `objects` array reference changes. Hit testing now does broadphase spatial query → narrowphase rotation-aware bounds check. For a canvas with hundreds of objects, the difference is measurable.

The key insight: don't rebuild the tree on every frame. Rebuild on structural changes (add/remove/move objects), and let `queryPoint()` do the work per interaction.

**Takeaway:** Spatial indices are worth adding proactively. The code is ~360 lines, mostly bookkeeping, and it turns O(n) hit testing into O(log n) with near-zero per-frame cost.

---

## Content-addressed IndexedDB beats base64 in undo stacks

Base64 data URIs in canvas state snapshots meant each undo step could be megabytes for image-heavy scenes. Replaced with content-addressed IndexedDB storage: `storeImage(dataUrl)` → SHA-256 hash → `pollin-img://abc123` reference. Undo snapshots now store lightweight string refs. `loadImage(ref)` resolves them with an LRU cache (20 entries).

Six insertion paths needed wiring: file drops on canvas, component drag-to-canvas, library component select, clipboard paste, AI generation output, and attachment-to-canvas. Missing even one creates an inconsistency where some images are refs and others are inline base64.

**Takeaway:** Identify *every* data ingestion path before wiring storage. Content-addressed storage naturally deduplicates — the same image dropped twice stores once.

---

## Code splitting via manualChunks is surgical

Vite warned about a 1,489 KB chunk. Three lines of `manualChunks` config split it into four: `index` (270 KB), `canvas-engine` (273 KB), `whisper` (873 KB), `gsap` (70 KB). The whisper chunk is large but only loads when speech-to-text is activated — it never blocks initial render.

The grouping logic: match module paths containing `@huggingface` → whisper chunk, canvas/hooks/services paths → canvas-engine chunk, `gsap` → gsap chunk. Everything else falls to index.

**Takeaway:** Before reaching for dynamic `import()`, check if `manualChunks` solves the problem. It's zero-refactor and directly controls what loads together.

---

## Snap guides need zoom-independent rendering

Snap guides (edge-to-edge and center alignment) render as dashed lines across the full canvas extent. The visual weight must be constant regardless of zoom level — a 1px dash at 3× zoom looks like 3px. Fix: divide line width and dash lengths by the current zoom factor before drawing.

Implementation: `computeSnap()` returns `{dx, dy, guides}` where `dx`/`dy` are the snapped deltas to apply to the dragged object, and `guides` is an array of `{axis, pos, from, to}` segments. The Canvas render loop draws them after normal objects but before the final `ctx.restore()`.

**Takeaway:** Any overlay drawn in world coordinates (selection handles, alignment guides, grid) must counter-scale by zoom to maintain consistent screen-space appearance.

---

## STT auto-fallback is better than STT configuration

The original speech-to-text hook exposed a "backend" toggle (native vs Whisper). Users don't care which engine runs — they want the mic button to work. Rewrote the flow: start with native Web Speech API, and if it errors with `network` or `service-not-allowed`, silently pivot to Whisper. The UI shows a small "Live" or "Whisper" badge so power users can see what's running, but selection is automatic.

Other STT fixes: `OfflineAudioContext` has poor codec support in some browsers — switching to real `AudioContext` with forced 16 kHz resampling fixed silent transcriptions. Added `pickMimeType()` to negotiate the best recording format. Added `testMicrophone()` to verify capture → decode before a real recording session.

**Takeaway:** Auto-fallback with visibility is better than manual selection. Users should see what's happening, not decide what should happen.

---

## Alias tables beat if-else chains

The component preview renderer originally used a 35-branch `if-else` chain to map component names to render functions. Every new component or synonym required a new branch, and the pattern hid the full mapping behind imperative control flow.

Replaced with a flat `GENERIC_RENDERERS` lookup table — 100+ component name aliases → renderer function. Adding a new alias is one line. The lookup is O(1) instead of O(n). A separate `LIBRARY_ALIASES` table (70+ entries) routes any design system name to the closest built-in visual match, so users can paste "Chakra UI" or "Primer" and get a reasonable preview without a dedicated renderer.

**Takeaway:** When the logic is "match a string to a handler," use a Record/Map. If-else chains are write-once-read-never; lookup tables are self-documenting and trivially extensible.

---

## Six built-in libraries, infinite custom sources

We started by adding registry entries for every popular design system (Chakra, Bootstrap, Carbon, Spectrum, Polaris, Primer). This bloated `library-registry.ts` by ~200 lines of component lists that were never rendered with unique visual DNA — they all routed through `LIBRARY_ALIASES` to the same 6 built-in renderers anyway.

Trimmed to 6 curated built-in libraries: Ant Design, Apple Liquid Glass, Fluent UI, Material UI 3, Radix UI, shadcn/ui. The alias knowledge is retained in `component-preview.ts` so custom source URLs still resolve correctly.

**Takeaway:** Don't ship registry data you can't visually differentiate. Keep the alias mapping (knowledge) but gate the UI exposure (entries) to what you can actually render distinctly.

---

## Delete dead code before it becomes "legacy"

A single audit pass found: `layout-templates.ts` (511 lines, zero imports), `KeyboardShortcuts.tsx` (251 lines, shortcuts handled inline in App.tsx), `getSupportedLibraries()` (exported, never called), and four `export` keywords on internal-only functions. Total: ~960 lines removed, 10 KB off the gzipped bundle.

The dynamic-vs-static import mismatch was a subtler form of debt. `ui-templates.ts` was dynamically imported by `conversion.ts` and `ui-renderer.ts` for tree-shaking, but statically imported by `App.tsx` and `Canvas.tsx` — so the dynamic imports provided zero benefit while generating build warnings. Standardizing to static imports eliminated both warnings.

**Takeaway:** Dead code doesn't hurt performance much, but it hurts comprehension. `export` keywords on internal functions, files with zero imports, and dynamic imports that can't actually split — these are signals to prune. Run the audit before they become "that file nobody touches."

---

## Ambient effects need a kill switch

The magnetic grid dot animation (cursor-following pull + glow) is delightful on an empty canvas — it rewards exploration and signals interactivity. But once objects exist or the user is in draw mode, it becomes a distraction: every `pointermove` triggers a `scheduleRender()` to update dots that the user isn't looking at, and the visual noise competes with actual content.

Fix: pass `null` as cursor to `drawGrid()` when `activeTool` is a draw tool or `objects.length > 0`. The grid dots still render (they're useful for alignment), but the magnetic animation stops. The `scheduleRender()` calls on hover and pointer-leave are also gated on the same condition.

**Takeaway:** Ambient polish should degrade gracefully as the workspace fills up. An effect that helps on an empty canvas can hurt on a busy one. Gate animations on context, not just a global toggle.

---

## Subagent delegation scales file creation

Three new service files (quadtree.ts, image-store.ts, component-preview.ts) were created by parallel subagents in a single round. Each subagent received: the type definitions, the design standards, and a clear interface contract. Integration (wiring into Canvas.tsx, App.tsx) was done in the main agent where cross-file context matters.

The pattern: subagents handle *leaf* files with well-defined interfaces. The orchestrator handles *integration* where understanding multiple files simultaneously matters.

**Takeaway:** Delegate file creation to subagents when the contract is clear. Keep integration work centralized where cross-file dependencies need reasoning.

---

## Things to revisit

- **Undo coalescing** — debounce or transaction boundaries for drag mutations
- ~~**Hit testing** — O(n) reverse scan works now, needs a spatial index (quadtree) for larger scenes~~ ✅ Done (QuadTree)
- ~~**Image storage** — base64 data URIs in state will bloat undo snapshots; move to object URLs or IndexedDB~~ ✅ Done (IndexedDB content-addressed)
- **Stroke smoothing** — simple `lineTo` looks jagged at low pointer event rates; Catmull-Rom or quadratic Bézier would help
- **Canvas resize** — `ResizeObserver` on the container instead of `window.resize` to catch panel collapses
- **Persistence** — no save/load yet; canvas state is lost on refresh
- **Component property editing** — library components land as images; need a property editor to tweak them post-placement
- ~~**Layout composition templates** — predefined layout shells (sidebar+main, card grid) for rapid prototyping~~ ✅ Built, then deleted (zero imports — premature)
- **Token export** — export resolved OKLCH tokens as CSS/JSON for handoff
- **Renderer deduplication** — 5 library-specific renderer sets repeat ~65 near-identical functions; extract parameterized templates

---

## By the numbers

| Metric | Value |
|--------|-------|
| Commits | 40+ |
| Days | 3 |
| TypeScript/TSX | ~10,200 lines |
| CSS | ~2,170 lines |
| Runtime deps | 5 (React, GSAP, html2canvas, Lucide, HF Transformers) |
| Files pruned in cleanup | ~52 |
| Dead code removed (Feb 27) | ~960 lines |
| Undo stack depth | 50 snapshots |
| Grid dot spacing | 40 px |
| Surface levels | 5 |
| Main chunk size | 290 KB (down from 1,489 KB) |
| Built-in libraries | 6 (Ant Design, Glass, Fluent, Material, Radix, shadcn) |
| Component aliases | 100+ (generic renderers) + 70+ (library name mappings) |
| Generic renderers | 20+ (popover, drawer, combobox, datepicker, etc.) |
| Spatial index | QuadTree, depth 8, 8/leaf |
| Image store | IndexedDB, SHA-256, LRU 20 |
