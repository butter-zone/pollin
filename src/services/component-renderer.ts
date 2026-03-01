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

// ── Data Attributes ─────────────────────────────────────

function dataAttrs(node: ComponentNode): string {
  return ` data-node-id="${escapeHTML(node.id)}" data-type="${escapeHTML(node.type)}"`;
}

// ── SVG Chart Stubs ─────────────────────────────────────

function renderBarChart(color: string): string {
  const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90];
  return `<svg viewBox="0 0 240 100" width="100%" height="100%" preserveAspectRatio="none" style="display:block;">
    ${bars.map((h, i) => `<rect x="${i * 20 + 2}" y="${100 - h}" width="16" height="${h}" rx="2" fill="${color}" opacity="${0.5 + (h / 180)}" />`).join('')}
  </svg>`;
}

function renderLineChart(color: string): string {
  const points = '0,70 20,55 40,60 60,40 80,45 100,30 120,35 140,20 160,25 180,15 200,22 220,10 240,18';
  return `<svg viewBox="0 0 240 100" width="100%" height="100%" preserveAspectRatio="none" style="display:block;">
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <polyline points="0,70 ${points.split(' ').slice(1).join(' ')} 240,100 0,100" fill="${color}" opacity="0.08" />
  </svg>`;
}

function renderAreaChart(color: string): string {
  const points = '0,65 30,50 60,55 90,35 120,40 150,25 180,30 210,18 240,22';
  return `<svg viewBox="0 0 240 80" width="100%" height="100%" preserveAspectRatio="none" style="display:block;">
    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${color}" stop-opacity="0.02"/></linearGradient></defs>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <polygon points="0,65 ${points.split(' ').slice(1).join(' ')} 240,80 0,80" fill="url(#ag)" />
  </svg>`;
}

// ── Image Placeholder SVG ───────────────────────────────

