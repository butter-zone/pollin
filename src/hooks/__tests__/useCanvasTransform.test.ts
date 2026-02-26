import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasTransform } from '../hooks/useCanvasTransform';
import { useHistory } from '../hooks/useHistory';
import { DrawingStroke } from '../types/canvas';

describe('useCanvasTransform', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useCanvasTransform());
    expect(result.current.transform.zoom).toBe(1);
    expect(result.current.transform.panX).toBe(0);
    expect(result.current.transform.panY).toBe(0);
    expect(result.current.guides.showGrid).toBe(false);
  });

  it('zooms in correctly', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.transform.zoom).toBeCloseTo(1.2, 1);
  });

  it('zooms out correctly', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.zoomIn();
      result.current.zoomOut();
    });
    expect(result.current.transform.zoom).toBeCloseTo(1, 1);
  });

  it('clamps zoom between 0.1 and 5', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.zoom(10);
    });
    expect(result.current.transform.zoom).toBe(5);

    act(() => {
      result.current.zoom(0.05);
    });
    expect(result.current.transform.zoom).toBe(0.1);
  });

  it('manages pan state', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.setPan(100, 200);
    });
    expect(result.current.transform.panX).toBe(100);
    expect(result.current.transform.panY).toBe(200);
  });

  it('toggles panning state', () => {
    const { result } = renderHook(() => useCanvasTransform());
    expect(result.current.transform.isPanning).toBe(false);
    act(() => {
      result.current.startPan();
    });
    expect(result.current.transform.isPanning).toBe(true);
    act(() => {
      result.current.endPan();
    });
    expect(result.current.transform.isPanning).toBe(false);
  });

  it('resets transform to initial state', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.zoomIn();
      result.current.setPan(50, 50);
      result.current.resetTransform();
    });
    expect(result.current.transform.zoom).toBe(1);
    expect(result.current.transform.panX).toBe(0);
    expect(result.current.transform.panY).toBe(0);
  });

  it('toggles grid visibility', () => {
    const { result } = renderHook(() => useCanvasTransform());
    expect(result.current.guides.showGrid).toBe(false);
    act(() => {
      result.current.toggleGrid();
    });
    expect(result.current.guides.showGrid).toBe(true);
    act(() => {
      result.current.toggleGrid();
    });
    expect(result.current.guides.showGrid).toBe(false);
  });

  it('manages grid size within valid range', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.setGridSize(50);
    });
    expect(result.current.guides.gridSize).toBe(50);

    act(() => {
      result.current.setGridSize(200);
    });
    expect(result.current.guides.gridSize).toBe(100);

    act(() => {
      result.current.setGridSize(2);
    });
    expect(result.current.guides.gridSize).toBe(5);
  });

  it('toggles snap to grid', () => {
    const { result } = renderHook(() => useCanvasTransform());
    expect(result.current.guides.snapToGrid).toBe(false);
    act(() => {
      result.current.toggleSnapToGrid();
    });
    expect(result.current.guides.snapToGrid).toBe(true);
  });

  it('snaps values to grid correctly', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.setGridSize(20);
      result.current.toggleSnapToGrid();
    });
    expect(result.current.snapToGridValue(23)).toBe(20);
    expect(result.current.snapToGridValue(27)).toBe(40);
    expect(result.current.snapToGridValue(30)).toBe(40);
  });

  it('does not snap when disabled', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.setGridSize(20);
    });
    expect(result.current.snapToGridValue(23)).toBe(23);
  });

  it('manages guides', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.addHorizontalGuide(50);
      result.current.addHorizontalGuide(100);
      result.current.addVerticalGuide(75);
    });
    expect(result.current.guides.horizontalGuides).toEqual([50, 100]);
    expect(result.current.guides.verticalGuides).toEqual([75]);

    act(() => {
      result.current.removeGuide('h', 50);
    });
    expect(result.current.guides.horizontalGuides).toEqual([100]);
  });

  it('clears all guides', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.addHorizontalGuide(50);
      result.current.addVerticalGuide(75);
      result.current.clearGuides();
    });
    expect(result.current.guides.horizontalGuides).toEqual([]);
    expect(result.current.guides.verticalGuides).toEqual([]);
  });

  it('prevents duplicate guides', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.addHorizontalGuide(50);
      result.current.addHorizontalGuide(50);
    });
    expect(result.current.guides.horizontalGuides).toEqual([50]);
  });

  it('sorts guides in order', () => {
    const { result } = renderHook(() => useCanvasTransform());
    act(() => {
      result.current.addHorizontalGuide(100);
      result.current.addHorizontalGuide(50);
      result.current.addHorizontalGuide(75);
    });
    expect(result.current.guides.horizontalGuides).toEqual([50, 75, 100]);
  });
});

