import type { ThemeTokens } from './ui-templates';

/* ─── Size constants ────────────────────────────────────── */

const SMALL_W = 320;
const SMALL_H = 160;
const LARGE_W = 320;
const LARGE_H = 240;

/** Component names that use the smaller 320×160 canvas */
const SMALL_COMPONENTS = new Set([
  'button', 'badge', 'tag', 'chip', 'toggle', 'switch',
  'checkbox', 'radio', 'slider', 'input', 'text field',
  'label', 'link', 'separator', 'divider', 'progress',
  'progress bar', 'spinner', 'loader', 'avatar', 'icon',
  'tooltip',
]);

/* ─── Helpers ───────────────────────────────────────────── */

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isGlassTheme(t: ThemeTokens): boolean {
  return t.radius === '16px' && t.bg.startsWith('linear-gradient');
}

function glassCSS(t: ThemeTokens): string {
  return isGlassTheme(t)
    ? 'backdrop-filter: blur(20px) saturate(1.8); -webkit-backdrop-filter: blur(20px) saturate(1.8);'
    : '';
}

/** Wraps inner HTML in a full page document with CSS reset and theming */
function wrap(t: ThemeTokens, bodyContent: string, extraStyles = ''): string {
  const glass = isGlassTheme(t);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 100%; height: 100%;
  font-family: ${t.fontFamily};
  color: ${t.text};
  background: ${t.bg};
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}
.preview-wrapper {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.surface {
  background: ${t.surface};
  border: 1px solid ${t.border};
  border-radius: ${t.radius};
  box-shadow: ${t.shadow};
  ${glass ? glassCSS(t) : ''}
}
${extraStyles}
</style>
</head>
<body>
<div class="preview-wrapper">
${bodyContent}
</div>
</body>
</html>`;
}

/* ─── Component renderers ───────────────────────────────── */

function renderButton(t: ThemeTokens): string {
  const btnBase = `
    display: inline-flex; align-items: center; justify-content: center;
    padding: 8px 16px; font-size: 13px; font-weight: 500;
    border-radius: ${t.radiusSm}; cursor: pointer;
    font-family: ${t.fontFamily}; transition: background 0.15s;
    border: none; line-height: 1.4;
  `;
  return wrap(t, `
    <div style="display: flex; gap: 10px; align-items: center;">
      <button style="${btnBase} background: ${t.primary}; color: ${t.primaryText};">Primary</button>
      <button style="${btnBase} background: ${t.surface}; color: ${t.text}; border: 1px solid ${t.border}; ${glassCSS(t)}">Secondary</button>
      <button style="${btnBase} background: transparent; color: ${t.primary}; border: 1px solid ${t.primary};">Outline</button>
    </div>
  `);
}

function renderInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width: 260px;">
      <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${t.text};">Email address</label>
      <input type="text" readonly style="
        width: 100%; padding: 8px 12px; font-size: 13px;
        background: ${t.inputBg}; color: ${t.text};
        border: 1px solid ${t.inputBorder}; border-radius: ${t.radiusSm};
        font-family: ${t.fontFamily}; outline: none;
        ${glassCSS(t)}
      " value="" placeholder="you@example.com"/>
      <p style="font-size: 11px; color: ${t.textMuted}; margin-top: 4px;">We'll never share your email.</p>
    </div>
  `);
}

