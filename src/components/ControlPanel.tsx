import { useState, type FC, type ReactNode } from 'react';
import type { CanvasState, Tool, DesignLibrary } from '@/types/canvas';

/* ─── sub-components used inside the panel ──────────────────────────── */

/** Collapsible folder (DialKit pattern) */
const Folder: FC<{
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}> = ({ label, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="dk-folder">
      <button
        className="dk-folder-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="dk-chevron" data-open={open}>
          ▸
        </span>
        <span className="dk-folder-label">{label}</span>
      </button>
      {open && <div className="dk-folder-body">{children}</div>}
    </div>
  );
};

/** Labeled slider with numeric readout */
const Slider: FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="dk-row">
    <label className="dk-label">{label}</label>
    <div className="dk-slider-group">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="dk-slider"
      />
      <span className="dk-value">
        {step < 1 ? value.toFixed(2) : value}
        {unit}
      </span>
    </div>
  </div>
);

/** Color swatch + hex input */
const ColorControl: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="dk-row">
    <label className="dk-label">{label}</label>
    <div className="dk-color-group">
      <input
        type="color"
        value={value === 'transparent' ? '#000000' : value}
        onChange={(e) => onChange(e.target.value)}
        className="dk-color-swatch"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="dk-color-hex"
        spellCheck={false}
      />
    </div>
  </div>
);