describe('useHistory', () => {
  const createStroke = (id: number): DrawingStroke => ({
    points: [{ x: id, y: id, timestamp: Date.now() }],
    color: '#ffffff',
    lineWidth: 2,
    timestamp: Date.now(),
  });

  it('initializes with empty history', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.history.past).toEqual([]);
    expect(result.current.history.present).toEqual([]);
    expect(result.current.history.future).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('pushes new state to history', () => {
    const { result } = renderHook(() => useHistory());
    const stroke = createStroke(1);

    act(() => {
      result.current.pushState([stroke]);
    });

    expect(result.current.history.present).toEqual([stroke]);
    expect(result.current.history.past).toEqual([[]]);
    expect(result.current.canUndo).toBe(true);
  });

  it('undoes state correctly', () => {
    const { result } = renderHook(() => useHistory());
    const stroke1 = createStroke(1);
    const stroke2 = createStroke(2);

    act(() => {
      result.current.pushState([stroke1]);
      result.current.pushState([stroke1, stroke2]);
    });

    expect(result.current.canUndo).toBe(true);

    let undoResult: DrawingStroke[] | null = null;
    act(() => {
      undoResult = result.current.undo();
    });

    expect(undoResult).toEqual([stroke1]);
    expect(result.current.history.present).toEqual([stroke1]);
    expect(result.current.canRedo).toBe(true);
  });

  it('redoes state correctly', () => {
    const { result } = renderHook(() => useHistory());
    const stroke1 = createStroke(1);
    const stroke2 = createStroke(2);

    act(() => {
      result.current.pushState([stroke1]);
      result.current.pushState([stroke1, stroke2]);
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    let redoResult: DrawingStroke[] | null = null;
    act(() => {
      redoResult = result.current.redo();
    });

    expect(redoResult).toEqual([stroke1, stroke2]);
    expect(result.current.history.present).toEqual([stroke1, stroke2]);
  });

  it('clears future history when new state is pushed', () => {
    const { result } = renderHook(() => useHistory());
    const stroke1 = createStroke(1);
    const stroke2 = createStroke(2);
    const stroke3 = createStroke(3);

    act(() => {
      result.current.pushState([stroke1]);
      result.current.pushState([stroke1, stroke2]);
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.pushState([stroke3]);
    });

    expect(result.current.canRedo).toBe(false);
    expect(result.current.history.future).toEqual([]);
  });

  it('handles undo when no past exists', () => {
    const { result } = renderHook(() => useHistory());
    let undoResult: DrawingStroke[] | null = null;

    act(() => {
      undoResult = result.current.undo();
    });

    expect(undoResult).toBe(null);
    expect(result.current.history.past).toEqual([]);
  });

  it('handles redo when no future exists', () => {
    const { result } = renderHook(() => useHistory());
    let redoResult: DrawingStroke[] | null = null;

    act(() => {
      redoResult = result.current.redo();
    });

    expect(redoResult).toBe(null);
    expect(result.current.history.future).toEqual([]);
  });

  it('clears history', () => {
    const { result } = renderHook(() => useHistory());
    const stroke = createStroke(1);

    act(() => {
      result.current.pushState([stroke]);
      result.current.clear();
    });

    expect(result.current.history.past).toEqual([]);
    expect(result.current.history.present).toEqual([]);
    expect(result.current.history.future).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it('limits history size to max', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      // Push 55 states (more than the default max of 50)
      for (let i = 0; i < 55; i++) {
        result.current.pushState([createStroke(i)]);
      }
    });

    // Should only have 50 past states
    expect(result.current.history.past.length).toBe(50);
  });

  it('maintains undo/redo state correctly through multiple operations', () => {
    const { result } = renderHook(() => useHistory());
    const stroke1 = createStroke(1);
    const stroke2 = createStroke(2);
    const stroke3 = createStroke(3);

    act(() => {
      result.current.pushState([stroke1]);
      result.current.pushState([stroke1, stroke2]);
      result.current.pushState([stroke1, stroke2, stroke3]);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.history.present).toEqual([stroke1]);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });
});
