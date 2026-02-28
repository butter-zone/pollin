import type { ComponentNode, ComponentTree, ComponentNodeType } from '@/types/component-tree';

// ── HTML Escaping ───────────────────────────────────────

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Style Serialization ────────────────────────────────

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function stylesToCSS(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');
}

// ── Default Styles Per Type ─────────────────────────────

const DEFAULT_STYLES: Partial<Record<ComponentNodeType, Record<string, string>>> = {
  // Layout
  container: { display: 'flex', flexDirection: 'column' },
  stack: { display: 'flex' },
  grid: { display: 'grid' },
  spacer: { flex: '1' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' },
  scroll: { overflow: 'auto' },
  section: {},

  // Content
  text: {},
  heading: {},
  paragraph: {},
  image: {},
  icon: {},
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    background: '#6366f1',
    color: 'white',
  },
  code: {
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    background: '#f3f4f6',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    overflowX: 'auto',
  },

  // Input
  button: {
    cursor: 'pointer',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
  },
  checkbox: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  radio: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  toggle: {},
  slider: { width: '100%' },

  // Navigation
  navbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  sidebar: {
    borderRight: '1px solid #e5e7eb',
    padding: '16px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #e5e7eb',
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' },
  link: { color: '#2563eb', textDecoration: 'none' },
  menu: { listStyle: 'none', padding: '0', margin: '0' },

  // Feedback
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
  },
  toast: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  progress: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: '#e5e7eb',
    overflow: 'hidden',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  skeleton: {
    background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    height: '20px',
  },
  tooltip: {},
  dialog: {},

  // Data
  table: { width: '100%', borderCollapse: 'collapse' },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    background: 'white',
  },
  list: { listStyle: 'none', padding: '0', margin: '0' },
  listItem: { padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
  stat: { textAlign: 'center' },
  chart: {
    background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
    color: '#6b7280',
    fontSize: '14px',
  },
};

// ── Alert / Toast Variant Colors ────────────────────────

const ALERT_VARIANTS: Record<string, { bg: string; border: string; color: string }> = {
  info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534' },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
  error: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
};

// ── Button Variant Helpers ──────────────────────────────

function buttonVariantStyles(variant: string): Record<string, string> {
  switch (variant) {
    case 'primary':
      return { background: '#2563eb', color: 'white' };
    case 'outline':
      return { background: 'transparent', border: '1px solid #d1d5db', color: '#111827' };
    case 'ghost':
      return { background: 'transparent', color: '#111827' };
    default:
      return { background: '#2563eb', color: 'white' };
  }
}

// ── Merge Styles ────────────────────────────────────────

function mergeStyles(
  defaults: Record<string, string>,
  custom: Record<string, string>,
): Record<string, string> {
  return { ...defaults, ...custom };
}

// ── Render Children ─────────────────────────────────────

function renderChildren(children?: (ComponentNode | string)[]): string {
  if (!children || children.length === 0) return '';
  return children
    .map((child) => (typeof child === 'string' ? escapeHTML(child) : renderNode(child)))
    .join('');
}

// ── Node Rendering ──────────────────────────────────────