function renderTextarea(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width: 260px;">
      <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${t.text};">Message</label>
      <div style="
        width: 100%; height: 72px; padding: 8px 12px; font-size: 13px;
        background: ${t.inputBg}; color: ${t.textMuted};
        border: 1px solid ${t.inputBorder}; border-radius: ${t.radiusSm};
        font-family: ${t.fontFamily}; resize: none; line-height: 1.5;
        ${glassCSS(t)}
      ">Type your message here...</div>
    </div>
  `);
}

function renderCard(t: ThemeTokens): string {
  return wrap(t, `
    <div class="surface" style="width: 260px; padding: 20px;">
      <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${escapeHTML('Card Title')}</h3>
      <p style="font-size: 12px; color: ${t.textMuted}; margin-bottom: 16px;">This is a card description with supporting text for the user.</p>
      <button style="
        padding: 7px 14px; font-size: 12px; font-weight: 500;
        background: ${t.primary}; color: ${t.primaryText};
        border: none; border-radius: ${t.radiusSm}; cursor: pointer;
        font-family: ${t.fontFamily};
      ">Action</button>
    </div>
  `);
}

function renderDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position: relative; width: 280px;">
      <div style="position: absolute; inset: -20px; background: rgba(0,0,0,0.4); border-radius: ${t.radiusLg};"></div>
      <div class="surface" style="position: relative; padding: 20px; width: 100%; ${glassCSS(t)}">
        <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Confirm Action</h3>
        <p style="font-size: 12px; color: ${t.textMuted}; margin-bottom: 18px;">Are you sure you want to continue? This action cannot be undone.</p>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button style="
            padding: 6px 14px; font-size: 12px; font-weight: 500;
            background: ${t.surface}; color: ${t.text};
            border: 1px solid ${t.border}; border-radius: ${t.radiusSm}; cursor: pointer;
            font-family: ${t.fontFamily}; ${glassCSS(t)}
          ">Cancel</button>
          <button style="
            padding: 6px 14px; font-size: 12px; font-weight: 500;
            background: ${t.primary}; color: ${t.primaryText};
            border: none; border-radius: ${t.radiusSm}; cursor: pointer;
            font-family: ${t.fontFamily};
          ">Continue</button>
        </div>
      </div>
    </div>
  `);
}

function renderCheckbox(t: ThemeTokens): string {
  const items = [
    { label: 'Option A', checked: true },
    { label: 'Option B', checked: false },
    { label: 'Option C', checked: false },
  ];
  const boxes = items.map(i => `
    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
      <span style="
        width: 16px; height: 16px; border-radius: ${t.radiusSm};
        border: ${i.checked ? 'none' : `1.5px solid ${t.inputBorder}`};
        background: ${i.checked ? t.primary : t.inputBg};
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      ">${i.checked ? `<span style="color: ${t.primaryText}; font-size: 11px; line-height: 1;">&#10003;</span>` : ''}</span>
      ${escapeHTML(i.label)}
    </label>
  `).join('');
  return wrap(t, `<div style="display: flex; flex-direction: column; gap: 12px;">${boxes}</div>`);
}

function renderRadio(t: ThemeTokens): string {
  const items = [
    { label: 'Small', checked: false },
    { label: 'Medium', checked: true },
    { label: 'Large', checked: false },
  ];
  const radios = items.map(i => `
    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
      <span style="
        width: 16px; height: 16px; border-radius: 50%;
        border: 2px solid ${i.checked ? t.primary : t.inputBorder};
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; background: ${t.inputBg};
      ">${i.checked ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${t.primary};"></span>` : ''}</span>
      ${escapeHTML(i.label)}
    </label>
  `).join('');
  return wrap(t, `<div style="display: flex; flex-direction: column; gap: 12px;">${radios}</div>`);
}

function renderSwitch(t: ThemeTokens): string {
  const renderOne = (on: boolean, label: string) => {
    const trackBg = on ? t.primary : t.inputBorder;
    const thumbLeft = on ? '20px' : '2px';
    return `
      <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer;">
        <span style="
          width: 40px; height: 22px; border-radius: 11px;
          background: ${trackBg}; position: relative;
          display: inline-block; transition: background 0.2s;
        ">
          <span style="
            position: absolute; top: 2px; left: ${thumbLeft};
            width: 18px; height: 18px; border-radius: 50%;
            background: ${t.primaryText}; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            transition: left 0.2s;
          "></span>
        </span>
        ${escapeHTML(label)}
      </label>
    `;
  };
  return wrap(t, `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${renderOne(true, 'Notifications')}
      ${renderOne(false, 'Dark mode')}
    </div>
  `);
}

function renderSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width: 240px;">
      <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${t.text};">Framework</label>
      <div style="
        width: 100%; padding: 8px 12px; font-size: 13px;
        background: ${t.inputBg}; color: ${t.text};
        border: 1px solid ${t.inputBorder}; border-radius: ${t.radiusSm};
        display: flex; align-items: center; justify-content: space-between;
        ${glassCSS(t)}
      ">
        <span>Select an option…</span>
        <span style="font-size: 10px; color: ${t.textMuted};">&#9660;</span>
      </div>
    </div>
  `);
}

function renderTabs(t: ThemeTokens): string {
  const tabs = ['Overview', 'Analytics', 'Settings'];
  const tabItems = tabs.map((label, i) => {
    const active = i === 0;
    return `<span style="
      padding: 8px 16px; font-size: 13px; font-weight: ${active ? '600' : '400'};
      color: ${active ? t.text : t.textMuted};
      border-bottom: 2px solid ${active ? t.primary : 'transparent'};
      cursor: pointer;
    ">${escapeHTML(label)}</span>`;
  }).join('');
  return wrap(t, `
    <div style="width: 280px;">
      <div style="display: flex; border-bottom: 1px solid ${t.border};">${tabItems}</div>
      <div class="surface" style="padding: 16px; border-top: none; border-radius: 0 0 ${t.radiusSm} ${t.radiusSm}; font-size: 12px; color: ${t.textMuted}; ${glassCSS(t)}">
        Overview content goes here. This tab is currently active.
      </div>
    </div>
  `);
}