function renderImagePlaceholder(): string {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>`;
}

// ── Node Rendering ──────────────────────────────────────

function renderNode(node: ComponentNode): string {
  const defaults = DEFAULT_STYLES[node.type] ?? {};
  const props = node.props ?? {};
  const children = node.children;
  const da = dataAttrs(node);

  switch (node.type) {
    // ── Layout ──────────────────────────────────────────

    case 'container': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
    }

    case 'stack': {
      const direction = props.direction === 'horizontal' ? 'row' : 'column';
      const extra: Record<string, string> = { flexDirection: direction };
      if (props.gap) extra.gap = String(props.gap);
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
    }

    case 'grid': {
      const extra: Record<string, string> = {};
      if (props.columns) extra.gridTemplateColumns = String(props.columns);
      if (props.gap) extra.gap = String(props.gap);
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
    }

    case 'spacer': {
      const extra: Record<string, string> = {};
      if (props.size) {
        extra.height = String(props.size);
        extra.flex = 'none';
      }
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<div${da} style="${css}"></div>`;
    }

    case 'divider': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<hr${da} style="${css}" />`;
    }

    case 'scroll': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
    }

    case 'section': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<section${da} style="${css}">${renderChildren(children)}</section>`;
    }

    // ── Content ─────────────────────────────────────────

    case 'text': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span${da} style="${css}">${renderChildren(children)}</span>`;
    }

    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(props.level) || 2));
      const tag = `h${level}`;
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<${tag}${da} style="${css}">${renderChildren(children)}</${tag}>`;
    }

    case 'paragraph': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<p${da} style="${css}">${renderChildren(children)}</p>`;
    }

    case 'image': {
      const src = props.src as string | undefined;
      const alt = escapeHTML(String(props.alt ?? ''));
      if (src) {
        const css = stylesToCSS(mergeStyles(defaults, node.styles));
        return `<img${da} src="${escapeHTML(src)}" alt="${alt}" style="${css}" />`;
      }
      // SVG image placeholder
      const placeholderStyles: Record<string, string> = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
        background: '#f3f4f6',
        color: '#9ca3af',
        fontSize: '11px',
        fontWeight: '500',
        width: '100%',
        height: '150px',
        borderRadius: '6px',
      };
      const css = stylesToCSS(mergeStyles(placeholderStyles, node.styles));
      return `<div${da} style="${css}">${renderImagePlaceholder()}${alt ? `<span>${alt}</span>` : ''}</div>`;
    }

    case 'icon': {
      const name = String(props.name ?? '•');
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span${da} style="${css}">${escapeHTML(name)}</span>`;
    }

    case 'badge': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span${da} style="${css}">${renderChildren(children)}</span>`;
    }

    case 'avatar': {
      const name = String(props.name ?? '');
      const initial = name.charAt(0).toUpperCase() || '?';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div${da} style="${css}">${escapeHTML(initial)}</div>`;
    }

    case 'code': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<pre${da} style="${css}"><code>${renderChildren(children)}</code></pre>`;
    }

    // ── Input ───────────────────────────────────────────

    case 'button': {
      const variant = String(props.variant ?? 'primary');
      const variantStyles = buttonVariantStyles(variant);
      const css = stylesToCSS(mergeStyles({ ...defaults, ...variantStyles }, node.styles));
      return `<button${da} style="${css}">${renderChildren(children)}</button>`;
    }

    case 'input': {
      const type = escapeHTML(String(props.type ?? 'text'));
      const placeholder = escapeHTML(String(props.placeholder ?? ''));
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<input${da} type="${type}" placeholder="${placeholder}" style="${css}" />`;
    }

    case 'textarea': {
      const placeholder = escapeHTML(String(props.placeholder ?? ''));
      const rows = Number(props.rows) || 3;
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<textarea${da} placeholder="${placeholder}" rows="${rows}" style="${css}"></textarea>`;
    }

    case 'select': {
      const options = (Array.isArray(props.options) ? props.options : []) as string[];
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const optionsHTML = options
        .map((o) => `<option value="${escapeHTML(String(o))}">${escapeHTML(String(o))}</option>`)
        .join('');
      return `<select${da} style="${css}">${optionsHTML}</select>`;
    }

    case 'checkbox': {
      const label = escapeHTML(String(props.label ?? ''));
      const checked = props.checked ? ' checked' : '';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<label${da} style="${css}"><input type="checkbox"${checked} /> ${label}</label>`;
    }

    case 'radio': {
      const label = escapeHTML(String(props.label ?? ''));
      const group = escapeHTML(String(props.group ?? ''));
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<label${da} style="${css}"><input type="radio" name="${group}" /> ${label}</label>`;
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
      return `<div${da} style="${trackCSS}"><div style="${circleCSSStr}"></div></div>`;
    }

    case 'slider': {
      const min = Number(props.min ?? 0);
      const max = Number(props.max ?? 100);
      const value = Number(props.value ?? 50);
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<input${da} type="range" min="${min}" max="${max}" value="${value}" style="${css}" />`;
    }

    // ── Navigation ──────────────────────────────────────

    case 'navbar': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<nav${da} style="${css}">${renderChildren(children)}</nav>`;
    }

    case 'sidebar': {
      const width = String(props.width ?? '240px');
      const extra: Record<string, string> = { width };
      const css = stylesToCSS(mergeStyles({ ...defaults, ...extra }, node.styles));
      return `<aside${da} style="${css}">${renderChildren(children)}</aside>`;
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
      return `<a${da} href="${href}" style="${css}">${renderChildren(children)}</a>`;
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
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
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
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
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
      return `<div${da} style="${css}"><div style="${barCSS}"></div></div>`;
    }

    case 'spinner': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div${da} style="${css}"></div>`;
    }

    case 'skeleton': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div${da} style="${css}"></div>`;
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
      return `<div${da} style="${backdropCSS}"><div style="${cardCSS}">${renderChildren(children)}</div></div>`;
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
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
    }

    case 'list': {
      const ordered = Boolean(props.ordered);
      const tag = ordered ? 'ol' : 'ul';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<${tag}${da} style="${css}">${renderChildren(children)}</${tag}>`;
    }

    case 'listItem': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<li${da} style="${css}">${renderChildren(children)}</li>`;
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
      return `<div${da} style="${css}"><div style="font-size: 28px; font-weight: 700; line-height: 1.2;">${escapeHTML(value)}</div><div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${escapeHTML(label)}</div>${changeHTML}</div>`;
    }

    case 'chart': {
      const chartType = String(props.type ?? props.chartType ?? 'bar');
      const color = String(node.styles?.color ?? '#2563eb');
      const chartStyles: Record<string, string> = { ...defaults };
      // Remove text-centric color from chart container
      delete chartStyles.color;
      delete chartStyles.fontSize;
      const css = stylesToCSS(mergeStyles(chartStyles, node.styles));
      let chartSVG: string;
      switch (chartType) {
        case 'line': chartSVG = renderLineChart(color); break;
        case 'area': chartSVG = renderAreaChart(color); break;
        default: chartSVG = renderBarChart(color); break;
      }
      return `<div${da} style="${css}">${chartSVG}</div>`;
    }

    // ── Fallback ────────────────────────────────────────

    default: {
      const css = stylesToCSS(mergeStyles({}, node.styles));
      return `<div${da} style="${css}">${renderChildren(children)}</div>`;
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
// ── Design System Base Styles ───────────────────────────

const DESIGN_SYSTEM_CSS: Record<string, string> = {
  'material ui 3': `body { font-family: 'Roboto', 'Noto Sans', sans-serif; color: #1C1B1F; }
    button { border-radius: 20px; font-weight: 500; letter-spacing: 0.01em; }
    input, select, textarea { border-radius: 4px; border: 1px solid #79747E; }`,
  'apple liquid glass': `body { font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif; color: #1d1d1f; letter-spacing: -0.01em; }
    button { border-radius: 12px; font-weight: 500; }`,
  'ant design': `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: rgba(0,0,0,0.88); font-size: 14px; }
    button { border-radius: 6px; font-weight: 400; }
    input, select, textarea { border-radius: 6px; border: 1px solid #d9d9d9; }`,
  'fluent ui': `body { font-family: 'Segoe UI', 'Segoe UI Web', sans-serif; color: #242424; }
    button { border-radius: 4px; font-weight: 600; }
    input, select, textarea { border-radius: 4px; border: 1px solid #d1d1d1; }`,
  'shadcn/ui': `body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #09090b; font-size: 14px; }
    button { border-radius: 6px; font-weight: 500; font-size: 14px; }
    input, select, textarea { border-radius: 6px; border: 1px solid #e4e4e7; }`,
  'radix ui': `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #11181c; }
    button { border-radius: 6px; font-weight: 500; }
    input, select, textarea { border-radius: 6px; border: 1px solid #dfe3e6; }`,
};

export function renderTreeToHTML(tree: ComponentTree): string {
  const { width, height } = tree.metadata.viewport;
  const body = renderNode(tree.root);
  const ds = tree.metadata.designSystem?.toLowerCase() ?? '';
  const dsCSS = DESIGN_SYSTEM_CSS[ds] ?? '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #111827; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  h1, h2, h3, h4, h5, h6 { margin: 0; font-size: inherit; font-weight: inherit; }
  p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; cursor: pointer; border: none; background: none; padding: 0; }
  input, select, textarea { font: inherit; }
  ul, ol { list-style: none; margin: 0; padding: 0; }
  img { display: block; max-width: 100%; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { to { background-position: -200% 0; } }
  ${dsCSS}
</style>
</head>
<body>
${body}
</body>
</html>`;
}
