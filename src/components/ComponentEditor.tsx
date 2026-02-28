import { useState, useCallback, useMemo, type FC } from 'react';
import type { ComponentNode, ComponentNodeType, ComponentTree } from '@/types/component-tree';
import type { ComponentObject } from '@/types/canvas';
import { findNode, replaceNode, makeNodeId } from '@/types/component-tree';

// ── Constants ───────────────────────────────────────────

const NODE_TYPES: ComponentNodeType[] = [
  'container', 'stack', 'grid', 'spacer', 'divider', 'scroll', 'section',
  'text', 'heading', 'paragraph', 'image', 'icon', 'badge', 'avatar', 'code',
  'button', 'input', 'textarea', 'select', 'checkbox', 'radio', 'toggle', 'slider',
  'navbar', 'sidebar', 'tabs', 'breadcrumb', 'link', 'menu',
  'alert', 'toast', 'progress', 'spinner', 'skeleton', 'tooltip', 'dialog',
  'table', 'card', 'list', 'listItem', 'stat', 'chart',
];

const COMMON_CSS_PROPS = [
  'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap',
  'padding', 'margin', 'width', 'height', 'maxWidth', 'minHeight',
  'backgroundColor', 'color', 'fontSize', 'fontWeight', 'lineHeight',
  'border', 'borderRadius', 'boxShadow', 'overflow', 'opacity',
];

// ── Props ───────────────────────────────────────────────

interface ComponentEditorProps {
  /** The selected component object from the canvas */
  component: ComponentObject;
  /** Called when the tree is modified — parent should update the object + re-render */
  onUpdateTree: (newTree: ComponentTree) => void;
  /** Close the editor */
  onClose: () => void;
}

// ── Helpers ─────────────────────────────────────────────

function getTextPreview(node: ComponentNode): string {
  if (!node.children) return '';
  const textChild = node.children.find((c) => typeof c === 'string');
  if (typeof textChild === 'string') {
    return textChild.length > 30 ? textChild.slice(0, 30) + '…' : textChild;
  }
  return '';
}

function getTextContent(node: ComponentNode): string {
  if (!node.children) return '';
  return node.children
    .filter((c): c is string => typeof c === 'string')
    .join('\n');
}

function removeNodeById(root: ComponentNode, id: string): ComponentNode {
  if (!root.children) return root;
  const filtered = root.children
    .map((child) => {
      if (typeof child === 'string') return child;
      if (child.id === id) return null;
      return removeNodeById(child, id);
    })
    .filter((c): c is ComponentNode | string => c !== null);
  return { ...root, children: filtered };
}

// ── Tree Item ───────────────────────────────────────────

interface TreeItemProps {
  node: ComponentNode;
  depth: number;
  selectedId: string | null;
  collapsedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

const TreeItem: FC<TreeItemProps> = ({
  node,
  depth,
  selectedId,
  collapsedIds,
  onSelect,
  onToggleCollapse,
}) => {
  const hasNodeChildren = node.children?.some((c) => typeof c !== 'string') ?? false;
  const isCollapsed = collapsedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const preview = getTextPreview(node);
  const depthClass = `ce-tree-item--depth-${Math.min(depth, 5)}`;

  return (
    <>
      <div
        className={`ce-tree-item ${depthClass}${isSelected ? ' ce-tree-item--selected' : ''}`}
        onClick={() => onSelect(node.id)}
      >
        {hasNodeChildren ? (
          <button
            className="ce-tree-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(node.id);
            }}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
        ) : (
          <span className="ce-tree-toggle ce-tree-toggle--leaf">·</span>
        )}
        <span className="ce-tree-type">{node.type}</span>
        {preview && <span className="ce-tree-preview">{preview}</span>}
      </div>
      {!isCollapsed &&
        node.children
          ?.filter((c): c is ComponentNode => typeof c !== 'string')
          .map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              collapsedIds={collapsedIds}
              onSelect={onSelect}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
    </>
  );
};

// ── Key-Value Editor ────────────────────────────────────

interface KVEditorProps {
  entries: Record<string, string>;
  onChange: (entries: Record<string, string>) => void;
  label: string;
  valuePlaceholder?: string;
  suggestions?: string[];
}

