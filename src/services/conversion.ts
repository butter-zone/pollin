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
import type { ComponentTree } from '@/types/component-tree';
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
    const tree = buildMockComponentTree(payload.prompt, uiType, {
      designSystem: libraryName,
    });
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
    const tree = buildMockComponentTree(desc, uiType, {
      designSystem: libraryName,
    });

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

/* ─── Variation generation (ideation mode) ──────────────── */

/** Design systems to cycle through for variations */
const VARIATION_THEMES = [
  'Material UI 3',
  'shadcn/ui',
  'Apple Liquid Glass',
  'Ant Design',
  'Fluent UI',
  'Radix UI',
];

/**
 * Generate multiple themed variations of the same prompt.
 * Returns 3 ConversionResults, each with a different design system.
 * The first uses the user's selected library (or a default), and the remaining
 * use other design systems for contrast.
 */
export async function generateVariations(
  payload: GenerationPayload,
  count: number = 3,
): Promise<ConversionResult[]> {
  const libraryName = await getLibraryName(payload.libraryId);

  // Pick themes: start with selected, then fill with others
  const selectedNorm = (libraryName || '').toLowerCase();
  const otherThemes = VARIATION_THEMES.filter(
    (t) => t.toLowerCase() !== selectedNorm,
  );
  // Shuffle others for variety
  for (let i = otherThemes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherThemes[i], otherThemes[j]] = [otherThemes[j], otherThemes[i]];
  }
  const themes = [libraryName || 'Material UI 3', ...otherThemes].slice(0, count);

  const { buildMockComponentTree } = await import('./mock-trees');
  const { renderTreeToHTML } = await import('./component-renderer');
  const { renderHTMLToImage } = await import('./ui-renderer');

  const uiType = classifyPrompt(payload.prompt);

  const results: ConversionResult[] = [];

  for (const theme of themes) {
    try {
      const tree = buildMockComponentTree(payload.prompt, uiType, {
        designSystem: theme,
      });

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
