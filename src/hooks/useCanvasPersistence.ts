import { useCallback, useEffect, useRef, useState } from 'react';
import { DrawingStroke } from '@/types/canvas';

export interface CanvasPersistenceState {
  autosaveEnabled: boolean;
  autosaveInterval: number;
  lastSaved: Date | null;
  isDirty: boolean;
}

export interface UseCanvasPersistenceReturn {
  state: CanvasPersistenceState;
  saveToLocalStorage: (strokes: DrawingStroke[], sessionId: string) => void;
  loadFromLocalStorage: (sessionId: string) => DrawingStroke[] | null;
  deleteFromLocalStorage: (sessionId: string) => void;
  getSessions: () => Array<{ id: string; timestamp: Date; strokeCount: number }>;
  exportAsJSON: (strokes: DrawingStroke[]) => string;
  importFromJSON: (json: string) => DrawingStroke[] | null;
  exportAsPNG: (canvas: HTMLCanvasElement, filename?: string) => void;
  exportAsSVG: (strokes: DrawingStroke[], width: number, height: number) => string;
  enableAutosave: (strokes: DrawingStroke[], sessionId: string, interval?: number) => void;
  disableAutosave: () => void;
  setMarkClean: () => void;
  setMarkDirty: () => void;
}

const STORAGE_PREFIX = 'pollin_canvas_';
const STORAGE_INDEX = 'pollin_sessions_';

export function useCanvasPersistence(): UseCanvasPersistenceReturn {
  const [state, setState] = useState<CanvasPersistenceState>({
    autosaveEnabled: false,
    autosaveInterval: 10000, // 10 seconds
    lastSaved: null,
    isDirty: false,
  });

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const strokesRef = useRef<DrawingStroke[]>([]);
  const sessionIdRef = useRef<string>('');

  const saveToLocalStorage = useCallback(
    (strokes: DrawingStroke[], sessionId: string) => {
      try {
        const storageKey = `${STORAGE_PREFIX}${sessionId}`;
        const data = {
          sessionId,
          strokes,
          timestamp: new Date().toISOString(),
          strokeCount: strokes.length,
        };

        localStorage.setItem(storageKey, JSON.stringify(data));

        // Update session index
        const sessions = getSessions();
        const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
        if (sessionIndex === -1) {
          sessions.push({
            id: sessionId,
            timestamp: new Date(),
            strokeCount: strokes.length,
          });
        } else {
          sessions[sessionIndex] = {
            id: sessionId,
            timestamp: new Date(),
            strokeCount: strokes.length,
          };
        }

        localStorage.setItem(
          STORAGE_INDEX,
          JSON.stringify(sessions.map((s) => ({ ...s, timestamp: s.timestamp.toISOString() })))
        );

        setState((prev) => ({
          ...prev,
          lastSaved: new Date(),
          isDirty: false,
        }));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },
    []
  );

  const loadFromLocalStorage = useCallback((sessionId: string): DrawingStroke[] | null => {
    try {
      const storageKey = `${STORAGE_PREFIX}${sessionId}`;
      const data = localStorage.getItem(storageKey);

      if (!data) return null;

      const parsed = JSON.parse(data);
      return parsed.strokes || null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  const deleteFromLocalStorage = useCallback((sessionId: string) => {
    try {
      const storageKey = `${STORAGE_PREFIX}${sessionId}`;
      localStorage.removeItem(storageKey);

      // Update session index
      const sessions = getSessions().filter((s) => s.id !== sessionId);
      localStorage.setItem(
        STORAGE_INDEX,
        JSON.stringify(sessions.map((s) => ({ ...s, timestamp: s.timestamp.toISOString() })))
      );
    } catch (error) {
      console.error('Failed to delete from localStorage:', error);
    }
  }, []);

  const getSessions = useCallback(
    (): Array<{ id: string; timestamp: Date; strokeCount: number }> => {
      try {
        const data = localStorage.getItem(STORAGE_INDEX);
        if (!data) return [];

        const sessions = JSON.parse(data);
        return sessions.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }));
      } catch (error) {
        console.error('Failed to get sessions:', error);
        return [];
      }
    },
    []
  );

  const exportAsJSON = useCallback((strokes: DrawingStroke[]): string => {
    return JSON.stringify(
      {
        version: '1.0',
        timestamp: new Date().toISOString(),
        strokes,
      },
      null,
      2
    );
  }, []);

  const importFromJSON = useCallback((json: string): DrawingStroke[] | null => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data.strokes)) {
        throw new Error('Invalid JSON format');
      }
      return data.strokes;
    } catch (error) {
      console.error('Failed to import JSON:', error);
      return null;
    }
  }, []);

  const exportAsPNG = useCallback(
    (canvas: HTMLCanvasElement, filename: string = 'canvas.png') => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        });
      } catch (error) {
        console.error('Failed to export as PNG:', error);
      }
    },
    []
  );

  const exportAsSVG = useCallback(
    (strokes: DrawingStroke[], width: number, height: number): string => {
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="white"/>
`;

      strokes.forEach((stroke) => {
        if (stroke.points.length === 0) return;

        let pathData = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
        for (let i = 1; i < stroke.points.length; i++) {
          pathData += ` L ${stroke.points[i].x} ${stroke.points[i].y}`;
        }

        svg += `  <path d="${pathData}" stroke="${stroke.color}" stroke-width="${stroke.lineWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
`;
      });

      svg += '</svg>';
      return svg;
    },
    []
  );

  const enableAutosave = useCallback(
    (strokes: DrawingStroke[], sessionId: string, interval: number = 10000) => {
      strokesRef.current = strokes;
      sessionIdRef.current = sessionId;

      setState((prev) => ({
        ...prev,
        autosaveEnabled: true,
        autosaveInterval: interval,
      }));

      // Clear existing timer
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }

      // Set new timer
      autosaveTimerRef.current = setInterval(() => {
        saveToLocalStorage(strokesRef.current, sessionIdRef.current);
      }, interval);
    },
    [saveToLocalStorage]
  );

  const disableAutosave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearInterval(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      autosaveEnabled: false,
    }));
  }, []);

  const setMarkClean = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: false,
    }));
  }, []);

  const setMarkDirty = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: true,
    }));
  }, []);

  // Cleanup autosave on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    saveToLocalStorage,
    loadFromLocalStorage,
    deleteFromLocalStorage,
    getSessions,
    exportAsJSON,
    importFromJSON,
    exportAsPNG,
    exportAsSVG,
    enableAutosave,
    disableAutosave,
    setMarkClean,
    setMarkDirty,
  };
}
