import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  CanvasState,
  CanvasAction,
  CanvasObject,
  Tool,
  DesignLibrary,
} from '@/types/canvas';
import { useHistory } from './useHistory';
import {
  loadCanvas,
  saveCanvas,
  buildSnapshot,
  clearSavedCanvas,
  exportCanvasFile,
  importCanvasFile,
  type CanvasSnapshot,
} from '@/services/storage';

interface ExtendedCanvasState extends CanvasState {
  libraries: DesignLibrary[];
}

const defaultState: ExtendedCanvasState = {
  activeTool: 'select',
  isDrawing: false,
  lineWidth: 2,
  lineColor: 'oklch(1 0 0)',
  fillColor: 'transparent',
  strokeColor: 'oklch(1 0 0)',
  strokeWidth: 2,
  cornerRadius: 0,
  opacity: 1,
  objects: [],
  selectedIds: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: true,
  gridSize: 40,
  snapToGrid: true,
  // legacy compat
  tool: 'select',
  offsetX: 0,
  offsetY: 0,
  // New: library management
  libraries: [],
};

/** Build initial state by restoring from localStorage if available. */
function buildInitialState(): ExtendedCanvasState {
  const saved = loadCanvas();
  if (!saved) return defaultState;

  return {
    ...defaultState,
    objects: saved.objects,
    libraries: saved.libraries ?? [],
    zoom: saved.viewport.zoom,
    panX: saved.viewport.panX,
    panY: saved.viewport.panY,
    showGrid: saved.settings.showGrid,
    gridSize: saved.settings.gridSize,
    snapToGrid: saved.settings.snapToGrid,
    lineWidth: saved.settings.lineWidth,
    lineColor: saved.settings.lineColor,
    fillColor: saved.settings.fillColor,
    strokeColor: saved.settings.strokeColor,
    strokeWidth: saved.settings.strokeWidth,
    cornerRadius: saved.settings.cornerRadius,
    opacity: saved.settings.opacity,
  };
}

function canvasReducer(state: ExtendedCanvasState, action: CanvasAction): ExtendedCanvasState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.payload, tool: action.payload };
    case 'SET_DRAWING':
      return { ...state, isDrawing: action.payload };
    case 'SET_LINE_WIDTH':
      return { ...state, lineWidth: action.payload, strokeWidth: action.payload };
    case 'SET_LINE_COLOR':
      return { ...state, lineColor: action.payload, strokeColor: action.payload };
    case 'SET_FILL_COLOR':
      return { ...state, fillColor: action.payload };
    case 'SET_STROKE_COLOR':
      return { ...state, strokeColor: action.payload, lineColor: action.payload };
    case 'SET_STROKE_WIDTH':
      return { ...state, strokeWidth: action.payload, lineWidth: action.payload };
    case 'SET_CORNER_RADIUS':
      return { ...state, cornerRadius: action.payload };
    case 'SET_OPACITY':
      return { ...state, opacity: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(10, action.payload)) };
    case 'SET_PAN':
      return { ...state, panX: action.payload.x, panY: action.payload.y };
    case 'SET_OFFSET':
      return { ...state, offsetX: action.payload.x, offsetY: action.payload.y };
    case 'ADD_OBJECT':
      return { ...state, objects: [...state.objects, action.payload] };
    case 'UPDATE_OBJECT':
      return {
        ...state,
        objects: state.objects.map((o) =>
          o.id === action.payload.id ? { ...o, ...action.payload.changes } as CanvasObject : o
        ),
      };
    case 'DELETE_OBJECTS':
      return {
        ...state,
        objects: state.objects.filter((o) => !action.payload.includes(o.id)),
        selectedIds: state.selectedIds.filter((id) => !action.payload.includes(id)),
      };
    case 'SET_SELECTION':
      return { ...state, selectedIds: action.payload };
    case 'SET_OBJECTS':
      return { ...state, objects: action.payload };
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
    case 'SET_GRID_SIZE':
      return { ...state, gridSize: Math.max(5, Math.min(100, action.payload)) };
    case 'TOGGLE_SNAP':
      return { ...state, snapToGrid: !state.snapToGrid };
    case 'ADD_LIBRARY':
      return { ...state, libraries: [...state.libraries, action.payload] };
    case 'REMOVE_LIBRARY':
      return { ...state, libraries: state.libraries.filter((l) => l.id !== action.payload) };
    case 'TOGGLE_LIBRARY':
      return {
        ...state,
        libraries: state.libraries.map((l) =>
          l.id === action.payload ? { ...l, active: !l.active } : l
        ),
      };
    case 'OPEN_CONVERSION':
    case 'CLOSE_CONVERSION':
    case 'SET_CONVERSION_PROMPT':
      // These will be handled by a separate ConversionUI state
      return state;
    default:
      return state;
  }
}

