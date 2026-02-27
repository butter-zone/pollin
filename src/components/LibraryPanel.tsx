import { useState, useMemo } from 'react';
import { ChevronDown, Plus, Eye, EyeOff, Trash2, Loader2, Search, Check, Figma } from 'lucide-react';
import type { DesignLibrary, LibraryComponent } from '@/types/canvas';
import { resolveLibrary, getBuiltInEntries, instantiateBuiltIn } from '@/services/library-registry';
import type { ResolveStatus } from '@/services/library-registry';

interface LibraryPanelProps {
  libraries: DesignLibrary[];
  onAddLibrary: (library: DesignLibrary) => void;
  onRemoveLibrary: (libraryId: string) => void;
  onToggleLibrary: (libraryId: string) => void;
  onClose: () => void;
  onComponentSelect?: (component: LibraryComponent, libraryId: string) => void;
}

/** Source type icon */
function SourceIcon({ source }: { source: DesignLibrary['source'] }) {
  if (source === 'figma') return <Figma size={10} />;
  if (source === 'github') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
  return null;
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
  const [searchFilter, setSearchFilter] = useState('');

  const builtInEntries = useMemo(() => getBuiltInEntries(), []);

  /** Which built-in names are already added */
  const addedBuiltInNames = useMemo(
    () => new Set(libraries.map((l) => l.name.toLowerCase())),
    [libraries],
  );

  /** Custom (user-added) libraries — everything not matching a built-in name */
  const builtInNamesSet = useMemo(
    () => new Set(builtInEntries.map((e) => e.name.toLowerCase())),
    [builtInEntries],
  );
  const customLibraries = useMemo(
    () => libraries.filter((l) => !builtInNamesSet.has(l.name.toLowerCase())),
    [libraries, builtInNamesSet],
  );

  /** Active (added) built-in libraries — for expanding/component grid */
  const activeBuiltIns = useMemo(
    () => libraries.filter((l) => builtInNamesSet.has(l.name.toLowerCase())),
    [libraries, builtInNamesSet],
  );

  const toggleExpand = (libId: string) => {
    const next = new Set(expandedLibs);
    if (next.has(libId)) next.delete(libId);
    else next.add(libId);
    setExpandedLibs(next);
  };

  const handleToggleBuiltIn = (name: string) => {
    const existing = libraries.find((l) => l.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      onRemoveLibrary(existing.id);
    } else {
      const lib = instantiateBuiltIn(name);
      if (lib) onAddLibrary(lib);
    }
  };

  const handleAddCustom = async () => {
    if (!libUrl.trim() || resolveStatus === 'resolving') return;

    const result = await resolveLibrary(libUrl.trim(), (status, message) => {
      setResolveStatus(status);
      setResolveMessage(message || '');
    });

    if (result) {
      const alreadyAdded = libraries.some(
        (l) =>
          l.sourceUrl?.toLowerCase() === result.sourceUrl?.toLowerCase() ||
          l.name.toLowerCase() === result.name.toLowerCase(),
      );
      if (alreadyAdded) {
        setResolveStatus('error');
        setResolveMessage(`${result.name} is already added`);
        return;
      }
      onAddLibrary(result);
      setLibUrl('');
      setExpandedLibs((prev) => new Set([...prev, result.id]));
      setTimeout(() => {
        setResolveStatus(null);
        setResolveMessage('');
      }, 2000);
    }
  };

  /** Filter built-in entries by search */
  const filteredBuiltIns = useMemo(() => {
    if (!searchFilter.trim()) return builtInEntries;
    const q = searchFilter.toLowerCase();
    return builtInEntries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    );
  }, [builtInEntries, searchFilter]);

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
        {/* ═══ Built-in Libraries ═══════════════════ */}
        <div className="dk-folder">
          <div className="dk-folder-header" style={{ justifyContent: 'space-between' }}>
            <span>Built-in Libraries</span>
            <span className="dk-folder-count">{builtInEntries.length}</span>
          </div>

          {/* Search filter */}
          {builtInEntries.length > 3 && (
            <div className="dk-folder-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
              <div className="dk-search-row">
                <Search size={11} className="dk-search-icon" />
                <input
                  type="text"
                  placeholder="Filter libraries…"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="dk-input dk-input--search"
                />
              </div>
            </div>
          )}

          {/* Alphabetical list of built-in entries */}
          <div className="dk-builtin-list">
            {filteredBuiltIns.map((entry) => {
              const isAdded = addedBuiltInNames.has(entry.name.toLowerCase());
              const activeLib = activeBuiltIns.find(
                (l) => l.name.toLowerCase() === entry.name.toLowerCase(),
              );
              const isExpanded = activeLib ? expandedLibs.has(activeLib.id) : false;

              return (
                <div key={entry.name}>
                  <div className={`dk-builtin-row ${isAdded ? 'dk-builtin-row--active' : ''}`}>
                    <button
                      className="dk-builtin-toggle"
                      onClick={() => handleToggleBuiltIn(entry.name)}
                      title={isAdded ? 'Remove library' : 'Add library'}
                    >
                      <div className={`dk-builtin-check ${isAdded ? 'dk-builtin-check--on' : ''}`}>
                        {isAdded && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                    <div
                      className="dk-builtin-info"
                      onClick={() => {
                        if (isAdded && activeLib) toggleExpand(activeLib.id);
                      }}
                      style={{ cursor: isAdded ? 'pointer' : 'default' }}
                    >
                      <div className="dk-builtin-name">
                        <SourceIcon source={entry.source} />
                        {entry.name}
                      </div>
                      <div className="dk-builtin-meta">
                        {entry.componentCount} components
                      </div>
                    </div>
                    {isAdded && activeLib && (
                      <button
                        className="dk-icon-btn"
                        onClick={() => toggleExpand(activeLib.id)}
                        aria-label="Expand"
                      >
                        <ChevronDown
                          size={11}
                          style={{
                            transform: isExpanded ? 'none' : 'rotate(-90deg)',
                            transition: 'transform var(--dur) var(--ease)',
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {/* Component grid for expanded built-in */}
                  {isAdded && isExpanded && activeLib && (
                    <div className="dk-comp-grid">
                      {activeLib.components.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => onComponentSelect?.(comp, activeLib.id)}
                          className="dk-comp-card"
                          title={comp.description}
                        >
                          <div className="dk-comp-name">{comp.name}</div>
                          {comp.category && <div className="dk-comp-cat">{comp.category}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Custom Libraries ═══════════════════ */}
        <div className="dk-folder">
          <div className="dk-folder-header">
            <span>Custom Sources</span>
          </div>
          <div className="dk-folder-body" style={{ paddingTop: 4 }}>
            <div className="dk-row" style={{ gap: 4 }}>
              <input
                type="text"
                placeholder="Paste GitHub, docs, or Figma URL…"
                value={libUrl}
                onChange={(e) => setLibUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                className="dk-input"
                disabled={resolveStatus === 'resolving'}
              />
              <button
                onClick={handleAddCustom}
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
            {resolveStatus && resolveMessage && (
              <div
                className={`dk-resolve-status ${resolveStatus === 'error' ? 'dk-resolve-status--error' : resolveStatus === 'resolved' ? 'dk-resolve-status--success' : ''}`}
              >
                {resolveMessage}
              </div>
            )}
            {!resolveStatus && (
              <div className="dk-supported-hint">
                Supports GitHub repos, docs sites, and Figma files
              </div>
            )}
          </div>

          {/* Custom library list */}
          {customLibraries.map((lib) => (
            <div key={lib.id}>
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
                      transition: 'transform var(--dur) var(--ease)',
                    }}
                  />
                </button>
                <div className="dk-lib-info">
                  <div className="dk-lib-name">
                    <SourceIcon source={lib.source} />
                    {lib.name}
                  </div>
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
                      title={comp.description}
                    >
                      <div className="dk-comp-name">{comp.name}</div>
                      {comp.category && <div className="dk-comp-cat">{comp.category}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="dk-hint">Toggle built-in libraries or add custom sources</div>
    </div>
  );
}
