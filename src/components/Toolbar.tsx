import { useRef, useCallback, type FC } from 'react';
import gsap from 'gsap';
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
  { id: 'text', label: 'Text', shortcut: 'T' },
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
    text: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  };

  return svgByTool[toolId] ?? null;
};

export const Toolbar: FC<ToolbarProps> = ({ activeTool, panelMode, onToolChange, onPanelModeChange }) => {
  const logoRef = useRef<SVGSVGElement>(null);

  // Original circle positions for the pollin logo
  const originalPositions = useRef([
    { cx: 4, cy: 32.4707, r: 4 },
    { cx: 33.1836, cy: 4, r: 4 },
    { cx: 6.58984, cy: 7, r: 3 },
    { cx: 47.4219, cy: 53.4414, r: 3 },
    { cx: 35.1836, cy: 45.9883, r: 4 },
    { cx: 50.4219, cy: 24.4707, r: 8 },
    { cx: 15.9453, cy: 53.4414, r: 8 },
    { cx: 26.2109, cy: 26.7207, r: 12 },
  ]);

  const handleLogoEnter = useCallback(() => {
    if (!logoRef.current) return;
    const circles = logoRef.current.querySelectorAll('circle');
    const centerX = 29.5;
    const centerY = 31;
    const vbW = 59;
    const vbH = 62;
    circles.forEach((circle, i) => {
      const orig = originalPositions.current[i];
      // Scatter outward from center like pollen dispersing
      const angle = Math.atan2(orig.cy - centerY, orig.cx - centerX) + (Math.random() - 0.5) * 1.2;
      const dist = 5 + Math.random() * 8;
      const newR = orig.r * (0.75 + Math.random() * 0.5);
      // Clamp so circle stays fully inside the viewBox
      let newCx = orig.cx + Math.cos(angle) * dist;
      let newCy = orig.cy + Math.sin(angle) * dist;
      newCx = Math.max(newR, Math.min(vbW - newR, newCx));
      newCy = Math.max(newR, Math.min(vbH - newR, newCy));
      gsap.to(circle, {
        attr: { cx: newCx, cy: newCy, r: newR },
        duration: 0.6 + Math.random() * 0.3,
        ease: 'power2.out',
      });
    });
  }, []);

  const handleLogoLeave = useCallback(() => {
    if (!logoRef.current) return;
    const circles = logoRef.current.querySelectorAll('circle');
    circles.forEach((circle, i) => {
      const orig = originalPositions.current[i];
      gsap.to(circle, {
        attr: { cx: orig.cx, cy: orig.cy, r: orig.r },
        duration: 0.8 + Math.random() * 0.4,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  }, []);

  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      <div
        className="toolbar-logo"
        onMouseEnter={handleLogoEnter}
        onMouseLeave={handleLogoLeave}
      >
        <svg ref={logoRef} width="24" height="24" viewBox="0 0 59 62" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4" cy="32.4707" r="4" fill="currentColor"/>
          <circle cx="33.1836" cy="4" r="4" fill="currentColor"/>
          <circle cx="6.58984" cy="7" r="3" fill="currentColor"/>
          <circle cx="47.4219" cy="53.4414" r="3" fill="currentColor"/>
          <circle cx="35.1836" cy="45.9883" r="4" fill="currentColor"/>
          <circle cx="50.4219" cy="24.4707" r="8" fill="currentColor"/>
          <circle cx="15.9453" cy="53.4414" r="8" fill="currentColor"/>
          <circle cx="26.2109" cy="26.7207" r="12" fill="currentColor"/>
        </svg>
      </div>

      <div className="toolbar-divider" />

      {/* ── Mode toggles ─────────────────────────────── */}
      <div className="toolbar-modes">
        <button
          className={`toolbar-btn ${panelMode === 'prompt' ? 'toolbar-btn--active' : ''}`}
          onClick={() => onPanelModeChange('prompt')}
          title="Prompt (describe your idea)"
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
            <path d="M3 17c2-2 4-6 7-6s3 4 5 4 3-3 6-5" />
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