const KVEditor: FC<KVEditorProps> = ({ entries, onChange, label, valuePlaceholder, suggestions }) => {
  const [newKey, setNewKey] = useState('');

  const handleKeyChange = useCallback(
    (oldKey: string, newKeyName: string) => {
      const updated = { ...entries };
      const val = updated[oldKey];
      delete updated[oldKey];
      updated[newKeyName] = val;
      onChange(updated);
    },
    [entries, onChange],
  );

  const handleValueChange = useCallback(
    (key: string, value: string) => {
      onChange({ ...entries, [key]: value });
    },
    [entries, onChange],
  );

  const handleRemove = useCallback(
    (key: string) => {
      const updated = { ...entries };
      delete updated[key];
      onChange(updated);
    },
    [entries, onChange],
  );

  const handleAdd = useCallback(() => {
    const key = newKey.trim();
    if (!key || key in entries) return;
    onChange({ ...entries, [key]: '' });
    setNewKey('');
  }, [newKey, entries, onChange]);

  const unusedSuggestions = useMemo(
    () => suggestions?.filter((s) => !(s in entries)) ?? [],
    [suggestions, entries],
  );

  return (
    <div className="ce-kv-editor">
      <div className="ce-section-title">{label}</div>
      {Object.entries(entries).map(([key, value]) => (
        <div className="ce-kv-row" key={key}>
          <input
            className="ce-kv-key ce-input"
            value={key}
            onChange={(e) => handleKeyChange(key, e.target.value)}
          />
          <input
            className="ce-kv-value ce-input"
            value={value}
            placeholder={valuePlaceholder}
            onChange={(e) => handleValueChange(key, e.target.value)}
          />
          <button className="ce-btn ce-btn--small ce-btn--danger" onClick={() => handleRemove(key)}>
            ×
          </button>
        </div>
      ))}
      <div className="ce-kv-row ce-kv-row--add">
        {unusedSuggestions.length > 0 ? (
          <select
            className="ce-select ce-kv-key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          >
            <option value="">Add property…</option>
            {unusedSuggestions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <input
            className="ce-input ce-kv-key"
            value={newKey}
            placeholder="New key"
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        )}
        <button className="ce-btn ce-btn--small" onClick={handleAdd}>
          +
        </button>
      </div>
    </div>
  );
};

// ── Props Editor (Record<string, unknown>) ──────────────

interface PropsEditorProps {
  props: Record<string, unknown>;
  onChange: (props: Record<string, unknown>) => void;
}

const PropsEditor: FC<PropsEditorProps> = ({ props, onChange }) => {
  const [newKey, setNewKey] = useState('');

  const handleValueChange = useCallback(
    (key: string, raw: string) => {
      let value: unknown = raw;
      if (raw === 'true') value = true;
      else if (raw === 'false') value = false;
      else if (raw !== '' && !isNaN(Number(raw))) value = Number(raw);
      onChange({ ...props, [key]: value });
    },
    [props, onChange],
  );

  const handleRemove = useCallback(
    (key: string) => {
      const updated = { ...props };
      delete updated[key];
      onChange(updated);
    },
    [props, onChange],
  );

  const handleAdd = useCallback(() => {
    const key = newKey.trim();
    if (!key || key in props) return;
    onChange({ ...props, [key]: '' });
    setNewKey('');
  }, [newKey, props, onChange]);

  return (
    <div className="ce-kv-editor">
      <div className="ce-section-title">Props</div>
      {Object.entries(props).map(([key, value]) => (
        <div className="ce-kv-row" key={key}>
          <input className="ce-kv-key ce-input" value={key} readOnly />
          <input
            className="ce-kv-value ce-input"
            value={String(value ?? '')}
            onChange={(e) => handleValueChange(key, e.target.value)}
          />
          <button className="ce-btn ce-btn--small ce-btn--danger" onClick={() => handleRemove(key)}>
            ×
          </button>
        </div>
      ))}
      <div className="ce-kv-row ce-kv-row--add">
        <input
          className="ce-input ce-kv-key"
          value={newKey}
          placeholder="New prop"
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="ce-btn ce-btn--small" onClick={handleAdd}>
          +
        </button>
      </div>
    </div>
  );
};

// ── Node Editor ─────────────────────────────────────────

interface NodeEditorProps {
  node: ComponentNode;
  isRoot: boolean;
  onUpdateNode: (updated: ComponentNode) => void;
  onDeleteNode: () => void;
}

const NodeEditor: FC<NodeEditorProps> = ({ node, isRoot, onUpdateNode, onDeleteNode }) => {
  const handleTypeChange = useCallback(
    (type: ComponentNodeType) => {
      onUpdateNode({ ...node, type });
    },
    [node, onUpdateNode],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      const nonStringChildren = node.children?.filter((c) => typeof c !== 'string') ?? [];
      const newChildren: (ComponentNode | string)[] =
        text.length > 0 ? [text, ...nonStringChildren] : nonStringChildren;
      onUpdateNode({ ...node, children: newChildren.length > 0 ? newChildren : undefined });
    },
    [node, onUpdateNode],
  );

  const handleStylesChange = useCallback(
    (styles: Record<string, string>) => {
      onUpdateNode({ ...node, styles });
    },
    [node, onUpdateNode],
  );

  const handlePropsChange = useCallback(
    (props: Record<string, unknown>) => {
      onUpdateNode({ ...node, props });
    },
    [node, onUpdateNode],
  );

  const handleAddChild = useCallback(() => {
    const child: ComponentNode = {
      id: makeNodeId(),
      type: 'container',
      props: {},
      styles: {},
    };
    const children = [...(node.children ?? []), child];
    onUpdateNode({ ...node, children });
  }, [node, onUpdateNode]);

  const textContent = getTextContent(node);

  return (
    <div className="ce-node-editor">
      <div className="ce-section">
        <div className="ce-section-title">Node · {node.id}</div>

        <div className="ce-row">
          <label className="ce-label">Type</label>
          <select
            className="ce-select"
            value={node.type}
            onChange={(e) => handleTypeChange(e.target.value as ComponentNodeType)}
          >
            {NODE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ce-section">
        <div className="ce-row">
          <label className="ce-label">Text content</label>
          <textarea
            className="ce-textarea"
            value={textContent}
            placeholder="Enter text content…"
            rows={3}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>
      </div>

      <div className="ce-section">
        <PropsEditor props={node.props} onChange={handlePropsChange} />
      </div>

      <div className="ce-section">
        <KVEditor
          entries={node.styles}
          onChange={handleStylesChange}
          label="Styles"
          valuePlaceholder="value"
          suggestions={COMMON_CSS_PROPS}
        />
      </div>

      <div className="ce-section ce-section--actions">
        <button className="ce-btn" onClick={handleAddChild}>
          + Add child
        </button>
        {!isRoot && (
          <button className="ce-btn ce-btn--danger" onClick={onDeleteNode}>
            Delete node
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────

export const ComponentEditor: FC<ComponentEditorProps> = ({
  component,
  onUpdateTree,
  onClose,
}) => {
  const { tree } = component;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // ── Derive selected node ─────────────────────────────
  const selectedNode = useMemo(
    () => (selectedNodeId ? findNode(tree.root, selectedNodeId) : null),
    [tree.root, selectedNodeId],
  );

  // ── Tree navigator handlers ──────────────────────────
  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
  }, []);

  const handleToggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Node editor handlers ─────────────────────────────
  const handleUpdateNode = useCallback(
    (updated: ComponentNode) => {
      if (!selectedNodeId) return;
      const newRoot = replaceNode(tree.root, selectedNodeId, updated);
      onUpdateTree({ ...tree, root: newRoot });
    },
    [tree, selectedNodeId, onUpdateTree],
  );

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId || selectedNodeId === tree.root.id) return;
    const newRoot = removeNodeById(tree.root, selectedNodeId);
    onUpdateTree({ ...tree, root: newRoot });
    setSelectedNodeId(null);
  }, [tree, selectedNodeId, onUpdateTree]);

  // ── Metadata handlers ────────────────────────────────
  const handleNameChange = useCallback(
    (name: string) => {
      onUpdateTree({
        ...tree,
        metadata: { ...tree.metadata, name },
      });
    },
    [tree, onUpdateTree],
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      onUpdateTree({
        ...tree,
        metadata: { ...tree.metadata, description },
      });
    },
    [tree, onUpdateTree],
  );

  return (
    <div className="ce-panel">
      <div className="ce-header">
        <span className="ce-header-title">Component Editor</span>
        <button className="ce-header-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="ce-body">
        {/* ── Metadata ──────────────────────────────── */}
        <div className="ce-section">
          <div className="ce-section-title">Metadata</div>
          <div className="ce-row">
            <label className="ce-label">Name</label>
            <input
              className="ce-input"
              value={tree.metadata.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="ce-row">
            <label className="ce-label">Description</label>
            <textarea
              className="ce-textarea"
              value={tree.metadata.description}
              rows={2}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>
        </div>

        {/* ── Tree navigator ────────────────────────── */}
        <div className="ce-section">
          <div className="ce-section-title">Tree</div>
          <div className="ce-tree">
            <TreeItem
              node={tree.root}
              depth={0}
              selectedId={selectedNodeId}
              collapsedIds={collapsedIds}
              onSelect={handleSelectNode}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        </div>

        {/* ── Node editor ───────────────────────────── */}
        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            isRoot={selectedNode.id === tree.root.id}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>
    </div>
  );
};
