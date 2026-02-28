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

/* ═══════════════════════════════════════════════════════════
   Library-specific component renderers
   ═══════════════════════════════════════════════════════════ */

type Renderer = (t: ThemeTokens) => string;

/* ─── shadcn/ui ─────────────────────────────────────────── */

function shadcnButton(t: ThemeTokens): string {
  const base = `display:inline-flex;align-items:center;justify-content:center;font-family:'Inter',-apple-system,sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s;line-height:1;white-space:nowrap;`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:#fafafa;color:#09090b;border:none;">Primary</button>
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:#27272a;color:#fafafa;border:none;">Secondary</button>
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#fafafa;border:1px solid #27272a;">Outline</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#fafafa;border:none;">Ghost</button>
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:#ef4444;color:#fafafa;border:none;">Destructive</button>
        <button style="${base}height:36px;padding:0 10px;border-radius:6px;background:#fafafa;color:#09090b;border:none;font-size:16px;">+</button>
      </div>
    </div>
  `);
}

function shadcnInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;display:flex;flex-direction:column;gap:6px;font-family:'Inter',-apple-system,sans-serif;">
      <label style="font-size:14px;font-weight:500;color:#fafafa;">Email</label>
      <div style="height:36px;padding:0 12px;font-size:14px;background:#09090b;color:#a1a1aa;border:1px solid #27272a;border-radius:6px;display:flex;align-items:center;">you@example.com</div>
      <p style="font-size:12px;color:#a1a1aa;">Enter your email address.</p>
    </div>
  `);
}

function shadcnCard(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:#09090b;border:1px solid #27272a;border-radius:8px;overflow:hidden;font-family:'Inter',-apple-system,sans-serif;">
      <div style="padding:20px 20px 0;">
        <div style="font-size:16px;font-weight:600;color:#fafafa;margin-bottom:4px;">Create project</div>
        <div style="font-size:13px;color:#a1a1aa;">Deploy your new project in one-click.</div>
      </div>
      <div style="padding:16px 20px;">
        <div style="font-size:13px;font-weight:500;color:#fafafa;margin-bottom:6px;">Name</div>
        <div style="height:36px;padding:0 12px;background:#09090b;border:1px solid #27272a;border-radius:6px;color:#a1a1aa;font-size:14px;display:flex;align-items:center;">My Project</div>
      </div>
      <div style="padding:0 20px 20px;display:flex;justify-content:flex-end;gap:8px;">
        <button style="height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#fafafa;border:1px solid #27272a;font-size:14px;font-weight:500;cursor:pointer;">Cancel</button>
        <button style="height:36px;padding:0 16px;border-radius:6px;background:#fafafa;color:#09090b;border:none;font-size:14px;font-weight:500;cursor:pointer;">Deploy</button>
      </div>
    </div>
  `);
}

function shadcnSwitch(t: ThemeTokens): string {
  const on = (label: string, checked: boolean) => `
    <label style="display:flex;align-items:center;gap:10px;font-size:14px;color:#fafafa;cursor:pointer;font-family:'Inter',-apple-system,sans-serif;">
      <span style="width:44px;height:24px;border-radius:12px;background:${checked ? '#fafafa' : '#27272a'};position:relative;display:inline-block;">
        <span style="position:absolute;top:2px;left:${checked ? '22px' : '2px'};width:20px;height:20px;border-radius:50%;background:${checked ? '#09090b' : '#a1a1aa'};transition:left .2s;"></span>
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${on('Airplane Mode', true)}
      ${on('Bluetooth', false)}
    </div>
  `);
}

function shadcnBadge(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:6px;flex-wrap:wrap;font-family:'Inter',-apple-system,sans-serif;">
      <span style="padding:2px 10px;font-size:12px;font-weight:600;background:#fafafa;color:#09090b;border-radius:9999px;">Default</span>
      <span style="padding:2px 10px;font-size:12px;font-weight:600;background:#27272a;color:#fafafa;border-radius:9999px;">Secondary</span>
      <span style="padding:2px 10px;font-size:12px;font-weight:600;background:#ef4444;color:#fafafa;border-radius:9999px;">Destructive</span>
      <span style="padding:2px 10px;font-size:12px;font-weight:600;background:transparent;color:#fafafa;border:1px solid #27272a;border-radius:9999px;">Outline</span>
    </div>
  `);
}

function shadcnCheckbox(t: ThemeTokens): string {
  const item = (label: string, checked: boolean) => `
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#fafafa;cursor:pointer;font-family:'Inter',-apple-system,sans-serif;">
      <span style="width:16px;height:16px;border-radius:4px;border:${checked ? 'none' : '1px solid #27272a'};background:${checked ? '#fafafa' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${checked ? '<span style="color:#09090b;font-size:11px;">&#10003;</span>' : ''}
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${item('Accept terms and conditions', true)}
      ${item('Send notifications', false)}
    </div>
  `);
}

function shadcnSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;font-family:'Inter',-apple-system,sans-serif;">
      <label style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;color:#fafafa;">Framework</label>
      <div style="height:36px;padding:0 12px;background:#09090b;border:1px solid #27272a;border-radius:6px;display:flex;align-items:center;justify-content:space-between;color:#a1a1aa;font-size:14px;">
        <span>Select framework…</span>
        <span style="font-size:10px;">&#9660;</span>
      </div>
    </div>
  `);
}

function shadcnTabs(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;font-family:'Inter',-apple-system,sans-serif;">
      <div style="display:flex;background:#18181b;border-radius:6px;padding:4px;gap:2px;margin-bottom:12px;">
        <span style="flex:1;text-align:center;padding:6px 12px;font-size:13px;font-weight:500;background:#27272a;color:#fafafa;border-radius:4px;">Account</span>
        <span style="flex:1;text-align:center;padding:6px 12px;font-size:13px;font-weight:400;color:#a1a1aa;border-radius:4px;">Password</span>
      </div>
      <div style="background:#09090b;border:1px solid #27272a;border-radius:8px;padding:16px;">
        <div style="font-size:14px;font-weight:600;color:#fafafa;margin-bottom:4px;">Account</div>
        <div style="font-size:13px;color:#a1a1aa;">Make changes to your account here.</div>
      </div>
    </div>
  `);
}

function shadcnTable(t: ThemeTokens): string {
  const th = `padding:8px 12px;font-size:12px;font-weight:500;text-align:left;color:#a1a1aa;border-bottom:1px solid #27272a;`;
  const td = `padding:8px 12px;font-size:13px;color:#fafafa;border-bottom:1px solid #27272a;`;
  return wrap(t, `
    <div style="width:288px;border:1px solid #27272a;border-radius:8px;overflow:hidden;font-family:'Inter',-apple-system,sans-serif;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${th}">Name</th><th style="${th}">Status</th><th style="${th}">Role</th></tr></thead>
        <tbody>
          <tr><td style="${td}">Alice</td><td style="${td}"><span style="padding:2px 8px;background:#27272a;border-radius:9999px;font-size:11px;">Active</span></td><td style="${td}">Admin</td></tr>
          <tr><td style="${td}">Bob</td><td style="${td}"><span style="padding:2px 8px;background:#27272a;border-radius:9999px;font-size:11px;">Inactive</span></td><td style="${td}">Editor</td></tr>
          <tr><td style="${td};border-bottom:none;">Carol</td><td style="${td};border-bottom:none;"><span style="padding:2px 8px;background:#27272a;border-radius:9999px;font-size:11px;">Active</span></td><td style="${td};border-bottom:none;">Viewer</td></tr>
        </tbody>
      </table>
    </div>
  `);
}

function shadcnDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position:relative;width:300px;">
      <div style="position:absolute;inset:-16px;background:rgba(0,0,0,0.6);border-radius:10px;"></div>
      <div style="position:relative;background:#09090b;border:1px solid #27272a;border-radius:8px;padding:24px;font-family:'Inter',-apple-system,sans-serif;">
        <div style="font-size:16px;font-weight:600;color:#fafafa;margin-bottom:4px;">Are you absolutely sure?</div>
        <div style="font-size:13px;color:#a1a1aa;margin-bottom:20px;">This action cannot be undone.</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button style="height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#fafafa;border:1px solid #27272a;font-size:14px;cursor:pointer;">Cancel</button>
          <button style="height:36px;padding:0 16px;border-radius:6px;background:#fafafa;color:#09090b;border:none;font-size:14px;cursor:pointer;">Continue</button>
        </div>
      </div>
    </div>
  `);
}

function shadcnAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;border:1px solid #27272a;border-radius:8px;padding:16px;font-family:'Inter',-apple-system,sans-serif;">
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <span style="font-size:16px;color:#fafafa;flex-shrink:0;">&#9432;</span>
        <div>
          <div style="font-size:14px;font-weight:600;color:#fafafa;margin-bottom:2px;">Heads up!</div>
          <div style="font-size:13px;color:#a1a1aa;">You can add components to your app using the CLI.</div>
        </div>
      </div>
    </div>
  `);
}

function shadcnAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:12px;font-family:'Inter',-apple-system,sans-serif;">
      <div style="width:40px;height:40px;border-radius:9999px;background:#27272a;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fafafa;">CN</div>
      <div style="width:40px;height:40px;border-radius:9999px;background:#3f3f46;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fafafa;">JD</div>
      <div style="width:40px;height:40px;border-radius:9999px;background:#fafafa;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#09090b;">AB</div>
    </div>
  `);
}

function shadcnAccordion(t: ThemeTokens): string {
  const items = [
    { title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.', open: true },
    { title: 'Is it styled?', content: '', open: false },
    { title: 'Is it animated?', content: '', open: false },
  ];
  const els = items.map(i => `
    <div style="border-bottom:1px solid #27272a;">
      <div style="padding:14px 0;font-size:14px;font-weight:500;display:flex;justify-content:space-between;align-items:center;cursor:pointer;color:#fafafa;">
        ${escapeHTML(i.title)}
        <span style="font-size:10px;color:#a1a1aa;transform:rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding-bottom:14px;font-size:13px;color:#a1a1aa;">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width:280px;font-family:'Inter',-apple-system,sans-serif;">${els}</div>`);
}

/* ─── Material UI 3 ─────────────────────────────────────── */

function materialButton(t: ThemeTokens): string {
  const base = `display:inline-flex;align-items:center;justify-content:center;font-family:'Roboto','Helvetica','Arial',sans-serif;font-size:14px;font-weight:500;letter-spacing:0.02em;cursor:pointer;transition:all .2s;line-height:1;white-space:nowrap;`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:40px;padding:0 24px;border-radius:20px;background:#1976d2;color:#ffffff;border:none;box-shadow:0 2px 4px rgba(0,0,0,0.2);">Filled</button>
        <button style="${base}height:40px;padding:0 24px;border-radius:20px;background:transparent;color:#1976d2;border:1px solid #bdbdbd;">Outlined</button>
        <button style="${base}height:40px;padding:0 12px;border-radius:20px;background:transparent;color:#1976d2;border:none;">Text</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:40px;padding:0 24px;border-radius:20px;background:#e8def8;color:#1d192b;border:none;">Tonal</button>
        <button style="${base}width:56px;height:56px;border-radius:16px;background:#e8def8;color:#4a4458;border:none;box-shadow:0 3px 6px rgba(0,0,0,0.16);font-size:24px;">+</button>
      </div>
    </div>
  `);
}

function materialInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;display:flex;flex-direction:column;gap:16px;font-family:'Roboto','Helvetica','Arial',sans-serif;">
      <div style="position:relative;border:1px solid #bdbdbd;border-radius:4px;padding:16px 16px 8px;">
        <label style="position:absolute;top:-8px;left:12px;font-size:12px;color:#1976d2;background:#fafafa;padding:0 4px;">Email *</label>
        <div style="font-size:16px;color:#212121;">user@example.com</div>
      </div>
      <div style="position:relative;background:#e8e8e8;border-radius:4px 4px 0 0;padding:16px 16px 8px;border-bottom:2px solid #1976d2;">
        <label style="font-size:12px;color:#1976d2;display:block;margin-bottom:4px;">Password</label>
        <div style="font-size:16px;color:#212121;">••••••••</div>
      </div>
    </div>
  `);
}

function materialCard(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:#ffffff;border-radius:12px;box-shadow:0 2px 1px -1px rgba(0,0,0,0.2),0 1px 1px rgba(0,0,0,0.14),0 1px 3px rgba(0,0,0,0.12);overflow:hidden;font-family:'Roboto','Helvetica','Arial',sans-serif;">
      <div style="height:80px;background:linear-gradient(135deg,#42a5f5,#1976d2);"></div>
      <div style="padding:16px;">
        <div style="font-size:16px;font-weight:500;color:#212121;margin-bottom:4px;">Card Title</div>
        <div style="font-size:14px;color:#757575;margin-bottom:16px;">Supporting text for the card component with additional context.</div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button style="padding:0 12px;height:36px;font-size:14px;font-weight:500;color:#1976d2;background:transparent;border:none;border-radius:20px;cursor:pointer;">Cancel</button>
          <button style="padding:0 24px;height:36px;font-size:14px;font-weight:500;color:#ffffff;background:#1976d2;border:none;border-radius:20px;cursor:pointer;">Action</button>
        </div>
      </div>
    </div>
  `);
}

function materialSwitch(t: ThemeTokens): string {
  const sw = (label: string, on: boolean) => `
    <label style="display:flex;align-items:center;gap:12px;font-size:14px;color:#212121;cursor:pointer;font-family:'Roboto',sans-serif;">
      <span style="width:52px;height:32px;border-radius:16px;background:${on ? '#1976d2' : '#e0e0e0'};position:relative;display:inline-block;">
        <span style="position:absolute;top:4px;left:${on ? '24px' : '4px'};width:24px;height:24px;border-radius:50%;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:left .2s;"></span>
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:16px;">${sw('Wi-Fi', true)}${sw('Bluetooth', false)}</div>`);
}

function materialBadge(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:10px;flex-wrap:wrap;font-family:'Roboto',sans-serif;">
      <span style="height:32px;padding:0 12px;font-size:13px;font-weight:500;background:#e8def8;color:#1d192b;border-radius:8px;display:inline-flex;align-items:center;">Assist</span>
      <span style="height:32px;padding:0 12px;font-size:13px;font-weight:500;background:transparent;color:#212121;border:1px solid #bdbdbd;border-radius:8px;display:inline-flex;align-items:center;">Filter</span>
      <span style="height:32px;padding:0 12px;font-size:13px;font-weight:500;background:#1976d2;color:#ffffff;border-radius:8px;display:inline-flex;align-items:center;">Selected ✕</span>
      <span style="height:32px;padding:0 12px;font-size:13px;font-weight:500;background:#e8def8;color:#1d192b;border-radius:8px;display:inline-flex;align-items:center;">Suggestion</span>
    </div>
  `);
}

function materialCheckbox(t: ThemeTokens): string {
  const item = (label: string, checked: boolean) => `
    <label style="display:flex;align-items:center;gap:12px;font-size:14px;color:#212121;cursor:pointer;font-family:'Roboto',sans-serif;">
      <span style="width:18px;height:18px;border-radius:2px;border:${checked ? 'none' : '2px solid #757575'};background:${checked ? '#1976d2' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${checked ? '<span style="color:#ffffff;font-size:13px;font-weight:bold;">&#10003;</span>' : ''}
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:14px;">${item('Label', true)}${item('Label', false)}${item('Label', false)}</div>`);
}

function materialDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position:relative;width:300px;">
      <div style="position:absolute;inset:-16px;background:rgba(0,0,0,0.32);border-radius:16px;"></div>
      <div style="position:relative;background:#ffffff;border-radius:28px;padding:24px;font-family:'Roboto',sans-serif;box-shadow:0 8px 16px rgba(0,0,0,0.16);">
        <div style="font-size:24px;font-weight:400;color:#212121;margin-bottom:12px;">Delete item?</div>
        <div style="font-size:14px;color:#757575;margin-bottom:24px;">This item will be permanently removed.</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button style="height:40px;padding:0 24px;border-radius:20px;background:transparent;color:#1976d2;border:none;font-size:14px;font-weight:500;cursor:pointer;">Cancel</button>
          <button style="height:40px;padding:0 24px;border-radius:20px;background:#1976d2;color:#ffffff;border:none;font-size:14px;font-weight:500;cursor:pointer;">Delete</button>
        </div>
      </div>
    </div>
  `);
}

function materialTabs(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;font-family:'Roboto',sans-serif;">
      <div style="display:flex;border-bottom:1px solid #e0e0e0;">
        <span style="flex:1;text-align:center;padding:12px 16px;font-size:14px;font-weight:500;color:#1976d2;border-bottom:2px solid #1976d2;">Tab 1</span>
        <span style="flex:1;text-align:center;padding:12px 16px;font-size:14px;font-weight:500;color:#757575;">Tab 2</span>
        <span style="flex:1;text-align:center;padding:12px 16px;font-size:14px;font-weight:500;color:#757575;">Tab 3</span>
      </div>
      <div style="padding:16px;font-size:14px;color:#757575;">Tab 1 content displayed here.</div>
    </div>
  `);
}

function materialTable(t: ThemeTokens): string {
  const th = `padding:12px 16px;font-size:12px;font-weight:500;text-align:left;color:#757575;border-bottom:1px solid #e0e0e0;`;
  const td = `padding:12px 16px;font-size:14px;color:#212121;border-bottom:1px solid #f5f5f5;`;
  return wrap(t, `
    <div style="width:288px;background:#ffffff;border-radius:4px;box-shadow:0 2px 1px -1px rgba(0,0,0,0.2),0 1px 1px rgba(0,0,0,0.14),0 1px 3px rgba(0,0,0,0.12);overflow:hidden;font-family:'Roboto',sans-serif;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${th}">Name</th><th style="${th}">Status</th><th style="${th}">Role</th></tr></thead>
        <tbody>
          <tr><td style="${td}">Alice</td><td style="${td}">Active</td><td style="${td}">Admin</td></tr>
          <tr><td style="${td}">Bob</td><td style="${td}">Inactive</td><td style="${td}">Editor</td></tr>
          <tr><td style="${td};border-bottom:none;">Carol</td><td style="${td};border-bottom:none;">Active</td><td style="${td};border-bottom:none;">Viewer</td></tr>
        </tbody>
      </table>
    </div>
  `);
}

function materialAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;display:flex;flex-direction:column;gap:8px;font-family:'Roboto',sans-serif;">
      <div style="padding:12px 16px;background:#e3f2fd;color:#0d47a1;border-radius:4px;font-size:14px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">&#9432;</span> This is an info alert.
      </div>
      <div style="padding:12px 16px;background:#fce4ec;color:#b71c1c;border-radius:4px;font-size:14px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">&#9888;</span> This is an error alert.
      </div>
    </div>
  `);
}

function materialAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:10px;font-family:'Roboto',sans-serif;">
      <div style="width:40px;height:40px;border-radius:50%;background:#1976d2;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;color:#ffffff;">A</div>
      <div style="width:40px;height:40px;border-radius:50%;background:#9c27b0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;color:#ffffff;">B</div>
      <div style="width:40px;height:40px;border-radius:50%;background:#e0e0e0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;color:#757575;">C</div>
    </div>
  `);
}

function materialAccordion(t: ThemeTokens): string {
  const items = [
    { title: 'General settings', content: 'Configure your general preferences here.', open: true },
    { title: 'Privacy', content: '', open: false },
    { title: 'Notifications', content: '', open: false },
  ];
  const els = items.map(i => `
    <div style="background:#ffffff;box-shadow:0 1px 2px rgba(0,0,0,0.1);${i.open ? '' : 'margin-top:-1px;'}">
      <div style="padding:14px 16px;font-size:14px;font-weight:400;display:flex;justify-content:space-between;align-items:center;cursor:pointer;color:#212121;">
        ${escapeHTML(i.title)}
        <span style="font-size:10px;color:#757575;transform:rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding:0 16px 14px;font-size:14px;color:#757575;">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width:280px;border-radius:4px;overflow:hidden;font-family:'Roboto',sans-serif;">${els}</div>`);
}

function materialSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;font-family:'Roboto',sans-serif;">
      <div style="position:relative;border:1px solid #bdbdbd;border-radius:4px;padding:16px 16px 8px;">
        <label style="position:absolute;top:-8px;left:12px;font-size:12px;color:#1976d2;background:#fafafa;padding:0 4px;">Framework</label>
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:16px;color:#212121;">
          <span>React</span>
          <span style="font-size:10px;color:#757575;">&#9660;</span>
        </div>
      </div>
    </div>
  `);
}

/* ─── Radix UI ──────────────────────────────────────────── */

function radixButton(t: ThemeTokens): string {
  const base = `display:inline-flex;align-items:center;justify-content:center;font-family:'Inter',-apple-system,sans-serif;font-size:14px;font-weight:500;cursor:pointer;line-height:1;white-space:nowrap;`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:#3e63dd;color:#ffffff;border:none;">Solid</button>
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:#1b2677;color:#bec5f9;border:none;">Soft</button>
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#8da4ef;border:1px solid #2b3a8e;">Outline</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#8da4ef;border:none;">Ghost</button>
        <button style="${base}height:36px;padding:0 16px;border-radius:6px;background:#e5484d;color:#ffffff;border:none;">Danger</button>
      </div>
    </div>
  `);
}

function radixInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;display:flex;flex-direction:column;gap:6px;font-family:'Inter',-apple-system,sans-serif;">
      <label style="font-size:14px;font-weight:500;color:#eeeef0;">Email</label>
      <div style="height:36px;padding:0 12px;font-size:14px;background:#111113;color:#9b9ba7;border:1px solid #2b2c2f;border-radius:6px;display:flex;align-items:center;">you@example.com</div>
      <p style="font-size:12px;color:#9b9ba7;">Your email address.</p>
    </div>
  `);
}

function radixCard(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:#18191b;border:1px solid #2b2c2f;border-radius:10px;padding:20px;font-family:'Inter',-apple-system,sans-serif;">
      <div style="font-size:16px;font-weight:600;color:#eeeef0;margin-bottom:4px;">Quick start</div>
      <div style="font-size:13px;color:#9b9ba7;margin-bottom:16px;">Get up and running with Radix Themes quickly.</div>
      <div style="display:flex;gap:8px;">
        <button style="height:36px;padding:0 16px;border-radius:6px;background:#3e63dd;color:#ffffff;border:none;font-size:14px;font-weight:500;cursor:pointer;">Get started</button>
        <button style="height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#8da4ef;border:1px solid #2b3a8e;font-size:14px;font-weight:500;cursor:pointer;">Docs</button>
      </div>
    </div>
  `);
}

function radixSwitch(t: ThemeTokens): string {
  const sw = (label: string, on: boolean) => `
    <label style="display:flex;align-items:center;gap:10px;font-size:14px;color:#eeeef0;cursor:pointer;font-family:'Inter',sans-serif;">
      <span style="width:42px;height:24px;border-radius:12px;background:${on ? '#3e63dd' : '#2b2c2f'};position:relative;display:inline-block;">
        <span style="position:absolute;top:2px;left:${on ? '20px' : '2px'};width:20px;height:20px;border-radius:50%;background:#ffffff;transition:left .2s;box-shadow:0 1px 2px rgba(0,0,0,0.3);"></span>
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:14px;">${sw('Dark mode', true)}${sw('Notifications', false)}</div>`);
}

function radixBadge(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:6px;flex-wrap:wrap;font-family:'Inter',sans-serif;">
      <span style="padding:2px 8px;font-size:12px;font-weight:500;background:#3e63dd;color:#ffffff;border-radius:9999px;">Default</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:500;background:#1b2677;color:#bec5f9;border-radius:9999px;">Soft</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:500;background:transparent;color:#8da4ef;border:1px solid #2b3a8e;border-radius:9999px;">Outline</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:500;background:#e5484d;color:#ffffff;border-radius:9999px;">Error</span>
    </div>
  `);
}

function radixCheckbox(t: ThemeTokens): string {
  const item = (label: string, checked: boolean) => `
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#eeeef0;cursor:pointer;font-family:'Inter',sans-serif;">
      <span style="width:16px;height:16px;border-radius:4px;border:${checked ? 'none' : '1px solid #2b2c2f'};background:${checked ? '#3e63dd' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${checked ? '<span style="color:#ffffff;font-size:11px;">&#10003;</span>' : ''}
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:10px;">${item('Accept terms', true)}${item('Marketing emails', false)}</div>`);
}

function radixDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position:relative;width:300px;">
      <div style="position:absolute;inset:-16px;background:rgba(0,0,0,0.6);border-radius:12px;"></div>
      <div style="position:relative;background:#18191b;border:1px solid #2b2c2f;border-radius:10px;padding:24px;font-family:'Inter',sans-serif;">
        <div style="font-size:16px;font-weight:600;color:#eeeef0;margin-bottom:4px;">Edit profile</div>
        <div style="font-size:13px;color:#9b9ba7;margin-bottom:16px;">Make changes to your profile here.</div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
          <div style="height:36px;padding:0 12px;background:#111113;border:1px solid #2b2c2f;border-radius:6px;color:#eeeef0;font-size:14px;display:flex;align-items:center;">Freja Johnsen</div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button style="height:36px;padding:0 16px;border-radius:6px;background:transparent;color:#eeeef0;border:1px solid #2b2c2f;font-size:14px;cursor:pointer;">Cancel</button>
          <button style="height:36px;padding:0 16px;border-radius:6px;background:#3e63dd;color:#ffffff;border:none;font-size:14px;cursor:pointer;">Save</button>
        </div>
      </div>
    </div>
  `);
}

function radixTabs(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;font-family:'Inter',sans-serif;">
      <div style="display:flex;border-bottom:1px solid #2b2c2f;">
        <span style="padding:10px 16px;font-size:14px;font-weight:500;color:#eeeef0;border-bottom:2px solid #3e63dd;">Account</span>
        <span style="padding:10px 16px;font-size:14px;font-weight:400;color:#9b9ba7;">Documents</span>
        <span style="padding:10px 16px;font-size:14px;font-weight:400;color:#9b9ba7;">Settings</span>
      </div>
      <div style="padding:16px;border:1px solid #2b2c2f;border-top:none;border-radius:0 0 8px 8px;">
        <div style="font-size:14px;color:#9b9ba7;">Make changes to your account.</div>
      </div>
    </div>
  `);
}

function radixTable(t: ThemeTokens): string {
  const th = `padding:8px 12px;font-size:12px;font-weight:500;text-align:left;color:#9b9ba7;border-bottom:1px solid #2b2c2f;`;
  const td = `padding:8px 12px;font-size:13px;color:#eeeef0;border-bottom:1px solid #2b2c2f;`;
  return wrap(t, `
    <div style="width:288px;border:1px solid #2b2c2f;border-radius:10px;overflow:hidden;font-family:'Inter',sans-serif;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${th}">Name</th><th style="${th}">Status</th><th style="${th}">Role</th></tr></thead>
        <tbody>
          <tr><td style="${td}">Alice</td><td style="${td}"><span style="color:#30a46c;">Active</span></td><td style="${td}">Admin</td></tr>
          <tr><td style="${td}">Bob</td><td style="${td}"><span style="color:#9b9ba7;">Inactive</span></td><td style="${td}">Editor</td></tr>
          <tr><td style="${td};border-bottom:none;">Carol</td><td style="${td};border-bottom:none;"><span style="color:#30a46c;">Active</span></td><td style="${td};border-bottom:none;">Viewer</td></tr>
        </tbody>
      </table>
    </div>
  `);
}

function radixAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:#18191b;border:1px solid #2b2c2f;border-radius:10px;padding:16px;font-family:'Inter',sans-serif;">
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:16px;color:#3e63dd;flex-shrink:0;">&#9432;</span>
        <div>
          <div style="font-size:14px;font-weight:600;color:#eeeef0;margin-bottom:2px;">Information</div>
          <div style="font-size:13px;color:#9b9ba7;">You can customize components using the theme panel.</div>
        </div>
      </div>
    </div>
  `);
}

function radixAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:10px;font-family:'Inter',sans-serif;">
      <div style="width:40px;height:40px;border-radius:9999px;background:#3e63dd;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#ffffff;">AB</div>
      <div style="width:40px;height:40px;border-radius:9999px;background:#7c66dc;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#ffffff;">CD</div>
      <div style="width:40px;height:40px;border-radius:9999px;background:#2b2c2f;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#9b9ba7;">EF</div>
    </div>
  `);
}

function radixAccordion(t: ThemeTokens): string {
  const items = [
    { title: 'Accessible', content: 'Full keyboard navigation and screen reader support.', open: true },
    { title: 'Unstyled', content: '', open: false },
    { title: 'Composable', content: '', open: false },
  ];
  const els = items.map(i => `
    <div style="border-bottom:1px solid #2b2c2f;">
      <div style="padding:14px 0;font-size:14px;font-weight:500;display:flex;justify-content:space-between;align-items:center;cursor:pointer;color:#eeeef0;">
        ${escapeHTML(i.title)}
        <span style="font-size:10px;color:#9b9ba7;transform:rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding-bottom:14px;font-size:13px;color:#9b9ba7;">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width:280px;font-family:'Inter',sans-serif;">${els}</div>`);
}

function radixSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;font-family:'Inter',sans-serif;">
      <label style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;color:#eeeef0;">Theme</label>
      <div style="height:36px;padding:0 12px;background:#111113;border:1px solid #2b2c2f;border-radius:6px;display:flex;align-items:center;justify-content:space-between;color:#eeeef0;font-size:14px;">
        <span>Dark</span>
        <span style="font-size:10px;color:#9b9ba7;">&#9660;</span>
      </div>
    </div>
  `);
}

/* ─── Fluent UI ─────────────────────────────────────────── */

function fluentButton(t: ThemeTokens): string {
  const base = `display:inline-flex;align-items:center;justify-content:center;font-family:'Segoe UI','Segoe UI Web',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .1s;line-height:1;`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start;">
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:32px;padding:0 12px;border-radius:4px;background:#0078d4;color:#ffffff;border:none;">Primary</button>
        <button style="${base}height:32px;padding:0 12px;border-radius:4px;background:#ffffff;color:#242424;border:1px solid #d1d1d1;">Outline</button>
        <button style="${base}height:32px;padding:0 12px;border-radius:4px;background:#f5f5f5;color:#242424;border:1px solid transparent;">Subtle</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button style="${base}height:32px;padding:0 12px;border-radius:4px;background:transparent;color:#0078d4;border:none;">Transparent</button>
        <div style="display:flex;flex-direction:column;background:#ffffff;border:1px solid #d1d1d1;border-radius:4px;padding:8px 12px;cursor:pointer;">
          <span style="font-size:14px;font-weight:600;color:#242424;">Compound</span>
          <span style="font-size:12px;color:#707070;">Secondary content</span>
        </div>
      </div>
    </div>
  `);
}

function fluentInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;display:flex;flex-direction:column;gap:16px;font-family:'Segoe UI',sans-serif;">
      <div>
        <label style="display:block;font-size:14px;font-weight:600;margin-bottom:4px;color:#242424;">Full name</label>
        <div style="height:32px;padding:0 10px;font-size:14px;background:#ffffff;color:#242424;border:1px solid #d1d1d1;border-radius:4px;border-bottom:2px solid #0078d4;display:flex;align-items:center;">John Doe</div>
      </div>
      <div>
        <label style="display:block;font-size:14px;font-weight:600;margin-bottom:4px;color:#242424;">Description</label>
        <div style="height:64px;padding:8px 10px;font-size:14px;background:#ffffff;color:#707070;border:1px solid #d1d1d1;border-radius:4px;border-bottom:2px solid transparent;">Enter a description…</div>
      </div>
    </div>
  `);
}

function fluentCard(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:#ffffff;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.14),0 0 2px rgba(0,0,0,0.12);padding:16px;font-family:'Segoe UI',sans-serif;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:#0078d4;color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;">P</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:#242424;">Project Update</div>
          <div style="font-size:12px;color:#707070;">5 min ago</div>
        </div>
      </div>
      <div style="font-size:14px;color:#242424;margin-bottom:12px;">The latest deployment has been completed successfully.</div>
      <div style="display:flex;gap:8px;">
        <button style="height:32px;padding:0 12px;border-radius:4px;background:#0078d4;color:#ffffff;border:none;font-size:14px;font-weight:600;cursor:pointer;">View</button>
        <button style="height:32px;padding:0 12px;border-radius:4px;background:#f5f5f5;color:#242424;border:1px solid transparent;font-size:14px;font-weight:600;cursor:pointer;">Dismiss</button>
      </div>
    </div>
  `);
}

function fluentSwitch(t: ThemeTokens): string {
  const sw = (label: string, on: boolean) => `
    <label style="display:flex;align-items:center;gap:12px;font-size:14px;color:#242424;cursor:pointer;font-family:'Segoe UI',sans-serif;">
      <span style="width:40px;height:20px;border-radius:10px;background:${on ? '#0078d4' : '#8a8886'};position:relative;display:inline-block;border:1px solid ${on ? '#0078d4' : '#8a8886'};">
        <span style="position:absolute;top:1px;left:${on ? '21px' : '1px'};width:16px;height:16px;border-radius:50%;background:#ffffff;transition:left .15s;"></span>
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:14px;">${sw('Enable feature', true)}${sw('Dark mode', false)}</div>`);
}

function fluentBadge(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-family:'Segoe UI',sans-serif;">
      <span style="padding:2px 8px;font-size:12px;font-weight:600;background:#0078d4;color:#ffffff;border-radius:9999px;">Brand</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:600;background:#d13438;color:#ffffff;border-radius:9999px;">Danger</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:600;background:#107c10;color:#ffffff;border-radius:9999px;">Success</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:600;background:#ffb900;color:#242424;border-radius:9999px;">Warning</span>
      <span style="padding:2px 8px;font-size:12px;font-weight:600;background:#f5f5f5;color:#242424;border-radius:9999px;">Subtle</span>
    </div>
  `);
}

function fluentCheckbox(t: ThemeTokens): string {
  const item = (label: string, checked: boolean) => `
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#242424;cursor:pointer;font-family:'Segoe UI',sans-serif;">
      <span style="width:16px;height:16px;border-radius:2px;border:${checked ? 'none' : '1px solid #8a8886'};background:${checked ? '#0078d4' : '#ffffff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${checked ? '<span style="color:#ffffff;font-size:11px;font-weight:bold;">&#10003;</span>' : ''}
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:12px;">${item('Option A', true)}${item('Option B', false)}${item('Option C', false)}</div>`);
}

function fluentDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position:relative;width:300px;">
      <div style="position:absolute;inset:-16px;background:rgba(0,0,0,0.4);border-radius:8px;"></div>
      <div style="position:relative;background:#ffffff;border-radius:8px;box-shadow:0 8px 16px rgba(0,0,0,0.14),0 0 2px rgba(0,0,0,0.12);padding:24px;font-family:'Segoe UI',sans-serif;">
        <div style="font-size:20px;font-weight:600;color:#242424;margin-bottom:12px;">Dialog title</div>
        <div style="font-size:14px;color:#707070;margin-bottom:24px;">This is a dialog with content that requires user attention.</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button style="height:32px;padding:0 12px;border-radius:4px;background:#ffffff;color:#242424;border:1px solid #d1d1d1;font-size:14px;font-weight:600;cursor:pointer;">Close</button>
          <button style="height:32px;padding:0 12px;border-radius:4px;background:#0078d4;color:#ffffff;border:none;font-size:14px;font-weight:600;cursor:pointer;">Submit</button>
        </div>
      </div>
    </div>
  `);
}

function fluentTabs(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;font-family:'Segoe UI',sans-serif;">
      <div style="display:flex;gap:0;border-bottom:1px solid #e0e0e0;">
        <span style="padding:10px 16px;font-size:14px;font-weight:600;color:#0078d4;border-bottom:2px solid #0078d4;">Tab 1</span>
        <span style="padding:10px 16px;font-size:14px;font-weight:400;color:#707070;">Tab 2</span>
        <span style="padding:10px 16px;font-size:14px;font-weight:400;color:#707070;">Tab 3</span>
      </div>
      <div style="padding:16px;font-size:14px;color:#707070;">Tab 1 panel content goes here.</div>
    </div>
  `);
}

function fluentTable(t: ThemeTokens): string {
  const th = `padding:8px 12px;font-size:12px;font-weight:600;text-align:left;color:#707070;border-bottom:1px solid #e0e0e0;`;
  const td = `padding:8px 12px;font-size:14px;color:#242424;border-bottom:1px solid #f5f5f5;`;
  return wrap(t, `
    <div style="width:288px;background:#ffffff;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.14),0 0 2px rgba(0,0,0,0.12);overflow:hidden;font-family:'Segoe UI',sans-serif;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${th}">Name</th><th style="${th}">Status</th><th style="${th}">Role</th></tr></thead>
        <tbody>
          <tr style="background:#ffffff;"><td style="${td}">Alice</td><td style="${td}"><span style="color:#107c10;">●</span> Active</td><td style="${td}">Admin</td></tr>
          <tr style="background:#fafafa;"><td style="${td}">Bob</td><td style="${td}"><span style="color:#8a8886;">●</span> Away</td><td style="${td}">Editor</td></tr>
          <tr style="background:#ffffff;"><td style="${td};border-bottom:none;">Carol</td><td style="${td};border-bottom:none;"><span style="color:#107c10;">●</span> Active</td><td style="${td};border-bottom:none;">Viewer</td></tr>
        </tbody>
      </table>
    </div>
  `);
}

function fluentAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;display:flex;flex-direction:column;gap:8px;font-family:'Segoe UI',sans-serif;">
      <div style="padding:12px 16px;background:#deecf9;border-radius:4px;font-size:14px;color:#242424;display:flex;align-items:center;gap:10px;border-left:4px solid #0078d4;">
        <span style="font-size:16px;color:#0078d4;">&#9432;</span> Information message bar.
      </div>
      <div style="padding:12px 16px;background:#fde7e9;border-radius:4px;font-size:14px;color:#242424;display:flex;align-items:center;gap:10px;border-left:4px solid #d13438;">
        <span style="font-size:16px;color:#d13438;">&#9888;</span> Error message bar.
      </div>
    </div>
  `);
}

function fluentAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:10px;font-family:'Segoe UI',sans-serif;">
      <div style="position:relative;">
        <div style="width:40px;height:40px;border-radius:50%;background:#0078d4;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:#ffffff;">KM</div>
        <span style="position:absolute;bottom:0;right:0;width:12px;height:12px;border-radius:50%;background:#107c10;border:2px solid #ffffff;"></span>
      </div>
      <div style="position:relative;">
        <div style="width:40px;height:40px;border-radius:50%;background:#8764b8;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:#ffffff;">TP</div>
        <span style="position:absolute;bottom:0;right:0;width:12px;height:12px;border-radius:50%;background:#ffb900;border:2px solid #ffffff;"></span>
      </div>
      <div style="width:40px;height:40px;border-radius:50%;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:#707070;">JD</div>
    </div>
  `);
}

function fluentAccordion(t: ThemeTokens): string {
  const items = [
    { title: 'Accordion Header 1', content: 'Accordion panel content.', open: true },
    { title: 'Accordion Header 2', content: '', open: false },
    { title: 'Accordion Header 3', content: '', open: false },
  ];
  const els = items.map(i => `
    <div style="border-bottom:1px solid #e0e0e0;">
      <div style="padding:12px 0;font-size:14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;cursor:pointer;color:#242424;">
        ${escapeHTML(i.title)}
        <span style="font-size:10px;color:#707070;transform:rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding-bottom:12px;font-size:14px;color:#707070;">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width:280px;font-family:'Segoe UI',sans-serif;">${els}</div>`);
}

function fluentSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;font-family:'Segoe UI',sans-serif;">
      <label style="display:block;font-size:14px;font-weight:600;margin-bottom:4px;color:#242424;">Color</label>
      <div style="height:32px;padding:0 10px;background:#ffffff;border:1px solid #d1d1d1;border-radius:4px;border-bottom:2px solid transparent;display:flex;align-items:center;justify-content:space-between;color:#242424;font-size:14px;">
        <span>Blue</span>
        <span style="font-size:10px;color:#707070;">&#9660;</span>
      </div>
    </div>
  `);
}

/* ─── Apple Liquid Glass ─────────────────────────────────── */

const GLASS = 'backdrop-filter:blur(24px) saturate(1.8);-webkit-backdrop-filter:blur(24px) saturate(1.8);';
const SF = `-apple-system,'SF Pro Display','Helvetica Neue',sans-serif`;

function glassButton(t: ThemeTokens): string {
  const base = `display:inline-flex;align-items:center;justify-content:center;font-family:${SF};font-size:15px;font-weight:500;cursor:pointer;line-height:1;white-space:nowrap;${GLASS}`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
      <div style="display:flex;gap:10px;align-items:center;">
        <button style="${base}height:44px;padding:0 22px;border-radius:22px;background:rgba(255,255,255,0.22);color:#ffffff;border:1px solid rgba(255,255,255,0.25);box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 4px 16px rgba(0,0,0,0.1);">.glass</button>
        <button style="${base}height:44px;padding:0 22px;border-radius:22px;background:rgba(0,122,255,0.55);color:#ffffff;border:1px solid rgba(255,255,255,0.18);box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 4px 16px rgba(0,0,0,0.12);">.glassProminent</button>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <button style="${base}height:44px;padding:0 22px;border-radius:22px;background:transparent;color:rgba(255,255,255,0.85);border:none;">Plain</button>
        <button style="${base}width:50px;height:50px;border-radius:16px;background:rgba(255,255,255,0.22);color:#ffffff;border:1px solid rgba(255,255,255,0.2);font-size:22px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2),0 4px 16px rgba(0,0,0,0.1);">+</button>
      </div>
    </div>
  `);
}

function glassInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;display:flex;flex-direction:column;gap:8px;font-family:${SF};">
      <label style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);">Search</label>
      <div style="height:44px;padding:0 14px;font-size:15px;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;gap:8px;${GLASS}">
        <span style="font-size:14px;color:rgba(255,255,255,0.4);">&#128269;</span>
        Search…
      </div>
      <p style="font-size:12px;color:rgba(255,255,255,0.5);">Type to search all settings.</p>
    </div>
  `);
}

function glassCard(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:22px;overflow:hidden;font-family:${SF};${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 8px 32px rgba(0,0,0,0.15);">
      <div style="padding:22px;">
        <div style="font-size:17px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;margin-bottom:6px;">Control Center</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.6);line-height:1.45;margin-bottom:18px;">Customize your quick actions and widgets.</div>
        <div style="display:flex;gap:10px;">
          <button style="height:36px;padding:0 18px;border-radius:18px;background:rgba(255,255,255,0.22);color:#ffffff;border:1px solid rgba(255,255,255,0.2);font-size:14px;font-weight:500;cursor:pointer;${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.15);">Customize</button>
          <button style="height:36px;padding:0 18px;border-radius:18px;background:rgba(0,122,255,0.55);color:#ffffff;border:none;font-size:14px;font-weight:500;cursor:pointer;${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);">Done</button>
        </div>
      </div>
    </div>
  `);
}

function glassSwitch(t: ThemeTokens): string {
  const sw = (label: string, on: boolean) => `
    <label style="display:flex;align-items:center;gap:12px;font-size:15px;color:#ffffff;cursor:pointer;font-family:${SF};">
      <span style="width:51px;height:31px;border-radius:16px;background:${on ? 'rgba(52,199,89,0.85)' : 'rgba(255,255,255,0.15)'};position:relative;display:inline-block;${GLASS}border:1px solid ${on ? 'rgba(52,199,89,0.35)' : 'rgba(255,255,255,0.12)'};box-shadow:inset 0 1px 0 ${on ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'};">
        <span style="position:absolute;top:2px;left:${on ? '22px' : '2px'};width:27px;height:27px;border-radius:14px;background:rgba(255,255,255,0.97);box-shadow:0 2px 8px rgba(0,0,0,0.22),inset 0 -1px 2px rgba(0,0,0,0.06);transition:left .2s;"></span>
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:16px;">${sw('Wi-Fi', true)}${sw('Airplane Mode', false)}</div>`);
}

function glassBadge(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:8px;flex-wrap:wrap;font-family:${SF};">
      <span style="padding:4px 12px;font-size:13px;font-weight:500;background:rgba(0,122,255,0.5);color:#ffffff;border-radius:14px;${GLASS}border:1px solid rgba(0,122,255,0.3);">Active</span>
      <span style="padding:4px 12px;font-size:13px;font-weight:500;background:rgba(52,199,89,0.5);color:#ffffff;border-radius:14px;${GLASS}border:1px solid rgba(52,199,89,0.3);">Connected</span>
      <span style="padding:4px 12px;font-size:13px;font-weight:500;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.85);border-radius:14px;${GLASS}border:1px solid rgba(255,255,255,0.12);">Paused</span>
      <span style="padding:4px 12px;font-size:13px;font-weight:500;background:rgba(255,69,58,0.5);color:#ffffff;border-radius:14px;${GLASS}border:1px solid rgba(255,69,58,0.3);">Error</span>
    </div>
  `);
}

function glassCheckbox(t: ThemeTokens): string {
  const item = (label: string, checked: boolean) => `
    <label style="display:flex;align-items:center;gap:10px;font-size:15px;color:#ffffff;cursor:pointer;font-family:${SF};">
      <span style="width:22px;height:22px;border-radius:6px;border:${checked ? 'none' : '1.5px solid rgba(255,255,255,0.3)'};background:${checked ? 'rgba(0,122,255,0.7)' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;${GLASS}">
        ${checked ? '<span style="color:#ffffff;font-size:14px;font-weight:bold;">&#10003;</span>' : ''}
      </span>
      ${escapeHTML(label)}
    </label>`;
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:14px;">${item('Enable notifications', true)}${item('Allow Siri suggestions', false)}</div>`);
}

function glassDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position:relative;width:300px;">
      <div style="position:absolute;inset:-16px;background:rgba(0,0,0,0.45);border-radius:30px;"></div>
      <div style="position:relative;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.2);border-radius:26px;padding:28px 24px 24px;font-family:${SF};${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 12px 40px rgba(0,0,0,0.2);">
        <div style="font-size:17px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;margin-bottom:6px;text-align:center;">Remove Widget?</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:22px;text-align:center;line-height:1.4;">This widget will be removed from your Control Center.</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button style="height:50px;padding:0 20px;border-radius:14px;background:rgba(255,59,48,0.6);color:#ffffff;border:none;font-size:17px;font-weight:600;cursor:pointer;${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);">Remove</button>
          <button style="height:50px;padding:0 20px;border-radius:14px;background:rgba(255,255,255,0.18);color:#ffffff;border:1px solid rgba(255,255,255,0.15);font-size:17px;font-weight:500;cursor:pointer;${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);">Cancel</button>
        </div>
      </div>
    </div>
  `);
}

function glassSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;font-family:${SF};">
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:rgba(255,255,255,0.85);">Focus Mode</label>
      <div style="height:44px;padding:0 14px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:space-between;color:#ffffff;font-size:15px;${GLASS}">
        <span>Do Not Disturb</span>
        <span style="font-size:10px;color:rgba(255,255,255,0.45);">&#9660;</span>
      </div>
    </div>
  `);
}

function glassTabs(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;font-family:${SF};">
      <div style="display:inline-flex;background:rgba(255,255,255,0.12);border-radius:22px;padding:3px;gap:2px;margin-bottom:14px;border:1px solid rgba(255,255,255,0.1);${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);">
        <span style="padding:8px 18px;font-size:14px;font-weight:600;background:rgba(255,255,255,0.22);color:#ffffff;border-radius:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.15);">Controls</span>
        <span style="padding:8px 18px;font-size:14px;font-weight:400;color:rgba(255,255,255,0.55);border-radius:20px;">Widgets</span>
      </div>
      <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:18px;${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);">
        <div style="font-size:15px;font-weight:500;color:#ffffff;letter-spacing:-0.01em;margin-bottom:4px;">Quick Controls</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.45;">Manage your frequently used controls.</div>
      </div>
    </div>
  `);
}

function glassTable(t: ThemeTokens): string {
  const th = `padding:14px 16px;font-size:12px;font-weight:500;text-align:left;color:rgba(255,255,255,0.5);border-bottom:1px solid rgba(255,255,255,0.1);letter-spacing:0.02em;`;
  const td = `padding:14px 16px;font-size:15px;color:#ffffff;border-bottom:1px solid rgba(255,255,255,0.06);`;
  return wrap(t, `
    <div style="width:288px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);border-radius:18px;overflow:hidden;font-family:${SF};${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${th}">Device</th><th style="${th}">Status</th><th style="${th}">Battery</th></tr></thead>
        <tbody>
          <tr><td style="${td}">iPhone</td><td style="${td}"><span style="color:#34C759;">&#9679;</span> Active</td><td style="${td}">87%</td></tr>
          <tr><td style="${td}">iPad</td><td style="${td}"><span style="color:#FFD60A;">&#9679;</span> Idle</td><td style="${td}">62%</td></tr>
          <tr><td style="${td};border-bottom:none;">Mac</td><td style="${td};border-bottom:none;"><span style="color:#34C759;">&#9679;</span> Active</td><td style="${td};border-bottom:none;">100%</td></tr>
        </tbody>
      </table>
    </div>
  `);
}

function glassAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:280px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:18px;font-family:${SF};${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 8px 32px rgba(0,0,0,0.12);">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <span style="width:30px;height:30px;border-radius:10px;background:rgba(0,122,255,0.5);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;color:#ffffff;${GLASS}box-shadow:inset 0 1px 0 rgba(255,255,255,0.15);">&#9432;</span>
        <div style="padding-top:2px;">
          <div style="font-size:15px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;margin-bottom:3px;">Software Update</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.45;">iOS 26.1 is now available for your device.</div>
        </div>
      </div>
    </div>
  `);
}

function glassAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:10px;font-family:${SF};">
      <div style="width:44px;height:44px;border-radius:22px;background:linear-gradient(135deg,rgba(0,122,255,0.6),rgba(175,82,222,0.6));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:#ffffff;border:1px solid rgba(255,255,255,0.2);${GLASS}">JD</div>
      <div style="width:44px;height:44px;border-radius:22px;background:linear-gradient(135deg,rgba(255,149,0,0.6),rgba(255,69,58,0.6));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:#ffffff;border:1px solid rgba(255,255,255,0.2);${GLASS}">AK</div>
      <div style="width:44px;height:44px;border-radius:22px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.12);${GLASS}">SM</div>
    </div>
  `);
}

function glassAccordion(t: ThemeTokens): string {
  const items = [
    { title: 'Connectivity', content: 'Wi-Fi, Bluetooth, AirDrop, Cellular.', open: true },
    { title: 'Display & Brightness', content: '', open: false },
    { title: 'Sound & Haptics', content: '', open: false },
  ];
  const els = items.map(i => `
    <div style="border-bottom:1px solid rgba(255,255,255,0.08);">
      <div style="padding:14px 0;font-size:15px;font-weight:500;display:flex;justify-content:space-between;align-items:center;cursor:pointer;color:#ffffff;">
        ${escapeHTML(i.title)}
        <span style="font-size:10px;color:rgba(255,255,255,0.4);transform:rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding-bottom:14px;font-size:14px;color:rgba(255,255,255,0.55);">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width:280px;font-family:${SF};">${els}</div>`);
}

/* ═══════════════════════════════════════════════════════════
   Generic fallback renderers (theme-only, no library DNA)
   ═══════════════════════════════════════════════════════════ */

function renderButton(t: ThemeTokens): string {
  const btnBase = `display:inline-flex;align-items:center;justify-content:center;padding:8px 16px;font-size:13px;font-weight:500;border-radius:${t.radiusSm};cursor:pointer;font-family:${t.fontFamily};border:none;line-height:1.4;`;
  return wrap(t, `
    <div style="display:flex;gap:10px;align-items:center;">
      <button style="${btnBase}background:${t.primary};color:${t.primaryText};">Primary</button>
      <button style="${btnBase}background:${t.surface};color:${t.text};border:1px solid ${t.border};${glassCSS(t)}">Secondary</button>
      <button style="${btnBase}background:transparent;color:${t.primary};border:1px solid ${t.primary};">Outline</button>
    </div>
  `);
}

function renderInput(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;">
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:${t.text};">Email address</label>
      <input type="text" readonly style="width:100%;padding:8px 12px;font-size:13px;background:${t.inputBg};color:${t.text};border:1px solid ${t.inputBorder};border-radius:${t.radiusSm};font-family:${t.fontFamily};outline:none;${glassCSS(t)}" value="" placeholder="you@example.com"/>
      <p style="font-size:11px;color:${t.textMuted};margin-top:4px;">We'll never share your email.</p>
    </div>
  `);
}

function renderCard(t: ThemeTokens): string {
  return wrap(t, `
    <div class="surface" style="width:260px;padding:20px;">
      <h3 style="font-size:15px;font-weight:600;margin-bottom:4px;">${escapeHTML('Card Title')}</h3>
      <p style="font-size:12px;color:${t.textMuted};margin-bottom:16px;">This is a card description with supporting text.</p>
      <button style="padding:7px 14px;font-size:12px;font-weight:500;background:${t.primary};color:${t.primaryText};border:none;border-radius:${t.radiusSm};cursor:pointer;font-family:${t.fontFamily};">Action</button>
    </div>
  `);
}

function renderDialog(t: ThemeTokens): string {
  return wrap(t, `
    <div style="position:relative;width:280px;">
      <div style="position:absolute;inset:-20px;background:rgba(0,0,0,0.4);border-radius:${t.radiusLg};"></div>
      <div class="surface" style="position:relative;padding:20px;width:100%;${glassCSS(t)}">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:4px;">Confirm Action</h3>
        <p style="font-size:12px;color:${t.textMuted};margin-bottom:18px;">Are you sure? This action cannot be undone.</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button style="padding:6px 14px;font-size:12px;font-weight:500;background:${t.surface};color:${t.text};border:1px solid ${t.border};border-radius:${t.radiusSm};cursor:pointer;${glassCSS(t)}">Cancel</button>
          <button style="padding:6px 14px;font-size:12px;font-weight:500;background:${t.primary};color:${t.primaryText};border:none;border-radius:${t.radiusSm};cursor:pointer;">Continue</button>
        </div>
      </div>
    </div>
  `);
}

function renderCheckbox(t: ThemeTokens): string {
  const items = [{ label: 'Option A', checked: true }, { label: 'Option B', checked: false }, { label: 'Option C', checked: false }];
  const boxes = items.map(i => `
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
      <span style="width:16px;height:16px;border-radius:${t.radiusSm};border:${i.checked ? 'none' : `1.5px solid ${t.inputBorder}`};background:${i.checked ? t.primary : t.inputBg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${i.checked ? `<span style="color:${t.primaryText};font-size:11px;">&#10003;</span>` : ''}
      </span>
      ${escapeHTML(i.label)}
    </label>
  `).join('');
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:12px;">${boxes}</div>`);
}

function renderRadio(t: ThemeTokens): string {
  const items = [{ label: 'Small', checked: false }, { label: 'Medium', checked: true }, { label: 'Large', checked: false }];
  const radios = items.map(i => `
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
      <span style="width:16px;height:16px;border-radius:50%;border:2px solid ${i.checked ? t.primary : t.inputBorder};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${t.inputBg};">
        ${i.checked ? `<span style="width:8px;height:8px;border-radius:50%;background:${t.primary};"></span>` : ''}
      </span>
      ${escapeHTML(i.label)}
    </label>
  `).join('');
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:12px;">${radios}</div>`);
}

