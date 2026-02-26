import { type FC } from 'react';
import type { CanvasObject } from '@/types/canvas';

/* ─── Types ─────────────────────────────────────────────── */

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  target: CanvasObject | null;
  onAction: (actionId: string, target: CanvasObject | null) => void;
  onClose: () => void;
}

/* ─── Menu items ────────────────────────────────────────── */

function getMenuItems(target: CanvasObject | null): ContextMenuItem[] {
  if (!target) {
    return [
      { id: 'paste', label: 'Paste', icon: '⎘' },
      { id: 'select-all', label: 'Select All', icon: '☐' },
      { id: 'sep-1', label: '', separator: true },
      { id: 'toggle-grid', label: 'Toggle Grid', icon: '⊞' },
      { id: 'reset-view', label: 'Reset View', icon: '⟲' },
    ];
  }

  const isImage = target.kind === 'image';
  const isSketch = target.kind === 'stroke';

  return [
    { id: 'convert-ui', label: 'Convert to UI…', icon: '✦' },
    ...(isImage
      ? [{ id: 'convert-image', label: 'Use as Reference…', icon: '▣' }]
      : []),
    ...(isSketch
      ? [{ id: 'convert-sketch', label: 'Sketch → UI…', icon: '✎' }]
      : []),
    { id: 'sep-1', label: '', separator: true },
    { id: 'duplicate', label: 'Duplicate', icon: '⧉' },
    { id: 'bring-front', label: 'Bring to Front', icon: '↑' },
    { id: 'send-back', label: 'Send to Back', icon: '↓' },
    { id: 'sep-2', label: '', separator: true },
    { id: 'lock', label: target.locked ? 'Unlock' : 'Lock', icon: target.locked ? '◇' : '◆' },
    { id: 'toggle-visible', label: target.visible ? 'Hide' : 'Show', icon: target.visible ? '◉' : '◎' },
    { id: 'sep-3', label: '', separator: true },
    { id: 'delete', label: 'Delete', icon: '╳', danger: true },
  ];
}

/* ─── Component ─────────────────────────────────────────── */

export const ContextMenu: FC<ContextMenuProps> = ({ x, y, target, onAction, onClose }) => {
  const items = getMenuItems(target);

  return (
    <>
      {/* Invisible backdrop to capture clicks */}
      <div className="ctx-backdrop" onClick={onClose} />

      <div
        className="ctx-menu"
        style={{ left: x, top: y }}
        role="menu"
        aria-label="Context menu"
      >
        {items.map((item) =>
          item.separator ? (
            <div key={item.id} className="ctx-separator" role="separator" />
          ) : (
            <button
              key={item.id}
              className={`ctx-item ${item.danger ? 'ctx-item--danger' : ''} ${item.disabled ? 'ctx-item--disabled' : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  onAction(item.id, target);
                  onClose();
                }
              }}
              role="menuitem"
              disabled={item.disabled}
            >
              {item.icon && <span className="ctx-icon">{item.icon}</span>}
              <span className="ctx-label">{item.label}</span>
            </button>
          ),
        )}
      </div>
    </>
  );
};
