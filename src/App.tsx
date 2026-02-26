import { useCallback, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { StatusBar } from '@/components/StatusBar';
import { useCanvas } from '@/hooks/useCanvas';
import type { Tool } from '@/types/canvas';

function App() {
  const {
    state,
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
  } = useCanvas();

  // keyboard shortcuts for tools
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const map: Record<string, Tool> = {
        v: 'select',
        h: 'hand',
        p: 'pen',
        r: 'rect',
        o: 'ellipse',
        l: 'line',
        e: 'eraser',
      };
      const tool = map[e.key.toLowerCase()];
      if (tool) setTool(tool);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTool]);

  const handleDeleteSelected = useCallback(() => {
    deleteObjects(state.selectedIds);
  }, [deleteObjects, state.selectedIds]);

  const handleClearCanvas = useCallback(() => {
    setObjects([]);
    setSelection([]);
  }, [setObjects, setSelection]);

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.canvas-surface');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'pollin-export.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan(0, 0);
  }, [setZoom, setPan]);

  return (
    <div className="app-layout">
      {/* Left toolbar */}
      <Toolbar activeTool={state.activeTool} onToolChange={setTool} />

      {/* Canvas area */}
      <div className="canvas-area">
        <Canvas
          state={state}
          onAddObject={addObject}
          onUpdateObject={updateObject}
          onDeleteObjects={deleteObjects}
          onSetSelection={setSelection}
          onSetZoom={setZoom}
          onSetPan={setPan}
          onSetDrawing={setDrawing}
        />
      </div>

      {/* DialKit-style floating control panel */}
      <ControlPanel
        state={state as any}
        onLineWidthChange={setLineWidth}
        onLineColorChange={setLineColor}
        onFillColorChange={setFillColor}
        onStrokeColorChange={setStrokeColor}
        onStrokeWidthChange={setStrokeWidth}
        onCornerRadiusChange={setCornerRadius}
        onOpacityChange={setOpacity}
        onToolChange={setTool}
        onToggleGrid={toggleGrid}
        onSetGridSize={setGridSize}
        onToggleSnap={toggleSnap}
        onDeleteSelected={handleDeleteSelected}
        onClearCanvas={handleClearCanvas}
        onExportPNG={handleExportPNG}
        onAddLibrary={addLibrary}
        onRemoveLibrary={removeLibrary}
        onToggleLibrary={toggleLibrary}
      />

      {/* Bottom status bar */}
      <StatusBar
        zoom={state.zoom}
        objectCount={state.objects.length}
        selectedCount={state.selectedIds.length}
        activeTool={state.activeTool}
        onZoomChange={setZoom}
        onResetView={handleResetView}
      />
    </div>
  );
}

export default App;
