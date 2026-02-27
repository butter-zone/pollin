import { useState, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Loader2, Check, Figma, Search, X } from 'lucide-react';
import type { DesignLibrary, LibraryComponent } from '@/types/canvas';
import { resolveLibrary, getBuiltInEntries, instantiateBuiltIn } from '@/services/library-registry';
import type { ResolveStatus } from '@/services/library-registry';

interface LibraryPanelProps {
  libraries: DesignLibrary[];
  selectedLibraryId?: string;
  onSelectLibrary: (libraryId: string | undefined) => void;
  onAddLibrary: (library: DesignLibrary) => void;
  onRemoveLibrary: (libraryId: string) => void;
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

/** Component detail tooltip (rendered on hover) */
function ComponentTooltip({ comp, style }: { comp: LibraryComponent; style?: React.CSSProperties }) {
  return (
    <div className="dk-comp-tooltip" style={style}>
      <div className="dk-comp-tooltip-name">{comp.name}</div>
      {comp.category && <div className="dk-comp-tooltip-cat">{comp.category}</div>}
      {comp.description && <div className="dk-comp-tooltip-desc">{comp.description}</div>}
      <div className="dk-comp-tooltip-hint">Click to preview &middot; Drag to canvas</div>
    </div>
  );
}

export function LibraryPanel({
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  onAddLibrary,
  onRemoveLibrary,
  onClose,
  onComponentSelect,
}: LibraryPanelProps) {
  const [expandedLibs, setExpandedLibs] = useState<Set<string>>(new Set());
  const [libUrl, setLibUrl] = useState('');
  const [resolveStatus, setResolveStatus] = useState<ResolveStatus | null>(null);
  const [resolveMessage, setResolveMessage] = useState('');
  const [compFilter, setCompFilter] = useState('');
  const [hoveredComp, setHoveredComp] = useState<{ comp: LibraryComponent; rect: DOMRect } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const builtInEntries = useMemo(() => getBuiltInEntries(), []);

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

  /** Is there already a selected library? */
  const hasSelection = !!selectedLibraryId;

  /** Filter components by search term */
  const filterComponents = useCallback(
    (components: LibraryComponent[]): LibraryComponent[] => {
      if (!compFilter.trim()) return components;
      const q = compFilter.toLowerCase().trim();
      return components.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    },
    [compFilter],
  );

  /** Handle drag start for a component card */
  const handleDragStart = useCallback(
    (e: React.DragEvent, comp: LibraryComponent, libId: string) => {
      e.dataTransfer.setData('application/pollin-component', JSON.stringify({ component: comp, libraryId: libId }));
      e.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  /** Handle component card hover (show tooltip after delay) */
  const handleCompHover = useCallback(
    (comp: LibraryComponent, e: React.MouseEvent) => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setHoveredComp({ comp, rect });
      }, 400);
    },
    [],
  );