function renderBadge(t: ThemeTokens): string {
  const badges = [
    { label: 'Default', bg: t.primary, color: t.primaryText },
    { label: 'Success', bg: t.success, color: '#ffffff' },
    { label: 'Warning', bg: t.warning, color: '#000000' },
    { label: 'Danger', bg: t.danger, color: '#ffffff' },
  ];
  const els = badges.map(b => `
    <span style="
      padding: 3px 10px; font-size: 11px; font-weight: 600;
      background: ${b.bg}; color: ${b.color};
      border-radius: 9999px; display: inline-block;
    ">${escapeHTML(b.label)}</span>
  `).join('');
  return wrap(t, `<div style="display: flex; gap: 8px; flex-wrap: wrap;">${els}</div>`);
}

function renderAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="
        width: 48px; height: 48px; border-radius: 50%;
        background: ${t.primary}; color: ${t.primaryText};
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; font-weight: 600; flex-shrink: 0;
      ">JD</div>
      <div>
        <div style="font-size: 14px; font-weight: 600; color: ${t.text};">Jane Doe</div>
        <div style="font-size: 12px; color: ${t.textMuted};">jane@example.com</div>
      </div>
    </div>
  `);
}

function renderAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div class="surface" style="width: 280px; padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; border-left: 3px solid ${t.primary}; ${glassCSS(t)}">
      <span style="font-size: 18px; line-height: 1; color: ${t.primary}; flex-shrink: 0;">&#9432;</span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">Heads up!</div>
        <div style="font-size: 12px; color: ${t.textMuted};">You can add components to your app using the CLI.</div>
      </div>
      <span style="font-size: 16px; cursor: pointer; color: ${t.textMuted}; flex-shrink: 0; line-height: 1;">&times;</span>
    </div>
  `);
}

function renderProgress(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width: 260px;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
        <span style="font-weight: 500;">Uploading…</span>
        <span style="color: ${t.textMuted};">65%</span>
      </div>
      <div style="
        width: 100%; height: 8px; background: ${t.surfaceHover};
        border-radius: 4px; overflow: hidden;
      ">
        <div style="width: 65%; height: 100%; background: ${t.primary}; border-radius: 4px;"></div>
      </div>
    </div>
  `);
}

function renderSlider(t: ThemeTokens): string {
  const pct = 40;
  return wrap(t, `
    <div style="width: 240px;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
        <span style="font-weight: 500;">Volume</span>
        <span style="color: ${t.textMuted};">${pct}%</span>
      </div>
      <div style="position: relative; width: 100%; height: 6px; background: ${t.surfaceHover}; border-radius: 3px;">
        <div style="width: ${pct}%; height: 100%; background: ${t.primary}; border-radius: 3px;"></div>
        <div style="
          position: absolute; top: 50%; left: ${pct}%;
          width: 16px; height: 16px; border-radius: 50%;
          background: ${t.primary}; border: 2px solid ${t.primaryText};
          transform: translate(-50%, -50%); box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        "></div>
      </div>
    </div>
  `);
}

function renderAccordion(t: ThemeTokens): string {
  const items = [
    { title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.', open: true },
    { title: 'Is it styled?', content: '', open: false },
    { title: 'Is it animated?', content: '', open: false },
  ];
  const els = items.map(i => `
    <div style="border-bottom: 1px solid ${t.border};">
      <div style="
        padding: 12px 0; font-size: 13px; font-weight: 500;
        display: flex; justify-content: space-between; align-items: center;
        cursor: pointer;
      ">
        ${escapeHTML(i.title)}
        <span style="font-size: 10px; color: ${t.textMuted}; transform: rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding-bottom: 12px; font-size: 12px; color: ${t.textMuted};">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width: 270px;">${els}</div>`);
}

