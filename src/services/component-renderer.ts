import type { ComponentNode, ComponentTree, ComponentNodeType } from '@/types/component-tree';
import { icon as renderSvgIcon } from '@/services/ui-icons';

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
  text: { lineHeight: '1.5' },
  heading: { fontWeight: '700', lineHeight: '1.2' },
  paragraph: { lineHeight: '1.6' },
  image: {},
  icon: {},
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '16px',
    letterSpacing: '0.01em',
    background: '#eff6ff',
    color: '#2563eb',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '15px',
    lineHeight: '1',
    background: '#6366f1',
    color: 'white',
    letterSpacing: '0.02em',
  },
  code: {
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    background: '#f3f4f6',
    color: '#1f2937',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.5',
    overflowX: 'auto',
  },

  // Input
  button: {
    cursor: 'pointer',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '14px',
    lineHeight: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.006em',
    transition: 'background 0.15s, box-shadow 0.15s',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    lineHeight: '20px',
    background: 'white',
    color: '#111827',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: '14px',
    resize: 'vertical',
    lineHeight: '20px',
    background: 'white',
    color: '#111827',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    lineHeight: '20px',
    background: 'white',
    color: '#111827',
    appearance: 'none',
    transition: 'border-color 0.15s',
  },
  checkbox: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  radio: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  toggle: {},
  slider: { width: '100%' },

  // Navigation
  navbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    borderBottom: '1px solid #e5e7eb',
    gap: '16px',
  },
  sidebar: {
    borderRight: '1px solid #e5e7eb',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
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
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '14px',
    lineHeight: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  toast: {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)',
    fontSize: '14px',
    lineHeight: '20px',
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
    borderRadius: '12px',
    padding: '20px',
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    overflow: 'hidden',
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
    case 'secondary':
      return { background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' };
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
      const isVertical = props.orientation === 'vertical';
      if (isVertical) {
        const vStyles: Record<string, string> = {
          borderLeft: '1px solid #e5e7eb',
          width: '1px',
          alignSelf: 'stretch',
          margin: '0',
        };
        const css = stylesToCSS(mergeStyles(vStyles, node.styles));
        return `<div${da} style="${css}"></div>`;
      }
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
      const sizeByLevel: Record<number, string> = { 1: '2.25em', 2: '1.75em', 3: '1.375em', 4: '1.125em', 5: '1em', 6: '0.875em' };
      const trackingByLevel: Record<number, string> = { 1: '-0.025em', 2: '-0.02em', 3: '-0.015em', 4: '-0.01em', 5: '0', 6: '0.02em' };
      const levelDefaults: Record<string, string> = {
        fontSize: sizeByLevel[level] || '1em',
        letterSpacing: trackingByLevel[level] || '0',
      };
      const css = stylesToCSS(mergeStyles({ ...defaults, ...levelDefaults }, node.styles));
      return `<${tag}${da} style="${css}">${renderChildren(children)}</${tag}>`;
    }

    case 'paragraph': {
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<p${da} style="${css}">${renderChildren(children)}</p>`;
    }

    case 'image': {
      const src = props.src as string | undefined;
      const alt = escapeHTML(String(props.alt ?? ''));
      const isPlaceholder = !src || src === 'placeholder' || src === 'none';
      if (!isPlaceholder) {
        const css = stylesToCSS(mergeStyles(defaults, node.styles));
        return `<img${da} src="${escapeHTML(src!)}" alt="${alt}" style="${css}" />`;
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
      // Map common aliases to icon names in ui-icons.ts
      const ICON_ALIASES: Record<string, string> = {
        bolt: 'zap', lightning: 'zap', chart: 'bar-chart', analytics: 'trending-up',
        design: 'edit', code: 'file', doc: 'file', document: 'file',
      };
      const rawName = String(props.name ?? 'circle');
      const resolved = ICON_ALIASES[rawName] ?? rawName;
      const size = parseInt(node.styles?.fontSize ?? '18', 10) || 18;
      const color = node.styles?.color ?? 'currentColor';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<span${da} style="${css}">${renderSvgIcon(resolved, size, color)}</span>`;
    }

    case 'badge': {
      const badgeVariant = String(props.variant ?? 'default');
      const BADGE_VARIANTS: Record<string, { bg: string; color: string }> = {
        primary: { bg: '#2563eb', color: '#ffffff' },
        success: { bg: '#dcfce7', color: '#166534' },
        warning: { bg: '#fef3c7', color: '#92400e' },
        error: { bg: '#fee2e2', color: '#991b1b' },
        default: { bg: '#eff6ff', color: '#2563eb' },
      };
      const bv = BADGE_VARIANTS[badgeVariant] ?? BADGE_VARIANTS.default;
      const badgeExtra: Record<string, string> = { background: bv.bg, color: bv.color };
      const css = stylesToCSS(mergeStyles({ ...defaults, ...badgeExtra }, node.styles));
      return `<span${da} style="${css}">${renderChildren(children)}</span>`;
    }

    case 'avatar': {
      const initials = String(props.initials ?? props.name ?? '');
      const display = initials || '?';
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      return `<div${da} style="${css}">${escapeHTML(display)}</div>`;
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
      // Support both children-based and items-prop-based tabs
      const tabItems: string[] = (Array.isArray(props.items) ? props.items : []) as string[];
      let tabsHTML = '';
      if (children && children.length > 0) {
        tabsHTML = children.map((child, i) => {
          if (typeof child === 'string') {
            const isActive = i === activeIndex;
            const tabStyle = stylesToCSS({
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
              color: isActive ? '#2563eb' : '#6b7280',
              fontWeight: isActive ? '600' : '400',
              marginBottom: '-2px',
              fontSize: '14px',
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
            fontSize: '14px',
          };
          const merged = mergeStyles(tabStyle, child.styles);
          return `<div style="${stylesToCSS(merged)}">${renderChildren(child.children)}</div>`;
        }).join('');
      } else if (tabItems.length > 0) {
        tabsHTML = tabItems.map((label, i) => {
          const isActive = i === activeIndex;
          const tabStyle = stylesToCSS({
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
            color: isActive ? '#2563eb' : '#6b7280',
            fontWeight: isActive ? '600' : '400',
            marginBottom: '-2px',
            fontSize: '14px',
          });
          return `<div style="${tabStyle}">${escapeHTML(String(label))}</div>`;
        }).join('');
      }
      return `<div style="${css}">${tabsHTML}</div>`;
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
      const isActive = Boolean(props.active);
      const activeStyles: Record<string, string> = isActive
        ? { fontWeight: '600', background: '#eff6ff', borderRadius: '6px', padding: '6px 10px' }
        : {};
      const css = stylesToCSS(mergeStyles({ ...defaults, ...activeStyles }, node.styles));
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
      const label = props.label as string | undefined;
      const css = stylesToCSS(mergeStyles(defaults, node.styles));
      const barCSS = stylesToCSS({
        width: `${value}%`,
        height: '100%',
        background: '#2563eb',
        borderRadius: '4px',
        transition: 'width 0.3s',
      });
      const labelHTML = label
        ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:13px;">${escapeHTML(label)}</span><span style="font-size:12px;color:#6b7280;">${value}%</span></div>`
        : '';
      return `<div${da}>${labelHTML}<div style="${css}"><div style="${barCSS}"></div></div></div>`;
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
      const headers = (Array.isArray(props.headers) ? props.headers : Array.isArray(props.columns) ? props.columns : []) as string[];
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
      // Render props.title as a visible heading if set and no children already provide one
      let titleHTML = '';
      const title = props.title as string | undefined;
      if (title) {
        const hasHeadingChild = children?.some((c) => typeof c !== 'string' && /^h[1-6]$|^heading$/.test(c.type));
        if (!hasHeadingChild) {
          titleHTML = `<div style="font-size:15px;font-weight:600;margin-bottom:12px;letter-spacing:-0.01em;">${escapeHTML(title)}</div>`;
        }
      }
      return `<div${da} style="${css}">${titleHTML}${renderChildren(children)}</div>`;
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
        const arrow = isPositive ? '↑' : '↓';
        changeHTML = `<div style="font-size: 13px; font-weight: 500; color: ${changeColor}; margin-top: 4px; display: flex; align-items: center; gap: 2px;"><span>${arrow}</span> ${escapeHTML(String(change))}</div>`;
      }
      return `<div${da} style="${css}"><div style="font-size: 30px; font-weight: 700; line-height: 1.15; letter-spacing: -0.025em;">${escapeHTML(value)}</div><div style="font-size: 13px; color: #6b7280; margin-top: 6px; letter-spacing: 0.01em;">${escapeHTML(label)}</div>${changeHTML}</div>`;
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

/** Google Fonts URL fragments for each design system */
const DESIGN_SYSTEM_FONTS: Record<string, string> = {
  'material ui 3': 'family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500',
  'shadcn/ui': 'family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500',
  'ant design': 'family=Inter:wght@400;500;600;700',
  'fluent ui': 'family=Segoe+UI:wght@400;600;700',
  'radix ui': 'family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400',
  'apple liquid glass': '',
  'neo brutal editorial': 'family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500',
  'aurora glass neon': 'family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;500',
  'mono minimal grid': 'family=Inter:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500',
  'warm clay soft ui': 'family=Nunito:wght@400;600;700&family=Source+Serif+4:wght@500;600',
};

const DESIGN_SYSTEM_CSS: Record<string, string> = {
  'material ui 3': `
    body { font-family: 'Roboto', 'Noto Sans', sans-serif; color: #1D1B20; background: #FEF7FF; font-size: 14px; letter-spacing: 0.01em; }
    h1, h2, h3 { letter-spacing: -0.015em; }
    h1 { font-size: 2.25em; font-weight: 400; line-height: 1.15; }
    h2 { font-size: 1.75em; font-weight: 400; line-height: 1.2; }
    h3 { font-size: 1.375em; font-weight: 500; line-height: 1.25; }
    button { border-radius: 20px; padding: 10px 24px; font-weight: 500; font-size: 14px; letter-spacing: 0.02em; line-height: 20px; min-height: 40px; }
    input, select, textarea { border-radius: 4px; border: 1px solid #79747E; padding: 12px 16px; font-size: 16px; line-height: 24px; caret-color: #6750A4; }
    input:focus, textarea:focus { border-color: #6750A4; border-width: 2px; padding: 11px 15px; outline: none; }
    ::placeholder { color: #49454F; }
    [data-type="card"] { border-radius: 12px; border: none; background: #F3EDF7; box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15); }
    [data-type="badge"] { border-radius: 8px; font-weight: 500; letter-spacing: 0.02em; }
    [data-type="divider"] { border-color: #CAC4D0; }
    [data-type="navbar"] { background: #F3EDF7; border-bottom: none; }`,

  'apple liquid glass': `
    body { font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif; color: #ffffff; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); letter-spacing: -0.01em; font-size: 15px; }
    h1 { font-size: 2.5em; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }
    h2 { font-size: 1.75em; font-weight: 600; letter-spacing: -0.025em; line-height: 1.15; }
    h3 { font-size: 1.25em; font-weight: 600; letter-spacing: -0.02em; }
    button { border-radius: 14px; font-weight: 500; padding: 11px 22px; backdrop-filter: blur(12px) saturate(1.5); -webkit-backdrop-filter: blur(12px) saturate(1.5); background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.2); color: #fff; line-height: 20px; }
    input, select, textarea { border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #fff; padding: 11px 14px; font-size: 15px; line-height: 22px; }
    ::placeholder { color: rgba(255,255,255,0.45); }
    input:focus, textarea:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); }
    [data-type="card"] { backdrop-filter: blur(20px) saturate(1.8); -webkit-backdrop-filter: blur(20px) saturate(1.8); background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 22px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
    [data-type="navbar"] { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background: rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.12); }
    [data-type="badge"] { backdrop-filter: blur(8px); background: rgba(255,255,255,0.15); border-radius: 12px; color: #fff; }
    [data-type="divider"] { border-color: rgba(255,255,255,0.12); }`,

  'ant design': `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: rgba(0,0,0,0.88); background: #ffffff; font-size: 14px; line-height: 1.5714; }
    h1 { font-size: 38px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
    h2 { font-size: 30px; font-weight: 600; line-height: 1.27; letter-spacing: -0.015em; }
    h3 { font-size: 24px; font-weight: 600; line-height: 1.33; }
    button { border-radius: 8px; font-weight: 400; font-size: 14px; padding: 8px 16px; line-height: 22px; min-height: 32px; box-shadow: 0 2px 0 rgba(0,0,0,0.02); }
    input, select, textarea { border-radius: 6px; border: 1px solid #d9d9d9; padding: 8px 12px; font-size: 14px; line-height: 22px; }
    input:focus, textarea:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,0.08); }
    ::placeholder { color: rgba(0,0,0,0.25); }
    [data-type="card"] { border-radius: 8px; border: 1px solid #f0f0f0; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02); }
    [data-type="badge"] { border-radius: 4px; padding: 0 8px; font-size: 12px; line-height: 20px; }
    [data-type="table"] th { background: #fafafa; font-weight: 600; }`,

  'fluent ui': `
    body { font-family: 'Segoe UI', 'Segoe UI Web', -apple-system, sans-serif; color: #242424; background: #fafafa; font-size: 14px; line-height: 1.43; }
    h1 { font-size: 28px; font-weight: 600; line-height: 1.14; letter-spacing: -0.02em; }
    h2 { font-size: 24px; font-weight: 600; line-height: 1.17; letter-spacing: -0.01em; }
    h3 { font-size: 20px; font-weight: 600; line-height: 1.2; }
    button { border-radius: 4px; font-weight: 600; font-size: 14px; padding: 8px 16px; line-height: 20px; min-height: 32px; }
    input, select, textarea { border-radius: 4px; border-bottom: 2px solid #616161; border-top: 1px solid #d1d1d1; border-left: 1px solid #d1d1d1; border-right: 1px solid #d1d1d1; padding: 7px 12px; font-size: 14px; line-height: 20px; }
    input:focus, textarea:focus { border-bottom-color: #0078d4; }
    ::placeholder { color: #707070; }
    [data-type="card"] { border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.04); background: #fff; }
    [data-type="navbar"] { background: #fff; border-bottom: 1px solid #e0e0e0; }
    [data-type="badge"] { border-radius: 4px; font-weight: 600; font-size: 12px; }
    [data-type="divider"] { border-color: #e0e0e0; }`,

  'shadcn/ui': `
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #fafafa; background: #09090b; font-size: 14px; line-height: 1.5; letter-spacing: -0.006em; }
    h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; }
    h2 { font-size: 1.875rem; font-weight: 600; line-height: 1.15; letter-spacing: -0.02em; }
    h3 { font-size: 1.5rem; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; }
    button { border-radius: 6px; font-weight: 500; font-size: 14px; padding: 10px 16px; line-height: 20px; min-height: 36px; }
    input, select, textarea { border-radius: 6px; border: 1px solid #27272a; color: #fafafa; background: #09090b; padding: 9px 12px; font-size: 14px; line-height: 20px; }
    input:focus, textarea:focus { border-color: #a1a1aa; box-shadow: 0 0 0 2px rgba(161,161,170,0.15); }
    ::placeholder { color: #71717a; }
    [data-type="card"] { border-radius: 8px; border: 1px solid #27272a; background: #09090b; box-shadow: none; }
    [data-type="navbar"] { background: #09090b; border-bottom: 1px solid #27272a; }
    [data-type="badge"] { border-radius: 9999px; font-weight: 500; font-size: 12px; background: #27272a; color: #fafafa; border: 1px solid #3f3f46; }
    [data-type="divider"] { border-color: #27272a; }
    [data-type="table"] th { background: #18181b; color: #a1a1aa; font-weight: 500; font-size: 12px; letter-spacing: 0.02em; }
    [data-type="code"] { background: #18181b; border: 1px solid #27272a; color: #fafafa; font-family: 'JetBrains Mono', 'Fira Code', monospace; }`,

  'radix ui': `
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #eeeef0; background: #111113; font-size: 14px; line-height: 1.5; letter-spacing: -0.006em; }
    h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; }
    h2 { font-size: 1.75rem; font-weight: 600; line-height: 1.15; letter-spacing: -0.02em; }
    h3 { font-size: 1.375rem; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; }
    button { border-radius: 6px; font-weight: 500; font-size: 14px; padding: 9px 16px; line-height: 20px; min-height: 36px; }
    input, select, textarea { border-radius: 6px; border: 1px solid #2b2c2f; color: #eeeef0; background: #18191b; padding: 9px 12px; font-size: 14px; line-height: 20px; }
    input:focus, textarea:focus { border-color: #3e63dd; box-shadow: 0 0 0 1px #3e63dd; }
    ::placeholder { color: #63636e; }
    [data-type="card"] { border-radius: 8px; border: 1px solid #2b2c2f; background: #18191b; box-shadow: none; }
    [data-type="navbar"] { background: #18191b; border-bottom: 1px solid #2b2c2f; }
    [data-type="badge"] { border-radius: 9999px; font-weight: 500; background: #2b2c2f; color: #b0b4ba; }
    [data-type="divider"] { border-color: #2b2c2f; }
    [data-type="table"] th { background: #18191b; color: #9b9ba7; font-weight: 500; }
    [data-type="code"] { background: #18191b; border: 1px solid #2b2c2f; color: #eeeef0; }`,

  'neo brutal editorial': `
    body { font-family: 'Space Grotesk', Inter, sans-serif; color: #101010; background: #f7f5ef; font-size: 15px; line-height: 1.45; }
    h1, h2, h3 { letter-spacing: -0.03em; }
    h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.02; }
    h2 { font-size: 1.9rem; font-weight: 700; line-height: 1.05; }
    h3 { font-size: 1.45rem; font-weight: 700; line-height: 1.12; }
    button { border-radius: 4px; border: 2px solid #101010; box-shadow: 4px 4px 0 #101010; padding: 10px 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    input, select, textarea { border-radius: 2px; border: 2px solid #101010; background: #fff; color: #101010; padding: 10px 12px; }
    [data-type="card"] { border: 2px solid #101010; border-radius: 8px; box-shadow: 6px 6px 0 #101010; background: #fff; }
    [data-type="badge"] { border: 2px solid #101010; border-radius: 9999px; font-weight: 700; }
    [data-type="navbar"] { border-bottom: 2px solid #101010; background: #fff; }`,

  'aurora glass neon': `
    body { font-family: 'Manrope', Inter, sans-serif; color: #ebf7ff; background: radial-gradient(120% 120% at 20% 10%, #17386a 0%, #09162f 45%, #060f20 100%); font-size: 14px; line-height: 1.5; }
    h1 { font-size: 2.4rem; font-weight: 700; letter-spacing: -0.03em; text-shadow: 0 0 24px rgba(126,226,255,0.35); }
    h2 { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.02em; }
    h3 { font-size: 1.35rem; font-weight: 600; }
    button { border-radius: 12px; border: 1px solid rgba(126,226,255,0.5); background: linear-gradient(135deg, rgba(98,242,255,0.3), rgba(159,124,255,0.28)); color: #ebf7ff; box-shadow: 0 0 20px rgba(126,226,255,0.2); padding: 10px 16px; }
    input, select, textarea { border-radius: 10px; border: 1px solid rgba(126,226,255,0.35); background: rgba(11,24,44,0.72); color: #ebf7ff; padding: 10px 12px; }
    [data-type="card"] { border-radius: 16px; border: 1px solid rgba(126,226,255,0.26); background: rgba(14,30,56,0.7); backdrop-filter: blur(10px) saturate(1.2); }
    [data-type="badge"] { border-radius: 9999px; border: 1px solid rgba(126,226,255,0.36); background: rgba(16,32,60,0.72); }
    [data-type="navbar"] { border-bottom: 1px solid rgba(126,226,255,0.25); background: rgba(10,20,40,0.7); }`,

  'mono minimal grid': `
    body { font-family: 'Inter', sans-serif; color: #111; background: #fff; font-size: 14px; line-height: 1.55; }
    h1 { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.02em; }
    h2 { font-size: 1.7rem; font-weight: 600; letter-spacing: -0.015em; }
    h3 { font-size: 1.3rem; font-weight: 600; }
    button { border-radius: 8px; border: 1px solid #111; background: #111; color: #fff; padding: 10px 16px; font-weight: 600; }
    input, select, textarea { border-radius: 8px; border: 1px solid #ccc; background: #fff; color: #111; padding: 10px 12px; }
    [data-type="card"] { border-radius: 12px; border: 1px solid #d6d6d6; background: #fff; box-shadow: none; }
    [data-type="table"] th { border-bottom: 1px solid #d6d6d6; color: #444; font-weight: 600; }
    [data-type="divider"] { border-color: #e0e0e0; }
    [data-type="code"] { font-family: 'IBM Plex Mono', monospace; background: #f6f6f6; border: 1px solid #e3e3e3; color: #222; }`,

  'warm clay soft ui': `
    body { font-family: 'Nunito', 'Inter', sans-serif; color: #3e2a20; background: #f5ede6; font-size: 14px; line-height: 1.52; }
    h1 { font-size: 2.3rem; font-weight: 700; letter-spacing: -0.02em; }
    h2 { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.015em; }
    h3 { font-size: 1.35rem; font-weight: 600; }
    button { border-radius: 14px; border: 1px solid #d5bfae; background: #c96a4a; color: #fff9f5; padding: 10px 18px; box-shadow: 0 4px 14px rgba(113,69,48,0.18); }
    input, select, textarea { border-radius: 12px; border: 1px solid #cfb7a6; background: #fffaf6; color: #3e2a20; padding: 10px 12px; }
    [data-type="card"] { border-radius: 18px; border: 1px solid #d9c4b2; background: #fbf6f1; box-shadow: 0 8px 24px rgba(126,89,64,0.09); }
    [data-type="badge"] { border-radius: 9999px; border: 1px solid #d0b8a5; background: #efe4d9; color: #6a4a39; }
    [data-type="navbar"] { border-bottom: 1px solid #d9c5b4; background: rgba(251,246,241,0.88); }`,
};

export function renderTreeToHTML(tree: ComponentTree): string {
  const { width, height } = tree.metadata.viewport;
  const body = renderNode(tree.root);
  const ds = tree.metadata.designSystem?.toLowerCase() ?? '';
  const dsCSS = DESIGN_SYSTEM_CSS[ds] ?? '';
  const fontParam = DESIGN_SYSTEM_FONTS[ds] ?? '';
  const fontLink = fontParam
    ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${fontParam}&display=swap" rel="stylesheet">`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${fontLink}
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #111827;
    background: #ffffff;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  }
  h1, h2, h3, h4, h5, h6 { margin: 0; font-size: inherit; font-weight: inherit; }
  p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; cursor: pointer; border: none; background: none; padding: 0; line-height: 1.5; }
  input, select, textarea { font: inherit; line-height: 1.43; }
  ::placeholder { color: #9ca3af; opacity: 1; }
  hr { border: none; margin: 0; }
  ul, ol { list-style: none; margin: 0; padding: 0; }
  img { display: block; max-width: 100%; }
  svg { flex-shrink: 0; }
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