function renderNode(node: ComponentNode): string {
  const defaults = DEFAULT_STYLES[node.type] ?? {};
  const props = node.props ?? {};
  const children = node.children;

  switch (node.type) {
    // ── Layout ──────────────────────────────────────────

    case 'container': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'stack': {
      const direction = props.direction === 'horizontal' ? 'row' : 'column';
      const extra: Record<string, string> = { flexDirection: direction };
      if (props.gap) extra.gap = String(props.gap);
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'grid': {
      const extra: Record<string, string> = {};
      if (props.columns) extra.gridTemplateColumns = String(props.columns);
      if (props.gap) extra.gap = String(props.gap);
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'spacer': {
      const extra: Record<string, string> = {};
      if (props.size) {
        extra.height = String(props.size);
        extra.flex = 'none';
      }
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div style="${css}"></div>`;
    }

    case 'divider': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<hr style="${css}" />`;
    }

    case 'scroll': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'section': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<section style="${css}">${renderChildren(children)}</section>`;
    }

    // ── Content ─────────────────────────────────────────

    case 'text': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span style="${css}">${renderChildren(children)}</span>`;
    }

    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(props.level) || 2));
      const tag = `h${level}`;
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<${tag} style="${css}">${renderChildren(children)}</${tag}>`;
    }

    case 'paragraph': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<p style="${css}">${renderChildren(children)}</p>`;
    }

    case 'image': {
      const src = props.src as string | undefined;
      const alt = escapeHTML(String(props.alt ?? ''));
      if (src) {
        const css = stylesToCSS(mergeStyles(defaults, node.styles));
        return `<img src="${escapeHTML(src)}" alt="${alt}" style="${css}" />`;
      }
      // Gray placeholder
      const placeholderStyles: Record<string, string> = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e5e7eb',
        color: '#9ca3af',
        fontSize: '14px',
        width: '100%',
        height: '150px',
      };
      const css = stylesToCSS(mergeStyles(placeholderStyles, node.styles));
      return `<div style="${css}">Image</div>`;
    }

    case 'icon': {
      const name = String(props.name ?? '•');
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span style="${css}">${escapeHTML(name)}</span>`;
    }

    case 'badge': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span style="${css}">${renderChildren(children)}</span>`;
    }

    case 'avatar': {
      const name = String(props.name ?? '');
      const initial = name.charAt(0).toUpperCase() || '?';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}">${escapeHTML(initial)}</div>`;
    }

    case 'code': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<pre style="${css}"><code>${renderChildren(children)}</code></pre>`;
    }

    // ── Input ───────────────────────────────────────────

    case 'button': {
      const variant = String(props.variant ?? 'primary');
      const variantStyles = buttonVariantStyles(variant);
      const css = stylesToCSS(mergeStyles({ ...defaults, ...variantStyles }, node.styles));
      return `<button style="${css}">${renderChildren(children)}</button>`;
    }

    case 'input': {
      const type = escapeHTML(String(props.type ?? 'text'));
      const placeholder = escapeHTML(String(props.placeholder ?? ''));
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<input type="${type}" placeholder="${placeholder}" style="${css}" />`;
    }

    case 'textarea': {
      const placeholder = escapeHTML(String(props.placeholder ?? ''));
      const rows = Number(props.rows) || 3;
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<textarea placeholder="${placeholder}" rows="${rows}" style="${css}"></textarea>`;
    }

    case 'select': {
      const options = (Array.isArray(props.options) ? props.options : []) as string[];
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const optionsHTML = options
        .map((o) => `<option value="${escapeHTML(String(o))}">${escapeHTML(String(o))}</option>`)
        .join('');
      return `<select style="${css}">${optionsHTML}</select>`;
    }

    case 'checkbox': {
      const label = escapeHTML(String(props.label ?? ''));
      const checked = props.checked ? ' checked' : '';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<label style="${css}"><input type="checkbox"${checked} /> ${label}</label>`;
    }

    case 'radio': {
      const label = escapeHTML(String(props.label ?? ''));
      const group = escapeHTML(String(props.group ?? ''));
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<label style="${css}"><input type="radio" name="${group}" /> ${label}</label>`;
    }

    case 'toggle': {
      const isOn = Boolean(props.checked);
      const trackBg = isOn ? '#2563eb' : '#d1d5db';
      const circlePos = isOn ? '22px' : '1px';
      const trackCSS = stylesToCSS(
        mergeStyles(
          {
            width: '45px',
            height: '24px',
            borderRadius: '12px',
            background: trackBg,
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
          },
          node.styles,
        ),
      );
      const circleCSSStr = stylesToCSS({
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '1px',
        left: circlePos,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      });
      return `<div style="${trackCSS}"><div style="${circleCSSStr}"></div></div>`;
    }

    case 'slider': {
      const min = Number(props.min ?? 0);
      const max = Number(props.max ?? 100);
      const value = Number(props.value ?? 50);
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<input type="range" min="${min}" max="${max}" value="${value}" style="${css}" />`;
    }

    // ── Navigation ──────────────────────────────────────

    case 'navbar': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<nav style="${css}">${renderChildren(children)}</nav>`;
    }

    case 'sidebar': {
      const width = String(props.width ?? '240px');
      const extra: Record<string, string> = { width };
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<aside style="${css}">${renderChildren(children)}</aside>`;
    }

    case 'tabs': {
      const activeIndex = Number(props.activeIndex ?? 0);
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const items =
        children
          ?.map((child, i) => {
            if (typeof child === 'string') {
              const isActive = i === activeIndex;
              const tabStyle = stylesToCSS({
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#2563eb' : '#6b7280',
                fontWeight: isActive ? '600' : '400',
                marginBottom: '-2px',
              });
              return `<div style="${tabStyle}">${escapeHTML(child)}</div>`;
            }
            const isActive = i === activeIndex;
            const tabStyle: Record<string, string> = {
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
              color: isActive ? '#2563eb' : '#6b7280',
              fontWeight: isActive ? '600' : '400',
              marginBottom: '-2px',
            };
            const merged = mergeStyles(tabStyle, child.styles);
            return `<div style="${stylesToCSS(merged)}">${renderChildren(child.children)}</div>`;
          })
          .join('') ?? '';
      return `<div style="${css}">${items}</div>`;
    }

    case 'breadcrumb': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const items =
        children
          ?.map((child, i) => {
            const separator = i > 0 ? '<span style="margin: 0 4px; color: #9ca3af;"> / </span>' : '';
            if (typeof child === 'string') return `${separator}<span>${escapeHTML(child)}</span>`;
            return `${separator}${renderNode(child)}`;
          })
          .join('') ?? '';
      return `<nav style="${css}">${items}</nav>`;
    }

    case 'link': {
      const href = escapeHTML(String(props.href ?? '#'));
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<a href="${href}" style="${css}">${renderChildren(children)}</a>`;
    }

    case 'menu': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const items =
        children
          ?.map((child) => {
            if (typeof child === 'string')
              return `<li style="padding: 8px 12px; cursor: pointer;">${escapeHTML(child)}</li>`;
            return `<li style="padding: 8px 12px; cursor: pointer;">${renderNode(child)}</li>`;
          })
          .join('') ?? '';
      return `<ul style="${css}">${items}</ul>`;
    }

    // ── Feedback ────────────────────────────────────────

    case 'alert': {
      const variant = String(props.variant ?? 'info');
      const colors = ALERT_VARIANTS[variant] ?? ALERT_VARIANTS.info;
      const extra: Record<string, string> = {
        background: colors.bg,
        borderColor: colors.border,
        color: colors.color,
      };
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'toast': {
      const variant = String(props.variant ?? 'info');
      const colors = ALERT_VARIANTS[variant] ?? ALERT_VARIANTS.info;
      const extra: Record<string, string> = {
        background: colors.bg,
        borderColor: colors.border,
        color: colors.color,
      };
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'progress': {
      const value = Math.min(100, Math.max(0, Number(props.value ?? 60)));
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const barCSS = stylesToCSS({
        width: `${value}%`,
        height: '100%',
        background: '#2563eb',
        borderRadius: '4px',
        transition: 'width 0.3s',
      });
      return `<div style="${css}"><div style="${barCSS}"></div></div>`;
    }

    case 'spinner': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}"></div>`;
    }

    case 'skeleton': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}"></div>`;
    }

    case 'tooltip': {
      // Static render – just render children
      return renderChildren(children);
    }

    case 'dialog': {
      const backdropCSS = stylesToCSS({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
      });
      const cardCSS = stylesToCSS(
        mergeStyles(
          {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '480px',
            width: '100%',
          },
          node.styles,
        ),
      );
      return `<div style="${backdropCSS}"><div style="${cardCSS}">${renderChildren(children)}</div></div>`;
    }

    // ── Data ────────────────────────────────────────────

    case 'table': {
      const headers = (Array.isArray(props.headers) ? props.headers : []) as string[];
      const rows = (Array.isArray(props.rows) ? props.rows : []) as string[][];
      const css = stylesToCSS(mergeStyles(defaults, node.styles));

      const cellStyle = 'padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left;';
      const thStyle = `${cellStyle} font-weight: 600; background: #f9fafb;`;

      let thead = '';
      if (headers.length > 0) {
        thead = `<thead><tr>${headers.map((h) => `<th style="${thStyle}">${escapeHTML(String(h))}</th>`).join('')}</tr></thead>`;
      }

      let tbody = '';
      if (rows.length > 0) {
        tbody = `<tbody>${rows.map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => `<td style="${cellStyle}">${escapeHTML(String(cell))}</td>`).join('')}</tr>`).join('')}</tbody>`;
      }

      // Also allow children for composed tables
      const childrenHTML = renderChildren(children);

      return `<table style="${css}">${thead}${tbody}${childrenHTML}</table>`;
    }

    case 'card': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }

    case 'list': {
      const ordered = Boolean(props.ordered);
      const tag = ordered ? 'ol' : 'ul';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<${tag} style="${css}">${renderChildren(children)}</${tag}>`;
    }

    case 'listItem': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<li style="${css}">${renderChildren(children)}</li>`;
    }

    case 'stat': {
      const value = String(props.value ?? '—');
      const label = String(props.label ?? '');
      const change = props.change as string | undefined;
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      let changeHTML = '';
      if (change !== undefined && change !== null) {
        const isPositive = String(change).startsWith('+') || (!String(change).startsWith('-') && Number(change) >= 0);
        const changeColor = isPositive ? '#16a34a' : '#dc2626';
        changeHTML = `<div style="font-size: 13px; color: ${changeColor}; margin-top: 2px;">${escapeHTML(String(change))}</div>`;
      }
      return `<div style="${css}"><div style="font-size: 28px; font-weight: 700; line-height: 1.2;">${escapeHTML(value)}</div><div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${escapeHTML(label)}</div>${changeHTML}</div>`;
    }

    case 'chart': {
      const name = String(props.name ?? 'Untitled');
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div style="${css}">Chart: ${escapeHTML(name)}</div>`;
    }

    // ── Fallback ────────────────────────────────────────

    default: {
      const css = stylesToCSS(mergeStyles({}, node.styles));
      return `<div style="${css}">${renderChildren(children)}</div>`;
    }
  }
}

// ── Public API ──────────────────────────────────────────

/**
 * Render a single `ComponentNode` (and its children) to an HTML string.
 * Useful for component-level previews.
 */
export function renderNodeToHTML(node: ComponentNode): string {
  return renderNode(node);
}

/**
 * Render a full `ComponentTree` into a self-contained HTML document.
 * The result can be loaded into an iframe and captured as a bitmap.
 */
export function renderTreeToHTML(tree: ComponentTree): string {
  const { width, height } = tree.metadata.viewport;
  const body = renderNode(tree.root);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #111827; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { to { background-position: -200% 0; } }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
