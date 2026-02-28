import { useEffect, useRef, useCallback } from 'react';
import type {
  CanvasState,
  CanvasObject,
  StrokeObject,
  RectObject,
  EllipseObject,
  LineObject,
  TextObject,
  DrawPoint,
  Point,
  LibraryComponent,
} from '@/types/canvas';
import { renderHTMLToImage } from '@/services/ui-renderer';
import { generateComponentPreviewHTML } from '@/services/component-preview';
import { getTheme } from '@/services/ui-templates';
import { QuadTree } from '@/services/quadtree';
import { storeImage, loadImage, isImageRef } from '@/services/image-store';
import { computeSnap, drawSnapGuides, type SnapGuide } from '@/services/snap-guides';

// ── helpers ────────────────────────────────────────────
let _id = 0;
const uid = () => `obj-${Date.now()}-${++_id}`;

/** Module-level image cache — avoids re-creating Image() every frame */
const imageCache = new Map<string, HTMLImageElement>();

/** Module-level spatial index — rebuilt when objects change */
const spatialIndex = new QuadTree({ x: -10000, y: -10000, width: 20000, height: 20000 });

/** Track the object list identity to avoid redundant rebuilds */
let lastIndexedObjects: CanvasObject[] | null = null;

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
  onBeginTransaction?: () => void;
  onEndTransaction?: () => void;
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
  onBeginTransaction,
  onEndTransaction,
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
  const cursorWorld = useRef<Point | null>(null);
  const editingTextId = useRef<string | null>(null);

  // Snap guides — active during drag
  const activeGuides = useRef<SnapGuide[]>([]);

  // Resize handle state
  const resizeHandle = useRef<{
    corner: 'tl' | 'tr' | 'bl' | 'br';
    objId: string;
    startWorld: Point;
    originalBounds: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Rotation handle state
  const rotateHandle = useRef<{
    objId: string;
    startAngle: number;  // angle from center to initial click (radians)
    originalRotation: number;  // object's rotation at drag start (degrees)
  } | null>(null);

  // ── resize (ResizeObserver) ───────────────────────────
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

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas.parentElement || canvas);
    return () => observer.disconnect();
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

    // grid — disable magnetic cursor effect in draw mode or when objects exist
    if (state.showGrid) {
      const isDrawTool = !['select', 'hand'].includes(state.activeTool);
      const hasObjects = state.objects.length > 0;
      const magneticCursor = (isDrawTool || hasObjects) ? null : cursorWorld.current;
      drawGrid(ctx, w, h, zoom, panX, panY, state.gridSize, magneticCursor);
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
      drawSmoothStroke(ctx, drawingPoints.current);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // snap alignment guides (during drag)
    if (activeGuides.current.length > 0) {
      drawSnapGuides(ctx, activeGuides.current, zoom);
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
      // Don't intercept keys when user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;

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
        // Check resize handles first (only when exactly one object is selected)
        if (state.selectedIds.length === 1) {
          const selObj = state.objects.find((o) => o.id === state.selectedIds[0]);
          if (selObj) {
            const bounds = getObjectBounds(selObj);
            const cx = bounds.x + bounds.width / 2;
            const cy = bounds.y + bounds.height / 2;
            // Transform click into object-local space (undo object rotation)
            const rad = -(selObj.rotation * Math.PI) / 180;
            const cosR = Math.cos(rad);
            const sinR = Math.sin(rad);
            const localX = cosR * (world.x - cx) - sinR * (world.y - cy) + cx;
            const localY = sinR * (world.x - cx) + cosR * (world.y - cy) + cy;
            const corners: Array<{ key: 'tl' | 'tr' | 'bl' | 'br'; x: number; y: number }> = [
              { key: 'tl', x: bounds.x - 4, y: bounds.y - 4 },
              { key: 'tr', x: bounds.x + bounds.width + 4, y: bounds.y - 4 },
              { key: 'bl', x: bounds.x - 4, y: bounds.y + bounds.height + 4 },
              { key: 'br', x: bounds.x + bounds.width + 4, y: bounds.y + bounds.height + 4 },
            ];
            // Check rotation zones first (slightly outside corners, 8-16px radius)
            const rotateInner = 8 / state.zoom;
            const rotateOuter = 18 / state.zoom;
            for (const c of corners) {
              const dx = localX - c.x;
              const dy = localY - c.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              // Rotation zone: outside the resize handle but within an outer radius
              if (dist > rotateInner && dist <= rotateOuter) {
                const startAngle = Math.atan2(world.y - cy, world.x - cx);
                rotateHandle.current = {
                  objId: selObj.id,
                  startAngle,
                  originalRotation: selObj.rotation,
                };
                onBeginTransaction?.();
                return;
              }
              // Resize zone: inside the handle radius
              if (dist <= rotateInner) {
                resizeHandle.current = {
                  corner: c.key,
                  objId: selObj.id,
                  startWorld: world,
                  originalBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
                };
                onBeginTransaction?.();
                return;
              }
            }
          }
        }

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
          onBeginTransaction?.();
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

      // text tool — place a text object and begin inline editing
      if (state.activeTool === 'text') {
        const snapped = state.snapToGrid ? snapPoint(world, state.gridSize) : world;
        const textObj: TextObject = {
          id: uid(),
          kind: 'text',
          x: snapped.x,
          y: snapped.y,
          rotation: 0,
          opacity: state.opacity,
          locked: false,
          visible: true,
          name: 'Text',
          timestamp: Date.now(),
          text: '',
          fontSize: 16,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: state.lineColor,
          width: 200,
        };
        onAddObject(textObj);
        onSetSelection([textObj.id]);
        // Start inline editing after a frame so the object is in state
        requestAnimationFrame(() => {
          beginInlineTextEdit(textObj.id, textObj, canvasRef.current!);
        });
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

      // Track cursor for magnetic grid dots (only used when no objects & not drawing)
      cursorWorld.current = world;

      // panning
      if (isPanning.current && panStart.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        onSetPan(panOrigin.current.x + dx, panOrigin.current.y + dy);
        return;
      }

      // rotating a selected object
      if (rotateHandle.current) {
        const rh = rotateHandle.current;
        const obj = state.objects.find((o) => o.id === rh.objId);
        if (obj) {
          const bounds = getObjectBounds(obj);
          const cx = bounds.x + bounds.width / 2;
          const cy = bounds.y + bounds.height / 2;
          const currentAngle = Math.atan2(world.y - cy, world.x - cx);
          const deltaAngle = currentAngle - rh.startAngle;
          let newRotation = rh.originalRotation + (deltaAngle * 180) / Math.PI;
          // Snap to 15° increments when holding Shift
          if (e.shiftKey) {
            newRotation = Math.round(newRotation / 15) * 15;
          }
          onUpdateObject(rh.objId, { rotation: newRotation });
        }
        scheduleRender();
        return;
      }

      // resizing a selected object via handle
      if (resizeHandle.current) {
        const rh = resizeHandle.current;
        const ob = rh.originalBounds;
        const dx = world.x - rh.startWorld.x;
        const dy = world.y - rh.startWorld.y;

        let newX = ob.x;
        let newY = ob.y;
        let newW = ob.width;
        let newH = ob.height;

        // Compute new bounds based on which corner is dragged
        if (rh.corner === 'br') {
          newW = Math.max(10, ob.width + dx);
          newH = Math.max(10, ob.height + dy);
        } else if (rh.corner === 'bl') {
          newX = ob.x + dx;
          newW = Math.max(10, ob.width - dx);
          newH = Math.max(10, ob.height + dy);
        } else if (rh.corner === 'tr') {
          newY = ob.y + dy;
          newW = Math.max(10, ob.width + dx);
          newH = Math.max(10, ob.height - dy);
        } else {
          // tl
          newX = ob.x + dx;
          newY = ob.y + dy;
          newW = Math.max(10, ob.width - dx);
          newH = Math.max(10, ob.height - dy);
        }

        if (state.snapToGrid) {
          newX = snapToGrid(newX, state.gridSize);
          newY = snapToGrid(newY, state.gridSize);
          newW = snapToGrid(newW, state.gridSize) || state.gridSize;
          newH = snapToGrid(newH, state.gridSize) || state.gridSize;
        }

        const obj = state.objects.find((o) => o.id === rh.objId);
        if (obj) {
          const changes = getResizeChanges(obj, newX, newY, newW, newH);
          onUpdateObject(rh.objId, changes);
        }
        scheduleRender();
        return;
      }

      // dragging selected objects
      if (dragStart.current && state.activeTool === 'select') {
        const dx = world.x - dragStart.current.x;
        const dy = world.y - dragStart.current.y;

        // Compute snap guides against non-selected objects
        const selectedSet = new Set(state.selectedIds);
        const refBounds = state.objects
          .filter((o) => !selectedSet.has(o.id) && o.visible)
          .map(getObjectBounds);

        dragObjOrigins.current.forEach((origin, id) => {
          let nx = origin.x + dx;
          let ny = origin.y + dy;

          // Smart snap: try object-to-object alignment first
          const obj = state.objects.find((o) => o.id === id);
          if (obj) {
            const candidateBounds = { ...getObjectBounds(obj), x: nx, y: ny };
            // For image/ellipse, adjust bounds since x,y is center
            if (obj.kind === 'image' || obj.kind === 'ellipse') {
              candidateBounds.x = nx - candidateBounds.width / 2;
              candidateBounds.y = ny - candidateBounds.height / 2;
            }
            const snap = computeSnap(candidateBounds, refBounds, state.gridSize, state.snapToGrid);
            nx += snap.dx;
            ny += snap.dy;
            activeGuides.current = snap.guides;
          } else if (state.snapToGrid) {
            nx = snapToGrid(nx, state.gridSize);
            ny = snapToGrid(ny, state.gridSize);
            activeGuides.current = [];
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

      // Trigger render for magnetic grid effect on hover (skip when disabled)
      const magneticActive = state.showGrid
        && ['select', 'hand'].includes(state.activeTool)
        && state.objects.length === 0;
      if (magneticActive) scheduleRender();
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

      // finish rotation
      if (rotateHandle.current) {
        rotateHandle.current = null;
        onEndTransaction?.();
        return;
      }

      // finish resize
      if (resizeHandle.current) {
        resizeHandle.current = null;
        onEndTransaction?.();
        return;
      }

      // finish drag
      if (dragStart.current) {
        dragStart.current = null;
        dragObjOrigins.current.clear();
        activeGuides.current = [];
        onEndTransaction?.();
        scheduleRender();
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

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const dropPos = screenToWorld(sx, sy, state.zoom, state.panX, state.panY);
      const snapped = state.snapToGrid ? snapPoint(dropPos, state.gridSize) : dropPos;

      // Handle component drops from the library panel
      const compData = e.dataTransfer.getData('application/pollin-component');
      if (compData) {
        try {
          const { component, libraryId } = JSON.parse(compData) as {
            component: LibraryComponent;
            libraryId: string;
          };
          // Find library name from the state's libraries
          const lib = (state as any).libraries?.find?.((l: any) => l.id === libraryId);
          const libraryName = lib?.name as string | undefined;
          const theme = getTheme(libraryName);
          const { html, width, height } = generateComponentPreviewHTML(
            component.name,
            component.category,
            libraryName,
            theme,
          );
          renderHTMLToImage(html, width, height).then(async (result) => {
            const ref = await storeImage(result.dataUrl);
            const imgObj: CanvasObject = {
              id: uid(),
              kind: 'image',
              x: snapped.x - result.width / 2,
              y: snapped.y - result.height / 2,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              name: `${libraryName ? libraryName + ' / ' : ''}${component.name}`,
              timestamp: Date.now(),
              src: ref,
              width: result.width,
              height: result.height,
            };
            onAddObject(imgObj);
          }).catch((err) => {
            console.warn('[pollin] Component drop render failed:', err);
          });
        } catch {
          // Invalid component data — ignore
        }
        return;
      }

      const files = Array.from(e.dataTransfer.files);

      files.forEach((file) => {
        // only images
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const img = new Image();
          img.onload = async () => {
            const ref = await storeImage(src);
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
              src: ref,
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

  // ── pointer leave (clear magnetic grid cursor) ─────
  const onPointerLeave = useCallback(() => {
    cursorWorld.current = null;
    const magneticActive = state.showGrid
      && ['select', 'hand'].includes(state.activeTool)
      && state.objects.length === 0;
    if (magneticActive) scheduleRender();
  }, [state.showGrid, state.activeTool, state.objects.length, scheduleRender]);

  // ── inline text editing ──────────────────────────────
  const beginInlineTextEdit = useCallback(
    (id: string, obj: TextObject, canvas: HTMLCanvasElement) => {
      if (editingTextId.current) return; // already editing
      editingTextId.current = id;

      const rect = canvas.getBoundingClientRect();
      // Convert world → screen
      const sx = obj.x * state.zoom + state.panX + rect.left;
      const sy = obj.y * state.zoom + state.panY + rect.top;

      const input = document.createElement('textarea');
      input.value = obj.text;
      input.style.cssText = `
        position: fixed;
        left: ${sx}px;
        top: ${sy}px;
        width: ${obj.width * state.zoom}px;
        min-height: ${(obj.fontSize + 8) * state.zoom}px;
        font-size: ${obj.fontSize * state.zoom}px;
        font-family: ${obj.fontFamily};
        color: ${obj.color};
        background: transparent;
        border: 1px solid oklch(0.67 0.185 55);
        border-radius: 2px;
        outline: none;
        resize: none;
        overflow: hidden;
        padding: 2px 4px;
        z-index: 1000;
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
      `;

      document.body.appendChild(input);
      input.focus();
      input.select();

      // Auto-resize height
      const autoResize = () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
      };
      input.addEventListener('input', autoResize);
      autoResize();

      const commit = () => {
        const newText = input.value;
        if (newText.trim()) {
          onUpdateObject(id, { text: newText } as Partial<CanvasObject>);
        } else {
          // Empty text — delete the object
          onDeleteObjects([id]);
        }
        editingTextId.current = null;
        input.removeEventListener('input', autoResize);
        document.body.removeChild(input);
        scheduleRender();
      };

      input.addEventListener('blur', commit, { once: true });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          input.removeEventListener('blur', commit);
          editingTextId.current = null;
          // If brand new and empty, delete
          if (!input.value.trim()) onDeleteObjects([id]);
          document.body.removeChild(input);
          scheduleRender();
        }
        // Shift+Enter or just Enter to commit (Enter alone commits for single-line feel)
        // Actually let's use Escape to cancel and blur to commit (click away)
        e.stopPropagation();
      });
    },
    [state.zoom, state.panX, state.panY, onUpdateObject, onDeleteObjects, scheduleRender],
  );

  // ── double-click to edit text objects ────────────────
  const onDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const world = screenToWorld(sx, sy, state.zoom, state.panX, state.panY);
      const hit = hitTest(state.objects, world);
      if (hit && hit.kind === 'text') {
        onSetSelection([hit.id]);
        beginInlineTextEdit(hit.id, hit as TextObject, canvas);
      }
    },
    [state, onSetSelection, beginInlineTextEdit],
  );

  // ── cursor ───────────────────────────────────────────
  const cursor = (() => {
    if (isPanning.current || spaceHeld.current || state.activeTool === 'hand')
      return 'grab';
    if (rotateHandle.current) return 'grabbing';
    if (resizeHandle.current) {
      const c = resizeHandle.current.corner;
      if (c === 'tl' || c === 'br') return 'nwse-resize';
      return 'nesw-resize';
    }
    if (state.activeTool === 'select') return 'default';
    if (state.activeTool === 'pen') return 'crosshair';
    if (state.activeTool === 'text') return 'text';
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
      onPointerLeave={onPointerLeave}
      onDoubleClick={onDoubleClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      role="img"
      aria-label="Infinite drawing canvas"
    />
  );
}

// ── Drawing helpers ────────────────────────────────────

/**
 * Draw a smooth stroke using Catmull-Rom spline interpolation.
 *
 * Catmull-Rom produces C1-continuous curves that pass through every
 * control point, giving a natural hand-drawn feel even with sparse
 * pointer events. Segment density adapts to inter-point distance so
 * fast strokes get extra interpolated points.
 */
function drawSmoothStroke(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0) return;
  if (points.length === 1) {
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[0].x + 0.1, points[0].y);
    return;
  }
  if (points.length === 2) {
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    return;
  }

  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Adaptive segment count — more interpolation for longer gaps
    const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    const segments = Math.max(1, Math.ceil(dist / 6));

    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const t2 = t * t;
      const t3 = t2 * t;

      // Uniform Catmull-Rom basis matrix
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      ctx.lineTo(x, y);
    }
  }
}

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
  cursor: Point | null,
) {
  // Adaptive grid step: skip dots when zoomed out to cap total count.
  // At most ~200 dots per axis → ~40k total — well within budget.
  const MAX_DOTS_PER_AXIS = 200;
  const worldW = w / zoom;
  const worldH = h / zoom;
  const minStep = Math.max(worldW, worldH) / MAX_DOTS_PER_AXIS;
  const gs = Math.max(gridSize, minStep);

  // Inset grid bounds so dots (including magnetic displacement) aren't clipped at edges
  const margin = gs * 0.5;
  const startX = Math.floor((-panX / zoom + margin) / gs) * gs;
  const startY = Math.floor((-panY / zoom + margin) / gs) * gs;
  const endX = startX + worldW - margin * 2 + gs;
  const endY = startY + worldH - margin * 2 + gs;

  // Dot radius scales with zoom but stays subtle
  const baseDotRadius = Math.max(0.8, 1.2 / zoom);

  // Magnetic effect constants
  const magnetRadius = gs * 5;            // 5 grid cells influence range
  const magnetRadiusSq = magnetRadius * magnetRadius;
  const pullStrength = gs * 0.15;         // subtle pull toward cursor
  const maxRadiusScale = 2.2;             // dots grow up to 2.2x
  const baseAlpha = 0.15;
  const peakAlpha = 0.55;

  // Pre-batch non-magnetic dots in a single path for performance
  const magneticDots: { dx: number; dy: number; r: number; a: number }[] = [];
  ctx.fillStyle = `oklch(1 0 0 / ${baseAlpha})`;
  ctx.beginPath();

  for (let x = startX; x < endX; x += gs) {
    for (let y = startY; y < endY; y += gs) {
      if (cursor) {
        const ddx = cursor.x - x;
        const ddy = cursor.y - y;
        const distSq = ddx * ddx + ddy * ddy;

        if (distSq < magnetRadiusSq) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / magnetRadius;
          const ease = t * t * (3 - 2 * t); // smoothstep
          const pull = ease * pullStrength;
          const drawX = x + (dist > 0 ? (ddx / dist) * pull : 0);
          const drawY = y + (dist > 0 ? (ddy / dist) * pull : 0);
          magneticDots.push({
            dx: drawX,
            dy: drawY,
            r: baseDotRadius * (1 + ease * (maxRadiusScale - 1)),
            a: baseAlpha + ease * (peakAlpha - baseAlpha),
          });
          continue;
        }
      }
      // Non-magnetic dot — batch into single path
      ctx.moveTo(x + baseDotRadius, y);
      ctx.arc(x, y, baseDotRadius, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  // Draw magnetic dots individually (they have unique sizes/opacities)
  for (const dot of magneticDots) {
    ctx.fillStyle = `oklch(1 0 0 / ${dot.a})`;
    ctx.beginPath();
    ctx.arc(dot.dx, dot.dy, dot.r, 0, Math.PI * 2);
    ctx.fill();
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
      if (s.rotation) {
        const sb = getObjectBounds(s);
        const scx = sb.x + sb.width / 2;
        const scy = sb.y + sb.height / 2;
        ctx.translate(scx, scy);
        ctx.rotate((s.rotation * Math.PI) / 180);
        ctx.translate(-scx, -scy);
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      drawSmoothStroke(ctx, s.points);
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
      if (l.rotation) {
        const lb = getObjectBounds(l);
        const lcx = lb.x + lb.width / 2;
        const lcy = lb.y + lb.height / 2;
        ctx.translate(lcx, lcy);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.translate(-lcx, -lcy);
      }
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
      const srcKey = img.src as string;
      const cached = imageCache.get(srcKey);
      if (cached) {
        ctx.translate(img.x, img.y);
        ctx.rotate((img.rotation * Math.PI) / 180);
        ctx.drawImage(cached, -img.width / 2, -img.height / 2, img.width, img.height);
      } else if (isImageRef(srcKey)) {
        // Resolve pollin-img:// ref from IndexedDB, then cache
        loadImage(srcKey).then((dataUrl) => {
          const imgEl = new Image();
          imgEl.onload = () => { imageCache.set(srcKey, imgEl); };
          imgEl.src = dataUrl;
        }).catch(() => { /* image missing — skip */ });
      } else {
        // Plain data URL — load and cache for next frame
        const imgEl = new Image();
        imgEl.onload = () => { imageCache.set(srcKey, imgEl); };
        imgEl.src = srcKey;
      }
      break;
    }
    case 'text': {
      const t = obj as TextObject;
      if (!t.text) break; // empty text — skip rendering
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate((t.rotation * Math.PI) / 180);
      ctx.font = `${t.fontSize}px ${t.fontFamily}`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = 'top';
      // Simple word-wrap
      const words = t.text.split(/\n/);
      let lineY = 0;
      const lineHeight = t.fontSize * 1.4;
      for (const paragraph of words) {
        const parts = paragraph.split(' ');
        let line = '';
        for (const word of parts) {
          const testLine = line ? `${line} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > t.width && line) {
            ctx.fillText(line, 0, lineY);
            line = word;
            lineY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 0, lineY);
        lineY += lineHeight;
      }
      ctx.restore();
      break;
    }
    case 'component': {
      // Render component objects using their cached bitmap (same approach as images)
      const comp = obj as any;
      const cacheKey = comp.cachedImageRef as string | undefined;
      if (cacheKey) {
        const cached = imageCache.get(cacheKey);
        if (cached) {
          ctx.translate(comp.x, comp.y);
          ctx.rotate((comp.rotation * Math.PI) / 180);
          ctx.drawImage(cached, -comp.width / 2, -comp.height / 2, comp.width, comp.height);
        } else if (isImageRef(cacheKey)) {
          loadImage(cacheKey).then((dataUrl) => {
            const imgEl = new Image();
            imgEl.onload = () => { imageCache.set(cacheKey, imgEl); };
            imgEl.src = dataUrl;
          }).catch(() => { /* missing */ });
        } else {
          const imgEl = new Image();
          imgEl.onload = () => { imageCache.set(cacheKey, imgEl); };
          imgEl.src = cacheKey;
        }
      } else {
        // No cached render — draw a placeholder card
        ctx.translate(comp.x, comp.y);
        ctx.rotate((comp.rotation * Math.PI) / 180);
        ctx.fillStyle = 'oklch(0.22 0.015 260)';
        ctx.fillRect(-comp.width / 2, -comp.height / 2, comp.width, comp.height);
        ctx.strokeStyle = 'oklch(0.4 0.02 260)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-comp.width / 2, -comp.height / 2, comp.width, comp.height);
        ctx.fillStyle = 'oklch(0.6 0 0)';
        ctx.font = '13px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(comp.name || 'Component', 0, 0);
        ctx.textAlign = 'start';
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
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    // Rotate the selection highlight with the object
    ctx.translate(cx, cy);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    const hw = bounds.width / 2 + 4;
    const hh = bounds.height / 2 + 4;

    ctx.strokeStyle = 'oklch(0.67 0.185 55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
    ctx.setLineDash([]);

    // corner handles
    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: -hw, y: hh },
      { x: hw, y: hh },
    ];
    ctx.fillStyle = 'oklch(1 0 0)';
    ctx.strokeStyle = 'oklch(0.67 0.185 55)';
    ctx.lineWidth = 1.5;
    corners.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // rotation affordance: small arc at each corner (visible outside the handle)
    ctx.strokeStyle = 'oklch(0.67 0.185 55 / 0.4)';
    ctx.lineWidth = 1;
    corners.forEach((c, i) => {
      // Draw a small curved arrow outside each corner
      const startAngle = [Math.PI, -Math.PI / 2, Math.PI / 2, 0][i];
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, startAngle, startAngle + Math.PI / 2);
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
    case 'text': {
      const t = obj as TextObject;
      const lineCount = Math.max(1, (t.text.match(/\n/g) || []).length + 1);
      return {
        x: t.x,
        y: t.y,
        width: t.width,
        height: lineCount * t.fontSize * 1.4,
      };
    }
    case 'component': {
      const c = obj as any;
      return {
        x: c.x - c.width / 2,
        y: c.y - c.height / 2,
        width: c.width,
        height: c.height,
      };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/** Map new bounds to object-specific property changes. */
function getResizeChanges(
  obj: CanvasObject,
  newX: number,
  newY: number,
  newW: number,
  newH: number,
): Partial<CanvasObject> {
  switch (obj.kind) {
    case 'rect':
      return { x: newX, y: newY, width: newW, height: newH } as Partial<CanvasObject>;
    case 'ellipse':
      return {
        x: newX + newW / 2,
        y: newY + newH / 2,
        radiusX: newW / 2,
        radiusY: newH / 2,
      } as Partial<CanvasObject>;
    case 'image':
    case 'component':
      return {
        x: newX + newW / 2,
        y: newY + newH / 2,
        width: newW,
        height: newH,
      } as Partial<CanvasObject>;
    case 'text':
      return { x: newX, y: newY, width: newW } as Partial<CanvasObject>;
    case 'line':
      return { x: newX, y: newY, x2: newX + newW, y2: newY + newH } as Partial<CanvasObject>;
    case 'stroke':
      // For strokes, scale all points proportionally
      {
        const bounds = getObjectBounds(obj);
        if (bounds.width === 0 || bounds.height === 0) return { x: newX, y: newY };
        const scaleX = newW / bounds.width;
        const scaleY = newH / bounds.height;
        const points = (obj as StrokeObject).points.map((p) => ({
          ...p,
          x: newX + (p.x - bounds.x) * scaleX,
          y: newY + (p.y - bounds.y) * scaleY,
        }));
        return { points } as Partial<CanvasObject>;
      }
    default:
      return { x: newX, y: newY };
  }
}

/**
 * Rebuild the spatial index when the object list changes.
 * Called at the start of pointer events — amortised O(1) per event.
 */
function syncSpatialIndex(objects: CanvasObject[]): void {
  if (objects === lastIndexedObjects) return;
  lastIndexedObjects = objects;
  spatialIndex.rebuild(
    objects.map((o) => ({ id: o.id, bounds: getObjectBounds(o) })),
  );
}

function hitTest(objects: CanvasObject[], point: Point): CanvasObject | null {
  // Use the spatial index for a fast broadphase
  syncSpatialIndex(objects);
  const candidateIds = spatialIndex.queryPoint(point);

  // Also query a small region around the point for the 6px margin
  const margin = 6;
  const nearbyIds = spatialIndex.query({
    x: point.x - margin,
    y: point.y - margin,
    width: margin * 2,
    height: margin * 2,
  });

  // Merge candidates — nearbyIds is the superset
  const idSet = new Set(nearbyIds);
  for (const id of candidateIds) idSet.add(id);

  // Build a lookup for O(1) access and find the topmost (highest index) hit
  const objMap = new Map<string, number>();
  for (let i = 0; i < objects.length; i++) {
    objMap.set(objects[i].id, i);
  }

  let bestIdx = -1;
  let bestObj: CanvasObject | null = null;

  for (const id of idSet) {
    const idx = objMap.get(id);
    if (idx === undefined || idx <= bestIdx) continue;
    const obj = objects[idx];
    if (!obj.visible || obj.locked) continue;

    const b = getObjectBounds(obj);
    // Transform point into object-local space to handle rotation
    let px = point.x;
    let py = point.y;
    if (obj.rotation) {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const rad = -(obj.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      px = cos * (point.x - cx) - sin * (point.y - cy) + cx;
      py = sin * (point.x - cx) + cos * (point.y - cy) + cy;
    }
    if (
      px >= b.x - margin &&
      px <= b.x + b.width + margin &&
      py >= b.y - margin &&
      py <= b.y + b.height + margin
    ) {
      bestIdx = idx;
      bestObj = obj;
    }
  }
  return bestObj;
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
