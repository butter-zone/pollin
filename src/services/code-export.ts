/**
 * Code Export — converts a ComponentTree to clean React JSX or HTML/CSS.
 *
 * Two export targets:
 *   • React: functional component with inline styles (ready to paste)
 *   • HTML: self-contained HTML document with embedded CSS
 *
 * The exported code is clean, human-readable, and production-quality.
 */

import type { ComponentNode, ComponentTree, ComponentNodeType } from '@/types/component-tree';

/* ─── Helpers ───────────────────────────────────────────── */

function indent(depth: number): string {
  return '  '.repeat(depth);
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Escape text for JSX (minimal) */
function escapeJSX(s: string): string {
  return s.replace(/[{}<>]/g, (c) => {
    switch (c) {
      case '{': return '&#123;';
      case '}': return '&#125;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      default: return c;
    }
  });
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── Type → HTML tag mapping ───────────────────────────── */

const TYPE_TO_TAG: Record<ComponentNodeType, string> = {
  container: 'div',
  stack: 'div',
  grid: 'div',
  spacer: 'div',
  divider: 'hr',
  scroll: 'div',
  section: 'section',
  text: 'span',
  heading: 'h2',
  paragraph: 'p',
  image: 'img',
  icon: 'span',
  badge: 'span',
  avatar: 'div',
  code: 'pre',
  button: 'button',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  checkbox: 'label',
  radio: 'label',
  toggle: 'label',
  slider: 'input',
  navbar: 'nav',
  sidebar: 'aside',
  tabs: 'div',
  breadcrumb: 'nav',
  link: 'a',
  menu: 'nav',
  alert: 'div',
  toast: 'div',
  progress: 'div',
  spinner: 'div',
  skeleton: 'div',
  tooltip: 'div',
  dialog: 'div',
  table: 'table',
  card: 'div',
  list: 'ul',
  listItem: 'li',
  stat: 'div',
  chart: 'div',
};

/* ─── Heading level helper ──────────────────────────────── */

function headingTag(node: ComponentNode): string {
  const level = Math.min(Math.max(Number(node.props.level) || 2, 1), 6);
  return `h${level}`;
}

/* ─── React JSX Export ──────────────────────────────────── */

function styleObjToJSX(styles: Record<string, string>): string {
  const entries = Object.entries(styles);
  if (entries.length === 0) return '';
  const pairs = entries.map(([k, v]) => {
    // Numbers stay numeric, everything else is a string
    const numVal = Number(v);
    const val = !isNaN(numVal) && v === String(numVal) ? v : `'${v.replace(/'/g, "\\'")}'`;
    return `${k}: ${val}`;
  });
  return `{{ ${pairs.join(', ')} }}`;
}

function nodeToJSX(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const tag = node.type === 'heading' ? headingTag(node) : TYPE_TO_TAG[node.type] || 'div';

  // Build props
  const attrs: string[] = [];
  if (node.props.className) attrs.push(`className="${node.props.className}"`);
  if (Object.keys(node.styles).length > 0) {
    attrs.push(`style={${styleObjToJSX(node.styles)}}`);
  }

  // Type-specific props
  switch (node.type) {
    case 'input':
      if (node.props.placeholder) attrs.push(`placeholder="${node.props.placeholder}"`);
      if (node.props.type) attrs.push(`type="${node.props.type}"`);
      break;
    case 'textarea':
      if (node.props.placeholder) attrs.push(`placeholder="${node.props.placeholder}"`);
      if (node.props.rows) attrs.push(`rows={${node.props.rows}}`);
      break;
    case 'image':
      attrs.push(`src="${node.props.src || '/placeholder.png'}"`);
      attrs.push(`alt="${node.props.alt || ''}"`);
      break;
    case 'link':
      attrs.push(`href="${node.props.href || '#'}"`);
      break;
    case 'button':
      if (node.props.disabled) attrs.push('disabled');
      break;
    case 'slider':
      attrs.push('type="range"');
      if (node.props.min != null) attrs.push(`min={${node.props.min}}`);
      if (node.props.max != null) attrs.push(`max={${node.props.max}}`);
      if (node.props.value != null) attrs.push(`defaultValue={${node.props.value}}`);
      break;
  }

  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  // Self-closing tags
  if (['input', 'img', 'hr'].includes(tag) || (node.type === 'slider')) {
    return `${pad}<${tag}${attrStr} />`;
  }

  // Children
  const children = node.children;
  if (!children || children.length === 0) {
    // Special content for some types
    switch (node.type) {
      case 'checkbox':
        return `${pad}<${tag}${attrStr}>\n${pad}  <input type="checkbox" /> ${escapeJSX(String(node.props.label || 'Checkbox'))}\n${pad}</${tag}>`;
      case 'radio':
        return `${pad}<${tag}${attrStr}>\n${pad}  <input type="radio" /> ${escapeJSX(String(node.props.label || 'Radio'))}\n${pad}</${tag}>`;
      case 'toggle':
        return `${pad}<${tag}${attrStr}>\n${pad}  <input type="checkbox" role="switch" /> ${escapeJSX(String(node.props.label || ''))}\n${pad}</${tag}>`;
      case 'spinner':
        return `${pad}<${tag}${attrStr}>Loading...</${tag}>`;
      case 'skeleton':
        return `${pad}<${tag}${attrStr} />`;
      case 'select': {
        const opts = (node.props.options as string[]) || ['Option 1', 'Option 2'];
        const optStr = opts.map((o) => `${pad}  <option>${escapeJSX(o)}</option>`).join('\n');
        return `${pad}<${tag}${attrStr}>\n${optStr}\n${pad}</${tag}>`;
      }
      case 'table': {
        return tableToJSX(node, depth);
      }
      case 'stat': {
        return statToJSX(node, depth);
      }
      case 'progress': {
        const pct = node.props.value ?? 50;
        return `${pad}<${tag}${attrStr}>\n${pad}  <div style={{ width: '${pct}%', height: '4px', background: 'currentColor', borderRadius: '2px' }} />\n${pad}</${tag}>`;
      }
      case 'tabs': {
        const items = (node.props.items as string[]) || ['Tab 1', 'Tab 2'];
        const tabStr = items.map((t, i) =>
          `${pad}  <button${(node.props.activeIndex as number) === i ? ` style={{ fontWeight: 'bold' }}` : ''}>${escapeJSX(t)}</button>`
        ).join('\n');
        return `${pad}<${tag}${attrStr}>\n${tabStr}\n${pad}</${tag}>`;
      }
      case 'chart':
        return `${pad}<${tag}${attrStr}>{/* ${String(node.props.chartType || 'bar')} chart */}</${tag}>`;
      case 'avatar': {
        const initials = node.props.initials || '?';
        return `${pad}<${tag}${attrStr}>${escapeJSX(String(initials))}</${tag}>`;
      }
      default:
        return `${pad}<${tag}${attrStr} />`;
    }
  }

  // Has children — check if single text child
  if (children.length === 1 && typeof children[0] === 'string') {
    const text = escapeJSX(children[0]);
    if (text.length < 60) {
      return `${pad}<${tag}${attrStr}>${text}</${tag}>`;
    }
  }

  const childLines = children.map((child) => {
    if (typeof child === 'string') {
      return `${pad}  ${escapeJSX(child)}`;
    }
    return nodeToJSX(child, depth + 1);
  });

  return `${pad}<${tag}${attrStr}>\n${childLines.join('\n')}\n${pad}</${tag}>`;
}

function tableToJSX(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const cols = (node.props.columns as string[]) || [];
  const rows = (node.props.rows as string[][]) || [];
  const headerRow = cols.map((c) => `${pad}      <th>${escapeJSX(c)}</th>`).join('\n');
  const bodyRows = rows.map((row) =>
    `${pad}      <tr>\n${row.map((cell) => `${pad}        <td>${escapeJSX(cell)}</td>`).join('\n')}\n${pad}      </tr>`
  ).join('\n');
  return `${pad}<table${node.styles && Object.keys(node.styles).length ? ` style={${styleObjToJSX(node.styles)}}` : ''}>\n${pad}  <thead>\n${pad}    <tr>\n${headerRow}\n${pad}    </tr>\n${pad}  </thead>\n${pad}  <tbody>\n${bodyRows}\n${pad}  </tbody>\n${pad}</table>`;
}

function statToJSX(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const label = String(node.props.label || 'Stat');
  const value = String(node.props.value || '0');
  const change = node.props.change ? String(node.props.change) : undefined;
  let inner = `${pad}  <div style={{ fontSize: '24px', fontWeight: '700' }}>${escapeJSX(value)}</div>\n${pad}  <div style={{ fontSize: '13px', opacity: 0.6 }}>${escapeJSX(label)}</div>`;
  if (change) {
    inner += `\n${pad}  <div style={{ fontSize: '12px' }}>${escapeJSX(change)}</div>`;
  }
  const styleStr = Object.keys(node.styles).length ? ` style={${styleObjToJSX(node.styles)}}` : '';
  return `${pad}<div${styleStr}>\n${inner}\n${pad}</div>`;
}

/**
 * Export a ComponentTree to a React functional component string.
 */
export function exportToReact(tree: ComponentTree): string {
  const name = tree.metadata.name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
  const componentName = name || 'GeneratedComponent';

  const jsxBody = nodeToJSX(tree.root, 1);

  return `import React from 'react';

export default function ${componentName}() {
  return (
${jsxBody}
  );
}
`;
}

/* ─── HTML Export ────────────────────────────────────────── */

function styleToInlineCSS(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');
}

function nodeToHTML(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const tag = node.type === 'heading' ? headingTag(node) : TYPE_TO_TAG[node.type] || 'div';

  // Build attrs
  const attrs: string[] = [];
  if (Object.keys(node.styles).length > 0) {
    attrs.push(`style="${styleToInlineCSS(node.styles)}"`);
  }

  // Type-specific attrs
  switch (node.type) {
    case 'input':
      if (node.props.placeholder) attrs.push(`placeholder="${escapeHTML(String(node.props.placeholder))}"`);
      if (node.props.type) attrs.push(`type="${node.props.type}"`);
      break;
    case 'textarea':
      if (node.props.placeholder) attrs.push(`placeholder="${escapeHTML(String(node.props.placeholder))}"`);
      break;
    case 'image':
      attrs.push(`src="${node.props.src || '/placeholder.png'}"`);
      attrs.push(`alt="${escapeHTML(String(node.props.alt || ''))}"`);
      break;
    case 'link':
      attrs.push(`href="${node.props.href || '#'}"`);
      break;
    case 'button':
      if (node.props.disabled) attrs.push('disabled');
      break;
    case 'slider':
      attrs.push('type="range"');
      if (node.props.min != null) attrs.push(`min="${node.props.min}"`);
      if (node.props.max != null) attrs.push(`max="${node.props.max}"`);
      if (node.props.value != null) attrs.push(`value="${node.props.value}"`);
      break;
  }

  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

  // Self-closing
  const voidTags = ['input', 'img', 'hr', 'br'];
  if (voidTags.includes(tag) || node.type === 'slider') {
    return `${pad}<${tag}${attrStr}>`;
  }

  // Children
  const children = node.children;
  if (!children || children.length === 0) {
    switch (node.type) {
      case 'checkbox':
        return `${pad}<${tag}${attrStr}>\n${pad}  <input type="checkbox"> ${escapeHTML(String(node.props.label || 'Checkbox'))}\n${pad}</${tag}>`;
      case 'radio':
        return `${pad}<${tag}${attrStr}>\n${pad}  <input type="radio"> ${escapeHTML(String(node.props.label || 'Radio'))}\n${pad}</${tag}>`;
      case 'toggle':
        return `${pad}<${tag}${attrStr}>\n${pad}  <input type="checkbox" role="switch"> ${escapeHTML(String(node.props.label || ''))}\n${pad}</${tag}>`;
      case 'spinner':
        return `${pad}<${tag}${attrStr}>Loading...</${tag}>`;
      case 'select': {
        const opts = (node.props.options as string[]) || ['Option 1', 'Option 2'];
        const optStr = opts.map((o) => `${pad}  <option>${escapeHTML(o)}</option>`).join('\n');
        return `${pad}<${tag}${attrStr}>\n${optStr}\n${pad}</${tag}>`;
      }
      case 'table':
        return tableToHTML(node, depth);
      case 'stat':
        return statToHTML(node, depth);
      case 'progress': {
        const pct = node.props.value ?? 50;
        return `${pad}<${tag}${attrStr}>\n${pad}  <div style="width: ${pct}%; height: 4px; background: currentColor; border-radius: 2px"></div>\n${pad}</${tag}>`;
      }
      case 'tabs': {
        const items = (node.props.items as string[]) || ['Tab 1', 'Tab 2'];
        const tabStr = items.map((t, i) =>
          `${pad}  <button${i === (node.props.activeIndex as number) ? ' class="active"' : ''}>${escapeHTML(t)}</button>`
        ).join('\n');
        return `${pad}<${tag}${attrStr}>\n${tabStr}\n${pad}</${tag}>`;
      }
      case 'chart':
        return `${pad}<${tag}${attrStr}><!-- ${String(node.props.chartType || 'bar')} chart --></${tag}>`;
      case 'avatar':
        return `${pad}<${tag}${attrStr}>${escapeHTML(String(node.props.initials || '?'))}</${tag}>`;
      default:
        return `${pad}<${tag}${attrStr}></${tag}>`;
    }
  }

  if (children.length === 1 && typeof children[0] === 'string') {
    const text = escapeHTML(children[0]);
    if (text.length < 60) {
      return `${pad}<${tag}${attrStr}>${text}</${tag}>`;
    }
  }

  const childLines = children.map((child) => {
    if (typeof child === 'string') return `${pad}  ${escapeHTML(child)}`;
    return nodeToHTML(child, depth + 1);
  });

  return `${pad}<${tag}${attrStr}>\n${childLines.join('\n')}\n${pad}</${tag}>`;
}

function tableToHTML(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const cols = (node.props.columns as string[]) || [];
  const rows = (node.props.rows as string[][]) || [];
  const style = Object.keys(node.styles).length ? ` style="${styleToInlineCSS(node.styles)}"` : '';
  const headerRow = cols.map((c) => `${pad}      <th>${escapeHTML(c)}</th>`).join('\n');
  const bodyRows = rows.map((row) =>
    `${pad}      <tr>\n${row.map((cell) => `${pad}        <td>${escapeHTML(cell)}</td>`).join('\n')}\n${pad}      </tr>`
  ).join('\n');
  return `${pad}<table${style}>\n${pad}  <thead>\n${pad}    <tr>\n${headerRow}\n${pad}    </tr>\n${pad}  </thead>\n${pad}  <tbody>\n${bodyRows}\n${pad}  </tbody>\n${pad}</table>`;
}

function statToHTML(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const label = String(node.props.label || 'Stat');
  const value = String(node.props.value || '0');
  const change = node.props.change ? String(node.props.change) : undefined;
  const style = Object.keys(node.styles).length ? ` style="${styleToInlineCSS(node.styles)}"` : '';
  let inner = `${pad}  <div style="font-size: 24px; font-weight: 700">${escapeHTML(value)}</div>\n${pad}  <div style="font-size: 13px; opacity: 0.6">${escapeHTML(label)}</div>`;
  if (change) {
    inner += `\n${pad}  <div style="font-size: 12px">${escapeHTML(change)}</div>`;
  }
  return `${pad}<div${style}>\n${inner}\n${pad}</div>`;
}

/**
 * Export a ComponentTree to a self-contained HTML page.
 */
export function exportToHTML(tree: ComponentTree): string {
  const title = tree.metadata.name || 'Generated UI';
  const body = nodeToHTML(tree.root, 2);
  const vp = tree.metadata.viewport || { width: 420, height: 580 };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #111827;
      background: #ffffff;
      max-width: ${vp.width}px;
      min-height: ${vp.height}px;
    }
    a { color: inherit; text-decoration: none; }
    button { font: inherit; cursor: pointer; }
    input, textarea, select { font: inherit; }
    ul, ol { list-style: none; }
    img { max-width: 100%; display: block; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
    table { border-collapse: collapse; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

/* ─── Convenience: format selector ──────────────────────── */

export type ExportFormat = 'react' | 'html';

export function exportCode(tree: ComponentTree, format: ExportFormat): string {
  switch (format) {
    case 'react':
      return exportToReact(tree);
    case 'html':
      return exportToHTML(tree);
    default:
      return exportToHTML(tree);
  }
}
