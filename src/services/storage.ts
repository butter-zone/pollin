/**
 * Canvas persistence service.
 *
 * Uses localStorage for canvas state (objects, viewport, settings).
 * Auto-saves are debounced to avoid thrashing during drag / draw.
 *
 * Storage layout:
 *   pollin:canvas   – serialised CanvasSnapshot (objects + viewport + settings)
 *   pollin:meta     – last-saved timestamp, version
 */

import type { CanvasObject, DesignLibrary } from '@/types/canvas';

// ── Types ─────────────────────────────────────────────────

/** Everything we persist across page loads */
export interface CanvasSnapshot {
  version: number;
  savedAt: number;
  objects: CanvasObject[];
  libraries: DesignLibrary[];
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
  };
  settings: {
    showGrid: boolean;
    gridSize: number;
    snapToGrid: boolean;
    lineWidth: number;
    lineColor: string;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    cornerRadius: number;
    opacity: number;
  };
}

// ── Constants ─────────────────────────────────────────────

const STORAGE_KEY = 'pollin:canvas';
const META_KEY = 'pollin:meta';
const CURRENT_VERSION = 1;

// ── Helpers ───────────────────────────────────────────────

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__pollin_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ── Public API ────────────────────────────────────────────

/** Save a canvas snapshot to localStorage. */
export function saveCanvas(snapshot: CanvasSnapshot): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    const data = JSON.stringify(snapshot);
    localStorage.setItem(STORAGE_KEY, data);
    localStorage.setItem(
      META_KEY,
      JSON.stringify({ savedAt: snapshot.savedAt, version: snapshot.version }),
    );
    return true;
  } catch (err) {
    // Likely quota exceeded (large base64 images)
    console.warn('[pollin] save failed:', err);
    return false;
  }
}

/** Load the most recent canvas snapshot, or null if none exists. */
export function loadCanvas(): CanvasSnapshot | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CanvasSnapshot;

    // Version gate — only load if we understand the format
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('[pollin] unknown snapshot version', parsed.version);
      return null;
    }

    return parsed;
  } catch {
    console.warn('[pollin] failed to parse saved canvas');
    return null;
  }
}

/** Clear all saved data. */
export function clearSavedCanvas(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
}

/** Check if there's a saved canvas (without parsing it). */
export function hasSavedCanvas(): boolean {
  if (!isLocalStorageAvailable()) return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/** Return the timestamp of the last save, or null. */
export function lastSavedAt(): number | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const meta = JSON.parse(raw);
    return meta.savedAt ?? null;
  } catch {
    return null;
  }
}

// ── Build snapshot from current state ─────────────────────

export function buildSnapshot(state: {
  objects: CanvasObject[];
  libraries: DesignLibrary[];
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  lineWidth: number;
  lineColor: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius: number;
  opacity: number;
}): CanvasSnapshot {
  return {
    version: CURRENT_VERSION,
    savedAt: Date.now(),
    objects: state.objects,
    libraries: state.libraries,
    viewport: {
      zoom: state.zoom,
      panX: state.panX,
      panY: state.panY,
    },
    settings: {
      showGrid: state.showGrid,
      gridSize: state.gridSize,
      snapToGrid: state.snapToGrid,
      lineWidth: state.lineWidth,
      lineColor: state.lineColor,
      fillColor: state.fillColor,
      strokeColor: state.strokeColor,
      strokeWidth: state.strokeWidth,
      cornerRadius: state.cornerRadius,
      opacity: state.opacity,
    },
  };
}

// ── Export / Import ───────────────────────────────────────

/** Export current canvas as a downloadable .pollin.json file. */
export function exportCanvasFile(snapshot: CanvasSnapshot): void {
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pollin-${new Date().toISOString().slice(0, 10)}.pollin.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import a .pollin.json file and return the snapshot. */
export function importCanvasFile(): Promise<CanvasSnapshot | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pollin.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as CanvasSnapshot;
        if (parsed.version !== CURRENT_VERSION) {
          console.warn('[pollin] imported file has unknown version', parsed.version);
          return resolve(null);
        }
        resolve(parsed);
      } catch {
        console.warn('[pollin] failed to parse imported file');
        resolve(null);
      }
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}
