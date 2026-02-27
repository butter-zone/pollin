import { useState } from 'react';
import { ChevronDown, Plus, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import type { DesignLibrary, LibraryComponent } from '@/types/canvas';
import { resolveLibrary, getSupportedLibraries } from '@/services/library-registry';
import type { ResolveStatus } from '@/services/library-registry';

interface LibraryPanelProps {
  libraries: DesignLibrary[];
  onAddLibrary: (library: DesignLibrary) => void;
  onRemoveLibrary: (libraryId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
  onClose: () => void;
  onComponentSelect?: (component: LibraryComponent, libraryId: string) => void;
}

export function LibraryPanel({
  libraries,
  onAddLibrary,
  onRemoveLibrary,
  onToggleLibrary,
  onClose,
  onComponentSelect,
}: LibraryPanelProps) {
  const [expandedLibs, setExpandedLibs] = useState<Set<string>>(new Set());
  const [libUrl, setLibUrl] = useState('');
  const [resolveStatus, setResolveStatus] = useState<ResolveStatus | null>(null);
  const [resolveMessage, setResolveMessage] = useState('');

  const toggleExpand = (libId: string) => {
    const next = new Set(expandedLibs);
    if (next.has(libId)) next.delete(libId);
    else next.add(libId);
    setExpandedLibs(next);
  };

  const handleAddLibrary = async () => {
    if (!libUrl.trim() || resolveStatus === 'resolving') return;

    const result = await resolveLibrary(libUrl.trim(), (status, message) => {
      setResolveStatus(status);
      setResolveMessage(message || '');
    });

    if (result) {
      // Check for duplicates by sourceUrl
      const alreadyAdded = libraries.some(
        (l) => l.sourceUrl?.toLowerCase() === result.sourceUrl?.toLowerCase()
          || l.name.toLowerCase() === result.name.toLowerCase(),
      );
      if (alreadyAdded) {
        setResolveStatus('error');
        setResolveMessage(`${result.name} is already added`);
        return;
      }
      onAddLibrary(result);
      setLibUrl('');
      // Auto-expand the newly added library
      setExpandedLibs((prev) => new Set([...prev, result.id]));
      // Clear status after a brief delay
      setTimeout(() => {
        setResolveStatus(null);
        setResolveMessage('');
      }, 2000);
    }
  };

  return (
    <div className="dk-panel dk-library-panel">
      <div className="dk-panel-header">
        <span className="dk-panel-title">Design Systems</span>
        <button className="dk-icon-btn dk-icon-btn--sm" onClick={onClose} title="Close panel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="dk-panel-body">
        {/* ── Add library ──────────────────────── */}
        <div className="dk-folder">
          <div className="dk-folder-body" style={{ paddingTop: 8 }}>
            <div className="dk-row" style={{ gap: 4 }}>
              <input
                type="text"
                placeholder="Paste URL…"
                value={libUrl}
                onChange={(e) => setLibUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLibrary()}
                className="dk-input"
                disabled={resolveStatus === 'resolving'}
              />
              <button
                onClick={handleAddLibrary}
                className="dk-icon-btn"
                title="Add library"
                disabled={resolveStatus === 'resolving'}
              >
                {resolveStatus === 'resolving' ? (
                  <Loader2 size={14} className="dk-spin" />
                ) : (
                  <Plus size={14} />
                )}
              </button>
            </div>
            {/* Resolve status message */}
            {resolveStatus && resolveMessage && (
              <div
                className={`dk-resolve-status ${resolveStatus === 'error' ? 'dk-resolve-status--error' : resolveStatus === 'resolved' ? 'dk-resolve-status--success' : ''}`}
              >
                {resolveMessage}
              </div>
            )}
            {/* Supported libraries hint */}
            {!resolveStatus && libraries.length === 0 && (
              <div className="dk-supported-hint">
                Instant support for {getSupportedLibraries().join(', ')}. Any GitHub or docs URL also works.
              </div>
            )}
          </div>
        </div>

        {/* ── Library list ─────────────────────── */}
        {libraries.length === 0 ? (
          <div className="dk-empty">No design systems added yet</div>
        ) : (
          libraries.map((lib) => (
            <div key={lib.id} className="dk-folder">
              <div className="dk-lib-row">
                <button
                  onClick={() => toggleExpand(lib.id)}
                  className="dk-icon-btn"
                  aria-label="Expand"
                >
                  <ChevronDown
                    size={12}
                    style={{
                      transform: expandedLibs.has(lib.id) ? 'none' : 'rotate(-90deg)',
                      transition: `transform var(--dur) var(--ease)`,
                    }}
                  />
                </button>
                <div className="dk-lib-info">
                  <div className="dk-lib-name">{lib.name}</div>
                  <div className="dk-lib-meta">{lib.components.length} components</div>
                </div>
                <div className="dk-lib-actions">
                  <button
                    onClick={() => onToggleLibrary(lib.id)}
                    className="dk-icon-btn"
                    title={lib.active ? 'Hide library' : 'Show library'}
                  >
                    {lib.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    onClick={() => onRemoveLibrary(lib.id)}
                    className="dk-icon-btn dk-icon-btn--danger"
                    title="Remove library"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {expandedLibs.has(lib.id) && (
                <div className="dk-comp-grid">
                  {lib.components.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => onComponentSelect?.(comp, lib.id)}
                      className="dk-comp-card"
                    >
                      <div className="dk-comp-name">{comp.name}</div>
                      {comp.category && <div className="dk-comp-cat">{comp.category}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="dk-hint">Drag components onto canvas or use conversion tools</div>
    </div>
  );
}
