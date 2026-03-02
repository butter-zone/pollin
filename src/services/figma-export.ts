/**
 * Figma Export — converts a ComponentTree to Figma-compatible JSON.
 *
 * The output follows a subset of the Figma Plugin API node structure.
 * Users can import this JSON via a Figma plugin or use it as a handoff
 * artifact documenting the design structure.
 *
 * @see https://www.figma.com/plugin-docs/api/nodes/
 */

import type { ComponentTree, ComponentNode, ComponentNodeType } from '@/types/component-tree';

// ── Figma node types ────────────────────────────────────

interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FigmaPaint {
  type: 'SOLID';
  color: FigmaColor;
  opacity?: number;
}

interface FigmaNode {
  id: string;
  name: string;
  type: 'FRAME' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE' | 'COMPONENT' | 'INSTANCE' | 'GROUP';
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  cornerRadius?: number;
  opacity?: number;
  visible?: boolean;
  children?: FigmaNode[];
  // Frame-specific
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  // Text-specific
  characters?: string;
  fontSize?: number;
  fontName?: { family: string; style: string };
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT';
  textAutoResize?: 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'NONE';
}

interface FigmaDocument {
  name: string;
  description: string;
  designSystem?: string;
  viewport: { width: number; height: number };
  generatedAt: string;
  exportedAt: string;
  rootNode: FigmaNode;
}

// ── Color parsing ───────────────────────────────────────

function parseColor(cssColor: string | undefined): FigmaColor {
  if (!cssColor) return { r: 0, g: 0, b: 0, a: 1 };

  // Named colors shortcut
  const named: Record<string, FigmaColor> = {
    transparent: { r: 0, g: 0, b: 0, a: 0 },
    white: { r: 1, g: 1, b: 1, a: 1 },
    black: { r: 0, g: 0, b: 0, a: 1 },
    red: { r: 1, g: 0, b: 0, a: 1 },
    blue: { r: 0, g: 0, b: 1, a: 1 },
    green: { r: 0, g: 0.502, b: 0, a: 1 },
    gray: { r: 0.502, g: 0.502, b: 0.502, a: 1 },
    grey: { r: 0.502, g: 0.502, b: 0.502, a: 1 },
  };
  const lower = cssColor.trim().toLowerCase();
  if (named[lower]) return named[lower];

  // hex
  const hexMatch = lower.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length === 4) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  // rgb/rgba
  const rgbMatch = lower.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]) / 255,
      g: parseInt(rgbMatch[2]) / 255,
      b: parseInt(rgbMatch[3]) / 255,
      a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  // oklch — approximate conversion (simplified)
  const oklchMatch = lower.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/);
  if (oklchMatch) {
    // Very rough oklch → sRGB approximation for export purposes
    const L = parseFloat(oklchMatch[1]);
    const a = oklchMatch[4] !== undefined ? parseFloat(oklchMatch[4]) : 1;
    // Simplified: treat L as grayscale approximation
    return { r: L, g: L, b: L, a };
  }

  return { r: 0.5, g: 0.5, b: 0.5, a: 1 };
}

function makeFill(cssColor: string | undefined): FigmaPaint[] {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'none') return [];
  const color = parseColor(cssColor);
  if (color.a === 0) return [];
  return [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b, a: 1 }, opacity: color.a }];
}

// ── Size parsing ────────────────────────────────────────

