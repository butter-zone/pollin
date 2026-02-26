import type { FC } from 'react';
import { Tool } from '@/types/canvas';

export type PanelMode = 'prompt' | 'draw';

interface ToolbarProps {
  activeTool: Tool;
  panelMode: PanelMode;
  onToolChange: (tool: Tool) => void;
  onPanelModeChange: (mode: PanelMode) => void;
}

const drawTools: Array<{ id: Tool; label: string; shortcut: string }> = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'hand', label: 'Hand', shortcut: 'H' },
  { id: 'pen', label: 'Pen', shortcut: 'P' },
  { id: 'rect', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O' },
  { id: 'line', label: 'Line', shortcut: 'L' },
  { id: 'eraser', label: 'Eraser', shortcut: 'E' },
];

const ToolIcon: FC<{ toolId: Tool; isActive: boolean }> = ({ toolId, isActive }) => {
  const svgByTool: Record<Tool, JSX.Element> = {
    select: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 2L3 14L6.5 10.5L9.5 16L11.5 15L8.5 9L13 9L3 2Z"
          fill={isActive ? 'oklch(1 0 0)' : 'currentColor'} />
      </svg>
    ),
    hand: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10.5V5a2 2 0 0 0-4 0v9"/>
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16c-.8-.9-.2-2.3 1-2.3.5 0 .9.2 1.3.5L7 15.5"/>
      </svg>
    ),
    pen: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    rect: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    ellipse: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="10" ry="8" />
      </svg>
    ),
    line: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="20" x2="20" y2="4" />
      </svg>
    ),
    eraser: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l5.3 5.3c1 1 1 2.5 0 3.4l-6.6 6.6" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
      </svg>
    ),
  };

  return svgByTool[toolId] ?? null;
};

export const Toolbar: FC<ToolbarProps> = ({ activeTool, panelMode, onToolChange, onPanelModeChange }) => {
  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      <div className="toolbar-logo">
        <span className="toolbar-logo-mark">P</span>
      </div>

      <div className="toolbar-divider" />

      {/* ── Mode toggles ─────────────────────────────── */}
      <div className="toolbar-modes">
        <button
          className={`toolbar-btn ${panelMode === 'prompt' ? 'toolbar-btn--active' : ''}`}
          onClick={() => onPanelModeChange('prompt')}
          title="Prompt (describe your design)"
          aria-pressed={panelMode === 'prompt'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button
          className={`toolbar-btn ${panelMode === 'draw' ? 'toolbar-btn--active' : ''}`}
          onClick={() => onPanelModeChange('draw')}
          title="Draw (pen & shape tools)"
          aria-pressed={panelMode === 'draw'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22 16 8" />
            <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M15 2a5 5 0 0 1 0 7l-3.5 3.5" />
          </svg>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* ── Drawing tools (visible in draw mode) ─────── */}
      <div className={`toolbar-tools ${panelMode !== 'draw' ? 'toolbar-tools--hidden' : ''}`}>
        {drawTools.map((tool) => {
          const isActive = panelMode === 'draw' && activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`toolbar-btn ${isActive ? 'toolbar-btn--active' : ''}`}
              title={`${tool.label} (${tool.shortcut})`}
              aria-pressed={isActive}
              aria-label={tool.label}
            >
              <ToolIcon toolId={tool.id} isActive={isActive} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
