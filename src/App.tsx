import { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@/components/Canvas';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { StatusBar } from '@/components/StatusBar';
import { ConversionDialog } from '@/components/ConversionDialog';
import { ContextMenu } from '@/components/ContextMenu';
import { LibraryPanel } from '@/components/LibraryPanel';
import { useCanvas } from '@/hooks/useCanvas';
import { convertToUI } from '@/services/conversion';
import type { ConversionPayload } from '@/components/ConversionDialog';
import type { Tool, CanvasObject } from '@/types/canvas';

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
    undo,
    redo,
  } = useCanvas();

  // ── Library panel toggle ──────────────────────────────
  const [showLibPanel, setShowLibPanel] = useState(false);

  // keyboard shortcuts for tools + undo/redo/dup/select-all
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Undo: Ctrl+Z
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((ctrl && e.shiftKey && e.key.toLowerCase() === 'z') || (ctrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }
      // Duplicate: Ctrl+D
      if (ctrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        state.selectedIds.forEach((id) => {
          const obj = state.objects.find((o) => o.id === id);
          if (obj) {
            addObject({
              ...obj,
              id: `obj-${Date.now()}-dup`,
              x: obj.x + 20,
              y: obj.y + 20,
              name: `${obj.name || obj.kind} copy`,
            } as CanvasObject);
          }
        });
        return;
      }
      // Select all: Ctrl+A
      if (ctrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelection(state.objects.map((o) => o.id));
        return;
      }

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
  }, [setTool, undo, redo, addObject, setSelection, state.selectedIds, state.objects]);

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

  // ── Context menu state ────────────────────────────────
  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    target: CanvasObject | null;
  } | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const hit = state.selectedIds.length === 1
        ? state.objects.find((o) => o.id === state.selectedIds[0]) ?? null
        : null;
      setCtxMenu({ x: e.clientX, y: e.clientY, target: hit });
    },
    [state.selectedIds, state.objects],
  );

  // ── Conversion dialog state ───────────────────────────
  const [conversionTarget, setConversionTarget] = useState<CanvasObject | null>(null);
  const [conversionResult, setConversionResult] = useState<string | null>(null);

  const handleContextAction = useCallback(
    (actionId: string, target: CanvasObject | null) => {
      switch (actionId) {
        case 'convert-ui':
        case 'convert-sketch':
        case 'convert-image':
          if (target) setConversionTarget(target);
          break;
        case 'duplicate':
          if (target) {
            const clone = {
              ...target,
              id: `obj-${Date.now()}-dup`,
              x: target.x + 20,
              y: target.y + 20,
              name: `${target.name || target.kind} copy`,
            };
            addObject(clone as CanvasObject);
          }
          break;
        case 'bring-front':
          if (target) {
            const objs = state.objects.filter((o) => o.id !== target.id);
            objs.push(target);
            setObjects(objs);
          }
          break;
        case 'send-back':
          if (target) {
            const objs = state.objects.filter((o) => o.id !== target.id);
            objs.unshift(target);
            setObjects(objs);
          }
          break;
        case 'lock':
          if (target) updateObject(target.id, { locked: !target.locked });
          break;
        case 'toggle-visible':
          if (target) updateObject(target.id, { visible: !target.visible });
          break;
        case 'delete':
          if (target) deleteObjects([target.id]);
          break;
        case 'select-all':
          setSelection(state.objects.map((o) => o.id));
          break;
        case 'toggle-grid':
          toggleGrid();
          break;
        case 'reset-view':
          handleResetView();
          break;
      }
    },
    [state.objects, addObject, setObjects, updateObject, deleteObjects, setSelection, toggleGrid, handleResetView],
  );

  const handleConvert = useCallback(
    async (payload: ConversionPayload) => {
      const result = await convertToUI(payload);
      if (result.success) {
        setConversionResult(result.code);
      }
      setConversionTarget(null);
    },
    [],
  );

  return (
    <div className="app-layout" onContextMenu={handleContextMenu}>
      {/* Library panel toggle button */}
      <button
        className={`lib-toggle-btn${showLibPanel ? ' lib-toggle-btn--active' : ''}`}
        onClick={() => setShowLibPanel((v) => !v)}
        title="Design Libraries"
      >
        📚
      </button>

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

      {/* Library panel (toggleable right panel) */}
      {showLibPanel && (
        <div className="lib-panel-container">
          <LibraryPanel
            libraries={state.libraries}
            onAddLibrary={addLibrary}
            onRemoveLibrary={removeLibrary}
            onToggleLibrary={toggleLibrary}
          />
        </div>
      )}

      {/* Bottom status bar */}
      <StatusBar
        zoom={state.zoom}
        objectCount={state.objects.length}
        selectedCount={state.selectedIds.length}
        activeTool={state.activeTool}
        onZoomChange={setZoom}
        onResetView={handleResetView}
      />

      {/* Context menu */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          target={ctxMenu.target}
          onAction={handleContextAction}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Conversion dialog */}
      {conversionTarget && (
        <ConversionDialog
          target={conversionTarget}
          libraries={state.libraries}
          onClose={() => setConversionTarget(null)}
          onConvert={handleConvert}
        />
      )}

      {/* Generated code result */}
      {conversionResult && (
        <div className="cv-overlay" onClick={() => setConversionResult(null)}>
          <div className="cv-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="cv-header">
              <div className="cv-header-left">
                <span className="cv-icon">🎉</span>
                <h3 className="cv-title">Generated Code</h3>
              </div>
              <button className="cv-close" onClick={() => setConversionResult(null)}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              <pre style={{
                fontSize: 12,
                fontFamily: "'SF Mono', 'Cascadia Code', monospace",
                background: 'var(--c-surface-2)',
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                overflow: 'auto',
                maxHeight: 300,
                whiteSpace: 'pre-wrap',
                color: 'var(--c-text)',
              }}>
                {conversionResult}
              </pre>
            </div>
            <div className="cv-footer">
              <button
                className="cv-btn cv-btn--secondary"
                onClick={() => {
                  navigator.clipboard.writeText(conversionResult);
                }}
              >
                Copy to Clipboard
              </button>
              <button className="cv-btn cv-btn--primary" onClick={() => setConversionResult(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
