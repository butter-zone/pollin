import React, { useEffect, useRef, useCallback } from 'react';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  action: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: Shortcut[];
}

const categories: ShortcutCategory[] = [
  {
    title: 'Tools',
    shortcuts: [
      { key: 'V', action: 'Select tool' },
      { key: 'H', action: 'Hand / pan tool' },
      { key: 'P', action: 'Pen tool' },
      { key: 'R', action: 'Rectangle tool' },
      { key: 'O', action: 'Ellipse tool' },
      { key: 'L', action: 'Line tool' },
      { key: 'T', action: 'Text tool' },
      { key: 'E', action: 'Eraser tool' },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { key: 'Space (hold)', action: 'Pan canvas' },
      { key: 'Delete / Backspace', action: 'Delete selected' },
      { key: 'Escape', action: 'Cancel / deselect' },
    ],
  },
  {
    title: 'File',
    shortcuts: [
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+Shift+Z / Ctrl+Y', action: 'Redo' },
      { key: 'Ctrl+S', action: 'Save' },
      { key: 'Ctrl+D', action: 'Duplicate selected' },
      { key: 'Ctrl+A', action: 'Select all' },
    ],
  },
];

const cssString = `
.ks-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0.13 0.01 260 / 0.85);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.ks-overlay.ks-open {
  opacity: 1;
  pointer-events: auto;
}

.ks-modal {
  background: oklch(0.18 0.01 260);
  border: 1px solid oklch(0.3 0.01 260);
  border-radius: 12px;
  padding: 32px;
  max-width: 820px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  transform: scale(0.95);
  transition: transform 0.2s ease;
  box-shadow: 0 24px 64px oklch(0 0 0 / 0.5);
}

.ks-overlay.ks-open .ks-modal {
  transform: scale(1);
}

.ks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.ks-title {
  font-size: 20px;
  font-weight: 600;
  color: oklch(0.95 0 0);
  margin: 0;
}

.ks-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid oklch(0.3 0.01 260);
  border-radius: 8px;
  background: oklch(0.22 0.015 260);
  color: oklch(0.7 0 0);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  line-height: 1;
}

.ks-close-btn:hover {
  background: oklch(0.28 0.015 260);
  color: oklch(0.95 0 0);
}

.ks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 700px) {
  .ks-grid {
    grid-template-columns: 1fr;
  }
}

.ks-category-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: oklch(0.75 0.15 160);
  margin: 0 0 12px 0;
}

.ks-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ks-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
}

.ks-key {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  background: oklch(0.22 0.015 260);
  border: 1px solid oklch(0.3 0.01 260);
  color: oklch(0.85 0 0);
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
}

.ks-action {
  color: oklch(0.7 0 0);
  font-size: 13px;
  text-align: right;
  flex-shrink: 1;
}
`;

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ open, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the modal when it opens
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style>{cssString}</style>
      <div
        className={`ks-overlay${open ? ' ks-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={handleBackdropClick}
      >
        <div className="ks-modal" ref={modalRef} tabIndex={-1}>
          <div className="ks-header">
            <h2 className="ks-title">Keyboard Shortcuts</h2>
            <button className="ks-close-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="ks-grid">
            {categories.map((category) => (
              <div key={category.title}>
                <h3 className="ks-category-title">{category.title}</h3>
                <div className="ks-list">
                  {category.shortcuts.map((shortcut) => (
                    <div className="ks-row" key={shortcut.key}>
                      <kbd className="ks-key">{shortcut.key}</kbd>
                      <span className="ks-action">{shortcut.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcuts;
