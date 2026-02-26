import { useEffect, useRef } from 'react';
import { DrawPoint, DrawingStroke } from '@/types/canvas';

interface UseDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isDrawing: boolean;
  lineColor: string;
  lineWidth: number;
  onStrokeComplete?: (stroke: DrawingStroke) => void;
}

export function useDrawing({
  canvasRef,
  isDrawing,
  lineColor,
  lineWidth,
  onStrokeComplete,
}: UseDrawingProps) {
  const pointsRef = useRef<DrawPoint[]>([]);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    contextRef.current = context;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalCompositeOperation = 'source-over';
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!context) return;

    const handleMouseDown = (e: MouseEvent) => {
      const { offsetX, offsetY } = e as unknown as { offsetX: number; offsetY: number };
      pointsRef.current = [
        {
          x: offsetX,
          y: offsetY,
          timestamp: Date.now(),
        },
      ];

      context.beginPath();
      context.moveTo(offsetX, offsetY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing || pointsRef.current.length === 0) return;

      const { offsetX, offsetY } = e as unknown as { offsetX: number; offsetY: number };

      pointsRef.current.push({
        x: offsetX,
        y: offsetY,
        timestamp: Date.now(),
      });

      context.strokeStyle = lineColor;
      context.lineWidth = lineWidth;
      context.lineTo(offsetX, offsetY);
      context.stroke();
    };

    const handleMouseUp = () => {
      if (!isDrawing) return;

      context.closePath();

      if (onStrokeComplete && pointsRef.current.length > 1) {
        onStrokeComplete({
          points: pointsRef.current,
          color: lineColor,
          lineWidth,
          timestamp: Date.now(),
        });
      }

      pointsRef.current = [];
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDrawing, lineColor, lineWidth, canvasRef, onStrokeComplete]);
}
