import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCanvasPersistence } from '@/hooks/useCanvasPersistence';
import { DrawingStroke } from '@/types/canvas';

interface PersistencePanelProps {
  strokes: DrawingStroke[];
  canvas: HTMLCanvasElement | null;
  onLoadStrokes?: (strokes: DrawingStroke[]) => void;
}

export function PersistencePanel({ strokes, canvas, onLoadStrokes }: PersistencePanelProps) {
  const {
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
  } = useCanvasPersistence();

  const [sessionName, setSessionName] = useState(`session-${Date.now()}`);
  const [sessions, setSessions] = useState(getSessions());
  const [_showAutosave, setShowAutosave] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveToLocalStorage(strokes, sessionName);
    setSessions(getSessions());
  };

  const handleLoad = (sessionId: string) => {
    const loaded = loadFromLocalStorage(sessionId);
    if (loaded) {
      onLoadStrokes?.(loaded);
    }
  };

  const handleDelete = (sessionId: string) => {
    deleteFromLocalStorage(sessionId);
    setSessions(getSessions());
  };

  const handleEnableAutosave = () => {
    enableAutosave(strokes, sessionName, 10000);
    setShowAutosave(true);
  };

  const _handleDisableAutosave = () => {
    disableAutosave();
    setShowAutosave(false);
  };

  // suppress unused
  void _handleDisableAutosave;

  const handleExportJSON = () => {
    const json = exportAsJSON(strokes);
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
    link.download = `canvas-${Date.now()}.json`;
    link.click();
  };

  const handleExportPNG = () => {
    if (canvas) {
      exportAsPNG(canvas, `canvas-${Date.now()}.png`);
    }
  };

  const handleExportSVG = () => {
    const svg = exportAsSVG(strokes, canvas?.width || 800, canvas?.height || 600);
    const link = document.createElement('a');
    link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    link.download = `canvas-${Date.now()}.svg`;
    link.click();
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const imported = importFromJSON(json);
      if (imported) {
        onLoadStrokes?.(imported);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-surface-700 pt-lg space-y-lg"
      role="region"
      aria-label="Persistence and export panel"
    >
      {/* Autosave Status */}
      {state.autosaveEnabled && (
        <div className="bg-surface-700 p-sm rounded text-xs text-surface-200">
          <div className="flex items-center gap-sm">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Autosaving to: <span className="font-mono">{sessionName}</span>
          </div>
          {state.lastSaved && (
            <div className="text-surface-400 mt-xs">
              Last saved: {state.lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Session Management */}
      <div className="space-y-sm">
        <label className="block text-sm font-medium text-surface-200">Session Name</label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="w-full px-sm py-xs bg-surface-700 text-surface-50 rounded text-sm"
          placeholder="e.g., my-design-v1"
          aria-label="Session name for saving"
        />
      </div>

      {/* Save/Load Controls */}
      <div className="grid grid-cols-2 gap-sm">
        <button
          onClick={handleSave}
          className="control-button py-md"
          aria-label="Save current canvas to localStorage"
        >
          💾 Save
        </button>
        <button
          onClick={handleEnableAutosave}
          disabled={state.autosaveEnabled}
          className="control-button py-md disabled:opacity-50"
          aria-label="Enable autosave"
        >
          🔄 Autosave
        </button>
      </div>

      {/* Saved Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-sm">
          <label className="block text-sm font-medium text-surface-200">Saved Sessions</label>
          <div className="space-y-xs max-h-40 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-surface-700 p-sm rounded flex items-center justify-between text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono truncate">{session.id}</div>
                  <div className="text-surface-400 text-xs">
                    {session.strokeCount} strokes • {session.timestamp.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-xs ml-sm">
                  <button
                    onClick={() => handleLoad(session.id)}
                    className="control-button px-xs py-xs text-xs"
                    title="Load this session"
                  >
                    📂
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="control-button px-xs py-xs text-xs bg-red-900 hover:bg-red-800"
                    title="Delete this session"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-sm">
        <label className="block text-sm font-medium text-surface-200">Export Canvas</label>
        <div className="space-y-xs">
          <button
            onClick={handleExportJSON}
            className="control-button w-full py-md text-sm"
            aria-label="Export canvas as JSON file"
          >
            📋 Export JSON
          </button>
          <button
            onClick={handleExportPNG}
            disabled={!canvas}
            className="control-button w-full py-md text-sm disabled:opacity-50"
            aria-label="Export canvas as PNG image"
          >
            🖼️ Export PNG
          </button>
          <button
            onClick={handleExportSVG}
            className="control-button w-full py-md text-sm"
            aria-label="Export canvas as SVG vector"
          >
            ✏️ Export SVG
          </button>
        </div>
      </div>

      {/* Import Options */}
      <div className="space-y-sm">
        <label className="block text-sm font-medium text-surface-200">Import Canvas</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImportJSON(file);
            }
          }}
          className="hidden"
          aria-label="Import JSON file"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="control-button w-full py-md text-sm"
        >
          📂 Import JSON
        </button>
      </div>

      {/* Status */}
      <div className="text-xs text-surface-400 space-y-xs">
        {state.isDirty && (
          <div className="text-yellow-500 font-medium">⚠️ Unsaved changes</div>
        )}
        <div>Storage used: {sessions.length} session(s)</div>
      </div>
    </motion.div>
  );
}