function renderSwitch(t: ThemeTokens): string {
  const renderOne = (on: boolean, label: string) => {
    const trackBg = on ? t.primary : t.inputBorder;
    const thumbLeft = on ? '20px' : '2px';
    return `
      <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;">
        <span style="width:40px;height:22px;border-radius:11px;background:${trackBg};position:relative;display:inline-block;">
          <span style="position:absolute;top:2px;left:${thumbLeft};width:18px;height:18px;border-radius:50%;background:${t.primaryText};box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
        </span>
        ${escapeHTML(label)}
      </label>`;
  };
  return wrap(t, `<div style="display:flex;flex-direction:column;gap:14px;">${renderOne(true, 'Notifications')}${renderOne(false, 'Dark mode')}</div>`);
}

function renderSelect(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;">
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:${t.text};">Framework</label>
      <div style="width:100%;padding:8px 12px;font-size:13px;background:${t.inputBg};color:${t.text};border:1px solid ${t.inputBorder};border-radius:${t.radiusSm};display:flex;align-items:center;justify-content:space-between;${glassCSS(t)}">
        <span>Select an option…</span>
        <span style="font-size:10px;color:${t.textMuted};">&#9660;</span>
      </div>
    </div>
  `);
}

function renderTabs(t: ThemeTokens): string {
  const tabs = ['Overview', 'Analytics', 'Settings'];
  const tabItems = tabs.map((label, i) => {
    const active = i === 0;
    return `<span style="padding:8px 16px;font-size:13px;font-weight:${active ? '600' : '400'};color:${active ? t.text : t.textMuted};border-bottom:2px solid ${active ? t.primary : 'transparent'};cursor:pointer;">${escapeHTML(label)}</span>`;
  }).join('');
  return wrap(t, `
    <div style="width:280px;">
      <div style="display:flex;border-bottom:1px solid ${t.border};">${tabItems}</div>
      <div class="surface" style="padding:16px;border-top:none;border-radius:0 0 ${t.radiusSm} ${t.radiusSm};font-size:12px;color:${t.textMuted};${glassCSS(t)}">Overview content goes here.</div>
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
  const els = badges.map(b => `<span style="padding:3px 10px;font-size:11px;font-weight:600;background:${b.bg};color:${b.color};border-radius:9999px;display:inline-block;">${escapeHTML(b.label)}</span>`).join('');
  return wrap(t, `<div style="display:flex;gap:8px;flex-wrap:wrap;">${els}</div>`);
}

function renderAvatar(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:48px;height:48px;border-radius:50%;background:${t.primary};color:${t.primaryText};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;flex-shrink:0;">JD</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:${t.text};">Jane Doe</div>
        <div style="font-size:12px;color:${t.textMuted};">jane@example.com</div>
      </div>
    </div>
  `);
}

function renderAlert(t: ThemeTokens): string {
  return wrap(t, `
    <div class="surface" style="width:280px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;border-left:3px solid ${t.primary};${glassCSS(t)}">
      <span style="font-size:18px;line-height:1;color:${t.primary};flex-shrink:0;">&#9432;</span>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;margin-bottom:2px;">Heads up!</div>
        <div style="font-size:12px;color:${t.textMuted};">You can add components using the CLI.</div>
      </div>
      <span style="font-size:16px;cursor:pointer;color:${t.textMuted};flex-shrink:0;">&times;</span>
    </div>
  `);
}

function renderProgress(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:260px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
        <span style="font-weight:500;">Uploading…</span>
        <span style="color:${t.textMuted};">65%</span>
      </div>
      <div style="width:100%;height:8px;background:${t.surfaceHover};border-radius:4px;overflow:hidden;">
        <div style="width:65%;height:100%;background:${t.primary};border-radius:4px;"></div>
      </div>
    </div>
  `);
}

function renderSlider(t: ThemeTokens): string {
  const pct = 40;
  return wrap(t, `
    <div style="width:240px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;">
        <span style="font-weight:500;">Volume</span>
        <span style="color:${t.textMuted};">${pct}%</span>
      </div>
      <div style="position:relative;width:100%;height:6px;background:${t.surfaceHover};border-radius:3px;">
        <div style="width:${pct}%;height:100%;background:${t.primary};border-radius:3px;"></div>
        <div style="position:absolute;top:50%;left:${pct}%;width:16px;height:16px;border-radius:50%;background:${t.primary};border:2px solid ${t.primaryText};transform:translate(-50%,-50%);box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>
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
    <div style="border-bottom:1px solid ${t.border};">
      <div style="padding:12px 0;font-size:13px;font-weight:500;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
        ${escapeHTML(i.title)}
        <span style="font-size:10px;color:${t.textMuted};transform:rotate(${i.open ? '180' : '0'}deg);">&#9660;</span>
      </div>
      ${i.open ? `<div style="padding-bottom:12px;font-size:12px;color:${t.textMuted};">${escapeHTML(i.content)}</div>` : ''}
    </div>
  `).join('');
  return wrap(t, `<div style="width:270px;">${els}</div>`);
}

function renderTable(t: ThemeTokens): string {
  const thStyle = `padding:8px 12px;font-size:12px;font-weight:600;text-align:left;color:${t.textMuted};border-bottom:1px solid ${t.border};`;
  const tdStyle = `padding:8px 12px;font-size:12px;border-bottom:1px solid ${t.border};`;
  return wrap(t, `
    <div class="surface" style="width:288px;overflow:hidden;${glassCSS(t)}">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${thStyle}">Name</th><th style="${thStyle}">Status</th><th style="${thStyle}">Role</th></tr></thead>
        <tbody>
          <tr><td style="${tdStyle}">Alice</td><td style="${tdStyle}">Active</td><td style="${tdStyle}">Admin</td></tr>
          <tr><td style="${tdStyle}">Bob</td><td style="${tdStyle}">Inactive</td><td style="${tdStyle}">Editor</td></tr>
          <tr><td style="${tdStyle}">Carol</td><td style="${tdStyle}">Active</td><td style="${tdStyle}">Viewer</td></tr>
        </tbody>
      </table>
    </div>
  `);
}

function renderBreadcrumb(t: ThemeTokens): string {
  const crumbs = ['Home', 'Products', 'Widget'];
  const els = crumbs.map((c, i) => {
    const isLast = i === crumbs.length - 1;
    const sep = !isLast ? `<span style="margin:0 6px;color:${t.textMuted};font-size:11px;">/</span>` : '';
    return `<span style="font-size:13px;color:${isLast ? t.text : t.textMuted};font-weight:${isLast ? '500' : '400'};cursor:pointer;">${escapeHTML(c)}</span>${sep}`;
  }).join('');
  return wrap(t, `<div style="display:flex;align-items:center;">${els}</div>`);
}

function renderPagination(t: ThemeTokens): string {
  const pages = [1, 2, 3, 4, 5];
  const active = 2;
  const els = pages.map(p => {
    const isActive = p === active;
    return `<span style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:${isActive ? '600' : '400'};background:${isActive ? t.primary : 'transparent'};color:${isActive ? t.primaryText : t.text};border-radius:${t.radiusSm};cursor:pointer;border:${isActive ? 'none' : `1px solid ${t.border}`};">${p}</span>`;
  }).join('');
  return wrap(t, `
    <div style="display:flex;align-items:center;gap:4px;">
      <span style="font-size:13px;color:${t.textMuted};padding:0 6px;cursor:pointer;">&laquo;</span>
      ${els}
      <span style="font-size:13px;color:${t.textMuted};padding:0 6px;cursor:pointer;">&raquo;</span>
    </div>
  `);
}

function renderTooltip(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
      <div style="position:relative;background:${t.text};color:${t.bg.startsWith('linear') ? '#ffffff' : t.bg};padding:6px 12px;border-radius:${t.radiusSm};font-size:12px;box-shadow:${t.shadow};">
        Tooltip text
        <span style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${t.text};"></span>
      </div>
      <button style="padding:7px 14px;font-size:12px;background:${t.surface};color:${t.text};border:1px solid ${t.border};border-radius:${t.radiusSm};cursor:pointer;${glassCSS(t)}">Hover me</button>
    </div>
  `);
}

function renderNavbar(t: ThemeTokens): string {
  const links = ['Home', 'About', 'Services', 'Contact'];
  const navItems = links.map((l, i) => `<span style="font-size:13px;font-weight:${i === 0 ? '600' : '400'};color:${i === 0 ? t.text : t.textMuted};cursor:pointer;">${escapeHTML(l)}</span>`).join('');
  return wrap(t, `
    <div class="surface" style="width:288px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;${glassCSS(t)}">
      <span style="font-size:15px;font-weight:700;color:${t.primary};">Logo</span>
      <div style="display:flex;gap:16px;">${navItems}</div>
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
    <div style="padding:8px 14px;font-size:13px;display:flex;align-items:center;gap:10px;background:${i.active ? t.surfaceHover : 'transparent'};color:${i.active ? t.text : t.textMuted};border-radius:${t.radiusSm};cursor:pointer;font-weight:${i.active ? '500' : '400'};">
      <span style="font-size:14px;">${i.icon}</span>${escapeHTML(i.label)}
    </div>
  `).join('');
  return wrap(t, `
    <div class="surface" style="width:180px;padding:12px 8px;display:flex;flex-direction:column;gap:2px;${glassCSS(t)}">
      <div style="font-size:12px;font-weight:700;color:${t.textMuted};padding:6px 14px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Menu</div>
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
    if ('separator' in i && i.separator) return `<div style="height:1px;background:${t.border};margin:4px 0;"></div>`;
    const color = (i as {danger?: boolean}).danger ? t.danger : t.text;
    return `<div style="padding:7px 12px;font-size:13px;display:flex;justify-content:space-between;align-items:center;color:${color};cursor:pointer;border-radius:${t.radiusSm};">
      <span>${escapeHTML((i as {label: string}).label)}</span>
      ${(i as {shortcut?: string}).shortcut ? `<span style="font-size:11px;color:${t.textMuted};">${(i as {shortcut: string}).shortcut}</span>` : ''}
    </div>`;
  }).join('');
  return wrap(t, `<div class="surface" style="width:200px;padding:6px;${glassCSS(t)}">${els}</div>`);
}

