import { useCallback, useReducer, useRef } from 'react';
import {
  CanvasState,
  CanvasAction,
  CanvasObject,
  Tool,
  DesignLibrary,
} from '@/types/canvas';
import { useHistory } from './useHistory';

interface ExtendedCanvasState extends CanvasState {
  libraries: DesignLibrary[];
}

const initialState: ExtendedCanvasState = {
  activeTool: 'pen',
  isDrawing: false,
  lineWidth: 2,
  lineColor: '#ffffff',
  fillColor: 'transparent',
  strokeColor: '#ffffff',
  strokeWidth: 2,
  cornerRadius: 0,
  opacity: 1,
  objects: [],
  selectedIds: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: false,
  gridSize: 20,
  snapToGrid: false,
  // legacy compat
  tool: 'pen',
  offsetX: 0,
  offsetY: 0,
  // New: library management
  libraries: [],
};

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
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Stable refs so history callbacks don't depend on state
  const stateRef = useRef(state);
  stateRef.current = state;

  const getObjects = useCallback(() => stateRef.current.objects, []);
  const getSelection = useCallback(() => stateRef.current.selectedIds, []);
  const applySnapshot = useCallback(
    (objects: CanvasObject[], selectedIds: string[]) => {
      dispatch({ type: 'SET_OBJECTS', payload: objects });
      dispatch({ type: 'SET_SELECTION', payload: selectedIds });
    },
    [],
  );

  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory(
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
  };
}
