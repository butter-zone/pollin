import { useCallback, useRef, useState } from 'react';
import { DrawingStroke } from '@/types/canvas';

export interface CanvasHistory {
  past: DrawingStroke[][];
  present: DrawingStroke[];
  future: DrawingStroke[][];
}

export interface UseHistoryReturn {
  history: CanvasHistory;
  pushState: (strokes: DrawingStroke[]) => void;
  undo: () => DrawingStroke[] | null;
  redo: () => DrawingStroke[] | null;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export function useHistory(
  initialState: DrawingStroke[] = []
): UseHistoryReturn {
  const [history, setHistory] = useState<CanvasHistory>({
    past: [],
    present: initialState,
    future: [],
  });

  const maxHistorySize = useRef(50); // Keep last 50 states

  const pushState = useCallback((strokes: DrawingStroke[]) => {
    setHistory((prev) => {
      // Remove oldest state if we exceed max history size
      const newPast =
        prev.past.length >= maxHistorySize.current
          ? prev.past.slice(1)
          : prev.past;

      return {
        past: [...newPast, prev.present],
        present: strokes,
        future: [], // Clear future when new action is taken
      };
    });
  }, []);

  const undo = useCallback(() => {
    let result: DrawingStroke[] | null = null;

    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];

      result = newPresent;

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });

    return result;
  }, []);

  const redo = useCallback(() => {
    let result: DrawingStroke[] | null = null;

    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = prev.future.slice(1);
      const newPresent = prev.future[0];
      const newPast = [...prev.past, prev.present];

      result = newPresent;

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });

    return result;
  }, []);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: [],
      future: [],
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    history,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
