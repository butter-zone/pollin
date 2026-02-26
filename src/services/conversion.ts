/**
 * Conversion API client — skeleton for sketch/image → UI code generation.
 *
 * This module provides a unified interface for converting canvas objects
 * (sketches, images) into UI code using an AI backend. Currently stubbed
 * with mock responses; wire up to your preferred API (OpenAI, Anthropic,
 * local model, etc.) by implementing the `convert` function.
 */

import type { ConversionPayload } from '@/components/ConversionDialog';

/* ─── Response types ────────────────────────────────────── */

export interface ConversionResult {
  success: boolean;
  code: string;
  framework: string;
  preview?: string; // rendered HTML preview
  error?: string;
}

/* ─── API configuration ─────────────────────────────────── */

const API_BASE = import.meta.env.VITE_CONVERSION_API_URL || '';

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
