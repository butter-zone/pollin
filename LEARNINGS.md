# Learnings

Notes on what worked, what didn't, and what we'd carry forward — compiled from building Pollin over Feb 25–26, 2026.

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

## Things to revisit

- **Undo coalescing** — debounce or transaction boundaries for drag mutations
- **Hit testing** — O(n) reverse scan works now, needs a spatial index (quadtree) for larger scenes
- **Image storage** — base64 data URIs in state will bloat undo snapshots; move to object URLs or IndexedDB
- **Stroke smoothing** — simple `lineTo` looks jagged at low pointer event rates; Catmull-Rom or quadratic Bézier would help
- **Canvas resize** — `ResizeObserver` on the container instead of `window.resize` to catch panel collapses
- **Persistence** — no save/load yet; canvas state is lost on refresh

---

## By the numbers

| Metric | Value |
|--------|-------|
| Commits | 21 |
| Days | 2 |
| TypeScript/TSX | ~3,200 lines |
| CSS | ~1,700 lines |
| Runtime deps | 3 (React, Framer Motion, Lucide) |
| Files pruned in cleanup | ~50 |
| Undo stack depth | 50 snapshots |
| Grid dot radius (magnetic) | 5 cells |
| Surface levels | 5 |
