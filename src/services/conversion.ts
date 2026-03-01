/**
 * Conversion & generation API client.
 *
 * Handles three flows:
 * 1. LLM generation: user prompt → LLM → ComponentTree → rendered preview
 * 2. Remote API: user prompt → custom backend endpoint
 * 3. Mock generation: template-based fallback for offline dev
 *
 * Priority: remote API (VITE_CONVERSION_API_URL) > LLM (API key) > mock.
 */

import type { ConversionPayload } from '@/components/ConversionDialog';
import type { ComponentTree, ComponentNode } from '@/types/component-tree';
import { classifyPrompt } from '@/services/ui-templates';
import { getBuiltInEntries } from '@/services/library-registry';

/* ─── Response types ────────────────────────────────────── */

export interface ConversionResult {
  success: boolean;
  code: string;
  framework: string;
  preview?: string; // rendered HTML preview
  error?: string;
  /** Data URI of the rendered UI mockup image */
  imageDataUrl?: string;
  /** Width of the rendered image */
  imageWidth?: number;
  /** Height of the rendered image */
  imageHeight?: number;
  /** Classified UI type (login, dashboard, etc.) */
  uiType?: string;
  /** Structured component tree (when generated via LLM) */
  componentTree?: ComponentTree;
}

export interface GenerationPayload {
  prompt: string;
  model: string;
  framework: 'react' | 'html' | 'tailwind';
  imageRefs?: string[];   // base64 data URIs of reference images
  libraryId?: string;
  /** Called with progressive reasoning steps during generation */
  onStep?: (step: { id: string; label: string; detail?: string }) => void;
}

/* ─── API configuration ─────────────────────────────────── */

const API_BASE = import.meta.env.VITE_CONVERSION_API_URL || '';

/* ─── Prompt-based generation ───────────────────────────── */