function parsePx(val: string | undefined, fallback: number = 0): number {
  if (!val) return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

// ── Node ID generator ───────────────────────────────────

let _nodeCounter = 0;
function figmaId(): string {
  return `${++_nodeCounter}:${Math.random().toString(36).slice(2, 6)}`;
}

// ── Node type → Figma type mapping ──────────────────────

const TEXT_TYPES = new Set<ComponentNodeType>([
  'text', 'heading', 'paragraph', 'code', 'badge', 'link', 'breadcrumb',
]);

const INPUT_TYPES = new Set<ComponentNodeType>([
  'input', 'textarea', 'select', 'checkbox', 'radio', 'toggle', 'slider',
]);

const CONTAINER_TYPES = new Set<ComponentNodeType>([
  'container', 'stack', 'grid', 'scroll', 'section',
  'navbar', 'sidebar', 'tabs', 'card', 'list', 'listItem',
  'table', 'dialog', 'alert', 'toast', 'menu', 'stat',
]);

// ── Conversion ──────────────────────────────────────────

function convertNode(node: ComponentNode, parentWidth: number, _parentHeight: number): FigmaNode {
  const s = node.styles;

  // Determine Figma node type
  let figmaType: FigmaNode['type'] = 'FRAME';
  if (TEXT_TYPES.has(node.type)) figmaType = 'TEXT';
  if (node.type === 'image' || node.type === 'avatar') figmaType = 'RECTANGLE';
  if (node.type === 'divider') figmaType = 'RECTANGLE';
  if (node.type === 'spacer') figmaType = 'RECTANGLE';
  if (node.type === 'spinner' || node.type === 'progress') figmaType = 'RECTANGLE';

  const width = parsePx(s.width, figmaType === 'TEXT' ? parentWidth : parentWidth);
  const height = parsePx(s.height, figmaType === 'TEXT' ? 24 : 40);

  const base: FigmaNode = {
    id: figmaId(),
    name: node.props.label as string || node.props.placeholder as string || node.type,
    type: figmaType,
    x: 0,
    y: 0,
    width,
    height,
  };

  // Fills & strokes
  const bgColor = s.background || s.backgroundColor;
  if (bgColor) base.fills = makeFill(bgColor);

  const borderColor = s.borderColor || s.border?.split(' ').pop();
  if (borderColor) {
    base.strokes = makeFill(borderColor);
    base.strokeWeight = parsePx(s.borderWidth, 1);
  }

  // Corner radius
  if (s.borderRadius) {
    base.cornerRadius = parsePx(s.borderRadius);
  }

  // Opacity
  if (s.opacity) {
    base.opacity = parseFloat(s.opacity);
  }

  // Layout direction
  if (CONTAINER_TYPES.has(node.type) || INPUT_TYPES.has(node.type)) {
    const flexDir = s.flexDirection;
    base.layoutMode = flexDir === 'row' ? 'HORIZONTAL' : 'VERTICAL';
    base.primaryAxisSizingMode = 'AUTO';
    base.counterAxisSizingMode = 'FIXED';

    if (s.gap) base.itemSpacing = parsePx(s.gap);

    // Padding
    if (s.padding) {
      const p = parsePx(s.padding);
      base.paddingLeft = p;
      base.paddingRight = p;
      base.paddingTop = p;
      base.paddingBottom = p;
    }
    if (s.paddingLeft) base.paddingLeft = parsePx(s.paddingLeft);
    if (s.paddingRight) base.paddingRight = parsePx(s.paddingRight);
    if (s.paddingTop) base.paddingTop = parsePx(s.paddingTop);
    if (s.paddingBottom) base.paddingBottom = parsePx(s.paddingBottom);
  }

  // Text nodes
  if (figmaType === 'TEXT') {
    // Collect text from children
    const textContent = collectText(node);
    base.characters = textContent || node.props.label as string || '';
    base.fontSize = parsePx(s.fontSize, node.type === 'heading' ? 24 : 14);
    base.fontName = {
      family: (s.fontFamily || 'Inter').split(',')[0].replace(/['"]/g, '').trim(),
      style: s.fontWeight === '700' || s.fontWeight === 'bold' ? 'Bold'
        : s.fontWeight === '500' || s.fontWeight === 'medium' ? 'Medium'
        : 'Regular',
    };
    base.textAlignHorizontal = (s.textAlign === 'center' ? 'CENTER'
      : s.textAlign === 'right' ? 'RIGHT' : 'LEFT') as FigmaNode['textAlignHorizontal'];
    base.textAutoResize = 'WIDTH_AND_HEIGHT';

    // Text color → fills
    if (s.color) base.fills = makeFill(s.color);

    return base;
  }

  // Convert children recursively
  if (node.children && node.children.length > 0) {
    base.children = [];
    for (const child of node.children) {
      if (typeof child === 'string') {
        // Inline text → create a Text node
        if (child.trim()) {
          base.children.push({
            id: figmaId(),
            name: 'Text',
            type: 'TEXT',
            x: 0,
            y: 0,
            width: width,
            height: 20,
            characters: child,
            fontSize: parsePx(s.fontSize, 14),
            fontName: { family: 'Inter', style: 'Regular' },
            textAutoResize: 'WIDTH_AND_HEIGHT',
            fills: makeFill(s.color || '#111827'),
          });
        }
      } else {
        base.children.push(convertNode(child, width, height));
      }
    }
  }

  // Special: input/button placeholders
  if (INPUT_TYPES.has(node.type) && !base.children?.length) {
    const label = node.props.placeholder as string || node.props.label as string || node.type;
    base.children = [{
      id: figmaId(),
      name: 'Label',
      type: 'TEXT',
      x: 8,
      y: 8,
      width: width - 16,
      height: 20,
      characters: label,
      fontSize: 14,
      fontName: { family: 'Inter', style: 'Regular' },
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: makeFill(s.color || '#6b7280'),
    }];
  }

  if (node.type === 'button' && !base.children?.length) {
    const label = node.props.label as string || 'Button';
    base.fills = makeFill(bgColor || '#3b82f6');
    base.cornerRadius = parsePx(s.borderRadius, 6);
    base.children = [{
      id: figmaId(),
      name: 'Label',
      type: 'TEXT',
      x: 16,
      y: 8,
      width: width - 32,
      height: 20,
      characters: label,
      fontSize: 14,
      fontName: { family: 'Inter', style: 'Medium' },
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: makeFill(s.color || '#ffffff'),
    }];
  }

  return base;
}

/** Recursively collect text content from children. */
function collectText(node: ComponentNode): string {
  if (!node.children) return '';
  return node.children
    .map((c) => (typeof c === 'string' ? c : collectText(c)))
    .join(' ')
    .trim();
}

// ── Public API ──────────────────────────────────────────

/**
 * Convert a ComponentTree to a Figma-compatible JSON document.
 *
 * The resulting JSON can be imported into Figma via a plugin that
 * reads this structure and creates corresponding Figma nodes.
 */
export function exportToFigmaJSON(tree: ComponentTree): FigmaDocument {
  _nodeCounter = 0; // Reset ID counter
  const { width, height } = tree.metadata.viewport;

  const rootFrame: FigmaNode = {
    id: figmaId(),
    name: tree.metadata.name || 'Exported Screen',
    type: 'FRAME',
    x: 0,
    y: 0,
    width,
    height,
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
    layoutMode: 'VERTICAL',
    primaryAxisSizingMode: 'FIXED',
    counterAxisSizingMode: 'FIXED',
    children: [],
  };

  // Convert the ComponentTree root
  const converted = convertNode(tree.root, width, height);
  // Merge root-level styles
  converted.width = width;
  converted.height = height;
  rootFrame.children = [converted];

  return {
    name: tree.metadata.name || 'Untitled',
    description: tree.metadata.description || '',
    designSystem: tree.metadata.designSystem,
    viewport: tree.metadata.viewport,
    generatedAt: tree.metadata.generatedAt,
    exportedAt: new Date().toISOString(),
    rootNode: rootFrame,
  };
}

/**
 * Export a ComponentTree to a downloadable .figma.json file.
 */
export function downloadFigmaJSON(tree: ComponentTree): void {
  const doc = exportToFigmaJSON(tree);
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.name.replace(/\s+/g, '-').toLowerCase()}.figma.json`;
  a.click();
  URL.revokeObjectURL(url);
}
