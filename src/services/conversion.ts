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
    // Step 1: Analyzing prompt
    onStep?.({ id: 'analyze', label: 'Analyzing prompt' });
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

    // Step 4: Generating layout
    onStep?.({ id: 'layout', label: 'Generating layout', detail: `Building ${uiLabel} components` });
    await new Promise((r) => setTimeout(r, 350));

    // Step 5: Rendering mockup
    onStep?.({ id: 'render', label: 'Rendering mockup' });
    const { generateAndRender } = await import('./ui-renderer');
    const result = await generateAndRender(payload.prompt, libraryName);

    onStep?.({ id: 'complete', label: 'Complete' });

    return {
      success: true,
      framework: payload.framework,
      code: '',
      imageDataUrl: result.dataUrl,
      imageWidth: result.width,
      imageHeight: result.height,
      uiType: result.uiType,
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
  // Render an image mockup from the prompt — same as prompt-based generation
  const { prompt } = payload;
  const desc = prompt || 'a UI component';

  try {
    const { generateAndRender } = await import('./ui-renderer');
    const result = await generateAndRender(desc);

    return {
      success: true,
      framework: payload.framework,
      code: '',
      imageDataUrl: result.dataUrl,
      imageWidth: result.width,
      imageHeight: result.height,
      uiType: result.uiType,
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
