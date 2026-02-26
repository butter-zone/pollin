import { useState, useRef, useEffect, type FC } from 'react';
import type { CanvasObject, DesignLibrary } from '@/types/canvas';

/* ─── Types ─────────────────────────────────────────────── */

interface ConversionDialogProps {
  /** The canvas object (sketch or image) to convert */
  target: CanvasObject;
  /** Available design system libraries */
  libraries: DesignLibrary[];
  /** Close the dialog */
  onClose: () => void;
  /** Called when conversion is submitted */
  onConvert: (payload: ConversionPayload) => void;
}

export interface ConversionPayload {
  targetId: string;
  libraryId: string | null;
  prompt: string;
  fidelity: 'wireframe' | 'polished';
  framework: 'react' | 'html' | 'tailwind';
}

/* ─── Component ─────────────────────────────────────────── */

export const ConversionDialog: FC<ConversionDialogProps> = ({
  target,
  libraries,
  onClose,
  onConvert,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedLib, setSelectedLib] = useState<string | null>(
    libraries.find((l) => l.active)?.id ?? null,
  );
  const [fidelity, setFidelity] = useState<'wireframe' | 'polished'>('polished');
  const [framework, setFramework] = useState<'react' | 'html' | 'tailwind'>('react');
  const [isConverting, setIsConverting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = () => {
    setIsConverting(true);
    onConvert({
      targetId: target.id,
      libraryId: selectedLib,
      prompt,
      fidelity,
      framework,
    });
  };

  const activeLibs = libraries.filter((l) => l.active);
  const isSketch = target.kind === 'stroke';
  const label = isSketch ? 'Sketch' : 'Image';

  return (
    <div className="cv-overlay" onClick={onClose}>
      <div className="cv-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cv-header">
          <div className="cv-header-left">
            <span className="cv-icon">{isSketch ? '✎' : '▣'}</span>
            <h3 className="cv-title">Convert {label} → UI</h3>
          </div>
          <button className="cv-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Preview thumbnail */}
        <div className="cv-preview">
          <div className="cv-preview-label">{target.name || target.id.slice(0, 12)}</div>
          <div className="cv-preview-meta">
            {target.kind} · {Math.round(('width' in target ? (target as any).width : 0))}×
            {Math.round(('height' in target ? (target as any).height : 0))}
          </div>
        </div>

        {/* Prompt */}
        <div className="cv-section">
          <label className="cv-label">Describe the UI you want</label>
          <textarea
            ref={inputRef}
            className="cv-textarea"
            placeholder={
              isSketch
                ? 'e.g. "A login form with email, password, and submit button"'
                : 'e.g. "Recreate this design as a card component with..."'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        {/* Design System Picker */}
        <div className="cv-section">
          <label className="cv-label">Design System</label>
          <div className="cv-chips">
            <button
              className={`cv-chip ${selectedLib === null ? 'cv-chip--active' : ''}`}
              onClick={() => setSelectedLib(null)}
            >
              None (raw HTML)
            </button>
            {activeLibs.map((lib) => (
              <button
                key={lib.id}
                className={`cv-chip ${selectedLib === lib.id ? 'cv-chip--active' : ''}`}
                onClick={() => setSelectedLib(lib.id)}
              >
                {lib.name}
              </button>
            ))}
          </div>
        </div>

        {/* Options row */}
        <div className="cv-options">
          <div className="cv-option-group">
            <label className="cv-label">Fidelity</label>
            <div className="cv-toggle-group">
              <button
                className={`cv-toggle-btn ${fidelity === 'wireframe' ? 'cv-toggle-btn--active' : ''}`}
                onClick={() => setFidelity('wireframe')}
              >
                Wireframe
              </button>
              <button
                className={`cv-toggle-btn ${fidelity === 'polished' ? 'cv-toggle-btn--active' : ''}`}
                onClick={() => setFidelity('polished')}
              >
                Polished
              </button>
            </div>
          </div>

          <div className="cv-option-group">
            <label className="cv-label">Output</label>
            <div className="cv-toggle-group">
              {(['react', 'html', 'tailwind'] as const).map((fw) => (
                <button
                  key={fw}
                  className={`cv-toggle-btn ${framework === fw ? 'cv-toggle-btn--active' : ''}`}
                  onClick={() => setFramework(fw)}
                >
                  {fw === 'react' ? 'React' : fw === 'html' ? 'HTML' : 'Tailwind'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cv-footer">
          <button className="cv-btn cv-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="cv-btn cv-btn--primary"
            onClick={handleSubmit}
            disabled={isConverting}
          >
            {isConverting ? 'Converting…' : `Convert ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
};
