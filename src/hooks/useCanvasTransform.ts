import { useCallback, useReducer, useState } from 'react';

export interface CanvasTransformState {
  zoom: number;
  offsetX: number;
  offsetY: number;
  panX: number;
  panY: number;
  isPanning: boolean;
}

export interface GuideState {
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGuides: boolean;
  horizontalGuides: number[];
  verticalGuides: number[];
}

type TransformAction =
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'SET_IS_PANNING'; payload: boolean }
  | { type: 'RESET_TRANSFORM' }
  | { type: 'SET_GUIDES'; payload: GuideState };

const initialTransformState: CanvasTransformState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  panX: 0,
  panY: 0,
  isPanning: false,
};

const initialGuideState: GuideState = {
  showGrid: false,
  gridSize: 20,
  snapToGrid: false,
  showGuides: false,
  horizontalGuides: [],
  verticalGuides: [],
};

function transformReducer(
  state: CanvasTransformState,
  action: TransformAction
): CanvasTransformState {
  switch (action.type) {
    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.payload)),
      };
    case 'SET_PAN':
      return {
        ...state,
        panX: action.payload.x,
        panY: action.payload.y,
      };
    case 'SET_IS_PANNING':
      return {
        ...state,
        isPanning: action.payload,
      };
    case 'RESET_TRANSFORM':
      return initialTransformState;
    case 'SET_GUIDES':
      // Guides are managed separately, but included for completeness
      return state;
    default:
      return state;
  }
}

export interface UseCanvasTransformReturn {
  transform: CanvasTransformState;
  guides: GuideState;
  zoom: (factor: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setPan: (x: number, y: number) => void;
  startPan: () => void;
  endPan: () => void;
  resetTransform: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  addHorizontalGuide: (y: number) => void;
  addVerticalGuide: (x: number) => void;
  removeGuide: (type: 'h' | 'v', position: number) => void;
  clearGuides: () => void;
  snapToGridValue: (value: number) => number;
}

export function useCanvasTransform(): UseCanvasTransformReturn {
  const [transform, dispatch] = useReducer(transformReducer, initialTransformState);
  const [guides, setGuides] = useState<GuideState>(initialGuideState);

  const zoom = useCallback((factor: number) => {
    dispatch({
      type: 'SET_ZOOM',
      payload: factor,
    });
  }, []);

  const zoomIn = useCallback(() => {
    dispatch({
      type: 'SET_ZOOM',
      payload: transform.zoom * 1.2,
    });
  }, [transform.zoom]);

  const zoomOut = useCallback(() => {
    dispatch({
      type: 'SET_ZOOM',
      payload: transform.zoom / 1.2,
    });
  }, [transform.zoom]);

  const setPan = useCallback((x: number, y: number) => {
    dispatch({
      type: 'SET_PAN',
      payload: { x, y },
    });
  }, []);

  const startPan = useCallback(() => {
    dispatch({ type: 'SET_IS_PANNING', payload: true });
  }, []);

  const endPan = useCallback(() => {
    dispatch({ type: 'SET_IS_PANNING', payload: false });
  }, []);

  const resetTransform = useCallback(() => {
    dispatch({ type: 'RESET_TRANSFORM' });
  }, []);

  const toggleGrid = useCallback(() => {
    setGuides((prev) => ({
      ...prev,
      showGrid: !prev.showGrid,
    }));
  }, []);

  const toggleGuides = useCallback(() => {
    setGuides((prev) => ({
      ...prev,
      showGuides: !prev.showGuides,
    }));
  }, []);

  const setGridSize = useCallback((size: number) => {
    setGuides((prev) => ({
      ...prev,
      gridSize: Math.max(5, Math.min(100, size)),
    }));
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setGuides((prev) => ({
      ...prev,
      snapToGrid: !prev.snapToGrid,
    }));
  }, []);

  const addHorizontalGuide = useCallback((y: number) => {
    setGuides((prev) => {
      const guides = Array.from(new Set([...prev.horizontalGuides, y])).sort(
        (a, b) => a - b
      );
      return {
        ...prev,
        horizontalGuides: guides,
      };
    });
  }, []);

  const addVerticalGuide = useCallback((x: number) => {
    setGuides((prev) => {
      const guides = Array.from(new Set([...prev.verticalGuides, x])).sort(
        (a, b) => a - b
      );
      return {
        ...prev,
        verticalGuides: guides,
      };
    });
  }, []);

  const removeGuide = useCallback((type: 'h' | 'v', position: number) => {
    setGuides((prev) => {
      if (type === 'h') {
        return {
          ...prev,
          horizontalGuides: prev.horizontalGuides.filter((g) => g !== position),
        };
      } else {
        return {
          ...prev,
          verticalGuides: prev.verticalGuides.filter((g) => g !== position),
        };
      }
    });
  }, []);

  const clearGuides = useCallback(() => {
    setGuides((prev) => ({
      ...prev,
      horizontalGuides: [],
      verticalGuides: [],
    }));
  }, []);

  const snapToGridValue = useCallback(
    (value: number) => {
      if (!guides.snapToGrid) return value;
      return Math.round(value / guides.gridSize) * guides.gridSize;
    },
    [guides.snapToGrid, guides.gridSize]
  );

  return {
    transform,
    guides,
    zoom,
    zoomIn,
    zoomOut,
    setPan,
    startPan,
    endPan,
    resetTransform,
    toggleGrid,
    toggleGuides,
    setGridSize,
    toggleSnapToGrid,
    addHorizontalGuide,
    addVerticalGuide,
    removeGuide,
    clearGuides,
    snapToGridValue,
  };
}
