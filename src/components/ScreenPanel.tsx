import { useState, useCallback } from 'react';
import { Trash2, Monitor, Smartphone, ChevronDown, Play } from 'lucide-react';
import type { Screen } from '@/types/canvas';

// ── Device presets ──────────────────────────────────────
const DEVICE_PRESETS = [
  { label: 'iPhone 15', width: 393, height: 852, icon: Smartphone },
  { label: 'iPhone SE', width: 375, height: 667, icon: Smartphone },
  { label: 'iPad', width: 820, height: 1180, icon: Monitor },
  { label: 'Desktop', width: 1440, height: 900, icon: Monitor },
  { label: 'Custom', width: 400, height: 700, icon: Monitor },
] as const;

interface ScreenPanelProps {
  screens: Screen[];
  activeScreenId?: string;
  onAddScreen: (screen: Screen) => void;
  onUpdateScreen: (id: string, changes: Partial<Screen>) => void;
  onDeleteScreen: (id: string) => void;
  onSetActiveScreen: (id: string | undefined) => void;
  onNavigateToScreen: (screen: Screen) => void;
  onStartPrototype: () => void;
  onClose: () => void;
}

let _screenId = 0;
const makeScreenId = () => `screen-${Date.now()}-${++_screenId}`;

export function ScreenPanel({
  screens,
  activeScreenId,
  onAddScreen,
  onUpdateScreen,
  onDeleteScreen,
  onSetActiveScreen,
  onNavigateToScreen,
  onStartPrototype,
  onClose,
}: ScreenPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddScreen = useCallback(
    (presetIdx: number = 0) => {
      const preset = DEVICE_PRESETS[presetIdx];
      const sortOrder = screens.length;
      // Offset each new screen so they don't overlap
      const xOffset = sortOrder * (preset.width + 80);
      const screen: Screen = {
        id: makeScreenId(),
        name: `Screen ${screens.length + 1}`,
        x: xOffset,
        y: 0,
        width: preset.width,
        height: preset.height,
        sortOrder,
      };
      onAddScreen(screen);
      onSetActiveScreen(screen.id);
      onNavigateToScreen(screen);
    },
    [screens.length, onAddScreen, onSetActiveScreen, onNavigateToScreen],
  );

  const handleStartRename = useCallback((screen: Screen) => {
    setEditingId(screen.id);
    setEditName(screen.name);
  }, []);

  const handleFinishRename = useCallback(() => {
    if (editingId && editName.trim()) {
      onUpdateScreen(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  }, [editingId, editName, onUpdateScreen]);

  const handleScreenClick = useCallback(
    (screen: Screen) => {
      onSetActiveScreen(screen.id);
      onNavigateToScreen(screen);
    },
    [onSetActiveScreen, onNavigateToScreen],
  );

  const sorted = [...screens].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="dk-panel dk-screen-panel">
      <div className="dk-panel-header">
        <span className="dk-panel-title">Screens</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {screens.length > 0 && (
            <button
              className="dk-icon-btn dk-icon-btn--sm sp-play-btn"
              onClick={onStartPrototype}
              title="Preview prototype"
            >
              <Play size={12} />
            </button>
          )}
          <button
            className="dk-icon-btn dk-icon-btn--sm"
            onClick={onClose}
            title="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="dk-panel-body">
        {/* Add screen section */}
        <div className="dk-folder">
          <div className="dk-folder-header" style={{ justifyContent: 'space-between' }}>
            <span>Add Screen</span>
            <button
              className="dk-icon-btn dk-icon-btn--sm"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown
                size={11}
                style={{
                  transform: expanded ? 'none' : 'rotate(-90deg)',
                  transition: 'transform var(--dur) var(--ease)',
                }}
              />
            </button>
          </div>
          {expanded && (
            <div className="sp-preset-grid">
              {DEVICE_PRESETS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.label}
                    className="sp-preset-card"
                    onClick={() => handleAddScreen(idx)}
                    title={`${preset.label} (${preset.width}×${preset.height})`}
                  >
                    <Icon size={14} />
                    <span className="sp-preset-label">{preset.label}</span>
                    <span className="sp-preset-dims">
                      {preset.width}×{preset.height}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Screen list */}
        <div className="dk-folder">
          <div className="dk-folder-header">
            <span>Screens</span>
            <span className="dk-folder-count">{screens.length}</span>
          </div>

          {sorted.length === 0 && (
            <div className="sp-empty">
              No screens yet. Add one above to start prototyping.
            </div>
          )}

          {sorted.map((screen) => {
            const isActive = screen.id === activeScreenId;
            const isEditing = screen.id === editingId;

            return (
              <div
                key={screen.id}
                className={`sp-screen-row ${isActive ? 'sp-screen-row--active' : ''}`}
                onClick={() => handleScreenClick(screen)}
              >
                <div className="sp-screen-icon">
                  {screen.width > 900 ? (
                    <Monitor size={14} />
                  ) : (
                    <Smartphone size={14} />
                  )}
                </div>

                <div className="sp-screen-info">
                  {isEditing ? (
                    <input
                      autoFocus
                      className="sp-rename-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={handleFinishRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFinishRename();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="sp-screen-name"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(screen);
                      }}
                    >
                      {screen.name}
                    </span>
                  )}
                  <span className="sp-screen-dims">
                    {screen.width}×{screen.height}
                  </span>
                </div>

                <div className="sp-screen-actions">
                  <button
                    className="dk-icon-btn dk-icon-btn--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(screen);
                    }}
                    title="Rename"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  <button
                    className="dk-icon-btn dk-icon-btn--sm dk-icon-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScreen(screen.id);
                    }}
                    title="Delete screen"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dk-hint">
        Screens define frames on your canvas. Add flow links to create interactive prototypes.
      </div>
    </div>
  );
}