  const handleCompLeave = useCallback(() => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setHoveredComp(null);
  }, []);

  const toggleExpand = (libId: string) => {
    const next = new Set(expandedLibs);
    if (next.has(libId)) next.delete(libId);
    else next.add(libId);
    setExpandedLibs(next);
  };

  const handleSelectBuiltIn = (name: string) => {
    const existing = libraries.find((l) => l.name.toLowerCase() === name.toLowerCase());

    if (existing) {
      if (selectedLibraryId === existing.id) {
        // Already selected — deselect & remove
        onSelectLibrary(undefined);
        onRemoveLibrary(existing.id);
      } else if (!hasSelection) {
        // Exists but not selected, and nothing else is selected — select it
        onSelectLibrary(existing.id);
        setExpandedLibs((prev) => new Set([...prev, existing.id]));
      }
      // Otherwise another library is selected — locked out, do nothing
      return;
    }

    // Not yet added — but if another library is already selected, block
    if (hasSelection) return;

    // Add and select
    const lib = instantiateBuiltIn(name);
    if (lib) {
      onAddLibrary(lib);
      onSelectLibrary(lib.id);
      setExpandedLibs((prev) => new Set([...prev, lib.id]));
    }
  };

  const handleSelectCustom = (libId: string) => {
    if (selectedLibraryId === libId) {
      // Deselect
      onSelectLibrary(undefined);
    } else if (!hasSelection) {
      onSelectLibrary(libId);
    }
  };

  const handleRemoveCustom = (libId: string) => {
    if (selectedLibraryId === libId) {
      onSelectLibrary(undefined);
    }
    onRemoveLibrary(libId);
  };

  const handleAddCustom = async () => {
    if (!libUrl.trim() || resolveStatus === 'resolving') return;
    if (hasSelection) return; // can't add while one is active

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
      onSelectLibrary(result.id);
      setLibUrl('');
      setExpandedLibs((prev) => new Set([...prev, result.id]));
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
        {/* ═══ Built-in Libraries ═══════════════════ */}
        <div className="dk-folder">
          <div className="dk-folder-header" style={{ justifyContent: 'space-between' }}>
            <span>Built-in Libraries</span>
            <span className="dk-folder-count">{builtInEntries.length}</span>
          </div>

          {/* Alphabetical list of built-in entries */}
          <div className="dk-builtin-list">
            {builtInEntries.map((entry) => {
              const activeLib = activeBuiltIns.find(
                (l) => l.name.toLowerCase() === entry.name.toLowerCase(),
              );
              const isSelected = activeLib ? selectedLibraryId === activeLib.id : false;
              const isDisabled = hasSelection && !isSelected;
              const isExpanded = activeLib ? expandedLibs.has(activeLib.id) : false;

              return (
                <div key={entry.name}>
                  <div
                    className={`dk-builtin-row ${isSelected ? 'dk-builtin-row--active' : ''} ${isDisabled ? 'dk-builtin-row--disabled' : ''}`}
                  >
                    <button
                      className="dk-builtin-toggle"
                      onClick={() => handleSelectBuiltIn(entry.name)}
                      title={isSelected ? 'Deselect library' : isDisabled ? 'Deselect current library first' : 'Select library'}
                      disabled={isDisabled}
                    >
                      <div className={`dk-builtin-check ${isSelected ? 'dk-builtin-check--on' : ''}`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </button>
                    <div
                      className="dk-builtin-info"
                      onClick={() => {
                        if (isSelected && activeLib) toggleExpand(activeLib.id);
                      }}
                      style={{ cursor: isSelected ? 'pointer' : 'default' }}
                    >
                      <div className="dk-builtin-name">
                        <SourceIcon source={entry.source} />
                        {entry.name}
                      </div>
                      <div className="dk-builtin-meta">
                        {entry.componentCount} components
                      </div>
                    </div>
                    {isSelected && activeLib && (
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
                  {isSelected && isExpanded && activeLib && (() => {
                    const filtered = filterComponents(activeLib.components);
                    return (
                      <>
                        {activeLib.components.length > 8 && (
                          <div className="dk-comp-search">
                            <Search size={11} className="dk-comp-search-icon" />
                            <input
                              type="text"
                              placeholder="Filter components…"
                              value={compFilter}
                              onChange={(e) => setCompFilter(e.target.value)}
                              className="dk-comp-search-input"
                            />
                            {compFilter && (
                              <button className="dk-comp-search-clear" onClick={() => setCompFilter('')}>
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="dk-comp-grid">
                          {filtered.map((comp) => (
                            <button
                              key={comp.id}
                              onClick={() => onComponentSelect?.(comp, activeLib.id)}
                              onMouseEnter={(e) => handleCompHover(comp, e)}
                              onMouseLeave={handleCompLeave}
                              draggable
                              onDragStart={(e) => handleDragStart(e, comp, activeLib.id)}
                              className="dk-comp-card"
                              title={comp.description}
                            >
                              <div className="dk-comp-name">{comp.name}</div>
                              {comp.category && <div className="dk-comp-cat">{comp.category}</div>}
                            </button>
                          ))}
                          {filtered.length === 0 && compFilter && (
                            <div className="dk-comp-empty">No matches for "{compFilter}"</div>
                          )}
                        </div>
                      </>
                    );
                  })()}
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
                disabled={resolveStatus === 'resolving' || hasSelection}
              />
              <button
                onClick={handleAddCustom}
                className="dk-icon-btn"
                title={hasSelection ? 'Deselect current library first' : 'Add library'}
                disabled={resolveStatus === 'resolving' || hasSelection}
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
            {!resolveStatus && !hasSelection && (
              <div className="dk-supported-hint">
                Supports GitHub repos, docs sites, and Figma files
              </div>
            )}
          </div>

          {/* Custom library list */}
          {customLibraries.map((lib) => {
            const isSelected = selectedLibraryId === lib.id;
            const isDisabled = hasSelection && !isSelected;

            return (
              <div key={lib.id} className={isDisabled ? 'dk-builtin-row--disabled' : ''}>
                <div className="dk-lib-row">
                  <button
                    className="dk-builtin-toggle"
                    onClick={() => handleSelectCustom(lib.id)}
                    title={isSelected ? 'Deselect library' : isDisabled ? 'Deselect current library first' : 'Select library'}
                    disabled={isDisabled}
                  >
                    <div className={`dk-builtin-check ${isSelected ? 'dk-builtin-check--on' : ''}`}>
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (isSelected) toggleExpand(lib.id);
                    }}
                    className="dk-icon-btn"
                    aria-label="Expand"
                    disabled={!isSelected}
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
                      onClick={() => handleRemoveCustom(lib.id)}
                      className="dk-icon-btn dk-icon-btn--danger"
                      title="Remove library"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isSelected && expandedLibs.has(lib.id) && (() => {
                  const filtered = filterComponents(lib.components);
                  return (
                    <>
                      {lib.components.length > 8 && (
                        <div className="dk-comp-search">
                          <Search size={11} className="dk-comp-search-icon" />
                          <input
                            type="text"
                            placeholder="Filter components…"
                            value={compFilter}
                            onChange={(e) => setCompFilter(e.target.value)}
                            className="dk-comp-search-input"
                          />
                          {compFilter && (
                            <button className="dk-comp-search-clear" onClick={() => setCompFilter('')}>
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="dk-comp-grid">
                        {filtered.map((comp) => (
                          <button
                            key={comp.id}
                            onClick={() => onComponentSelect?.(comp, lib.id)}
                            onMouseEnter={(e) => handleCompHover(comp, e)}
                            onMouseLeave={handleCompLeave}
                            draggable
                            onDragStart={(e) => handleDragStart(e, comp, lib.id)}
                            className="dk-comp-card"
                            title={comp.description}
                          >
                            <div className="dk-comp-name">{comp.name}</div>
                            {comp.category && <div className="dk-comp-cat">{comp.category}</div>}
                          </button>
                        ))}
                        {filtered.length === 0 && compFilter && (
                          <div className="dk-comp-empty">No matches for "{compFilter}"</div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      <div className="dk-hint">Select a library, then click components to preview on canvas</div>

      {/* Component detail tooltip */}
      {hoveredComp && (
        <ComponentTooltip
          comp={hoveredComp.comp}
          style={{
            position: 'fixed',
            left: hoveredComp.rect.left - 8,
            top: hoveredComp.rect.bottom + 6,
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
}