/** Toggle switch */
const Toggle: FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="dk-row">
    <label className="dk-label">{label}</label>
    <button
      className={`dk-toggle ${value ? 'dk-toggle--on' : ''}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <span className="dk-toggle-thumb" />
    </button>
  </div>
);

/** Action button */
const Action: FC<{
  label: string;
  variant?: 'default' | 'danger';
  onClick: () => void;
}> = ({ label, variant = 'default', onClick }) => (
  <button
    className={`dk-action ${variant === 'danger' ? 'dk-action--danger' : ''}`}
    onClick={onClick}
  >
    {label}
  </button>
);

/* ─── main panel ────────────────────────────────────────────────────── */

interface ControlPanelProps {
  state: CanvasState & { libraries: DesignLibrary[] };
  onLineWidthChange: (w: number) => void;
  onLineColorChange: (c: string) => void;
  onFillColorChange: (c: string) => void;
  onStrokeColorChange: (c: string) => void;
  onStrokeWidthChange: (w: number) => void;
  onCornerRadiusChange: (r: number) => void;
  onOpacityChange: (o: number) => void;
  onToolChange?: (t: Tool) => void;
  onToggleGrid: () => void;
  onSetGridSize: (s: number) => void;
  onToggleSnap: () => void;
  onDeleteSelected: () => void;
  onClearCanvas: () => void;
  onExportPNG: () => void;
  onSaveNow?: () => void;
  onExportCanvas?: () => void;
  onImportCanvas?: () => void;
  onAddLibrary?: (lib: DesignLibrary) => void;
  onRemoveLibrary?: (libId: string) => void;
  onToggleLibrary?: (libId: string) => void;
}

export function ControlPanel({
  state,
  onLineWidthChange,
  onLineColorChange,
  onFillColorChange,
  onStrokeColorChange,
  onStrokeWidthChange,
  onCornerRadiusChange,
  onOpacityChange,
  onToolChange: _onToolChange,
  onToggleGrid,
  onSetGridSize,
  onToggleSnap,
  onDeleteSelected,
  onClearCanvas,
  onExportPNG,
  onSaveNow,
  onExportCanvas,
  onImportCanvas,
  onAddLibrary,
  onRemoveLibrary,
  onToggleLibrary,
}: ControlPanelProps) {
  const [libUrl, setLibUrl] = useState('');

  const selectedObj = state.selectedIds.length === 1
    ? state.objects.find((o) => o.id === state.selectedIds[0])
    : null;

  return (
    <div
      className="dk-panel"
      role="region"
      aria-label="Control panel"
    >
      {/* Panel header */}
      <div className="dk-panel-header">
        <span className="dk-panel-title">Controls</span>
      </div>

      <div className="dk-panel-body">
          {/* ── Drawing ──────────────────────────── */}
          <Folder label="Drawing">
            <Slider
              label="Stroke"
              value={state.lineWidth}
              min={1}
              max={48}
              unit="px"
              onChange={onLineWidthChange}
            />
            <ColorControl
              label="Color"
              value={state.lineColor}
              onChange={onLineColorChange}
            />
            <Slider
              label="Opacity"
              value={state.opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={onOpacityChange}
            />
          </Folder>

          {/* ── Libraries ────────────────────────── */}
          <Folder label={`Libraries (${state.libraries.length})`} defaultOpen={false}>
            <div className="dk-row">
              <input
                type="text"
                placeholder="Paste URL..."
                value={libUrl}
                onChange={(e) => setLibUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && libUrl.trim() && onAddLibrary) {
                    onAddLibrary({
                      id: `lib-${Date.now()}`,
                      name: libUrl.split('/').pop() || 'Library',
                      source: 'other',
                      sourceUrl: libUrl,
                      components: [],
                      active: true,
                    });
                    setLibUrl('');
                  }
                }}
                className="dk-input"
              />
            </div>
            {state.libraries.length === 0 ? (
              <div className="dk-empty">No design systems added</div>
            ) : (
              <div className="dk-objects-list">
                {state.libraries.map((lib) => (
                  <div key={lib.id} className="dk-lib-row">
                    <div className="dk-lib-info">
                      <div className="dk-lib-name">{lib.name}</div>
                      <div className="dk-lib-meta">{lib.components.length} components</div>
                    </div>
                    <div className="dk-lib-actions">
                      <button
                        onClick={() => onToggleLibrary?.(lib.id)}
                        className="dk-icon-btn"
                        title={lib.active ? 'Active' : 'Inactive'}
                      >
                        {lib.active ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => onRemoveLibrary?.(lib.id)}
                        className="dk-icon-btn dk-icon-btn--danger"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Folder>

          {/* ── Shape ────────────────────────────── */}
          <Folder label="Shape">
            <ColorControl
              label="Fill"
              value={state.fillColor}
              onChange={onFillColorChange}
            />
            <ColorControl
              label="Stroke"
              value={state.strokeColor}
              onChange={onStrokeColorChange}
            />
            <Slider
              label="Width"
              value={state.strokeWidth}
              min={0}
              max={24}
              unit="px"
              onChange={onStrokeWidthChange}
            />
            <Slider
              label="Radius"
              value={state.cornerRadius}
              min={0}
              max={100}
              unit="px"
              onChange={onCornerRadiusChange}
            />
          </Folder>

          {/* ── Canvas ───────────────────────────── */}
          <Folder label="Canvas" defaultOpen={false}>
            <Toggle
              label="Grid"
              value={state.showGrid}
              onChange={onToggleGrid}
            />
            <Slider
              label="Size"
              value={state.gridSize}
              min={5}
              max={100}
              unit="px"
              onChange={onSetGridSize}
            />
            <Toggle
              label="Snap"
              value={state.snapToGrid}
              onChange={onToggleSnap}
            />
          </Folder>

          {/* ── Selection info ────────────────────── */}
          {selectedObj && (
            <Folder label={`Selected: ${selectedObj.kind}`}>
              <div className="dk-row">
                <span className="dk-label">ID</span>
                <span className="dk-value dk-value--mono">{selectedObj.id.slice(0, 12)}</span>
              </div>
              <div className="dk-row">
                <span className="dk-label">Position</span>
                <span className="dk-value dk-value--mono">
                  {Math.round(selectedObj.x)}, {Math.round(selectedObj.y)}
                </span>
              </div>
            </Folder>
          )}

          {/* ── Actions ──────────────────────────── */}
          <Folder label="Actions" defaultOpen={false}>
            {state.selectedIds.length > 0 && (
              <Action
                label={`Delete (${state.selectedIds.length})`}
                variant="danger"
                onClick={onDeleteSelected}
              />
            )}
            <Action label="Clear All" variant="danger" onClick={onClearCanvas} />
            <Action label="Export PNG" onClick={onExportPNG} />
          </Folder>

          {/* ── File ─────────────────────────────── */}
          <Folder label="File" defaultOpen={false}>
            {onSaveNow && <Action label="Save Now" onClick={onSaveNow} />}
            {onExportCanvas && <Action label="Export .pollin" onClick={onExportCanvas} />}
            {onImportCanvas && <Action label="Import .pollin" onClick={onImportCanvas} />}
          </Folder>

          {/* ── Objects list ──────────────────────── */}
          <Folder label={`Objects (${state.objects.length})`} defaultOpen={false}>
            {state.objects.length === 0 && (
              <div className="dk-empty">No objects yet</div>
            )}
            <div className="dk-objects-list">
              {[...state.objects].reverse().map((obj) => (
                <div
                  key={obj.id}
                  className={`dk-object-row ${
                    state.selectedIds.includes(obj.id) ? 'dk-object-row--selected' : ''
                  }`}
                >
                  <span className="dk-object-kind">{obj.kind}</span>
                  <span className="dk-object-name">{obj.name || obj.id.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </Folder>
        </div>
    </div>
  );
}