function renderTable(t: ThemeTokens): string {
  const headers = ['Name', 'Status', 'Role'];
  const rows = [
    ['Alice', 'Active', 'Admin'],
    ['Bob', 'Inactive', 'Editor'],
    ['Carol', 'Active', 'Viewer'],
  ];
  const thStyle = `padding: 8px 12px; font-size: 12px; font-weight: 600; text-align: left; color: ${t.textMuted}; border-bottom: 1px solid ${t.border};`;
  const tdStyle = `padding: 8px 12px; font-size: 12px; border-bottom: 1px solid ${t.border};`;
  return wrap(t, `
    <div class="surface" style="width: 288px; overflow: hidden; ${glassCSS(t)}">
      <table style="width: 100%; border-collapse: collapse;">
        <thead><tr>${headers.map(h => `<th style="${thStyle}">${escapeHTML(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td style="${tdStyle}">${escapeHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  `);
}

function renderBreadcrumb(t: ThemeTokens): string {
  const crumbs = ['Home', 'Products', 'Widget'];
  const els = crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    const style = isLast
      ? `font-size: 13px; color: ${t.text}; font-weight: 500;`
      : `font-size: 13px; color: ${t.textMuted}; cursor: pointer; text-decoration: none;`;
    const sep = !isLast ? `<span style="margin: 0 6px; color: ${t.textMuted}; font-size: 11px;">/</span>` : '';
    return `<span style="${style}">${escapeHTML(c)}</span>${sep}`;
  }).join('');
  return wrap(t, `<div style="display: flex; align-items: center;">${els}</div>`);
}

function renderPagination(t: ThemeTokens): string {
  const pages = [1, 2, 3, 4, 5];
  const active = 2;
  const els = pages.map(p => {
    const isActive = p === active;
    return `<span style="
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: ${isActive ? '600' : '400'};
      background: ${isActive ? t.primary : 'transparent'};
      color: ${isActive ? t.primaryText : t.text};
      border-radius: ${t.radiusSm}; cursor: pointer;
      border: ${isActive ? 'none' : `1px solid ${t.border}`};
    ">${p}</span>`;
  }).join('');
  return wrap(t, `
    <div style="display: flex; align-items: center; gap: 4px;">
      <span style="font-size: 13px; color: ${t.textMuted}; padding: 0 6px; cursor: pointer;">&laquo;</span>
      ${els}
      <span style="font-size: 13px; color: ${t.textMuted}; padding: 0 6px; cursor: pointer;">&raquo;</span>
    </div>
  `);
}

function renderTooltip(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="
        position: relative; background: ${t.text}; color: ${t.bg.startsWith('linear') ? '#ffffff' : t.bg};
        padding: 6px 12px; border-radius: ${t.radiusSm}; font-size: 12px;
        box-shadow: ${t.shadow};
      ">
        Tooltip text
        <span style="
          position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
          width: 0; height: 0; border-left: 5px solid transparent;
          border-right: 5px solid transparent; border-top: 5px solid ${t.text};
        "></span>
      </div>
      <button style="
        padding: 7px 14px; font-size: 12px;
        background: ${t.surface}; color: ${t.text};
        border: 1px solid ${t.border}; border-radius: ${t.radiusSm};
        cursor: pointer; font-family: ${t.fontFamily}; ${glassCSS(t)}
      ">Hover me</button>
    </div>
  `);
}

function renderNavbar(t: ThemeTokens): string {
  const links = ['Home', 'About', 'Services', 'Contact'];
  const navItems = links.map((l, i) => `
    <span style="
      font-size: 13px; font-weight: ${i === 0 ? '600' : '400'};
      color: ${i === 0 ? t.text : t.textMuted}; cursor: pointer;
    ">${escapeHTML(l)}</span>
  `).join('');
  return wrap(t, `
    <div class="surface" style="width: 288px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; ${glassCSS(t)}">
      <span style="font-size: 15px; font-weight: 700; color: ${t.primary};">Logo</span>
      <div style="display: flex; gap: 16px;">${navItems}</div>
    </div>
  `);
}

function renderSidebar(t: ThemeTokens): string {
  const items = [
    { label: 'Dashboard', icon: '&#9632;', active: true },
    { label: 'Projects', icon: '&#9733;', active: false },
    { label: 'Settings', icon: '&#9881;', active: false },
    { label: 'Help', icon: '&#9432;', active: false },
  ];
  const els = items.map(i => `
    <div style="
      padding: 8px 14px; font-size: 13px; display: flex; align-items: center; gap: 10px;
      background: ${i.active ? t.surfaceHover : 'transparent'};
      color: ${i.active ? t.text : t.textMuted};
      border-radius: ${t.radiusSm}; cursor: pointer; font-weight: ${i.active ? '500' : '400'};
    ">
      <span style="font-size: 14px;">${i.icon}</span>
      ${escapeHTML(i.label)}
    </div>
  `).join('');
  return wrap(t, `
    <div class="surface" style="width: 180px; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; ${glassCSS(t)}">
      <div style="font-size: 12px; font-weight: 700; color: ${t.textMuted}; padding: 6px 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Menu</div>
      ${els}
    </div>
  `);
}

function renderMenu(t: ThemeTokens): string {
  const items = [
    { label: 'Edit', shortcut: '⌘E' },
    { label: 'Duplicate', shortcut: '⌘D' },
    { separator: true },
    { label: 'Archive', shortcut: '' },
    { label: 'Delete', shortcut: '⌘⌫', danger: true },
  ];
  const els = items.map(i => {
    if ('separator' in i && i.separator) {
      return `<div style="height: 1px; background: ${t.border}; margin: 4px 0;"></div>`;
    }
    const color = (i as {danger?: boolean}).danger ? t.danger : t.text;
    return `
      <div style="
        padding: 7px 12px; font-size: 13px; display: flex; justify-content: space-between; align-items: center;
        color: ${color}; cursor: pointer; border-radius: ${t.radiusSm};
      ">
        <span>${escapeHTML((i as {label: string}).label)}</span>
        ${(i as {shortcut?: string}).shortcut ? `<span style="font-size: 11px; color: ${t.textMuted};">${(i as {shortcut: string}).shortcut}</span>` : ''}
      </div>
    `;
  }).join('');
  return wrap(t, `
    <div class="surface" style="width: 200px; padding: 6px; ${glassCSS(t)}">
      ${els}
    </div>
  `);
}

function renderSkeleton(t: ThemeTokens): string {
  const pulseCSS = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .skel { animation: pulse 1.5s ease-in-out infinite; }
  `;
  return wrap(t, `
    <div style="width: 260px; display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <div class="skel" style="width: 40px; height: 40px; border-radius: 50%; background: ${t.surfaceHover}; flex-shrink: 0;"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <div class="skel" style="height: 12px; width: 70%; border-radius: 4px; background: ${t.surfaceHover};"></div>
          <div class="skel" style="height: 10px; width: 50%; border-radius: 4px; background: ${t.surfaceHover};"></div>
        </div>
      </div>
      <div class="skel" style="height: 10px; width: 100%; border-radius: 4px; background: ${t.surfaceHover};"></div>
      <div class="skel" style="height: 10px; width: 90%; border-radius: 4px; background: ${t.surfaceHover};"></div>
      <div class="skel" style="height: 10px; width: 60%; border-radius: 4px; background: ${t.surfaceHover};"></div>
    </div>
  `, pulseCSS);
}

function renderSpinner(t: ThemeTokens): string {
  const spinCSS = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid ${t.surfaceHover};
      border-top-color: ${t.primary};
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `;
  return wrap(t, `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
      <div class="spinner"></div>
      <span style="font-size: 12px; color: ${t.textMuted};">Loading…</span>
    </div>
  `, spinCSS);
}

function renderSeparator(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width: 240px; display: flex; flex-direction: column; gap: 12px;">
      <span style="font-size: 13px; color: ${t.text};">Section A</span>
      <div style="height: 1px; background: ${t.border}; width: 100%;"></div>
      <span style="font-size: 13px; color: ${t.text};">Section B</span>
    </div>
  `);
}

function renderLabel(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <span style="font-size: 13px; font-weight: 500; color: ${t.text};">Username</span>
      <span style="font-size: 11px; color: ${t.textMuted};">Enter your unique username.</span>
    </div>
  `);
}

function renderLink(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display: flex; gap: 16px; align-items: center;">
      <span style="font-size: 13px; color: ${t.primary}; text-decoration: underline; cursor: pointer;">Default link</span>
      <span style="font-size: 13px; color: ${t.textMuted}; text-decoration: underline; cursor: pointer;">Muted link</span>
    </div>
  `);
}

