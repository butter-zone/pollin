/**
 * Conversion & generation API client.
 *
 * Handles two flows:
 * 1. Prompt-based generation: user describes a design → AI generates UI code
 * 2. Object conversion: canvas sketches/images → UI code
 *
 * Currently stubbed with mock responses. Wire up to your preferred API
 * by setting VITE_CONVERSION_API_URL.
 */

import type { ConversionPayload } from '@/components/ConversionDialog';

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
    const { getBuiltInEntries } = await import('./library-registry');
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

/* ─── Mock generation ───────────────────────────────────── */

async function mockGeneration(payload: GenerationPayload): Promise<ConversionResult> {
  const onStep = payload.onStep;
  try {
    // Step 1: Analyzing prompt
    onStep?.({ id: 'analyze', label: 'Analyzing prompt' });
    await new Promise((r) => setTimeout(r, 400));

    // Step 2: Classifying UI type
    const { classifyPrompt, getTheme } = await import('./ui-templates');
    const uiType = classifyPrompt(payload.prompt);
    const uiLabel = uiType.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
    onStep?.({ id: 'classify', label: 'Classifying UI type', detail: uiLabel });
    await new Promise((r) => setTimeout(r, 350));

    // Step 3: Selecting design system
    const libraryName = await getLibraryName(payload.libraryId);
    const theme = getTheme(libraryName);
    const dsLabel = libraryName || 'Default';
    onStep?.({ id: 'theme', label: 'Applying design system', detail: dsLabel });
    void theme; // used by generateAndRender internally
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
  // Simulate API latency
  await new Promise((r) => setTimeout(r, 1500));

  const { framework, fidelity, prompt } = payload;
  const desc = prompt || 'a UI component';

  if (framework === 'react') {
    return {
      success: true,
      framework: 'react',
      code: `import React from 'react';

export function GeneratedComponent() {
  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">${desc}</h2>
      <p className="text-gray-600 mb-4">
        Generated from ${fidelity} conversion
      </p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Action
      </button>
    </div>
  );
}`,
    };
  }

  if (framework === 'tailwind') {
    return {
      success: true,
      framework: 'tailwind',
      code: `<div class="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
  <h2 class="text-lg font-semibold mb-4">${desc}</h2>
  <p class="text-gray-600 mb-4">
    Generated from ${fidelity} conversion
  </p>
  <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
    Action
  </button>
</div>`,
    };
  }

  return {
    success: true,
    framework: 'html',
    code: `<div style="padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
  <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">${desc}</h2>
  <p style="color: #6b7280; margin-bottom: 16px;">
    Generated from ${fidelity} conversion
  </p>
  <button style="padding: 8px 16px; background: #2563eb; color: white; border-radius: 6px; border: none; cursor: pointer;">
    Action
  </button>
</div>`,
  };
}
