import { useEffect, useRef } from 'react';
import { useDrawing } from '@/hooks/useDrawing';
import { useCanvasTransform } from '@/hooks/useCanvasTransform';
import { useHistory } from '@/hooks/useHistory';
import { CanvasState, DrawingStroke } from '@/types/canvas';

interface CanvasAdvancedProps {
  state: CanvasState;
  onStrokeComplete?: (stroke: DrawingStroke) => void;
  onStateChange?: (strokes: DrawingStroke[]) => void;
}

export function CanvasAdvanced({
  state,
  onStrokeComplete,
  onStateChange,
}: CanvasAdvancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokesRef = useRef<DrawingStroke[]>([]);

  const { transform, guides, zoomIn, zoomOut, setPan, startPan, endPan, snapToGridValue: _snapToGridValue } =
    useCanvasTransform();
  const { history: _history, pushState, undo, redo, canUndo: _canUndo, canRedo: _canRedo, clear: _clear } = useHistory(
    strokesRef.current
  );

  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const context = canvas.getContext('2d');
    if (context) {
      contextRef.current = context;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.globalCompositeOperation = 'source-over';
    }

    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width;
      canvas.height = newRect.height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
      redrawCanvas();
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [zoomIn, zoomOut]);

  // Handle panning
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Check if middle mouse button or spacebar is held
      if (e.button === 1 || (e as any).spaceKey) {
        startPan();
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (transform.isPanning) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        setPan(transform.panX + deltaX, transform.panY + deltaY);
        lastX = e.clientX;
        lastY = e.clientY;
        redrawCanvas();
      }
    };

    const handleMouseUp = () => {
      if (transform.isPanning) {
        endPan();
      }
    };

    // Spacebar for panning
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !transform.isPanning) {
        e.preventDefault();
        (e as any).spaceKey = true;
        startPan();
      }
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        const previousState = undo();
        if (previousState) {
          strokesRef.current = previousState;
          redrawCanvas();
          onStateChange?.(previousState);
        }
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyZ' && e.shiftKey)) {
        e.preventDefault();
        const nextState = redo();
        if (nextState) {
          strokesRef.current = nextState;
          redrawCanvas();
          onStateChange?.(nextState);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        endPan();
        (e as any).spaceKey = false;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [transform.isPanning, transform.panX, transform.panY, startPan, endPan, setPan, undo, redo]);

  // Drawing functionality
  useDrawing({
    canvasRef,
    isDrawing: state.isDrawing && !transform.isPanning,
    lineColor: state.lineColor,
    lineWidth: state.lineWidth,
    onStrokeComplete: (stroke) => {
      strokesRef.current.push(stroke);
      pushState(strokesRef.current);
      onStrokeComplete?.(stroke);
      onStateChange?.(strokesRef.current);
    },
  });

  const redrawCanvas = () => {
    if (!canvasRef.current || !contextRef.current) return;

    const context = contextRef.current;
    const canvas = canvasRef.current;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    context.save();

    // Apply transformations
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(transform.zoom, transform.zoom);
    context.translate(transform.panX - canvas.width / 2 / transform.zoom,
      transform.panY - canvas.height / 2 / transform.zoom);

    // Draw grid if enabled
    if (guides.showGrid) {
      drawGrid(context, canvas, guides.gridSize);
    }

    // Draw guides if enabled
    if (guides.showGuides) {
      drawGuides(context, canvas, guides);
    }

    // Draw strokes
    strokesRef.current.forEach((stroke) => {
      drawStroke(context, stroke);
    });

    context.restore();
  };

  const drawGrid = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gridSize: number
  ) => {
    context.strokeStyle = 'rgba(200, 200, 200, 0.2)';
    context.lineWidth = 0.5;

    const startX = Math.floor(-transform.panX / gridSize) * gridSize;
    const startY = Math.floor(-transform.panY / gridSize) * gridSize;
    const endX = startX + canvas.width / transform.zoom;
    const endY = startY + canvas.height / transform.zoom;

    for (let x = startX; x < endX; x += gridSize) {
      context.beginPath();
      context.moveTo(x, startY);
      context.lineTo(x, endY);
      context.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      context.beginPath();
      context.moveTo(startX, y);
      context.lineTo(endX, y);
      context.stroke();
    }
  };

  const drawGuides = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    guides: any
  ) => {
    context.strokeStyle = '#0066ff';
    context.lineWidth = 1;

    // Horizontal guides
    guides.horizontalGuides.forEach((y: number) => {
      context.beginPath();
      context.moveTo(-canvas.width, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    });

    // Vertical guides
    guides.verticalGuides.forEach((x: number) => {
      context.beginPath();
      context.moveTo(x, -canvas.height);
      context.lineTo(x, canvas.height);
      context.stroke();
    });
  };

  const drawStroke = (context: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.lineWidth;
    context.beginPath();

    stroke.points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });

    context.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      className="canvas-container w-full h-full cursor-crosshair"
      role="img"
      aria-label="Drawing canvas with zoom, pan, grid, and guides support"
    />
  );
}