export async function generateFromPrompt(
  payload: GenerationPayload,
): Promise<ConversionResult> {
  // Priority 1: Remote API endpoint
  if (API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (err) {
      return {
        success: false,
        code: '',
        framework: payload.framework,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // Priority 2: Direct LLM API (OpenAI / Anthropic)
  const { isLLMConfigured } = await import('./llm-client');
  if (isLLMConfigured()) {
    return llmGeneration(payload);
  }

  // Priority 3: Offline mock templates
  return mockGeneration(payload);
}

/* ─── Library name lookup (for theming) ─────────────────── */

let _libraryCache: Map<string, string> | null = null;

/** Normalize a string for fuzzy matching (lowercase, strip separators) */
function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[\\s/\\-_]+/g, '');
}

async function getLibraryName(libraryId?: string): Promise<string | undefined> {
  if (!libraryId) return undefined;
  if (!_libraryCache) {
    _libraryCache = new Map();
    for (const entry of getBuiltInEntries()) {
      _libraryCache.set(normalizeName(entry.name), entry.name);
    }
  }
  const normalizedId = normalizeName(libraryId);
  // Exact normalized match
  const exact = _libraryCache.get(normalizedId);
  if (exact) return exact;
  // Prefix/substring match
  for (const [key, name] of _libraryCache) {
    if (normalizedId.startsWith(key) || key.startsWith(normalizedId)) return name;
    if (normalizedId.includes(key) || key.includes(normalizedId)) return name;
  }
  // If not in the built-in cache, it may be a custom library — return the raw ID
  // so the prompt can still mention it
  return libraryId;
}

/* ─── LLM-powered generation ────────────────────────────── */

async function llmGeneration(payload: GenerationPayload): Promise<ConversionResult> {
  const onStep = payload.onStep;
  try {
    onStep?.({ id: 'analyze', label: 'Analyzing prompt' });

    const { generateComponentTree } = await import('./llm-client');
    const libraryName = await getLibraryName(payload.libraryId);

    // Generate ComponentTree via LLM
    const tree = await generateComponentTree(payload.prompt, {
      imageRefs: payload.imageRefs,
      designSystem: libraryName,
      viewport: { width: 420, height: 580 },
      onStep,
    });

    // Render ComponentTree → HTML → bitmap
    onStep?.({ id: 'render', label: 'Rendering mockup' });
    const { renderTreeToHTML } = await import('./component-renderer');
    const { renderHTMLToImage } = await import('./ui-renderer');

    const html = renderTreeToHTML(tree);
    const vp = tree.metadata.viewport || { width: 420, height: 580 };
    const renderResult = await renderHTMLToImage(html, vp.width, vp.height);

    onStep?.({ id: 'complete', label: 'Complete' });

    return {
      success: true,
      framework: payload.framework,
      code: html,
      imageDataUrl: renderResult.dataUrl,
      imageWidth: renderResult.width,
      imageHeight: renderResult.height,
      uiType: tree.metadata.name,
      componentTree: tree,
    };
  } catch (err) {
    return {
      success: false,
      code: '',
      framework: payload.framework,
      error: err instanceof Error ? err.message : 'Generation failed',
    };
  }
}

/* ─── Mock generation ───────────────────────────────────── */

async function mockGeneration(payload: GenerationPayload): Promise<ConversionResult> {
  const onStep = payload.onStep;
  try {
    // Step 1: Analyzing prompt (show which model is selected)
    onStep?.({ id: 'analyze', label: 'Analyzing prompt', detail: payload.model || undefined });
    await new Promise((r) => setTimeout(r, 400));

    // Step 2: Classifying UI type
    const uiType = classifyPrompt(payload.prompt);
    const uiLabel = uiType.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
    onStep?.({ id: 'classify', label: 'Classifying UI type', detail: uiLabel });
    await new Promise((r) => setTimeout(r, 350));

    // Step 3: Selecting design system
    const libraryName = await getLibraryName(payload.libraryId);
    const dsLabel = libraryName || 'Default';
    onStep?.({ id: 'theme', label: 'Applying design system', detail: dsLabel });
    await new Promise((r) => setTimeout(r, 300));

    // Step 4: Build a ComponentTree (so output is editable via ComponentEditor)
    onStep?.({ id: 'layout', label: 'Generating layout', detail: `Building ${uiLabel} components` });
    const { buildMockComponentTree } = await import('./mock-trees');
    let tree = buildMockComponentTree(payload.prompt, uiType, {
      designSystem: libraryName,
    });

    // Apply theme colors to tree nodes when a design system is set
    if (libraryName) {
      tree = applyThemeColors(tree, libraryName);
    }
    await new Promise((r) => setTimeout(r, 200));

    // Step 5: Render ComponentTree → HTML → bitmap
    onStep?.({ id: 'render', label: 'Rendering mockup' });
    const { renderTreeToHTML } = await import('./component-renderer');
    const { renderHTMLToImage } = await import('./ui-renderer');

    const html = renderTreeToHTML(tree);
    const vp = tree.metadata.viewport;
    const renderResult = await renderHTMLToImage(html, vp.width, vp.height);

    onStep?.({ id: 'complete', label: 'Complete' });

    return {
      success: true,
      framework: payload.framework,
      code: html,
      imageDataUrl: renderResult.dataUrl,
      imageWidth: renderResult.width,
      imageHeight: renderResult.height,
      uiType,
      componentTree: tree,
    };
  } catch (err) {
    return {
      success: false,
      code: '',
      framework: payload.framework,
      error: err instanceof Error ? err.message : 'Render failed',
    };
  }
}

/* ─── Main conversion function ──────────────────────────── */

export async function convertToUI(
  payload: ConversionPayload,
  imageData?: string, // base64 data URI of the sketch/image
): Promise<ConversionResult> {
  // If an API endpoint is configured, use it
  if (API_BASE) {
    return callRemoteAPI(payload, imageData);
  }

  // Otherwise return a mock response for development
  return mockConversion(payload);
}

/* ─── Remote API call ───────────────────────────────────── */

async function callRemoteAPI(
  payload: ConversionPayload,
  imageData?: string,
): Promise<ConversionResult> {
  try {
    const response = await fetch(`${API_BASE}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        image: imageData,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    return {
      success: false,
      code: '',
      framework: payload.framework,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/* ─── Mock conversion for development ───────────────────── */

async function mockConversion(payload: ConversionPayload): Promise<ConversionResult> {
  const { prompt } = payload;
  const desc = prompt || 'a UI component';

  try {
    const uiType = classifyPrompt(desc);
    const libraryName = await getLibraryName(payload.libraryId ?? undefined);

    // Build an editable ComponentTree
    const { buildMockComponentTree } = await import('./mock-trees');
    let tree = buildMockComponentTree(desc, uiType, {
      designSystem: libraryName,
    });

    // Apply theme colors when a design system is set
    if (libraryName) {
      tree = applyThemeColors(tree, libraryName);
    }

    // Render to bitmap
    const { renderTreeToHTML } = await import('./component-renderer');
    const { renderHTMLToImage } = await import('./ui-renderer');

    const html = renderTreeToHTML(tree);
    const vp = tree.metadata.viewport;
    const result = await renderHTMLToImage(html, vp.width, vp.height);

    return {
      success: true,
      framework: payload.framework,
      code: html,
      imageDataUrl: result.dataUrl,
      imageWidth: result.width,
      imageHeight: result.height,
      uiType,
      componentTree: tree,
    };
  } catch (err) {
    return {
      success: false,
      code: '',
      framework: payload.framework,
      error: err instanceof Error ? err.message : 'Render failed',
    };
  }
}

/* ─── Theme color palettes for visual diversity ─────────── */

interface ThemeColors {
  primary: string;
  onPrimary: string;
  surface: string;
  surfaceAlt: string;
  onSurface: string;
  border: string;
  muted: string;
  accent: string;
  link: string;
  cardBg: string;
  inputBorder: string;
  inputBg: string;
  isDark: boolean;
}

const THEME_COLORS: Record<string, ThemeColors> = {
  'Material UI 3': {
    primary: '#1976d2', onPrimary: '#ffffff', surface: '#fafafa', surfaceAlt: '#f5f5f5',
    onSurface: '#212121', border: '#e0e0e0', muted: '#757575', accent: '#9c27b0',
    link: '#1976d2', cardBg: '#ffffff', inputBorder: '#bdbdbd', inputBg: '#ffffff', isDark: false,
  },
  'shadcn/ui': {
    primary: '#fafafa', onPrimary: '#09090b', surface: '#09090b', surfaceAlt: '#18181b',
    onSurface: '#fafafa', border: '#27272a', muted: '#a1a1aa', accent: '#a78bfa',
    link: '#a78bfa', cardBg: '#18181b', inputBorder: '#27272a', inputBg: '#09090b', isDark: true,
  },
  'Apple Liquid Glass': {
    primary: 'rgba(0,122,255,0.65)', onPrimary: '#ffffff', surface: 'rgba(255,255,255,0.12)', surfaceAlt: 'rgba(255,255,255,0.08)',
    onSurface: '#ffffff', border: 'rgba(255,255,255,0.2)', muted: 'rgba(255,255,255,0.6)', accent: 'rgba(0,122,255,0.55)',
    link: 'rgba(100,180,255,0.9)', cardBg: 'rgba(255,255,255,0.18)', inputBorder: 'rgba(255,255,255,0.15)', inputBg: 'rgba(255,255,255,0.1)', isDark: true,
  },
  'Ant Design': {
    primary: '#1677ff', onPrimary: '#ffffff', surface: '#ffffff', surfaceAlt: '#fafafa',
    onSurface: 'rgba(0,0,0,0.88)', border: '#d9d9d9', muted: 'rgba(0,0,0,0.45)', accent: '#722ed1',
    link: '#1677ff', cardBg: '#ffffff', inputBorder: '#d9d9d9', inputBg: '#ffffff', isDark: false,
  },
  'Fluent UI': {
    primary: '#0078d4', onPrimary: '#ffffff', surface: '#fafafa', surfaceAlt: '#f5f5f5',
    onSurface: '#242424', border: '#e0e0e0', muted: '#707070', accent: '#8764b8',
    link: '#0078d4', cardBg: '#ffffff', inputBorder: '#8a8886', inputBg: '#ffffff', isDark: false,
  },
  'Radix UI': {
    primary: '#3e63dd', onPrimary: '#ffffff', surface: '#111113', surfaceAlt: '#18191b',
    onSurface: '#eeeef0', border: '#2b2c2f', muted: '#9b9ba7', accent: '#7c66dc',
    link: '#7c66dc', cardBg: '#18191b', inputBorder: '#2b2c2f', inputBg: '#111113', isDark: true,
  },
};

/**
 * Walk a ComponentTree and inject theme-appropriate colors into node styles.
 * This makes each design system visually distinct beyond just fonts/radii.
 */
function applyThemeColors(tree: ComponentTree, themeName: string): ComponentTree {
  const colors = THEME_COLORS[themeName];
  if (!colors) return tree;
  return { ...tree, root: colorizeNode(tree.root, colors) };
}

function colorizeNode(node: ComponentNode, t: ThemeColors): ComponentNode {
  const s = { ...node.styles };
  const variant = String(node.props?.variant ?? '');

  switch (node.type) {
    case 'button':
      if (variant === 'primary' || variant === '') {
        s.background = t.primary;
        s.color = t.onPrimary;
      } else if (variant === 'secondary') {
        s.background = t.surfaceAlt;
        s.color = t.onSurface;
      } else if (variant === 'ghost') {
        s.background = 'transparent';
        s.color = t.onSurface;
      } else if (variant === 'outline') {
        s.background = 'transparent';
        s.border = `1px solid ${t.border}`;
        s.color = t.onSurface;
      }
      break;
    case 'card':
      s.background = t.cardBg;
      s.borderColor = t.border;
      if (t.isDark) s.color = t.onSurface;
      break;
    case 'container':
      // Only color root-level containers that have minHeight (page-level containers)
      if (s.minHeight === '100%' || s.minHeight === '100vh') {
        s.color = t.onSurface;
      }
      break;
    case 'navbar':
      s.borderBottom = `1px solid ${t.border}`;
      if (t.isDark) { s.background = t.surfaceAlt; s.color = t.onSurface; }
      break;
    case 'sidebar':
      s.borderRight = `1px solid ${t.border}`;
      if (t.isDark) { s.background = t.surfaceAlt; s.color = t.onSurface; }
      break;
    case 'link':
      s.color = t.link;
      break;
    case 'avatar':
      s.background = t.accent;
      s.color = t.onPrimary;
      break;
    case 'badge':
      if (variant === 'primary') {
        s.background = t.primary;
        s.color = t.onPrimary;
      } else {
        s.background = t.surfaceAlt;
        s.color = t.onSurface;
      }
      break;
    case 'divider':
      s.borderTop = `1px solid ${t.border}`;
      break;
    case 'input':
    case 'textarea':
    case 'select':
      s.border = `1px solid ${t.inputBorder}`;
      if (t.isDark) {
        s.background = t.inputBg;
        s.color = t.onSurface;
      }
      break;
    case 'heading':
      if (t.isDark) s.color = t.onSurface;
      break;
    case 'paragraph':
    case 'text':
      if (t.isDark) s.color = t.onSurface;
      break;
    case 'tabs':
      s.borderBottom = `2px solid ${t.border}`;
      break;
    default:
      break;
  }

  const children = node.children?.map((child) =>
    typeof child === 'string' ? child : colorizeNode(child, t),
  );

  return { ...node, styles: s, children };
}

/* ─── Variation generation (ideation mode) ──────────────── */

/** Design systems available for variations */
export const VARIATION_THEMES = [
  'Material UI 3',
  'shadcn/ui',
  'Apple Liquid Glass',
  'Ant Design',
  'Fluent UI',
  'Radix UI',
];

/**
 * Generate multiple themed variations of the same prompt.
 * When no library is selected, all variations use different random libraries
 * with full color theming applied — making each visually distinct.
 * When a library IS selected, variations use other design systems.
 * Pass `excludeTheme` to prevent duplicating the main result's theme.
 */
export async function generateVariations(
  payload: GenerationPayload,
  count: number = 3,
  excludeTheme?: string,
): Promise<ConversionResult[]> {
  const libraryName = await getLibraryName(payload.libraryId);

  // Shuffle all themes, excluding any already used by the main result
  const available = VARIATION_THEMES.filter((t) => {
    if (excludeTheme && t.toLowerCase() === excludeTheme.toLowerCase()) return false;
    if (libraryName && t.toLowerCase() === libraryName.toLowerCase()) return false;
    return true;
  });
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const themes = available.slice(0, count);

  const { buildMockComponentTree } = await import('./mock-trees');
  const { renderTreeToHTML } = await import('./component-renderer');
  const { renderHTMLToImage } = await import('./ui-renderer');

  const uiType = classifyPrompt(payload.prompt);

  const results: ConversionResult[] = [];

  for (const theme of themes) {
    try {
      let tree = buildMockComponentTree(payload.prompt, uiType, {
        designSystem: theme,
      });

      // Apply theme colors to tree nodes for visual diversity
      tree = applyThemeColors(tree, theme);

      const html = renderTreeToHTML(tree);
      const vp = tree.metadata.viewport;
      const renderResult = await renderHTMLToImage(html, vp.width, vp.height);

      results.push({
        success: true,
        framework: payload.framework,
        code: html,
        imageDataUrl: renderResult.dataUrl,
        imageWidth: renderResult.width,
        imageHeight: renderResult.height,
        uiType,
        componentTree: tree,
      });
    } catch {
      // Skip failed variations
    }
  }

  return results;
}
