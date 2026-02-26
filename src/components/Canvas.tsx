import { useEffect, useRef, useCallback } from 'react';
import type {
  CanvasState,
  CanvasObject,
  StrokeObject,
  RectObject,
  EllipseObject,
  LineObject,
  DrawPoint,
  Point,
} from '@/types/canvas';

// ── helpers ────────────────────────────────────────────
let _id = 0;
const uid = () => `obj-${Date.now()}-${++_id}`;

/** Module-level image cache — avoids re-creating Image() every frame */
const imageCache = new Map<string, HTMLImageElement>();

function screenToWorld(
  sx: number,
  sy: number,
  zoom: number,
  panX: number,
  panY: number,
): Point {
  return { x: (sx - panX) / zoom, y: (sy - panY) / zoom };
}

// ── Props ──────────────────────────────────────────────
interface CanvasProps {
  state: CanvasState;
  onAddObject: (obj: CanvasObject) => void;
  onUpdateObject: (id: string, changes: Partial<CanvasObject>) => void;
  onDeleteObjects: (ids: string[]) => void;
  onSetSelection: (ids: string[]) => void;
  onSetZoom: (z: number) => void;
  onSetPan: (x: number, y: number) => void;
  onSetDrawing: (d: boolean) => void;
}

export function Canvas({
  state,
  onAddObject,
  onUpdateObject,
  onDeleteObjects,
  onSetSelection,
  onSetZoom,
  onSetPan,
  onSetDrawing,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);

  // Interaction state kept in refs (avoids re-renders per pointer-move)
  const drawingPoints = useRef<DrawPoint[]>([]);
  const shapeStart = useRef<Point | null>(null);
  const shapePreview = useRef<CanvasObject | null>(null);
  const panStart = useRef<Point | null>(null);
  const panOrigin = useRef<Point>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const spaceHeld = useRef(false);
  const dragStart = useRef<Point | null>(null);
  const dragObjOrigins = useRef<Map<string, Point>>(new Map());

  // ── resize ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctxRef.current = ctx;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      scheduleRender();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── render loop ──────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const { zoom, panX, panY } = state;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // grid
    if (state.showGrid) {
      drawGrid(ctx, w, h, zoom, panX, panY, state.gridSize);
    }

    // objects
    state.objects.forEach((obj) => {
      if (!obj.visible) return;
      drawObject(ctx, obj, state.selectedIds.includes(obj.id));
    });

    // live shape preview
    if (shapePreview.current) {
      drawObject(ctx, shapePreview.current, false);
    }

    // live stroke preview
    if (drawingPoints.current.length > 1) {
      ctx.globalAlpha = state.opacity;
      ctx.strokeStyle = state.lineColor;
      ctx.lineWidth = state.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      drawingPoints.current.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
  }, [render]);

  useEffect(() => {
    scheduleRender();
  }, [scheduleRender]);

  // ── keyboard ─────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spaceHeld.current) {
        spaceHeld.current = true;
        e.preventDefault();
      }
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (state.selectedIds.length > 0) {
          onDeleteObjects(state.selectedIds);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceHeld.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [state.selectedIds, onDeleteObjects]);

  // ── pointer handlers ─────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = screenToWorld(sx, sy, state.zoom, state.panX, state.panY);

      // pan with middle-click or space-held
      if (e.button === 1 || spaceHeld.current || state.activeTool === 'hand') {
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
        panOrigin.current = { x: state.panX, y: state.panY };
        return;
      }

      if (state.activeTool === 'select') {
        // hit test
        const hit = hitTest(state.objects, world);
        if (hit) {
          const alreadySelected = state.selectedIds.includes(hit.id);
          if (e.shiftKey) {
            onSetSelection(
              alreadySelected
                ? state.selectedIds.filter((id) => id !== hit.id)
                : [...state.selectedIds, hit.id],
            );
          } else if (!alreadySelected) {
            onSetSelection([hit.id]);
          }
          // begin drag
          dragStart.current = world;
          dragObjOrigins.current = new Map();
          const ids = alreadySelected ? state.selectedIds : [hit.id];
          ids.forEach((id) => {
            const obj = state.objects.find((o) => o.id === id);
            if (obj) dragObjOrigins.current.set(id, { x: obj.x, y: obj.y });
          });
        } else {
          onSetSelection([]);
        }
        return;
      }

      if (state.activeTool === 'pen') {
        onSetDrawing(true);
        drawingPoints.current = [{ ...world, timestamp: Date.now() }];
        return;
      }

      if (['rect', 'ellipse', 'line'].includes(state.activeTool)) {
        shapeStart.current = state.snapToGrid ? snapPoint(world, state.gridSize) : world;
        return;
      }

      if (state.activeTool === 'eraser') {
        const hit = hitTest(state.objects, world);
        if (hit) onDeleteObjects([hit.id]);
        return;
      }
    },
    [state, onSetSelection, onSetDrawing, onDeleteObjects],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = screenToWorld(sx, sy, state.zoom, state.panX, state.panY);

      // panning
      if (isPanning.current && panStart.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        onSetPan(panOrigin.current.x + dx, panOrigin.current.y + dy);
        return;
      }

      // dragging selected objects
      if (dragStart.current && state.activeTool === 'select') {
        const dx = world.x - dragStart.current.x;
        const dy = world.y - dragStart.current.y;
        dragObjOrigins.current.forEach((origin, id) => {
          let nx = origin.x + dx;
          let ny = origin.y + dy;
          if (state.snapToGrid) {
            nx = snapToGrid(nx, state.gridSize);
            ny = snapToGrid(ny, state.gridSize);
          }
          onUpdateObject(id, { x: nx, y: ny });
        });
        scheduleRender();
        return;
      }

      // drawing stroke
      if (state.isDrawing && state.activeTool === 'pen') {
        drawingPoints.current.push({ ...world, timestamp: Date.now() });
        scheduleRender();
        return;
      }

      // shape preview
      if (shapeStart.current && ['rect', 'ellipse', 'line'].includes(state.activeTool)) {
        const end = state.snapToGrid ? snapPoint(world, state.gridSize) : world;
        shapePreview.current = buildShapePreview(
          state.activeTool as 'rect' | 'ellipse' | 'line',
          shapeStart.current,
          end,
          state,
        );
        scheduleRender();
        return;
      }

      // eraser drag
      if (e.buttons === 1 && state.activeTool === 'eraser') {
        const hit = hitTest(state.objects, world);
        if (hit) onDeleteObjects([hit.id]);
      }
    },
    [state, onSetPan, onUpdateObject, onDeleteObjects, scheduleRender],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      canvas.releasePointerCapture(e.pointerId);

      // finish pan
      if (isPanning.current) {
        isPanning.current = false;
        panStart.current = null;
        return;
      }

      // finish drag
      if (dragStart.current) {
        dragStart.current = null;
        dragObjOrigins.current.clear();
        return;
      }

      // finish stroke
      if (state.isDrawing && state.activeTool === 'pen' && drawingPoints.current.length > 1) {
        const stroke: StrokeObject = {
          id: uid(),
          kind: 'stroke',
          x: 0,
          y: 0,
          rotation: 0,
          opacity: state.opacity,
          locked: false,
          visible: true,
          name: 'Stroke',
          timestamp: Date.now(),
          points: [...drawingPoints.current],
          color: state.lineColor,
          lineWidth: state.lineWidth,
        };
        onAddObject(stroke);
        drawingPoints.current = [];
        onSetDrawing(false);
        return;
      }

      // finish shape
      if (shapeStart.current && shapePreview.current) {
        onAddObject({ ...shapePreview.current, id: uid() });
        shapeStart.current = null;
        shapePreview.current = null;
        return;
      }

      drawingPoints.current = [];
      onSetDrawing(false);
    },
    [state, onAddObject, onSetDrawing],
  );

  // ── wheel zoom (native listener for non-passive) ────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newZoom = Math.max(0.05, Math.min(20, state.zoom * factor));

      const newPanX = sx - (sx - state.panX) * (newZoom / state.zoom);
      const newPanY = sy - (sy - state.panY) * (newZoom / state.zoom);

      onSetZoom(newZoom);
      onSetPan(newPanX, newPanY);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [state.zoom, state.panX, state.panY, onSetZoom, onSetPan]);

  // ── drag-drop image support ──────────────────────────
  const onDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const dropPos = screenToWorld(sx, sy, state.zoom, state.panX, state.panY);
      const snapped = state.snapToGrid ? snapPoint(dropPos, state.gridSize) : dropPos;

      files.forEach((file) => {
        // only images
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const imgObj: CanvasObject = {
              id: uid(),
              kind: 'image',
              x: snapped.x,
              y: snapped.y,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              name: file.name,
              timestamp: Date.now(),
              src,
              width: Math.min(img.width, 400),
              height: Math.min(img.height, 300),
            };
            onAddObject(imgObj);
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      });
    },
    [state, onAddObject],
  );

  // ── cursor ───────────────────────────────────────────
  const cursor = (() => {
    if (isPanning.current || spaceHeld.current || state.activeTool === 'hand')
      return 'grab';
    if (state.activeTool === 'select') return 'default';
    if (state.activeTool === 'pen') return 'crosshair';
    if (state.activeTool === 'eraser') return 'crosshair';
    return 'crosshair';
  })();

  return (
    <canvas
      ref={canvasRef}
      className="canvas-surface"
      style={{ cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDragOver={onDragOver}
      onDrop={onDrop}
      role="img"
      aria-label="Infinite drawing canvas"
    />
  );
}

// ── Drawing helpers ────────────────────────────────────
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function snapPoint(p: Point, gridSize: number): Point {
  return { x: snapToGrid(p.x, gridSize), y: snapToGrid(p.y, gridSize) };
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  zoom: number,
  panX: number,
  panY: number,
  gridSize: number,
) {
  const gs = gridSize;
  const startX = Math.floor(-panX / zoom / gs) * gs;
  const startY = Math.floor(-panY / zoom / gs) * gs;
  const endX = startX + w / zoom + gs;
  const endY = startY + h / zoom + gs;

  // Dot radius scales with zoom but stays subtle
  const dotRadius = Math.max(0.8, 1.2 / zoom);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';

  for (let x = startX; x < endX; x += gs) {
    for (let y = startY; y < endY; y += gs) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject,
  selected: boolean,
) {
  ctx.save();
  ctx.globalAlpha = obj.opacity;

  switch (obj.kind) {
    case 'stroke': {
      const s = obj;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      s.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      break;
    }
    case 'rect': {
      const r = obj;
      ctx.translate(r.x + r.width / 2, r.y + r.height / 2);
      ctx.rotate((r.rotation * Math.PI) / 180);
      if (r.fill && r.fill !== 'transparent') {
        ctx.fillStyle = r.fill;
        ctx.beginPath();
        roundRect(ctx, -r.width / 2, -r.height / 2, r.width, r.height, r.cornerRadius);
        ctx.fill();
      }
      if (r.strokeWidth > 0) {
        ctx.strokeStyle = r.stroke;
        ctx.lineWidth = r.strokeWidth;
        ctx.beginPath();
        roundRect(ctx, -r.width / 2, -r.height / 2, r.width, r.height, r.cornerRadius);
        ctx.stroke();
      }
      break;
    }
    case 'ellipse': {
      const el = obj;
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(el.radiusX), Math.abs(el.radiusY), 0, 0, Math.PI * 2);
      if (el.fill && el.fill !== 'transparent') {
        ctx.fillStyle = el.fill;
        ctx.fill();
      }
      if (el.strokeWidth > 0) {
        ctx.strokeStyle = el.stroke;
        ctx.lineWidth = el.strokeWidth;
        ctx.stroke();
      }
      break;
    }
    case 'line': {
      const l = obj;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      break;
    }
    case 'image': {
      const img = obj as any;
      const cached = imageCache.get(img.src);
      if (cached) {
        ctx.translate(img.x, img.y);
        ctx.rotate((img.rotation * Math.PI) / 180);
        ctx.drawImage(cached, -img.width / 2, -img.height / 2, img.width, img.height);
      } else {
        // Load and cache for next frame
        const imgEl = new Image();
        imgEl.onload = () => {
          imageCache.set(img.src, imgEl);
        };
        imgEl.src = img.src;
      }
      break;
    }
    default:
      break;
  }

  ctx.restore();

  // selection highlight
  if (selected) {
    ctx.save();
    const bounds = getObjectBounds(obj);
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 1.5 / 1; // we're already in world space
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
    ctx.setLineDash([]);

    // corner handles
    const corners = [
      { x: bounds.x - 4, y: bounds.y - 4 },
      { x: bounds.x + bounds.width + 4, y: bounds.y - 4 },
      { x: bounds.x - 4, y: bounds.y + bounds.height + 4 },
      { x: bounds.x + bounds.width + 4, y: bounds.y + bounds.height + 4 },
    ];
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 1.5;
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function getObjectBounds(obj: CanvasObject): { x: number; y: number; width: number; height: number } {
  switch (obj.kind) {
    case 'stroke': {
      const xs = obj.points.map((p) => p.x);
      const ys = obj.points.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
    }
    case 'rect':
      return { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
    case 'ellipse':
      return {
        x: obj.x - Math.abs(obj.radiusX),
        y: obj.y - Math.abs(obj.radiusY),
        width: Math.abs(obj.radiusX) * 2,
        height: Math.abs(obj.radiusY) * 2,
      };
    case 'line': {
      const minX = Math.min(obj.x, obj.x2);
      const minY = Math.min(obj.y, obj.y2);
      return {
        x: minX,
        y: minY,
        width: Math.abs(obj.x2 - obj.x),
        height: Math.abs(obj.y2 - obj.y),
      };
    }
    case 'image': {
      const img = obj as any;
      return {
        x: img.x - img.width / 2,
        y: img.y - img.height / 2,
        width: img.width,
        height: img.height,
      };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

function hitTest(objects: CanvasObject[], point: Point): CanvasObject | null {
  // iterate reverse so top-most wins
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (!obj.visible || obj.locked) continue;
    const b = getObjectBounds(obj);
    const margin = 6;
    if (
      point.x >= b.x - margin &&
      point.x <= b.x + b.width + margin &&
      point.y >= b.y - margin &&
      point.y <= b.y + b.height + margin
    ) {
      return obj;
    }
  }
  return null;
}

function buildShapePreview(
  tool: 'rect' | 'ellipse' | 'line',
  start: Point,
  end: Point,
  state: CanvasState,
): CanvasObject {
  const base = {
    id: '__preview__',
    rotation: 0,
    opacity: state.opacity,
    locked: false,
    visible: true,
    name: '',
    timestamp: Date.now(),
  };

  if (tool === 'rect') {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    return {
      ...base,
      kind: 'rect',
      x,
      y,
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
      fill: state.fillColor,
      stroke: state.strokeColor,
      strokeWidth: state.strokeWidth,
      cornerRadius: state.cornerRadius,
    } as RectObject;
  }

  if (tool === 'ellipse') {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    return {
      ...base,
      kind: 'ellipse',
      x: cx,
      y: cy,
      radiusX: Math.abs(end.x - start.x) / 2,
      radiusY: Math.abs(end.y - start.y) / 2,
      fill: state.fillColor,
      stroke: state.strokeColor,
      strokeWidth: state.strokeWidth,
    } as EllipseObject;
  }

  // line
  return {
    ...base,
    kind: 'line',
    x: start.x,
    y: start.y,
    x2: end.x,
    y2: end.y,
    color: state.strokeColor,
    lineWidth: state.strokeWidth,
  } as LineObject;
}
