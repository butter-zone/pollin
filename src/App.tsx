import { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@/components/Canvas';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { StatusBar } from '@/components/StatusBar';
import { ConversionDialog } from '@/components/ConversionDialog';
import { ContextMenu } from '@/components/ContextMenu';
import { LibraryPanel } from '@/components/LibraryPanel';
import { PromptPanel } from '@/components/PromptPanel';
import type { GenerationEntry, ImageAttachment } from '@/components/PromptPanel';
import type { PanelMode } from '@/components/Toolbar';
import { useCanvas } from '@/hooks/useCanvas';
import { convertToUI, generateFromPrompt } from '@/services/conversion';
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
    // Persistence
    lastSaved,
    saveNow,
    exportCanvas,
    importCanvas,
    // Undo coalescing
    beginTransaction,
    endTransaction,
  } = useCanvas();

  // ── Panel mode: prompt (default) vs draw ───────────────
  const [panelMode, setPanelMode] = useState<PanelMode>('prompt');

  // ── Library panel toggle ──────────────────────────────
  const [showLibPanel, setShowLibPanel] = useState(false);

  // ── Selected library (single-select, shared between panels) ──
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | undefined>();

  // ── Generation state ──────────────────────────────────
  const [generations, setGenerations] = useState<GenerationEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Switch to draw mode when a drawing tool shortcut is pressed
  const handleToolChange = useCallback((tool: Tool) => {
    setTool(tool);
    if (['pen', 'rect', 'ellipse', 'line', 'text', 'eraser'].includes(tool)) {
      setPanelMode('draw');
    }
  }, [setTool]);

  const handlePanelModeChange = useCallback((mode: PanelMode) => {
    setPanelMode(mode);
    if (mode === 'prompt') {
      setTool('select');
    }
  }, [setTool]);

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
      // Save: Ctrl+S
      if (ctrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveNow();
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
        t: 'text',
        e: 'eraser',
      };
      const tool = map[e.key.toLowerCase()];
      if (tool) handleToolChange(tool);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleToolChange, undo, redo, saveNow, addObject, setSelection, state.selectedIds, state.objects]);

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
        case 'paste':
          // Paste from clipboard — images or text
          navigator.clipboard.read().then(async (items) => {
            for (const item of items) {
              // Try image first
              const imageType = item.types.find((t) => t.startsWith('image/'));
              if (imageType) {
                const blob = await item.getType(imageType);
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const src = ev.target?.result as string;
                  const img = new Image();
                  img.onload = () => {
                    addObject({
                      id: `obj-${Date.now()}-paste`,
                      kind: 'image',
                      x: state.panX + 200,
                      y: state.panY + 200,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      visible: true,
                      name: 'Pasted image',
                      timestamp: Date.now(),
                      src,
                      width: Math.min(img.width, 400),
                      height: Math.min(img.height, 300),
                    } as CanvasObject);
                  };
                  img.src = src;
                };
                reader.readAsDataURL(blob);
                return;
              }
              // Fall back to text
              if (item.types.includes('text/plain')) {
                const blob = await item.getType('text/plain');
                const text = await blob.text();
                if (text.trim()) {
                  addObject({
                    id: `obj-${Date.now()}-paste`,
                    kind: 'text',
                    x: state.panX + 200,
                    y: state.panY + 200,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    visible: true,
                    name: 'Pasted text',
                    timestamp: Date.now(),
                    text: text.trim(),
                    fontSize: 16,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: 'oklch(1 0 0)',
                    width: 200,
                  } as CanvasObject);
                }
              }
            }
          }).catch(() => {
            // Clipboard API may not be available or permission denied — silent fail
          });
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

  // ── Prompt-based generation ───────────────────────────
  const handleGenerate = useCallback(
    async (prompt: string, model: string, attachments: ImageAttachment[], libraryId?: string) => {
      const genId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const entry: GenerationEntry = {
        id: genId,
        prompt,
        model,
        status: 'generating',
        timestamp: Date.now(),
        attachments,
      };
      setGenerations((prev) => [entry, ...prev]);
      setIsGenerating(true);

      try {
        const result = await generateFromPrompt({
          prompt,
          model,
          framework: 'react',
          imageRefs: attachments.map((a) => a.dataUrl),
          libraryId,
        });

        const newStatus: GenerationEntry['status'] = result.success ? 'done' : 'error';
        setGenerations((prev) =>
          prev.map((g) =>
            g.id === genId
              ? {
                  ...g,
                  status: newStatus,
                  result: result.code || result.error || undefined,
                  imageDataUrl: result.imageDataUrl,
                }
              : g,
          ).slice(0, 20),
        );

        // Place the rendered UI image directly on the canvas
        if (result.success && result.imageDataUrl) {
          const imgObj: CanvasObject = {
            id: `obj-${Date.now()}-gen`,
            kind: 'image',
            x: state.panX + 120,
            y: state.panY + 80,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            name: `Generated: ${prompt.slice(0, 40)}`,
            timestamp: Date.now(),
            src: result.imageDataUrl,
            width: result.imageWidth ?? 420,
            height: result.imageHeight ?? 580,
          };
          addObject(imgObj);
        }
      } catch {
        setGenerations((prev) =>
          prev.map((g) => (g.id === genId ? { ...g, status: 'error' } : g)),
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [addObject, state.panX, state.panY],
  );

  // ── Add image attachment to canvas ────────────────────
  const handleImageToCanvas = useCallback(
    (att: ImageAttachment) => {
      const imgObj: CanvasObject = {
        id: `obj-${Date.now()}-img`,
        kind: 'image',
        x: state.panX + 200,
        y: state.panY + 200,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        name: att.name,
        timestamp: Date.now(),
        src: att.dataUrl,
        width: Math.min(att.width, 400),
        height: Math.min(att.height, 300),
      };
      addObject(imgObj);
    },
    [addObject, state.panX, state.panY],
  );

  return (
    <div className={`app-layout ${panelMode === 'prompt' ? 'app-layout--prompt' : 'app-layout--draw'}`} onContextMenu={handleContextMenu}>
      {/* Library panel toggle button */}
      <button
        className={`lib-toggle-btn${showLibPanel ? ' lib-toggle-btn--active' : ''}`}
        onClick={() => setShowLibPanel((v) => !v)}
        title="Design Libraries"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      </button>

      {/* Left toolbar rail */}
      <Toolbar
        activeTool={state.activeTool}
        panelMode={panelMode}
        onToolChange={handleToolChange}
        onPanelModeChange={handlePanelModeChange}
      />

      {/* Left panel: prompt OR drawing controls */}
      <div className="left-panel">
        {panelMode === 'prompt' ? (
          <PromptPanel
            libraries={state.libraries}
            selectedLibraryId={selectedLibraryId}
            onSelectedLibraryChange={setSelectedLibraryId}
            onGenerate={handleGenerate}
            onImageToCanvas={handleImageToCanvas}
            isGenerating={isGenerating}
            generations={generations}
            selectedObjectCount={state.selectedIds.length}
          />
        ) : (
          <ControlPanel
            state={state as any}
            onLineWidthChange={setLineWidth}
            onLineColorChange={setLineColor}
            onFillColorChange={setFillColor}
            onStrokeColorChange={setStrokeColor}
            onStrokeWidthChange={setStrokeWidth}
            onCornerRadiusChange={setCornerRadius}
            onOpacityChange={setOpacity}
            onToolChange={handleToolChange}
            onToggleGrid={toggleGrid}
            onSetGridSize={setGridSize}
            onToggleSnap={toggleSnap}
            onDeleteSelected={handleDeleteSelected}
            onClearCanvas={handleClearCanvas}
            onExportPNG={handleExportPNG}
            onSaveNow={saveNow}
            onExportCanvas={exportCanvas}
            onImportCanvas={importCanvas}
            onAddLibrary={addLibrary}
            onRemoveLibrary={removeLibrary}
            onToggleLibrary={toggleLibrary}
          />
        )}
      </div>

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
          onBeginTransaction={beginTransaction}
          onEndTransaction={endTransaction}
        />
      </div>

      {/* Library panel (toggleable right panel) */}
      {showLibPanel && (
        <LibraryPanel
          libraries={state.libraries}
          selectedLibraryId={selectedLibraryId}
          onSelectLibrary={setSelectedLibraryId}
          onAddLibrary={addLibrary}
          onRemoveLibrary={removeLibrary}
          onClose={() => setShowLibPanel(false)}
        />
      )}

      {/* Bottom status bar */}
      <StatusBar
        zoom={state.zoom}
        objectCount={state.objects.length}
        selectedCount={state.selectedIds.length}
        activeTool={state.activeTool}
        lastSaved={lastSaved}
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
          onAddLibrary={addLibrary}
        />
      )}

      {/* Generated code result (conversion dialog — kept for sketch→code flow) */}
      {conversionResult && (
        <div className="cv-overlay" onClick={() => setConversionResult(null)}>
          <div className="cv-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="cv-header">
              <div className="cv-header-left">
                <span className="cv-icon">✦</span>
                <h3 className="cv-title">Generated Code</h3>
              </div>
              <button className="cv-close" onClick={() => setConversionResult(null)}>✕</button>
            </div>
            <div className="cv-section">
              <pre className="pp-gen-code" style={{ maxHeight: 300 }}>
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
