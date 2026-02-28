/**
 * Component Tree — structured representation of generated UI.
 *
 * Instead of rendering prompts to flat PNGs, the LLM returns a ComponentTree
 * that can be edited per-node, re-rendered, and exported to code.
 *
 * Node types map to common UI primitives; styles are CSS properties.
 */

// ── Node types ──────────────────────────────────────────

/**
 * Every node in the tree has a type, optional props, optional styles,
 * and optional children. Text content is represented as a string child.
 */
export interface ComponentNode {
  /** Unique ID within this tree (for selection / editing) */
  id: string;
  /** Semantic component type */
  type: ComponentNodeType;
  /** Component-specific props (label, placeholder, src, etc.) */
  props: Record<string, unknown>;
  /** CSS properties applied to this node */
  styles: Record<string, string>;
  /** Child nodes or text content */
  children?: (ComponentNode | string)[];
}

/**
 * Supported component types.
 *
 * Grouped by purpose — the LLM picks from these when building a tree.
 * Keep this list stable; adding types is fine, removing is a breaking change.
 */
export type ComponentNodeType =
  // Layout
  | 'container'
  | 'stack'
  | 'grid'
  | 'spacer'
  | 'divider'
  | 'scroll'
  | 'section'
  // Content
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'icon'
  | 'badge'
  | 'avatar'
  | 'code'
  // Input
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'toggle'
  | 'slider'
  // Navigation
  | 'navbar'
  | 'sidebar'
  | 'tabs'
  | 'breadcrumb'
  | 'link'
  | 'menu'
  // Feedback
  | 'alert'
  | 'toast'
  | 'progress'
  | 'spinner'
  | 'skeleton'
  | 'tooltip'
  | 'dialog'
  // Data
  | 'table'
  | 'card'
  | 'list'
  | 'listItem'
  | 'stat'
  | 'chart';

// ── Tree root ───────────────────────────────────────────

export interface ComponentTree {
  /** The root node (usually a container or section) */
  root: ComponentNode;
  /** Metadata about this generated tree */
  metadata: ComponentTreeMetadata;
}

export interface ComponentTreeMetadata {
  /** Human-readable name for this screen/component */
  name: string;
  /** Brief description of what was generated */
  description: string;
  /** Design system used during generation */
  designSystem?: string;
  /** Intended viewport dimensions */
  viewport: { width: number; height: number };
  /** The prompt that produced this tree */
  prompt: string;
  /** ISO timestamp of generation */
  generatedAt: string;
  /** LLM model used */
  model?: string;
}

// ── JSON Schema for LLM structured output ───────────────

/**
 * JSON Schema definition that instructs the LLM to return a valid
 * ComponentTree. Used with OpenAI's `response_format` or Anthropic's
 * tool-use structured output.
 */
export const COMPONENT_TREE_JSON_SCHEMA = {
  type: 'object',
  required: ['root', 'metadata'],
  properties: {
    root: {
      $ref: '#/$defs/node',
    },
    metadata: {
      type: 'object',
      required: ['name', 'description', 'viewport', 'prompt', 'generatedAt'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        designSystem: { type: 'string' },
        viewport: {
          type: 'object',
          required: ['width', 'height'],
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
        prompt: { type: 'string' },
        generatedAt: { type: 'string' },
        model: { type: 'string' },
      },
    },
  },
  $defs: {
    node: {
      type: 'object',
      required: ['id', 'type', 'props', 'styles'],
      properties: {
        id: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'container', 'stack', 'grid', 'spacer', 'divider', 'scroll', 'section',
            'text', 'heading', 'paragraph', 'image', 'icon', 'badge', 'avatar', 'code',
            'button', 'input', 'textarea', 'select', 'checkbox', 'radio', 'toggle', 'slider',
            'navbar', 'sidebar', 'tabs', 'breadcrumb', 'link', 'menu',
            'alert', 'toast', 'progress', 'spinner', 'skeleton', 'tooltip', 'dialog',
            'table', 'card', 'list', 'listItem', 'stat', 'chart',
          ],
        },
        props: { type: 'object' },
        styles: { type: 'object' },
        children: {
          type: 'array',
          items: {
            oneOf: [
              { type: 'string' },
              { $ref: '#/$defs/node' },
            ],
          },
        },
      },
    },
  },
} as const;

// ── Utilities ───────────────────────────────────────────

/** Generate a unique node ID */
export function makeNodeId(): string {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Deep-clone a ComponentNode tree */
export function cloneNode(node: ComponentNode): ComponentNode {
  return {
    ...node,
    id: makeNodeId(),
    props: { ...node.props },
    styles: { ...node.styles },
    children: node.children?.map((child) =>
      typeof child === 'string' ? child : cloneNode(child),
    ),
  };
}

/** Find a node by ID in a tree (depth-first) */
export function findNode(
  root: ComponentNode,
  id: string,
): ComponentNode | null {
  if (root.id === id) return root;
  if (!root.children) return null;
  for (const child of root.children) {
    if (typeof child === 'string') continue;
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

/** Replace a node by ID, returning a new tree (immutable update) */
export function replaceNode(
  root: ComponentNode,
  id: string,
  replacement: ComponentNode,
): ComponentNode {
  if (root.id === id) return replacement;
  if (!root.children) return root;
  const newChildren = root.children.map((child) => {
    if (typeof child === 'string') return child;
    return replaceNode(child, id, replacement);
  });
  return { ...root, children: newChildren };
}

/** Count all nodes in a tree */
export function countNodes(node: ComponentNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      if (typeof child !== 'string') count += countNodes(child);
    }
  }
  return count;
}

/** Flatten a tree into a list of all nodes */
export function flattenNodes(node: ComponentNode): ComponentNode[] {
  const result: ComponentNode[] = [node];
  if (node.children) {
    for (const child of node.children) {
      if (typeof child !== 'string') {
        result.push(...flattenNodes(child));
      }
    }
  }
  return result;
}
