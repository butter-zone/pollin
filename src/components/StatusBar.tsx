import type { FC } from 'react';

interface StatusBarProps {
  zoom: number;
  objectCount: number;
  selectedCount: number;
  activeTool: string;
  onZoomChange: (z: number) => void;
  onResetView: () => void;
}

export const StatusBar: FC<StatusBarProps> = ({
  zoom,
  objectCount,
  selectedCount,
  activeTool,
  onZoomChange,
  onResetView,
}) => {
  const zoomPct = Math.round(zoom * 100);

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
