/**
 * UI Renderer — converts HTML/CSS mockups into canvas-ready bitmap images.
 *
 * Uses a hidden iframe to render the HTML, then captures it with html2canvas,
 * returning a data URI that can be placed on the canvas as an ImageObject.
 */

import html2canvas from 'html2canvas';
import { generateUIHTML } from '@/services/ui-templates';

export interface RenderResult {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render a self-contained HTML string to a PNG data URL.
 *
 * Strategy:
 *   1. Create a hidden iframe (avoids style leakage from the host page).
 *   2. Write the HTML into the iframe.
 *   3. Wait for fonts/images to settle.
 *   4. Use html2canvas to rasterize the iframe body.
 *   5. Tear down and return the data URL.
 */
export async function renderHTMLToImage(
  html: string,
  width: number,
  height: number,
): Promise<RenderResult> {
  if (typeof document === 'undefined' || !document.body) {
    throw new Error('renderHTMLToImage requires a browser environment');
  }

  const TIMEOUT_MS = 15_000;

  const renderPromise = new Promise<RenderResult>((resolve, reject) => {
    // ── Create hidden iframe ──────────────────────────
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: ${width}px;
      height: ${height}px;
      border: none;
      opacity: 0;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(iframe);

    const cleanup = () => {
      try {
        document.body.removeChild(iframe);
      } catch { /* already removed */ }
    };

    // Guard against re-entry (iframe.onload fires twice with doc.write)
    let handled = false;

    iframe.onload = async () => {
      if (handled) return;
      handled = true;

      try {
        const iframeDoc = iframe.contentDocument;
        if (!iframeDoc) throw new Error('Cannot access iframe document');

        // Write the full HTML into the iframe
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for fonts and layout to settle
        try {
          await iframeDoc.fonts?.ready;
        } catch { /* fonts API may not be available */ }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        const body = iframeDoc.body;
        if (!body) throw new Error('Iframe body is null');

        // Use html2canvas to capture
        const canvas = await html2canvas(body, {
          width,
          height,
          windowWidth: width,
          windowHeight: height,
          scale: 2, // 2x for retina-quality output
          useCORS: true,
          allowTaint: false,
          backgroundColor: null, // Preserve any background set in CSS
          logging: false,
        });

        const dataUrl = canvas.toDataURL('image/png');

        // Release canvas GPU memory
        canvas.width = 0;
        canvas.height = 0;

        cleanup();
        resolve({
          dataUrl,
          width,
          height,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    iframe.onerror = (event) => {
      cleanup();
      reject(new Error(`Failed to load iframe: ${event}`));
    };

    // Trigger iframe load — use srcdoc for same-origin access
    iframe.srcdoc = '<html><body></body></html>';
  });

  // Race against a timeout to prevent hanging
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('UI render timed out')), TIMEOUT_MS),
  );
  return Promise.race([renderPromise, timeoutPromise]);
}

/**
 * Convenience wrapper: generates the HTML and renders it in one call.
 */
export async function generateAndRender(
  prompt: string,
  libraryName?: string,
): Promise<RenderResult & { uiType: string }> {
  const generated = generateUIHTML(prompt, libraryName);
  const result = await renderHTMLToImage(generated.html, generated.width, generated.height);
  return {
    ...result,
    uiType: generated.uiType,
  };
}