function renderIcon(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display: flex; gap: 16px; align-items: center;">
      <span style="font-size: 24px; color: ${t.primary};">&#9733;</span>
      <span style="font-size: 24px; color: ${t.success};">&#10003;</span>
      <span style="font-size: 24px; color: ${t.danger};">&#10005;</span>
      <span style="font-size: 24px; color: ${t.warning};">&#9888;</span>
      <span style="font-size: 24px; color: ${t.textMuted};">&#9881;</span>
    </div>
  `);
}

function renderGeneric(t: ThemeTokens, componentName: string, category: string | undefined): string {
  return wrap(t, `
    <div class="surface" style="width: 260px; padding: 24px; text-align: center; ${glassCSS(t)}">
      <div style="
        width: 48px; height: 48px; border-radius: ${t.radius};
        background: ${t.primary}; color: ${t.primaryText};
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; font-weight: 700; margin: 0 auto 14px;
      ">${escapeHTML(componentName.charAt(0).toUpperCase())}</div>
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${escapeHTML(componentName)}</div>
      ${category ? `<div style="font-size: 12px; color: ${t.textMuted};">${escapeHTML(category)}</div>` : ''}
    </div>
  `);
}

/* ─── Main export ───────────────────────────────────────── */

export function generateComponentPreviewHTML(
  componentName: string,
  category: string | undefined,
  _libraryName: string | undefined,
  theme: ThemeTokens,
): { html: string; width: number; height: number } {
  const key = componentName.toLowerCase().trim();

  // Determine size
  const isSmall = SMALL_COMPONENTS.has(key);
  const width = isSmall ? SMALL_W : LARGE_W;
  const height = isSmall ? SMALL_H : LARGE_H;

  let html: string;

  // Match component type
  if (key === 'button') {
    html = renderButton(theme);
  } else if (key === 'input' || key === 'text field') {
    html = renderInput(theme);
  } else if (key === 'textarea') {
    html = renderTextarea(theme);
  } else if (key === 'card') {
    html = renderCard(theme);
  } else if (key === 'dialog' || key === 'modal') {
    html = renderDialog(theme);
  } else if (key === 'checkbox') {
    html = renderCheckbox(theme);
  } else if (key === 'radio' || key === 'radio group') {
    html = renderRadio(theme);
  } else if (key === 'switch' || key === 'toggle') {
    html = renderSwitch(theme);
  } else if (key === 'select' || key === 'dropdown') {
    html = renderSelect(theme);
  } else if (key === 'tabs') {
    html = renderTabs(theme);
  } else if (key === 'badge' || key === 'tag' || key === 'chip') {
    html = renderBadge(theme);
  } else if (key === 'avatar') {
    html = renderAvatar(theme);
  } else if (key === 'alert' || key === 'notification' || key === 'toast') {
    html = renderAlert(theme);
  } else if (key === 'progress' || key === 'progress bar') {
    html = renderProgress(theme);
  } else if (key === 'slider') {
    html = renderSlider(theme);
  } else if (key === 'accordion') {
    html = renderAccordion(theme);
  } else if (key === 'table' || key === 'data table' || key === 'data grid') {
    html = renderTable(theme);
  } else if (key === 'breadcrumb') {
    html = renderBreadcrumb(theme);
  } else if (key === 'pagination') {
    html = renderPagination(theme);
  } else if (key === 'tooltip') {
    html = renderTooltip(theme);
  } else if (key === 'navigation bar' || key === 'navbar' || key === 'navigation menu' || key === 'menubar') {
    html = renderNavbar(theme);
  } else if (key === 'sidebar') {
    html = renderSidebar(theme);
  } else if (key === 'menu' || key === 'context menu' || key === 'dropdown menu') {
    html = renderMenu(theme);
  } else if (key === 'skeleton') {
    html = renderSkeleton(theme);
  } else if (key === 'spinner' || key === 'loader') {
    html = renderSpinner(theme);
  } else if (key === 'separator' || key === 'divider') {
    html = renderSeparator(theme);
  } else if (key === 'label') {
    html = renderLabel(theme);
  } else if (key === 'link') {
    html = renderLink(theme);
  } else if (key === 'icon') {
    html = renderIcon(theme);
  } else {
    html = renderGeneric(theme, componentName, category);
  }

  return { html, width, height };
}
