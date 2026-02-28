/**
 * Design Token Export
 *
 * Extracts the resolved OKLCH design tokens from Pollin's :root CSS
 * custom properties and the ThemeTokens system, then exports them
 * as downloadable CSS variables or JSON token files for handoff.
 */

// ── Token structure ──────────────────────────────────────

export interface DesignTokenGroup {
  [key: string]: string | DesignTokenGroup;
}

export interface DesignTokens {
  /** Metadata about the export */
  $schema: string;
  $version: string;
  $generatedAt: string;
  /** The actual token values, nested by category */
  color: DesignTokenGroup;
  radius: DesignTokenGroup;
  shadow: DesignTokenGroup;
  motion: DesignTokenGroup;
  typography: DesignTokenGroup;
}

// ── Extract from :root ───────────────────────────────────

/**
 * Read all CSS custom properties from :root and return them
 * as a flat Record<string, string>.
 */
function extractRootTokens(): Record<string, string> {
  const tokens: Record<string, string> = {};

  try {
    const root = document.documentElement;
    const computed = getComputedStyle(root);

    // Walk all stylesheets looking for :root rules
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (
            rule instanceof CSSStyleRule &&
            (rule.selectorText === ':root' || rule.selectorText === ':root, :host')
          ) {
            for (let i = 0; i < rule.style.length; i++) {
              const prop = rule.style[i];
              if (prop.startsWith('--')) {
                // Use computed style for resolved values
                const value = computed.getPropertyValue(prop).trim();
                if (value) tokens[prop] = value;
              }
            }
          }
        }
      } catch {
        // Cross-origin stylesheets throw SecurityError — skip
      }
    }
  } catch (err) {
    console.warn('[pollin] token extraction failed:', err);
  }

  return tokens;
}

/**
 * Group flat CSS custom properties into a structured token object.
 */
function organizeTokens(flat: Record<string, string>): DesignTokens {
  const color: DesignTokenGroup = {};
  const radius: DesignTokenGroup = {};
  const shadow: DesignTokenGroup = {};
  const motion: DesignTokenGroup = {};
  const typography: DesignTokenGroup = {};

  for (const [prop, value] of Object.entries(flat)) {
    // Strip leading --
    const name = prop.replace(/^--/, '');

    if (name.startsWith('c-')) {
      // Color tokens: --c-bg, --c-surface-1, --c-accent, etc.
      const key = name.slice(2); // remove 'c-'
      color[key] = value;
    } else if (name.startsWith('radius')) {
      const key = name.replace('radius-', '').replace('radius', 'default');
      radius[key] = value;
    } else if (name.startsWith('shadow')) {
      const key = name.replace('shadow-', '').replace('shadow', 'default');
      shadow[key] = value;
    } else if (name === 'ease' || name === 'dur') {
      motion[name === 'dur' ? 'duration' : 'easing'] = value;
    } else if (
      name.includes('font') ||
      name.includes('line-height') ||
      name.includes('letter-spacing')
    ) {
      typography[name] = value;
    }
  }

  return {
    $schema: 'https://pollin.dev/tokens/v1',
    $version: '1.0.0',
    $generatedAt: new Date().toISOString(),
    color,
    radius,
    shadow,
    motion,
    typography,
  };
}

// ── Export formats ────────────────────────────────────────

/**
 * Generate a CSS custom properties file from the extracted tokens.
 */
function tokensToCSS(flat: Record<string, string>): string {
  const lines = [
    '/* ═══════════════════════════════════════════════════',
    '   Pollin Design Tokens',
    `   Generated: ${new Date().toISOString()}`,
    '   ═══════════════════════════════════════════════════ */',
    '',
    ':root {',
  ];

  // Group by prefix for readability
  const groups: Record<string, [string, string][]> = {};

  for (const [prop, value] of Object.entries(flat)) {
    const name = prop.replace(/^--/, '');
    let group = 'other';
    if (name.startsWith('c-')) group = 'colors';
    else if (name.startsWith('radius')) group = 'radii';
    else if (name.startsWith('shadow')) group = 'shadows';
    else if (name === 'ease' || name === 'dur') group = 'motion';

    if (!groups[group]) groups[group] = [];
    groups[group].push([prop, value]);
  }

  const groupOrder = ['colors', 'radii', 'shadows', 'motion', 'other'];
  const groupLabels: Record<string, string> = {
    colors: 'Colors (OKLCH)',
    radii: 'Border Radii',
    shadows: 'Shadows',
    motion: 'Motion',
    other: 'Other',
  };

  for (const groupKey of groupOrder) {
    const entries = groups[groupKey];
    if (!entries || entries.length === 0) continue;

    lines.push(`  /* ── ${groupLabels[groupKey]} ──────────── */`);
    for (const [prop, value] of entries) {
      lines.push(`  ${prop}: ${value};`);
    }
    lines.push('');
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate a JSON token file (compatible with Style Dictionary / Tokens Studio).
 */
function tokensToJSON(tokens: DesignTokens): string {
  // Convert to Tokens Studio / Style Dictionary format
  const output: Record<string, unknown> = {
    $schema: tokens.$schema,
    $version: tokens.$version,
    $generatedAt: tokens.$generatedAt,
  };

  // Helper: wrap each leaf value in a { $value, $type } object
  function wrapGroup(
    group: DesignTokenGroup,
    type: string,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(group)) {
      if (typeof val === 'string') {
        result[key] = { $value: val, $type: type };
      } else {
        result[key] = wrapGroup(val, type);
      }
    }
    return result;
  }

  if (Object.keys(tokens.color).length > 0) {
    output.color = wrapGroup(tokens.color, 'color');
  }
  if (Object.keys(tokens.radius).length > 0) {
    output.radius = wrapGroup(tokens.radius, 'dimension');
  }
  if (Object.keys(tokens.shadow).length > 0) {
    output.shadow = wrapGroup(tokens.shadow, 'shadow');
  }
  if (Object.keys(tokens.motion).length > 0) {
    output.motion = wrapGroup(tokens.motion, 'other');
  }
  if (Object.keys(tokens.typography).length > 0) {
    output.typography = wrapGroup(tokens.typography, 'fontFamily');
  }

  return JSON.stringify(output, null, 2);
}

// ── Download helpers ─────────────────────────────────────

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Public API ───────────────────────────────────────────

/** Extract all design tokens from the live :root CSS. */
export function getDesignTokens(): DesignTokens {
  const flat = extractRootTokens();
  return organizeTokens(flat);
}

/** Get flat CSS custom properties map. */
export function getFlatTokens(): Record<string, string> {
  return extractRootTokens();
}

/** Download tokens as a CSS custom properties file. */
export function exportTokensCSS(): void {
  const flat = extractRootTokens();
  const css = tokensToCSS(flat);
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(css, `pollin-tokens-${date}.css`, 'text/css');
}

/** Download tokens as a JSON file (Style Dictionary compatible). */
export function exportTokensJSON(): void {
  const flat = extractRootTokens();
  const tokens = organizeTokens(flat);
  const json = tokensToJSON(tokens);
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(json, `pollin-tokens-${date}.tokens.json`, 'application/json');
}
