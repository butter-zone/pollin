/**
 * snap-guides.ts
 *
 * Smart alignment guides for the canvas.  When dragging an object, this
 * module detects nearby edges / centers of other objects and produces:
 *
 * 1. **Snap corrections** — small (x, y) offsets to apply to the dragged
 *    object so it snaps to the nearest guide.
 * 2. **Guide lines** — horizontal / vertical lines to render as visual
 *    feedback during the drag.
 *
 * Design-token-aligned: uses OKLCH accent color for guide rendering.
 */

import type { Rect } from '@/types/canvas';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SnapGuide {
  /** 'h' for a horizontal line (matches Y coords), 'v' for vertical (matches X). */
  axis: 'h' | 'v';
  /** The world-space coordinate of the guide line. */
  position: number;
  /** Start of the line segment (the other axis). */
  from: number;
  /** End of the line segment. */
  to: number;
}

export interface SnapResult {
  /** Correction to apply to the dragged object's X position. */
  dx: number;
  /** Correction to apply to the dragged object's Y position. */
  dy: number;
  /** Guide lines to render. */
  guides: SnapGuide[];
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Maximum distance (world-space px) to snap. */
const SNAP_THRESHOLD = 6;

// ---------------------------------------------------------------------------
// Edge extraction
// ---------------------------------------------------------------------------

interface Edges {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
}

function edgesFromRect(r: Rect): Edges {
  return {
    left: r.x,
    right: r.x + r.width,
    top: r.y,
    bottom: r.y + r.height,
    cx: r.x + r.width / 2,
    cy: r.y + r.height / 2,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute snap corrections and visual guides for a dragging rectangle
 * against a set of reference rectangles (other objects on the canvas).
 *
 * Performance: O(n) scan of reference rects.  For typical canvas sizes
 * (< 500 objects) this takes < 0.1 ms.  The QuadTree could pre-filter
 * candidates but is overkill here — we already have the object list.
 *
 * @param dragging     Bounds of the object being dragged (before snap).
 * @param references   Bounds of all other objects on the canvas.
 * @param gridSize     Grid spacing (if snap-to-grid is on, this is used
 *                     as an additional set of guides).
 * @param snapToGrid   Whether grid snapping is enabled.
 */
export function computeSnap(
  dragging: Rect,
  references: Rect[],
  gridSize: number,
  snapToGrid: boolean,
): SnapResult {
  const d = edgesFromRect(dragging);

  // Collect candidate snap positions on each axis
  // Each candidate: { value, refFrom, refTo } where refFrom/refTo
  // describe the extent of the guide line on the perpendicular axis.
  type Candidate = { value: number; refFrom: number; refTo: number };
  const xCandidates: Candidate[] = [];
  const yCandidates: Candidate[] = [];

  for (const ref of references) {
    const r = edgesFromRect(ref);

    // Vertical guide candidates (snap X positions)
    xCandidates.push(
      { value: r.left,  refFrom: r.top, refTo: r.bottom },
      { value: r.right, refFrom: r.top, refTo: r.bottom },
      { value: r.cx,    refFrom: r.top, refTo: r.bottom },
    );

    // Horizontal guide candidates (snap Y positions)
    yCandidates.push(
      { value: r.top,    refFrom: r.left, refTo: r.right },
      { value: r.bottom, refFrom: r.left, refTo: r.right },
      { value: r.cy,     refFrom: r.left, refTo: r.right },
    );
  }

  // Optionally add grid lines as candidates
  if (snapToGrid && gridSize > 0) {
    const gridRange = 200; // how many grid lines to check
    const startX = Math.floor((d.cx - gridRange * gridSize) / gridSize) * gridSize;
    const startY = Math.floor((d.cy - gridRange * gridSize) / gridSize) * gridSize;
    for (let i = 0; i < gridRange * 2; i++) {
      xCandidates.push({ value: startX + i * gridSize, refFrom: -1e9, refTo: 1e9 });
      yCandidates.push({ value: startY + i * gridSize, refFrom: -1e9, refTo: 1e9 });
    }
  }

  // For the dragged object, we check its left, right, and center X against
  // all x candidates; similarly for top, bottom, center Y.
  const dXEdges = [d.left, d.right, d.cx];
  const dYEdges = [d.top, d.bottom, d.cy];

  let bestDx = Infinity;
  let bestDy = Infinity;
  const matchedX: { snapPos: number; candidate: Candidate }[] = [];
  const matchedY: { snapPos: number; candidate: Candidate }[] = [];

  // Find best X snap
  for (const dx of dXEdges) {
    for (const c of xCandidates) {
      const diff = c.value - dx;
      const absDiff = Math.abs(diff);
      if (absDiff > SNAP_THRESHOLD) continue;
      if (absDiff < Math.abs(bestDx)) {
        bestDx = diff;
        matchedX.length = 0;
        matchedX.push({ snapPos: c.value, candidate: c });
      } else if (absDiff === Math.abs(bestDx)) {
        matchedX.push({ snapPos: c.value, candidate: c });
      }
    }
  }

  // Find best Y snap
  for (const dy of dYEdges) {
    for (const c of yCandidates) {
      const diff = c.value - dy;
      const absDiff = Math.abs(diff);
      if (absDiff > SNAP_THRESHOLD) continue;
      if (absDiff < Math.abs(bestDy)) {
        bestDy = diff;
        matchedY.length = 0;
        matchedY.push({ snapPos: c.value, candidate: c });
      } else if (absDiff === Math.abs(bestDy)) {
        matchedY.push({ snapPos: c.value, candidate: c });
      }
    }
  }

  const dx = Math.abs(bestDx) <= SNAP_THRESHOLD ? bestDx : 0;
  const dy = Math.abs(bestDy) <= SNAP_THRESHOLD ? bestDy : 0;

  // Build guide lines
  const guides: SnapGuide[] = [];

  if (dx !== 0) {
    // Deduplicate by snap position
    const seen = new Set<number>();
    for (const m of matchedX) {
      if (seen.has(m.snapPos)) continue;
      seen.add(m.snapPos);
      // Extend guide line to cover both the dragged object and the reference
      const from = Math.min(m.candidate.refFrom, d.top + dx);
      const to = Math.max(m.candidate.refTo, d.bottom + dx);
      guides.push({ axis: 'v', position: m.snapPos, from, to });
    }
  }

  if (dy !== 0) {
    const seen = new Set<number>();
    for (const m of matchedY) {
      if (seen.has(m.snapPos)) continue;
      seen.add(m.snapPos);
      const from = Math.min(m.candidate.refFrom, d.left + dy);
      const to = Math.max(m.candidate.refTo, d.right + dy);
      guides.push({ axis: 'h', position: m.snapPos, from, to });
    }
  }

  return { dx, dy, guides };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Draw snap guide lines on the canvas context.
 *
 * Uses the design system accent color (oklch) with a dashed pattern.
 * Call this inside the render loop, within the world-space transform.
 *
 * @param ctx     Canvas 2D rendering context (already in world coordinates).
 * @param guides  Array of active guides from `computeSnap`.
 * @param zoom    Current zoom level — used to keep dashes device-pixel-sized.
 */
export function drawSnapGuides(
  ctx: CanvasRenderingContext2D,
  guides: SnapGuide[],
  zoom: number,
): void {
  if (guides.length === 0) return;

  ctx.save();
  ctx.strokeStyle = 'oklch(0.7 0.2 250)'; // accent blue, visible on dark bg
  ctx.lineWidth = 1 / zoom;               // 1 device pixel regardless of zoom
  ctx.setLineDash([4 / zoom, 3 / zoom]);

  for (const g of guides) {
    ctx.beginPath();
    if (g.axis === 'v') {
      ctx.moveTo(g.position, g.from);
      ctx.lineTo(g.position, g.to);
    } else {
      ctx.moveTo(g.from, g.position);
      ctx.lineTo(g.to, g.position);
    }
    ctx.stroke();
  }

  ctx.restore();
}