export function useCanvas() {
  const [state, dispatch] = useReducer(canvasReducer, undefined, buildInitialState);

  // Stable refs so history callbacks don't depend on state
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Auto-save with debounce ────────────────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Debounced auto-save: 800ms after last state change
  useEffect(() => {
    // Don't save transient drawing state
    if (state.isDrawing) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const snapshot = buildSnapshot(state);
      const ok = saveCanvas(snapshot);
      if (ok) setLastSaved(snapshot.savedAt);
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // Depend on the fields we persist (not isDrawing / activeTool / selectedIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.objects,
    state.libraries,
    state.zoom,
    state.panX,
    state.panY,
    state.showGrid,
    state.gridSize,
    state.snapToGrid,
    state.lineWidth,
    state.lineColor,
    state.fillColor,
    state.strokeColor,
    state.strokeWidth,
    state.cornerRadius,
    state.opacity,
    state.isDrawing,
  ]);

  const getObjects = useCallback(() => stateRef.current.objects, []);
  const getSelection = useCallback(() => stateRef.current.selectedIds, []);
  const applySnapshot = useCallback(
    (objects: CanvasObject[], selectedIds: string[]) => {
      dispatch({ type: 'SET_OBJECTS', payload: objects });
      dispatch({ type: 'SET_SELECTION', payload: selectedIds });
    },
    [],
  );

  const { pushSnapshot, undo, redo, canUndo, canRedo, beginTransaction, endTransaction } = useHistory(
    getObjects,
    getSelection,
    applySnapshot,
  );

  const setTool = useCallback((tool: Tool) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);

  const setDrawing = useCallback((isDrawing: boolean) => {
    dispatch({ type: 'SET_DRAWING', payload: isDrawing });
  }, []);

  const setLineWidth = useCallback((width: number) => {
    dispatch({ type: 'SET_LINE_WIDTH', payload: Math.max(1, Math.min(100, width)) });
  }, []);

  const setLineColor = useCallback((color: string) => {
    dispatch({ type: 'SET_LINE_COLOR', payload: color });
  }, []);

  const setFillColor = useCallback((color: string) => {
    dispatch({ type: 'SET_FILL_COLOR', payload: color });
  }, []);

  const setStrokeColor = useCallback((color: string) => {
    dispatch({ type: 'SET_STROKE_COLOR', payload: color });
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    dispatch({ type: 'SET_STROKE_WIDTH', payload: Math.max(0, Math.min(100, width)) });
  }, []);

  const setCornerRadius = useCallback((radius: number) => {
    dispatch({ type: 'SET_CORNER_RADIUS', payload: Math.max(0, radius) });
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    dispatch({ type: 'SET_OPACITY', payload: Math.max(0, Math.min(1, opacity)) });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPan = useCallback((x: number, y: number) => {
    dispatch({ type: 'SET_PAN', payload: { x, y } });
  }, []);

  const addObject = useCallback((obj: CanvasObject) => {
    pushSnapshot();
    dispatch({ type: 'ADD_OBJECT', payload: obj });
  }, [pushSnapshot]);

  const updateObject = useCallback((id: string, changes: Partial<CanvasObject>) => {
    pushSnapshot();
    dispatch({ type: 'UPDATE_OBJECT', payload: { id, changes } });
  }, [pushSnapshot]);

  const deleteObjects = useCallback((ids: string[]) => {
    pushSnapshot();
    dispatch({ type: 'DELETE_OBJECTS', payload: ids });
  }, [pushSnapshot]);

  const setSelection = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_SELECTION', payload: ids });
  }, []);

  const setObjects = useCallback((objects: CanvasObject[]) => {
    pushSnapshot();
    dispatch({ type: 'SET_OBJECTS', payload: objects });
  }, [pushSnapshot]);

  const toggleGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_GRID' });
  }, []);

  const setGridSize = useCallback((size: number) => {
    dispatch({ type: 'SET_GRID_SIZE', payload: size });
  }, []);

  const toggleSnap = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP' });
  }, []);

  const addLibrary = useCallback((lib: DesignLibrary) => {
    dispatch({ type: 'ADD_LIBRARY', payload: lib });
  }, []);

  const removeLibrary = useCallback((libId: string) => {
    dispatch({ type: 'REMOVE_LIBRARY', payload: libId });
  }, []);

  const toggleLibrary = useCallback((libId: string) => {
    dispatch({ type: 'TOGGLE_LIBRARY', payload: libId });
  }, []);

  // ── Persistence actions ────────────────────────────────

  /** Force an immediate save (bypass debounce). */
  const saveNow = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const snapshot = buildSnapshot(stateRef.current);
    const ok = saveCanvas(snapshot);
    if (ok) setLastSaved(snapshot.savedAt);
    return ok;
  }, []);

  /** Clear saved data from localStorage. */
  const clearSaved = useCallback(() => {
    clearSavedCanvas();
    setLastSaved(null);
  }, []);

  /** Export canvas to a .pollin.json file. */
  const exportCanvas = useCallback(() => {
    const snapshot = buildSnapshot(stateRef.current);
    exportCanvasFile(snapshot);
  }, []);

  /** Import a .pollin.json file and replace current state. */
  const importCanvas = useCallback(async () => {
    const snapshot = await importCanvasFile();
    if (!snapshot) return false;
    applyFullSnapshot(snapshot);
    return true;
  }, []);

  /** Apply a full snapshot to current state (used by import + load). */
  const applyFullSnapshot = useCallback((snapshot: CanvasSnapshot) => {
    dispatch({ type: 'SET_OBJECTS', payload: snapshot.objects });
    dispatch({ type: 'SET_SELECTION', payload: [] });
    dispatch({ type: 'SET_ZOOM', payload: snapshot.viewport.zoom });
    dispatch({ type: 'SET_PAN', payload: { x: snapshot.viewport.panX, y: snapshot.viewport.panY } });
    dispatch({ type: 'SET_LINE_WIDTH', payload: snapshot.settings.lineWidth });
    dispatch({ type: 'SET_LINE_COLOR', payload: snapshot.settings.lineColor });
    dispatch({ type: 'SET_FILL_COLOR', payload: snapshot.settings.fillColor });
    dispatch({ type: 'SET_STROKE_COLOR', payload: snapshot.settings.strokeColor });
    dispatch({ type: 'SET_STROKE_WIDTH', payload: snapshot.settings.strokeWidth });
    dispatch({ type: 'SET_CORNER_RADIUS', payload: snapshot.settings.cornerRadius });
    dispatch({ type: 'SET_OPACITY', payload: snapshot.settings.opacity });
    // Re-add libraries
    snapshot.libraries?.forEach((lib) => {
      dispatch({ type: 'ADD_LIBRARY', payload: lib });
    });
    setLastSaved(snapshot.savedAt);
  }, []);

  return {
    state,
    dispatch,
    setTool,
    setDrawing,
    setLineWidth,
    setLineColor,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
    setCornerRadius,
    setOpacity,
    setZoom,
    setPan,
    addObject,
    updateObject,
    deleteObjects,
    setSelection,
    setObjects,
    toggleGrid,
    setGridSize,
    toggleSnap,
    addLibrary,
    removeLibrary,
    toggleLibrary,
    undo,
    redo,
    canUndo,
    canRedo,
    pushSnapshot,
    beginTransaction,
    endTransaction,
    // Persistence
    lastSaved,
    saveNow,
    clearSaved,
    exportCanvas,
    importCanvas,
  };
}
