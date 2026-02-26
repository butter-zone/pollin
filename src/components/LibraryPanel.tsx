import { useState } from 'react';
import { ChevronDown, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { DesignLibrary, LibraryComponent } from '@/types/canvas';

interface LibraryPanelProps {
  libraries: DesignLibrary[];
  onAddLibrary: (library: DesignLibrary) => void;
  onRemoveLibrary: (libraryId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
  onComponentSelect?: (component: LibraryComponent, libraryId: string) => void;
}

export function LibraryPanel({
  libraries,
  onAddLibrary,
  onRemoveLibrary,
  onToggleLibrary,
  onComponentSelect,
}: LibraryPanelProps) {
  const [expandedLibs, setExpandedLibs] = useState<Set<string>>(new Set());
  const [libUrl, setLibUrl] = useState('');
  const [sourceType, setSourceType] = useState<'github' | 'npm' | 'figma' | 'other'>('github');

  const toggleExpand = (libId: string) => {
    const next = new Set(expandedLibs);
    if (next.has(libId)) next.delete(libId);
    else next.add(libId);
    setExpandedLibs(next);
  };

  const handleAddLibrary = () => {
    if (!libUrl.trim()) return;

    const newLib: DesignLibrary = {
      id: `lib-${Date.now()}`,
      name: libUrl.split('/').pop() || 'Library',
      description: `Added from ${sourceType}`,
      source: sourceType,
      sourceUrl: libUrl,
      components: [
        {
          id: 'btn-primary',
          name: 'Button Primary',
          category: 'Buttons',
          description: 'Primary action button',
          props: { variant: 'primary', size: 'md' },
        },
        {
          id: 'btn-secondary',
          name: 'Button Secondary',
          category: 'Buttons',
          description: 'Secondary action button',
          props: { variant: 'secondary', size: 'md' },
        },
        {
          id: 'input-text',
          name: 'Text Input',
          category: 'Forms',
          description: 'Single-line text field',
          props: { type: 'text', size: 'md' },
        },
      ],
      active: true,
    };

    onAddLibrary(newLib);
    setLibUrl('');
  };

  return (
    <div className="dk-panel dk-library-panel">
      <div className="dk-panel-header">
        <span className="dk-panel-title">Design Systems</span>
      </div>

      <div className="dk-panel-body">
        {/* ── Add library ──────────────────────── */}
        <div className="dk-folder">
          <div className="dk-folder-body" style={{ paddingTop: 8 }}>
            <div className="dk-row">
              <label className="dk-label">Source</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as typeof sourceType)}
                className="dk-select"
              >
                <option value="github">GitHub</option>
                <option value="npm">NPM</option>
                <option value="figma">Figma</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="dk-row" style={{ gap: 4 }}>
              <input
                type="text"
                placeholder="Paste URL or name…"
                value={libUrl}
                onChange={(e) => setLibUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLibrary()}
                className="dk-input"
              />
              <button onClick={handleAddLibrary} className="dk-icon-btn" title="Add library">
                <Plus size={14} />
              </button>
            </div>
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
