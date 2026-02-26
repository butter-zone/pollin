# Design Tokens

Guidance for defining, naming, and using design tokens in Pollin.

## Purpose

- Create a single source of truth for design decisions
- Enable consistency across all UI surfaces
- Support theming and future platform expansion
- Reduce arbitrary style choices

## Token Principles

- **Tokens represent intent, not values** — A token like `surface-800` describes semantic intent (a dark surface), not a literal hex value
- **Names describe usage, not appearance** — Use `accent-blue` not `primary-color`; use `spacing-md` not `margin-16px`
- **Tokens should be composable and scalable** — Build complex patterns from simple, reusable primitives

## Token Categories

### Color

**Semantic roles:**
- `surface` — Backgrounds, panels, neutral surfaces (50–950 range)
- `accent` — Interactive highlights: blue, red, green, yellow, purple
- `error`, `success`, `warning` — Status states (when expanded)

**Usage:**
```ts
// ✅ Good: Uses semantic intent
className="bg-surface-800 text-surface-50"

// ❌ Bad: Appears arbitrary
className="bg-[#262626] text-white"
```

### Typography

**Scale:**
- `xs` — 12px, for small text
- `sm` — 14px, for labels and secondary text
- `base` — 16px, for body text
- `lg` — 18px, for section headers
- `xl` — 20px, for subsection headers
- `2xl` — 24px, for page titles

**Usage:**
```ts
// Defined in tailwind.config.js
// Accessible via Tailwind utilities: text-xs, text-sm, etc.
```

### Spacing

**Scale (4px base):**
- `xs` — 4px, for tight spacing
- `sm` — 8px, for compact spacing
- `md` — 16px, default spacing
- `lg` — 24px, generous spacing
- `xl` — 32px, large spacing
- `2xl` — 48px, very large spacing

**Usage:**
```ts
// ✅ Good: Uses spacing tokens
className="p-lg gap-sm"

// ❌ Bad: Arbitrary units
className="p-[24px] gap-[8px]"
```

### Shadows

- `sm` — Subtle elevation
- `panel` — Cards, panels, modals
- `elevated` — Floating UI elements (control panels, popovers)

**Usage:**
```ts
className="shadow-panel" // or shadow-elevated
```

### Motion

- Animations should respect `prefers-reduced-motion`
- Spring easing preferred for natural motion
- No motion for critical interactions

## Adding New Tokens

Before adding a new token:

1. Check if an existing token fits the use case
2. Consider if the value could be reused elsewhere
3. Document the intent and usage
4. Update `src/design/tokens.ts` and `tailwind.config.js` in parallel

**Example:**
```ts
// src/design/tokens.ts
export const spacing = {
  xs: '4px',
  sm: '8px',
  // ... add new token here
} as const;

// tailwind.config.js
spacing: {
  xs: '4px',
  sm: '8px',
  // ... also here
}
```

## Token Naming Convention

**Format:** `{category}-{scale|semantic}`

**Examples:**
- ✅ `spacing-md`, `color-surface-700`, `text-lg`, `shadow-elevated`
- ❌ `margin-big`, `button-bg-color`, `heading-font-size`

## Current Token Set

See `src/design/tokens.ts` for the complete, canonical token definitions.

## Future Additions

- Dark/light mode theming strategy
- Token versioning for breaking changes
- Component-level token overrides
- Platform-specific token mappings (web, mobile, etc.)
