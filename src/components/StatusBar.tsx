import { useState, useEffect, type FC } from 'react';

interface StatusBarProps {
  zoom: number;
  objectCount: number;
  selectedCount: number;
  activeTool: string;
  lastSaved: number | null;
  onZoomChange: (z: number) => void;
  onResetView: () => void;
}

function formatTimeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const StatusBar: FC<StatusBarProps> = ({
  zoom,
  objectCount,
  selectedCount,
  activeTool,
  lastSaved,
  onZoomChange,
  onResetView,
}) => {
  const zoomPct = Math.round(zoom * 100);

  // Refresh the "saved X ago" text every 10s
  const [, tick] = useState(0);
  useEffect(() => {
    if (!lastSaved) return;
    const id = setInterval(() => tick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, [lastSaved]);

  return (
    <div className="status-bar" role="status">
      {/* Left: info */}
      <div className="status-section">
        <span className="status-chip">{activeTool}</span>
        <span className="status-text">
          {objectCount} object{objectCount !== 1 ? 's' : ''}
        </span>
        {selectedCount > 0 && (
          <span className="status-text status-text--accent">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Center: save status */}
      <div className="status-section">
        {lastSaved ? (
          <span className="status-text status-saved" title={new Date(lastSaved).toLocaleString()}>
            <svg className="status-saved-icon" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 4.5 6 12 2.5 8.5" /></svg>
            Saved {formatTimeAgo(lastSaved)}
          </span>
        ) : (
          <span className="status-text status-text--dim">Not saved</span>
        )}
      </div>

      {/* Right: zoom */}
      <div className="status-section">
        <button className="status-zoom-btn" onClick={() => onZoomChange(zoom / 1.2)}>
          −
        </button>

        <button className="status-zoom-level" onClick={onResetView} title="Reset to 100%">
          {zoomPct}%
        </button>

        <button className="status-zoom-btn" onClick={() => onZoomChange(zoom * 1.2)}>
          +
        </button>
      </div>
    </div>
  );
};