function renderSkeleton(t: ThemeTokens): string {
  const pulseCSS = `@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}.skel{animation:pulse 1.5s ease-in-out infinite;}`;
  return wrap(t, `
    <div style="width:260px;display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;gap:12px;align-items:center;">
        <div class="skel" style="width:40px;height:40px;border-radius:50%;background:${t.surfaceHover};flex-shrink:0;"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
          <div class="skel" style="height:12px;width:70%;border-radius:4px;background:${t.surfaceHover};"></div>
          <div class="skel" style="height:10px;width:50%;border-radius:4px;background:${t.surfaceHover};"></div>
        </div>
      </div>
      <div class="skel" style="height:10px;width:100%;border-radius:4px;background:${t.surfaceHover};"></div>
      <div class="skel" style="height:10px;width:90%;border-radius:4px;background:${t.surfaceHover};"></div>
      <div class="skel" style="height:10px;width:60%;border-radius:4px;background:${t.surfaceHover};"></div>
    </div>
  `, pulseCSS);
}

function renderSpinner(t: ThemeTokens): string {
  const spinCSS = `@keyframes spin{to{transform:rotate(360deg);}}.spinner{width:36px;height:36px;border:3px solid ${t.surfaceHover};border-top-color:${t.primary};border-radius:50%;animation:spin 0.7s linear infinite;}`;
  return wrap(t, `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
      <div class="spinner"></div>
      <span style="font-size:12px;color:${t.textMuted};">Loading…</span>
    </div>
  `, spinCSS);
}

function renderSeparator(t: ThemeTokens): string {
  return wrap(t, `
    <div style="width:240px;display:flex;flex-direction:column;gap:12px;">
      <span style="font-size:13px;color:${t.text};">Section A</span>
      <div style="height:1px;background:${t.border};width:100%;"></div>
      <span style="font-size:13px;color:${t.text};">Section B</span>
    </div>
  `);
}

function renderLabel(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;flex-direction:column;gap:6px;">
      <span style="font-size:13px;font-weight:500;color:${t.text};">Username</span>
      <span style="font-size:11px;color:${t.textMuted};">Enter your unique username.</span>
    </div>
  `);
}

function renderLink(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:16px;align-items:center;">
      <span style="font-size:13px;color:${t.primary};text-decoration:underline;cursor:pointer;">Default link</span>
      <span style="font-size:13px;color:${t.textMuted};text-decoration:underline;cursor:pointer;">Muted link</span>
    </div>
  `);
}

function renderIcon(t: ThemeTokens): string {
  return wrap(t, `
    <div style="display:flex;gap:16px;align-items:center;">
      <span style="font-size:24px;color:${t.primary};">&#9733;</span>
      <span style="font-size:24px;color:${t.success};">&#10003;</span>
      <span style="font-size:24px;color:${t.danger};">&#10005;</span>
      <span style="font-size:24px;color:${t.warning};">&#9888;</span>
      <span style="font-size:24px;color:${t.textMuted};">&#9881;</span>
    </div>
  `);
}

function renderGeneric(t: ThemeTokens, componentName: string, category: string | undefined): string {
  return wrap(t, `
    <div class="surface" style="width:260px;padding:24px;text-align:center;${glassCSS(t)}">
      <div style="width:48px;height:48px;border-radius:${t.radius};background:${t.primary};color:${t.primaryText};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 14px;">${escapeHTML(componentName.charAt(0).toUpperCase())}</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${escapeHTML(componentName)}</div>
      ${category ? `<div style="font-size:12px;color:${t.textMuted};">${escapeHTML(category)}</div>` : ''}
    </div>
  `);
}

/* ═══════════════════════════════════════════════════════════
   Library override registry
   ═══════════════════════════════════════════════════════════ */

type ComponentRenderers = Partial<Record<string, Renderer>>;

const LIBRARY_OVERRIDES: Record<string, ComponentRenderers> = {
  'shadcn/ui': {
    button: shadcnButton, input: shadcnInput, 'text field': shadcnInput,
    card: shadcnCard, dialog: shadcnDialog, modal: shadcnDialog,
    switch: shadcnSwitch, toggle: shadcnSwitch,
    badge: shadcnBadge, tag: shadcnBadge, chip: shadcnBadge,
    checkbox: shadcnCheckbox, select: shadcnSelect, dropdown: shadcnSelect,
    tabs: shadcnTabs, table: shadcnTable, 'data table': shadcnTable,
    alert: shadcnAlert, notification: shadcnAlert, toast: shadcnAlert,
    avatar: shadcnAvatar, accordion: shadcnAccordion,
  },
  'material ui 3': {
    button: materialButton, input: materialInput, 'text field': materialInput,
    card: materialCard, dialog: materialDialog, modal: materialDialog,
    switch: materialSwitch, toggle: materialSwitch,
    badge: materialBadge, tag: materialBadge, chip: materialBadge,
    checkbox: materialCheckbox, select: materialSelect, dropdown: materialSelect,
    tabs: materialTabs, table: materialTable, 'data table': materialTable,
    alert: materialAlert, notification: materialAlert, toast: materialAlert,
    avatar: materialAvatar, accordion: materialAccordion,
  },
  'radix ui': {
    button: radixButton, input: radixInput, 'text field': radixInput,
    card: radixCard, dialog: radixDialog, modal: radixDialog,
    switch: radixSwitch, toggle: radixSwitch,
    badge: radixBadge, tag: radixBadge, chip: radixBadge,
    checkbox: radixCheckbox, select: radixSelect, dropdown: radixSelect,
    tabs: radixTabs, table: radixTable, 'data table': radixTable,
    alert: radixAlert, notification: radixAlert, toast: radixAlert,
    avatar: radixAvatar, accordion: radixAccordion,
  },
  'fluent ui': {
    button: fluentButton, input: fluentInput, 'text field': fluentInput,
    card: fluentCard, dialog: fluentDialog, modal: fluentDialog,
    switch: fluentSwitch, toggle: fluentSwitch,
    badge: fluentBadge, tag: fluentBadge, chip: fluentBadge,
    checkbox: fluentCheckbox, select: fluentSelect, dropdown: fluentSelect,
    tabs: fluentTabs, table: fluentTable, 'data table': fluentTable,
    alert: fluentAlert, notification: fluentAlert, toast: fluentAlert,
    avatar: fluentAvatar, accordion: fluentAccordion,
  },
  'apple liquid glass': {
    button: glassButton, input: glassInput, 'text field': glassInput,
    card: glassCard, dialog: glassDialog, modal: glassDialog,
    switch: glassSwitch, toggle: glassSwitch,
    badge: glassBadge, tag: glassBadge, chip: glassBadge,
    checkbox: glassCheckbox, select: glassSelect, dropdown: glassSelect,
    tabs: glassTabs, table: glassTable, 'data table': glassTable,
    alert: glassAlert, notification: glassAlert, toast: glassAlert,
    avatar: glassAvatar, accordion: glassAccordion,
  },
};

/* ─── Library name normalization ────────────────────────── */

function resolveLibraryKey(libraryName: string | undefined): string | undefined {
  if (!libraryName) return undefined;
  const lower = libraryName.toLowerCase().trim();
  // Exact match
  if (LIBRARY_OVERRIDES[lower]) return lower;
  // Fuzzy matches
  for (const key of Object.keys(LIBRARY_OVERRIDES)) {
    const norm = key.replace(/[\\s/\\-_]+/g, '');
    const lowerNorm = lower.replace(/[\\s/\\-_]+/g, '');
    if (lowerNorm === norm) return key;
    if (lowerNorm.includes(norm) || norm.includes(lowerNorm)) return key;
  }
  return undefined;
}

/* ═══════════════════════════════════════════════════════════
   Main export
   ═══════════════════════════════════════════════════════════ */

export function generateComponentPreviewHTML(
  componentName: string,
  category: string | undefined,
  libraryName: string | undefined,
  theme: ThemeTokens,
): { html: string; width: number; height: number } {
  const key = componentName.toLowerCase().trim();

  // Determine size
  const isSmall = SMALL_COMPONENTS.has(key);
  const width = isSmall ? SMALL_W : LARGE_W;
  const height = isSmall ? SMALL_H : LARGE_H;

  // Check for library-specific override first
  const libKey = resolveLibraryKey(libraryName);
  if (libKey) {
    const overrides = LIBRARY_OVERRIDES[libKey];
    const override = overrides?.[key];
    if (override) {
      return { html: override(theme), width, height };
    }
  }

  // Fall back to generic theme-based renderers
  let html: string;

  if (key === 'button') {
    html = renderButton(theme);
  } else if (key === 'input' || key === 'text field') {
    html = renderInput(theme);
  } else if (key === 'textarea') {
    html = renderInput(theme);
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
