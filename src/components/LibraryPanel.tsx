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

  const toggleLibrary = (libId: string) => {
    const newExpanded = new Set(expandedLibs);
    if (newExpanded.has(libId)) {
      newExpanded.delete(libId);
    } else {
      newExpanded.add(libId);
    }
    setExpandedLibs(newExpanded);
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
        // Placeholder components for demo
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
        <h3 className="dk-panel-title">Design Systems</h3>
      </div>

      {/* Add Library Input */}
      <div className="dk-row gap-2 p-3 border-b border-[--c-border]">
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value as 'github' | 'npm' | 'figma' | 'other')}
          className="flex-1 px-2 py-1 text-xs rounded border border-[--c-border] bg-[--c-surface-2] text-[--c-text]"
        >
          <option value="github">GitHub</option>
          <option value="npm">NPM</option>
          <option value="figma">Figma</option>
          <option value="other">Other URL</option>
        </select>
        <input
          type="text"
          placeholder="Paste URL or name..."
          value={libUrl}
          onChange={(e) => setLibUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddLibrary()}
          className="flex-1 px-2 py-1 text-xs rounded border border-[--c-border] bg-[--c-surface-2] text-[--c-text]"
        />
        <button
          onClick={handleAddLibrary}
          className="dk-action dk-action-sm"
          title="Add library"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Libraries List */}
      <div className="divide-y divide-[--c-border] max-h-80 overflow-y-auto">
        {libraries.length === 0 ? (
          <div className="p-3 text-xs text-[--c-text-muted] text-center">
            No design systems added yet
          </div>
        ) : (
          libraries.map((lib) => (
            <div key={lib.id} className="border-b border-[--c-border] last:border-0">
              {/* Library Header */}
              <div className="flex items-center gap-2 p-2 hover:bg-[--c-surface-3]">
                <button
                  onClick={() => toggleLibrary(lib.id)}
                  className="flex-shrink-0 p-1 hover:bg-[--c-surface-3] rounded"
                >
                  <ChevronDown
                    size={14}
                    className={`transition ${expandedLibs.has(lib.id) ? '' : '-rotate-90'}`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[--c-text] truncate">{lib.name}</p>
                  <p className="text-xs text-[--c-text-muted] truncate">{lib.components.length} components</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onToggleLibrary(lib.id)}
                    className="p-1 hover:bg-[--c-surface-3] rounded text-[--c-text-muted]"
                    title={lib.active ? 'Hide library' : 'Show library'}
                  >
                    {lib.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => onRemoveLibrary(lib.id)}
                    className="p-1 hover:bg-[--c-danger]/10 rounded text-[--c-danger]"
                    title="Remove library"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Components Grid */}
              {expandedLibs.has(lib.id) && (
                <div className="px-2 pb-2 pt-1 bg-[--c-surface-2]/50 grid grid-cols-2 gap-2">
                  {lib.components.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => onComponentSelect?.(comp, lib.id)}
                      className="p-2 text-left rounded border border-[--c-border] hover:bg-[--c-surface-3] transition text-xs"
                    >
                      <p className="font-medium text-[--c-text] truncate">{comp.name}</p>
                      {comp.category && (
                        <p className="text-[--c-text-muted] text-xs">{comp.category}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="text-xs text-[--c-text-muted] p-2 border-t border-[--c-border]">
        💡 Drag components onto canvas or use conversion tools
      </div>
    </div>
  );
}
