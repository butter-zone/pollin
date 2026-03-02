/**
 * UI Template Engine
 *
 * Generates high-fidelity HTML/CSS UI mockups from natural language prompts.
 * Each template produces self-contained HTML with inline styles that renders
 * as a realistic UI design mockup — not code, but visual output.
 *
 * Supports design system theming (shadcn, Material, Fluent, Radix, Ant, Apple Glass).
 */

import { icon, iconFilled } from '@/services/ui-icons';

/* ─── HTML escape (prevent XSS from user prompts) ───────── */

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Sanitize & truncate a prompt-derived title for embedding in HTML */
function safeTitle(raw: string, fallback: string, maxLen = 60): string {
  const trimmed = raw.trim() || fallback;
  const truncated = trimmed.length > maxLen ? trimmed.slice(0, maxLen - 1) + '…' : trimmed;
  return escapeHTML(truncated);
}

/* ─── Design system theme tokens ────────────────────────── */

export interface ThemeTokens {
  fontFamily: string;
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  radius: string;
  radiusSm: string;
  radiusLg: string;
  shadow: string;
  shadowLg: string;
  inputBg: string;
  inputBorder: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
}

const DEFAULT_THEME: ThemeTokens = {
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  bg: '#ffffff',
  surface: '#f9fafb',
  surfaceHover: '#f3f4f6',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  primary: '#2563eb',
  primaryText: '#ffffff',
  radius: '8px',
  radiusSm: '6px',
  radiusLg: '12px',
  shadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  accent: '#8b5cf6',
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const THEMES: Record<string, Partial<ThemeTokens>> = {
  'shadcn/ui': {
    fontFamily: `'Inter', -apple-system, sans-serif`,
    bg: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    border: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    primary: '#fafafa',
    primaryText: '#09090b',
    radius: '6px',
    radiusSm: '4px',
    radiusLg: '8px',
    shadow: '0 1px 2px rgba(0,0,0,0.3)',
    shadowLg: '0 8px 16px rgba(0,0,0,0.4)',
    inputBg: '#09090b',
    inputBorder: '#27272a',
    accent: '#a78bfa',
    danger: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
  },
  'material ui 3': {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
    bg: '#fafafa',
    surface: '#ffffff',
    surfaceHover: '#f5f5f5',
    border: '#e0e0e0',
    text: '#212121',
    textMuted: '#757575',
    primary: '#1976d2',
    primaryText: '#ffffff',
    radius: '4px',
    radiusSm: '4px',
    radiusLg: '8px',
    shadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.12)',
    shadowLg: '0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
    inputBg: '#ffffff',
    inputBorder: '#bdbdbd',
    accent: '#9c27b0',
    danger: '#d32f2f',
    success: '#2e7d32',
    warning: '#ed6c02',
  },
  'fluent ui': {
    fontFamily: `'Segoe UI', 'Segoe UI Web', sans-serif`,
    bg: '#fafafa',
    surface: '#ffffff',
    surfaceHover: '#f5f5f5',
    border: '#e0e0e0',
    text: '#242424',
    textMuted: '#707070',
    primary: '#0078d4',
    primaryText: '#ffffff',
    radius: '4px',
    radiusSm: '2px',
    radiusLg: '8px',
    shadow: '0 2px 4px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.12)',
    shadowLg: '0 8px 16px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.12)',
    inputBg: '#ffffff',
    inputBorder: '#8a8886',
    accent: '#8764b8',
    danger: '#d13438',
    success: '#107c10',
    warning: '#ffb900',
  },
  'radix ui': {
    fontFamily: `'Inter', -apple-system, sans-serif`,
    bg: '#111113',
    surface: '#18191b',
    surfaceHover: '#212225',
    border: '#2b2c2f',
    text: '#eeeef0',
    textMuted: '#9b9ba7',
    primary: '#3e63dd',
    primaryText: '#ffffff',
    radius: '6px',
    radiusSm: '4px',
    radiusLg: '10px',
    shadow: '0 2px 8px rgba(0,0,0,0.3)',
    shadowLg: '0 12px 24px rgba(0,0,0,0.4)',
    inputBg: '#111113',
    inputBorder: '#2b2c2f',
    accent: '#7c66dc',
    danger: '#e5484d',
    success: '#30a46c',
    warning: '#f5a623',
  },
  'apple liquid glass': {
    fontFamily: `-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif`,
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: 'rgba(255,255,255,0.18)',
    surfaceHover: 'rgba(255,255,255,0.25)',
    border: 'rgba(255,255,255,0.2)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.7)',
    primary: 'rgba(0,122,255,0.55)',
    primaryText: '#ffffff',
    radius: '22px',
    radiusSm: '14px',
    radiusLg: '26px',
    shadow: '0 8px 32px rgba(0,0,0,0.15)',
    shadowLg: '0 16px 48px rgba(0,0,0,0.2)',
    inputBg: 'rgba(255,255,255,0.12)',
    inputBorder: 'rgba(255,255,255,0.15)',
    accent: 'rgba(0,122,255,0.55)',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FFD60A',
  },
  'ant design': {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    bg: '#ffffff',
    surface: '#fafafa',
    surfaceHover: '#f0f0f0',
    border: '#d9d9d9',
    text: 'rgba(0,0,0,0.88)',
    textMuted: 'rgba(0,0,0,0.45)',
    primary: '#1677ff',
    primaryText: '#ffffff',
    radius: '6px',
    radiusSm: '4px',
    radiusLg: '8px',
    shadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)',
    shadowLg: '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
    inputBg: '#ffffff',
    inputBorder: '#d9d9d9',
    accent: '#722ed1',
    danger: '#ff4d4f',
    success: '#52c41a',
    warning: '#faad14',
  },
};

function getTheme(libraryName?: string): ThemeTokens {
  if (!libraryName) return DEFAULT_THEME;
  const key = libraryName.toLowerCase();
  // Exact match first, then prefix match (e.g. 'material ui 3' matches 'material ui')
  let override = THEMES[key];
  if (!override) {
    for (const [k, v] of Object.entries(THEMES)) {
      if (key.startsWith(k) || k.startsWith(key)) { override = v; break; }
    }
  }
  if (!override) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...override };
}

/* ─── Prompt classification ─────────────────────────────── */

type UIType =
  | 'login'
  | 'signup'
  | 'finance'
  | 'dashboard'
  | 'settings'
  | 'profile'
  | 'pricing'
  | 'landing'
  | 'navbar'
  | 'sidebar'
  | 'card'
  | 'form'
  | 'table'
  | 'chat'
  | 'modal'
  | 'notification'
  | 'onboarding'
  | 'search'
  | 'media-player'
  | 'calendar'
  | 'email'
  | 'ecommerce'
  | 'kanban'
  | 'todo'
  | 'generic';

const UI_PATTERNS: [RegExp, UIType][] = [
  [/\b(log\s*in|sign\s*in|auth(?:entication)?)\b/i, 'login'],
  [/\b(sign\s*up|register|create\s*account|onboard)\b/i, 'signup'],
  [/\b(finance|financial|bank(?:ing)?|wallet|budget(?:ing)?|expense(?:s)?|transaction(?:s)?|portfolio|investment(?:s)?|wealth|cash\s*flow|balance\s*sheet)\b/i, 'finance'],
  [/\b(weather|forecast|climate|temperature|rain|snow|storm|cook(?:ing)?|recipe|meal\s*plan|kitchen|car|cars|auto|automotive|vehicle|travel|trip|itinerary|flight|hotel|fitness|workout|gym|health|healthcare|medical|doctor|education|course|learning|school|task\s*manager|productivity|e-?commerce|shop|store|checkout|inventory)\b/i, 'dashboard'],
  [/\b(dashboard|analytics|metrics|stats|overview)\b/i, 'dashboard'],
  [/\b(settings?|preferences?|config(?:uration)?)\b/i, 'settings'],
  [/\b(profile|account|user\s*page)\b/i, 'profile'],
  [/\b(pricing|plans?|subscription|billing)\b/i, 'pricing'],
  [/\b(landing|hero|homepage|home\s*page)\b/i, 'landing'],
  [/\b(nav(?:bar|igation)?|header|top\s*bar|menu\s*bar)\b/i, 'navbar'],
  [/\b(sidebar|side\s*nav|drawer|left\s*panel)\b/i, 'sidebar'],
  [/\b(card|tile|widget)\b/i, 'card'],
  [/\b(form|input|contact|feedback|survey)\b/i, 'form'],
  [/\b(table|data\s*grid|spreadsheet|list\s*view)\b/i, 'table'],
  [/\b(chat|messag(?:e|ing)|conversation|inbox)\b/i, 'chat'],
  [/\b(modal|dialog|popup|overlay)\b/i, 'modal'],
  [/\b(notification|toast|alert|banner)\b/i, 'notification'],
  [/\b(onboarding|wizard|stepper|walkthrough)\b/i, 'onboarding'],
  [/\b(search|explore|discover|browse)\b/i, 'search'],
  [/\b(media|player|video|music|audio)\b/i, 'media-player'],
  [/\b(calendar|schedule|event|appointment)\b/i, 'calendar'],
  [/\b(email|mail|compose|newsletter)\b/i, 'email'],
  [/\b(e-?commerce|shop|store|product|cart|checkout)\b/i, 'ecommerce'],
  [/\b(kanban|board|trello|sprint|backlog|columns?\s*view)\b/i, 'kanban'],
  [/\b(todo|to-?do|task\s*list|checklist|tasks?)\b/i, 'todo'],
  [/\b(app|mobile\s*app|web\s*app|platform|saas|product\s*app|tool)\b/i, 'dashboard'],
];

function classifyPrompt(prompt: string): UIType {
  for (const [pattern, type] of UI_PATTERNS) {
    if (pattern.test(prompt)) return type;
  }
  return 'generic';
}

/* ─── Dark mode detection ───────────────────────────────── */

function wantsDark(prompt: string, theme: ThemeTokens): boolean {
  if (/\bdark\b/i.test(prompt)) return true;
  // shadcn and radix themes are already dark
  if (theme.bg.startsWith('#0') || theme.bg.startsWith('#1')) return true;
  return false;
}

/* ─── Glass backdrop helper ─────────────────────────────── */

function isGlassTheme(libraryName?: string): boolean {
  return libraryName?.toLowerCase().includes('glass') ?? false;
}

function glassStyles(t: ThemeTokens): string {
  return `backdrop-filter: blur(20px) saturate(1.8); -webkit-backdrop-filter: blur(20px) saturate(1.8); background: ${t.surface}; border: 1px solid ${t.border};`;
}

/* ─── Shared CSS reset & base ───────────────────────────── */

function baseCSS(t: ThemeTokens): string {
  const bgVal = `background: ${t.bg};`;
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html {
      font-family: ${t.fontFamily};
      color: ${t.text};
      ${bgVal}
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
      min-height: 100%;
      line-height: 1.5;
      font-size: 14px;
    }
    .container {
      width: 420px;
      min-height: 580px;
      padding: 32px;
      ${bgVal}
      position: relative;
      overflow: hidden;
    }
    .container--wide {
      width: 780px;
    }
    .container--full {
      width: 900px;
      min-height: 620px;
    }
    input, textarea, select {
      font-family: inherit;
      font-size: 14px;
      padding: 10px 12px;
      border-radius: ${t.radiusSm};
      border: 1px solid ${t.inputBorder};
      background: ${t.inputBg};
      color: ${t.text};
      outline: none;
      width: 100%;
      line-height: 20px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input:focus, textarea:focus {
      border-color: ${t.primary};
      box-shadow: 0 0 0 2px ${t.primary}18;
    }
    button {
      font-family: inherit;
      cursor: pointer;
      border: none;
      outline: none;
      transition: all 0.15s;
      line-height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-align: center;
    }
    .btn-primary {
      background: ${t.primary};
      color: ${t.primaryText};
      padding: 10px 20px;
      border-radius: ${t.radiusSm};
      font-size: 14px;
      font-weight: 500;
      width: 100%;
      letter-spacing: -0.006em;
    }
    .btn-secondary {
      background: ${t.surface};
      color: ${t.text};
      padding: 10px 20px;
      border-radius: ${t.radiusSm};
      font-size: 14px;
      font-weight: 500;
      border: 1px solid ${t.border};
      width: 100%;
      letter-spacing: -0.006em;
    }
    .text-muted { color: ${t.textMuted}; }
    .text-sm { font-size: 13px; line-height: 18px; }
    .text-xs { font-size: 11px; line-height: 16px; letter-spacing: 0.01em; }
    .text-lg { font-size: 18px; font-weight: 600; line-height: 24px; letter-spacing: -0.01em; }
    .text-xl { font-size: 24px; font-weight: 700; line-height: 30px; letter-spacing: -0.025em; }
    .text-2xl { font-size: 30px; font-weight: 700; line-height: 36px; letter-spacing: -0.03em; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .gap-4 { gap: 16px; }
    .gap-6 { gap: 24px; }
    .w-full { width: 100%; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    .mb-2 { margin-bottom: 8px; }
    .p-4 { padding: 16px; }
    .rounded { border-radius: ${t.radius}; }
    .surface {
      background: ${t.surface};
      border: 1px solid ${t.border};
      border-radius: ${t.radius};
    }
    .shadow { box-shadow: ${t.shadow}; }
    .avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: ${t.primary};
      display: flex; align-items: center; justify-content: center;
      color: ${t.primaryText}; font-weight: 600; font-size: 16px;
      flex-shrink: 0;
    }
    .avatar--sm { width: 32px; height: 32px; font-size: 13px; }
    .avatar--lg { width: 56px; height: 56px; font-size: 22px; }
    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500;
      background: ${t.surface}; border: 1px solid ${t.border};
    }
    .divider {
      height: 1px; background: ${t.border}; width: 100%;
    }
    .icon-placeholder {
      width: 20px; height: 20px;
      border-radius: 4px;
      background: ${t.textMuted};
      opacity: 0.3;
      flex-shrink: 0;
    }
    .toggle-track {
      width: 44px; height: 24px;
      border-radius: 12px;
      background: ${t.border};
      position: relative;
      flex-shrink: 0;
    }
    .toggle-track--on {
      background: ${t.primary};
    }
    .toggle-thumb {
      width: 20px; height: 20px;
      border-radius: 50%;
      background: white;
      position: absolute;
      top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-track--on .toggle-thumb {
      left: 22px;
    }
  `;
}

/* ─── Template generators ───────────────────────────────── */

function loginTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  return `
    <div class="container flex flex-col justify-center" style="gap:32px;">
      <div style="text-align:center;">
        <div class="avatar avatar--lg" style="margin:0 auto 16px;">P</div>
        <div class="text-xl">Welcome back</div>
        <div class="text-sm text-muted" style="margin-top:4px;">Sign in to your account</div>
      </div>
      <div class="flex flex-col gap-4" style="${gs} ${glass ? 'padding:24px;border-radius:' + t.radiusLg : ''}">
        <div class="flex flex-col gap-2">
          <label class="text-sm" style="font-weight:500;">Email</label>
          <input type="email" placeholder="name@example.com" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <label class="text-sm" style="font-weight:500;">Password</label>
            <span class="text-xs" style="color:${t.primary};cursor:pointer;">Forgot password?</span>
          </div>
          <input type="password" placeholder="••••••••" />
        </div>
        <button class="btn-primary" style="margin-top:8px;">Sign in</button>
        <div class="divider"></div>
        <button class="btn-secondary">
          <span class="flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="${t.textMuted}" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="${t.textMuted}" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
            Continue with Google
          </span>
        </button>
      </div>
      <div class="text-sm text-muted" style="text-align:center;">
        Don't have an account? <span style="color:${t.primary};cursor:pointer;">Sign up</span>
      </div>
    </div>
  `;
}

function signupTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  return `
    <div class="container flex flex-col justify-center" style="gap:28px;">
      <div style="text-align:center;">
        <div class="text-xl">Create your account</div>
        <div class="text-sm text-muted" style="margin-top:4px;">Start your free trial today</div>
      </div>
      <div class="flex flex-col gap-4" style="${gs} ${glass ? 'padding:24px;border-radius:' + t.radiusLg : ''}">
        <div class="flex gap-3">
          <div class="flex flex-col gap-2 w-full">
            <label class="text-sm" style="font-weight:500;">First name</label>
            <input placeholder="John" />
          </div>
          <div class="flex flex-col gap-2 w-full">
            <label class="text-sm" style="font-weight:500;">Last name</label>
            <input placeholder="Doe" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm" style="font-weight:500;">Email</label>
          <input type="email" placeholder="john@example.com" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm" style="font-weight:500;">Password</label>
          <input type="password" placeholder="Create a strong password" />
          <div class="text-xs text-muted">Must be at least 8 characters</div>
        </div>
        <div class="flex items-center gap-2" style="margin-top:4px;">
          <div style="width:16px;height:16px;border:1.5px solid ${t.inputBorder};border-radius:4px;"></div>
          <span class="text-sm text-muted">I agree to the Terms and Privacy Policy</span>
        </div>
        <button class="btn-primary" style="margin-top:4px;">Create account</button>
      </div>
      <div class="text-sm text-muted" style="text-align:center;">
        Already have an account? <span style="color:${t.primary};cursor:pointer;">Sign in</span>
      </div>
    </div>
  `;
}

function dashboardTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} padding:20px; border-radius:${t.radiusLg};`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:20px; border-radius:${t.radius};`;
  return `
    <div class="container container--full" style="padding:24px;">
      <div class="flex justify-between items-center" style="margin-bottom:24px;">
        <div>
          <div class="text-xl">Dashboard</div>
          <div class="text-sm text-muted">Welcome back, here's what's happening</div>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary" style="width:auto;padding:8px 16px;">Export</button>
          <button class="btn-primary" style="width:auto;padding:8px 16px;">+ New</button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px;">
        <div style="${cardStyle}">
          <div class="text-xs text-muted" style="margin-bottom:8px;">Total Revenue</div>
          <div class="text-xl">$45,231</div>
          <div class="text-xs" style="color:${t.success}; margin-top:4px;">↑ 20.1% from last month</div>
        </div>
        <div style="${cardStyle}">
          <div class="text-xs text-muted" style="margin-bottom:8px;">Subscriptions</div>
          <div class="text-xl">+2,350</div>
          <div class="text-xs" style="color:${t.success}; margin-top:4px;">↑ 180.1% from last month</div>
        </div>
        <div style="${cardStyle}">
          <div class="text-xs text-muted" style="margin-bottom:8px;">Sales</div>
          <div class="text-xl">+12,234</div>
          <div class="text-xs" style="color:${t.success}; margin-top:4px;">↑ 19% from last month</div>
        </div>
        <div style="${cardStyle}">
          <div class="text-xs text-muted" style="margin-bottom:8px;">Active Now</div>
          <div class="text-xl">+573</div>
          <div class="text-xs" style="color:${t.success}; margin-top:4px;">↑ 201 since last hour</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:16px;">
        <div style="${cardStyle}">
          <div class="text-lg" style="margin-bottom:16px;">Overview</div>
          <div style="display:flex; gap:4px; align-items:flex-end; height:180px;">
            ${[65, 45, 75, 55, 85, 60, 90, 50, 70, 80, 95, 40].map((h, i) =>
              `<div style="flex:1;background:${i === 10 ? t.primary : t.border};height:${h}%;border-radius:4px 4px 0 0;"></div>`
            ).join('')}
          </div>
          <div class="flex justify-between text-xs text-muted" style="margin-top:8px;">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>
        <div style="${cardStyle}">
          <div class="text-lg" style="margin-bottom:16px;">Recent Activity</div>
          <div class="flex flex-col gap-4">
            ${['Olivia Martin', 'Jackson Lee', 'Isabella Nguyen', 'William Kim', 'Sofia Davis'].map((name, i) =>
              `<div class="flex items-center gap-3">
                <div class="avatar avatar--sm" style="background:${[t.primary, t.accent, t.success, t.warning, t.danger][i]};">${name[0]}</div>
                <div style="flex:1;min-width:0;">
                  <div class="text-sm" style="font-weight:500;">${name}</div>
                  <div class="text-xs text-muted">${name.toLowerCase().replace(' ', '.')}@email.com</div>
                </div>
                <div class="text-sm" style="font-weight:500;">+$${(Math.random() * 2000 + 100).toFixed(0)}</div>
              </div>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function financeTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} padding:18px; border-radius:${t.radiusLg};`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:18px; border-radius:${t.radius};`;

  return `
    <div class="container container--full" style="padding:20px;">
      <div class="flex justify-between items-center" style="margin-bottom:18px;">
        <div>
          <div class="text-xl">Finance Home</div>
          <div class="text-sm text-muted">Track balances, spending, and goals in one place</div>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary" style="width:auto;padding:8px 14px;">${icon('search', 14, t.textMuted)} Insights</button>
          <button class="btn-primary" style="width:auto;padding:8px 14px;">${icon('plus', 14, t.primaryText)} Add transaction</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:14px;">
        <div style="${cardStyle}">
          <div class="text-xs text-muted" style="margin-bottom:8px;">Total balance</div>
          <div style="font-size:34px; font-weight:700; letter-spacing:-0.02em;">$128,430.24</div>
          <div class="flex items-center gap-2" style="margin-top:8px; font-size:12px; color:${t.success};">
            ${icon('trending-up', 12, t.success)} +2.8% this month
          </div>
          <div style="display:flex; gap:8px; margin-top:14px;">
            <span class="chip">Cash $18,210</span>
            <span class="chip">Investments $92,040</span>
            <span class="chip">Savings $18,180</span>
          </div>
        </div>
        <div style="${cardStyle}">
          <div class="text-sm" style="font-weight:600; margin-bottom:10px;">Quick Actions</div>
          <div class="flex flex-col gap-2">
            <button class="btn-secondary" style="text-align:left; justify-content:flex-start;">${icon('arrow-right-left', 14, t.text)} Transfer</button>
            <button class="btn-secondary" style="text-align:left; justify-content:flex-start;">${icon('wallet', 14, t.text)} Pay bill</button>
            <button class="btn-secondary" style="text-align:left; justify-content:flex-start;">${icon('target', 14, t.text)} Create goal</button>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:14px;">
        <div style="${cardStyle}">
          <div class="text-sm" style="font-weight:600; margin-bottom:10px;">Spending Overview</div>
          <div style="display:flex; gap:4px; align-items:flex-end; height:130px; margin-bottom:8px;">
            ${[35, 52, 46, 64, 60, 58, 72, 67, 74, 68, 76, 83].map((h, i) =>
              `<div style="flex:1;background:${i > 9 ? t.primary : t.border};height:${h}%;border-radius:3px 3px 0 0;"></div>`
            ).join('')}
          </div>
          <div class="flex justify-between text-xs text-muted"><span>Jan</span><span>Jun</span><span>Dec</span></div>
        </div>

        <div style="${cardStyle}">
          <div class="text-sm" style="font-weight:600; margin-bottom:10px;">Budget Health</div>
          ${[
            ['Housing', '74%'],
            ['Food', '58%'],
            ['Transport', '42%'],
            ['Entertainment', '65%'],
          ].map(([k, v]) => `
            <div style="margin-bottom:10px;">
              <div class="flex justify-between text-xs" style="margin-bottom:4px;"><span>${k}</span><span class="text-muted">${v}</span></div>
              <div style="height:7px;background:${t.border};border-radius:9999px;overflow:hidden;"><div style="height:100%;width:${v};background:${t.primary};"></div></div>
            </div>
          `).join('')}
        </div>

        <div style="${cardStyle}">
          <div class="text-sm" style="font-weight:600; margin-bottom:10px;">Recent Transactions</div>
          <div class="flex flex-col gap-10">
            ${[
              ['Salary', '+$4,200', t.success],
              ['Rent', '-$1,450', t.danger],
              ['Coffee Shop', '-$12.40', t.textMuted],
              ['ETF Buy', '-$600', t.warning],
              ['Dividend', '+$84', t.success],
            ].map(([name, value, color]) => `
              <div class="flex justify-between items-center text-sm">
                <span>${name}</span>
                <span style="color:${color};font-weight:600;">${value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function settingsTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const sectionStyle = glass
    ? `${gs} padding:20px; border-radius:${t.radiusLg}; margin-bottom:16px;`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:20px; border-radius:${t.radius}; margin-bottom:16px;`;
  return `
    <div class="container container--wide" style="padding:32px;">
      <div class="text-xl" style="margin-bottom:4px;">Settings</div>
      <div class="text-sm text-muted" style="margin-bottom:24px;">Manage your account preferences</div>
      <div class="flex gap-6">
        <div style="width:180px; flex-shrink:0;">
          ${['General', 'Notifications', 'Appearance', 'Security', 'Billing', 'Integrations'].map((item, i) =>
            `<div style="padding:8px 12px; border-radius:${t.radiusSm}; font-size:14px; cursor:pointer; ${i === 0 ? `background:${t.surfaceHover}; font-weight:500;` : `color:${t.textMuted};`}">${item}</div>`
          ).join('')}
        </div>
        <div style="flex:1;">
          <div style="${sectionStyle}">
            <div class="text-lg" style="margin-bottom:16px;">Profile</div>
            <div class="flex gap-4" style="margin-bottom:16px;">
              <div class="avatar avatar--lg">U</div>
              <div>
                <div style="font-weight:500;">Upload a photo</div>
                <div class="text-xs text-muted">JPG, PNG or GIF. Max 2MB.</div>
                <button class="btn-secondary" style="width:auto; padding:6px 12px; font-size:12px; margin-top:8px;">Change avatar</button>
              </div>
            </div>
            <div class="flex gap-3" style="margin-bottom:12px;">
              <div class="flex flex-col gap-2 w-full">
                <label class="text-sm" style="font-weight:500;">Display name</label>
                <input value="Alex Johnson" />
              </div>
              <div class="flex flex-col gap-2 w-full">
                <label class="text-sm" style="font-weight:500;">Username</label>
                <input value="@alexj" />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm" style="font-weight:500;">Bio</label>
              <textarea rows="3" style="resize:none;" placeholder="Tell us about yourself…"></textarea>
            </div>
          </div>
          <div style="${sectionStyle}">
            <div class="text-lg" style="margin-bottom:16px;">Notifications</div>
            ${['Email notifications', 'Push notifications', 'Weekly digest', 'Marketing emails'].map((label, i) =>
              `<div class="flex justify-between items-center" style="padding:8px 0; ${i > 0 ? `border-top:1px solid ${t.border};` : ''}">
                <div>
                  <div class="text-sm" style="font-weight:500;">${label}</div>
                  <div class="text-xs text-muted">Receive ${label.toLowerCase()} about activity</div>
                </div>
                <div class="toggle-track${i < 2 ? ' toggle-track--on' : ''}"><div class="toggle-thumb"></div></div>
              </div>`
            ).join('')}
          </div>
          <div class="flex justify-between">
            <button class="btn-secondary" style="width:auto;padding:8px 20px;">Cancel</button>
            <button class="btn-primary" style="width:auto;padding:8px 20px;">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function profileTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} padding:20px; border-radius:${t.radiusLg};`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:20px; border-radius:${t.radius};`;
  return `
    <div class="container" style="padding:0;">
      <div style="height:120px; background:linear-gradient(135deg, ${t.primary}, ${t.accent}); position:relative;">
        <div class="avatar avatar--lg" style="position:absolute; bottom:-28px; left:32px; width:80px; height:80px; font-size:32px; border:4px solid ${t.bg};">A</div>
      </div>
      <div style="padding:44px 32px 32px;">
        <div class="flex justify-between items-center" style="margin-bottom:16px;">
          <div>
            <div class="text-xl">Alex Johnson</div>
            <div class="text-sm text-muted">@alexj · Product Designer</div>
          </div>
          <button class="btn-primary" style="width:auto; padding:8px 20px;">Edit profile</button>
        </div>
        <div class="text-sm" style="margin-bottom:20px; line-height:1.5;">
          Building beautiful interfaces. Previously at Figma. Love design systems, coffee, and open source.
        </div>
        <div class="flex gap-6 text-sm" style="margin-bottom:24px;">
          <span><strong>1,234</strong> <span class="text-muted">following</span></span>
          <span><strong>5,678</strong> <span class="text-muted">followers</span></span>
          <span class="text-muted">📍 San Francisco</span>
        </div>
        <div class="divider" style="margin-bottom:20px;"></div>
        <div class="text-lg" style="margin-bottom:12px;">Recent Work</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          ${['Design System v2', 'Mobile App Redesign', 'Dashboard UI', 'Brand Guidelines'].map((title, i) =>
            `<div style="${cardStyle}">
              <div style="height:80px; border-radius:${t.radiusSm}; background:${[t.primary, t.accent, t.success, t.warning][i]}; opacity:0.15; margin-bottom:12px;"></div>
              <div class="text-sm" style="font-weight:500;">${title}</div>
              <div class="text-xs text-muted">${Math.floor(Math.random() * 28 + 1)} days ago</div>
            </div>`
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

function pricingTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const plans = [
    { name: 'Free', price: '$0', desc: 'For individuals', features: ['5 projects', '1 GB storage', 'Basic analytics', 'Email support'] },
    { name: 'Pro', price: '$19', desc: 'For professionals', features: ['Unlimited projects', '100 GB storage', 'Advanced analytics', 'Priority support', 'Custom domains'], popular: true },
    { name: 'Enterprise', price: '$49', desc: 'For teams', features: ['Everything in Pro', '1 TB storage', 'SSO & SAML', 'Dedicated support', 'SLA guarantee', 'Custom integrations'] },
  ];
  return `
    <div class="container container--wide" style="padding:40px 32px; text-align:center;">
      <div class="text-xl" style="font-size:28px; margin-bottom:8px;">Simple, transparent pricing</div>
      <div class="text-sm text-muted" style="margin-bottom:32px;">Choose the plan that fits your needs</div>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; text-align:left;">
        ${plans.map(plan => {
          const style = plan.popular
            ? `border:2px solid ${t.primary}; ${glass ? gs : `background:${t.surface};`} padding:24px; border-radius:${t.radiusLg}; position:relative;`
            : `${glass ? gs : `background:${t.surface}; border:1px solid ${t.border};`} padding:24px; border-radius:${t.radiusLg};`;
          return `
            <div style="${style}">
              ${plan.popular ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${t.primary};color:${t.primaryText};font-size:11px;font-weight:600;padding:2px 12px;border-radius:99px;">Most Popular</div>` : ''}
              <div class="text-lg">${plan.name}</div>
              <div style="font-size:32px;font-weight:700;margin:12px 0 4px;">${plan.price}<span class="text-sm text-muted" style="font-weight:400;">/mo</span></div>
              <div class="text-sm text-muted" style="margin-bottom:20px;">${plan.desc}</div>
              <button class="${plan.popular ? 'btn-primary' : 'btn-secondary'}" style="margin-bottom:20px;">Get started</button>
              <div class="flex flex-col gap-3">
                ${plan.features.map(f => `
                  <div class="flex items-center gap-2 text-sm">
                    <span style="color:${t.success};">✓</span>
                    ${f}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function landingTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const title = safeTitle(prompt.replace(/\b(landing|hero|page|homepage|home|design|create|make|build|generate|a|an|the|with|for|my)\b/gi, '').trim(), 'Build faster');
  return `
    <div class="container container--wide" style="padding:0;">
      <div class="flex justify-between items-center" style="padding:16px 32px; border-bottom:1px solid ${t.border};">
        <div class="flex items-center gap-2">
          <div style="width:28px; height:28px; border-radius:6px; background:${t.primary};"></div>
          <span style="font-weight:600; font-size:16px;">Brand</span>
        </div>
        <div class="flex items-center gap-6 text-sm">
          <span>Features</span><span>Pricing</span><span>About</span>
          <button class="btn-primary" style="width:auto; padding:8px 16px;">Get started</button>
        </div>
      </div>
      <div style="padding:80px 32px 60px; text-align:center;">
        <div class="chip" style="margin:0 auto 16px; ${glass ? gs : ''}">${'✨ Now in beta'}</div>
        <div style="font-size:42px; font-weight:800; line-height:1.1; margin-bottom:16px; letter-spacing:-0.02em;">
          ${title.charAt(0).toUpperCase() + title.slice(1)}<br/>with superpowers
        </div>
        <div class="text-muted" style="font-size:17px; max-width:480px; margin:0 auto 32px; line-height:1.5;">
          The all-in-one platform that helps you ship products faster. Designed for modern teams.
        </div>
        <div class="flex justify-center gap-3">
          <button class="btn-primary" style="width:auto; padding:12px 28px; font-size:15px;">Start free trial</button>
          <button class="btn-secondary" style="width:auto; padding:12px 28px; font-size:15px;">Watch demo →</button>
        </div>
      </div>
      <div style="margin:0 32px 32px; ${glass ? gs : `background:${t.surface}; border:1px solid ${t.border};`} border-radius:${t.radiusLg}; padding:32px; display:grid; grid-template-columns:repeat(3,1fr); gap:24px;">
        ${[
          { title: 'Lightning Fast', desc: 'Built on modern infrastructure for blazing performance' },
          { title: 'Secure by Default', desc: 'Enterprise-grade security with end-to-end encryption' },
          { title: 'Team Collaboration', desc: 'Work together in real-time with powerful collaboration tools' },
        ].map(f => `
          <div style="text-align:center;">
            <div style="width:48px;height:48px;border-radius:${t.radius};background:${t.primary};opacity:0.15;margin:0 auto 12px;"></div>
            <div style="font-weight:600;margin-bottom:4px;">${f.title}</div>
            <div class="text-sm text-muted">${f.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function chatTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const bubbleStyle = glass ? gs : `background:${t.surface}; border:1px solid ${t.border};`;
  return `
    <div class="container" style="padding:0; display:flex; flex-direction:column;">
      <div style="padding:16px 20px; border-bottom:1px solid ${t.border}; ${glass ? gs : ''}" class="flex items-center gap-3">
        <div class="avatar avatar--sm">S</div>
        <div>
          <div class="text-sm" style="font-weight:600;">Sarah Chen</div>
          <div class="text-xs text-muted">Online</div>
        </div>
      </div>
      <div style="flex:1; padding:20px; display:flex; flex-direction:column; gap:16px; overflow:auto;">
        <div style="max-width:75%;">
          <div style="${bubbleStyle} padding:10px 14px; border-radius:${t.radius} ${t.radius} ${t.radius} 4px;">
            <div class="text-sm">Hey! Did you see the new designs? I think they look great 🎨</div>
          </div>
          <div class="text-xs text-muted" style="margin-top:4px;">2:30 PM</div>
        </div>
        <div style="max-width:75%; align-self:flex-end;">
          <div style="background:${t.primary}; color:${t.primaryText}; padding:10px 14px; border-radius:${t.radius} ${t.radius} 4px ${t.radius};">
            <div class="text-sm">Yes! Love the new color scheme. The dashboard looks clean 👌</div>
          </div>
          <div class="text-xs text-muted" style="margin-top:4px; text-align:right;">2:31 PM</div>
        </div>
        <div style="max-width:75%;">
          <div style="${bubbleStyle} padding:10px 14px; border-radius:${t.radius} ${t.radius} ${t.radius} 4px;">
            <div class="text-sm">Great! I'll finalize the components and share the Figma link. Should be ready by end of day.</div>
          </div>
          <div class="text-xs text-muted" style="margin-top:4px;">2:33 PM</div>
        </div>
        <div style="max-width:75%; align-self:flex-end;">
          <div style="background:${t.primary}; color:${t.primaryText}; padding:10px 14px; border-radius:${t.radius} ${t.radius} 4px ${t.radius};">
            <div class="text-sm">Perfect, looking forward to it! 🚀</div>
          </div>
          <div class="text-xs text-muted" style="margin-top:4px; text-align:right;">2:34 PM</div>
        </div>
      </div>
      <div style="padding:12px 16px; border-top:1px solid ${t.border}; ${glass ? gs : ''}">
        <div class="flex items-center gap-2">
          <input placeholder="Type a message…" style="flex:1;" />
          <button class="btn-primary" style="width:auto; padding:10px 16px;">
            <span style="font-size:16px;">↑</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function tableTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const rows = [
    { name: 'Olivia Martin', email: 'olivia@email.com', status: 'Active', role: 'Admin', amount: '$1,999' },
    { name: 'Jackson Lee', email: 'jackson@email.com', status: 'Active', role: 'Member', amount: '$899' },
    { name: 'Isabella Nguyen', email: 'isabella@email.com', status: 'Inactive', role: 'Member', amount: '$499' },
    { name: 'William Kim', email: 'william@email.com', status: 'Active', role: 'Admin', amount: '$2,499' },
    { name: 'Sofia Davis', email: 'sofia@email.com', status: 'Pending', role: 'Viewer', amount: '$199' },
  ];
  return `
    <div class="container container--wide" style="padding:24px;">
      <div class="flex justify-between items-center" style="margin-bottom:20px;">
        <div>
          <div class="text-xl">Users</div>
          <div class="text-sm text-muted">Manage your team members</div>
        </div>
        <div class="flex gap-2">
          <input placeholder="Search users…" style="width:200px;" />
          <button class="btn-primary" style="width:auto; padding:8px 16px;">+ Add user</button>
        </div>
      </div>
      <div style="${glass ? gs : `background:${t.surface}; border:1px solid ${t.border};`} border-radius:${t.radius}; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="border-bottom:1px solid ${t.border};">
              <th style="text-align:left; padding:12px 16px; font-weight:500; color:${t.textMuted}; font-size:12px;">NAME</th>
              <th style="text-align:left; padding:12px 16px; font-weight:500; color:${t.textMuted}; font-size:12px;">STATUS</th>
              <th style="text-align:left; padding:12px 16px; font-weight:500; color:${t.textMuted}; font-size:12px;">ROLE</th>
              <th style="text-align:right; padding:12px 16px; font-weight:500; color:${t.textMuted}; font-size:12px;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, i) => `
              <tr style="${i < rows.length - 1 ? `border-bottom:1px solid ${t.border};` : ''}">
                <td style="padding:12px 16px;">
                  <div class="flex items-center gap-3">
                    <div class="avatar avatar--sm">${row.name[0]}</div>
                    <div>
                      <div style="font-weight:500;">${row.name}</div>
                      <div class="text-xs text-muted">${row.email}</div>
                    </div>
                  </div>
                </td>
                <td style="padding:12px 16px;">
                  <span class="chip" style="background:${row.status === 'Active' ? t.success : row.status === 'Pending' ? t.warning : t.danger}20; color:${row.status === 'Active' ? t.success : row.status === 'Pending' ? t.warning : t.danger}; border:none;">
                    ${row.status}
                  </span>
                </td>
                <td style="padding:12px 16px;" class="text-muted">${row.role}</td>
                <td style="padding:12px 16px; text-align:right; font-weight:500;">${row.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center text-sm text-muted" style="margin-top:12px;">
        <span>Showing 1-5 of 48 results</span>
        <div class="flex gap-2">
          <button class="btn-secondary" style="width:auto; padding:6px 12px; font-size:12px;">Previous</button>
          <button class="btn-secondary" style="width:auto; padding:6px 12px; font-size:12px;">Next</button>
        </div>
      </div>
    </div>
  `;
}

function ecommerceTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} border-radius:${t.radiusLg}; overflow:hidden;`
    : `background:${t.surface}; border:1px solid ${t.border}; border-radius:${t.radius}; overflow:hidden;`;
  const products = [
    { name: 'Minimal Desk Lamp', price: '$89', cat: 'Lighting', color: t.primary },
    { name: 'Ergonomic Chair', price: '$449', cat: 'Furniture', color: t.accent },
    { name: 'Wireless Charger', price: '$35', cat: 'Electronics', color: t.success },
    { name: 'Ceramic Mug Set', price: '$28', cat: 'Kitchen', color: t.warning },
  ];
  return `
    <div class="container container--wide" style="padding:24px;">
      <div class="flex justify-between items-center" style="margin-bottom:24px;">
        <div class="flex items-center gap-6">
          <span style="font-weight:700; font-size:18px;">Shop</span>
          <div class="flex gap-4 text-sm text-muted">
            <span style="color:${t.text}; font-weight:500;">All</span>
            <span>Lighting</span><span>Furniture</span><span>Electronics</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <input placeholder="Search products…" style="width:200px;" />
          <div style="position:relative;">
            ${icon('shopping-cart', 20, t.text)}
            <span style="position:absolute;top:-6px;right:-8px;background:${t.danger};color:white;font-size:10px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;">3</span>
          </div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
        ${products.map(p => `
          <div style="${cardStyle}">
            <div style="height:180px; background:${p.color}; opacity:0.12;"></div>
            <div style="padding:16px;">
              <div class="text-xs text-muted" style="margin-bottom:4px;">${p.cat}</div>
              <div class="text-sm" style="font-weight:600; margin-bottom:8px;">${p.name}</div>
              <div class="flex justify-between items-center">
                <span style="font-weight:700;">${p.price}</span>
                <button class="btn-primary" style="width:auto; padding:6px 12px; font-size:12px;">Add to cart</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function formTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const formStyle = glass ? `${gs} padding:24px; border-radius:${t.radiusLg};` : '';
  const formTitle = safeTitle(prompt.replace(/\b(form|create|make|build|generate|design|a|an|the|with|for|my)\b/gi, '').trim(), 'Contact');
  return `
    <div class="container flex flex-col justify-center" style="gap:24px;">
      <div>
        <div class="text-xl">${formTitle.charAt(0).toUpperCase() + formTitle.slice(1)} Form</div>
        <div class="text-sm text-muted" style="margin-top:4px;">Fill in the details below</div>
      </div>
      <div class="flex flex-col gap-4" style="${formStyle}">
        <div class="flex gap-3">
          <div class="flex flex-col gap-2 w-full">
            <label class="text-sm" style="font-weight:500;">Full Name</label>
            <input placeholder="John Doe" />
          </div>
          <div class="flex flex-col gap-2 w-full">
            <label class="text-sm" style="font-weight:500;">Email</label>
            <input type="email" placeholder="john@example.com" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm" style="font-weight:500;">Subject</label>
          <select style="padding:10px 12px;border:1px solid ${t.inputBorder};border-radius:${t.radiusSm};background:${t.inputBg};color:${t.text};font-size:14px;">
            <option>General Inquiry</option>
            <option>Technical Support</option>
            <option>Billing</option>
            <option>Partnership</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm" style="font-weight:500;">Message</label>
          <textarea rows="4" style="resize:none;" placeholder="How can we help you?"></textarea>
        </div>
        <div class="flex items-center gap-2">
          <div style="width:16px;height:16px;border:1.5px solid ${t.inputBorder};border-radius:4px;"></div>
          <span class="text-sm text-muted">Subscribe to newsletter</span>
        </div>
        <div class="flex gap-3" style="margin-top:8px;">
          <button class="btn-secondary">Cancel</button>
          <button class="btn-primary">Submit</button>
        </div>
      </div>
    </div>
  `;
}

function cardTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} padding:20px; border-radius:${t.radiusLg};`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:20px; border-radius:${t.radius}; box-shadow:${t.shadow};`;
  const cardTitle = safeTitle(prompt.replace(/\b(card|tile|widget|create|make|build|generate|design|a|an|the|with|for|my)\b/gi, '').trim(), 'Feature');
  return `
    <div class="container flex flex-col justify-center" style="gap:16px;">
      <div style="${cardStyle}">
        <div style="height:160px; border-radius:${t.radiusSm}; background:linear-gradient(135deg, ${t.primary}, ${t.accent}); margin-bottom:16px;"></div>
        <div class="text-lg">${cardTitle.charAt(0).toUpperCase() + cardTitle.slice(1)}</div>
        <div class="text-sm text-muted" style="margin-top:4px; line-height:1.5;">
          A beautifully designed component with thoughtful defaults and great attention to detail.
        </div>
        <div class="flex gap-2" style="margin-top:16px;">
          <span class="chip">Design</span>
          <span class="chip">UI</span>
          <span class="chip">Component</span>
        </div>
        <div class="divider" style="margin:16px 0;"></div>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="avatar avatar--sm">A</div>
            <div class="text-sm" style="font-weight:500;">Alex Johnson</div>
          </div>
          <div class="text-xs text-muted">2 days ago</div>
        </div>
      </div>
    </div>
  `;
}

function notificationTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const notifStyle = glass
    ? `${gs} padding:16px; border-radius:${t.radiusLg}; margin-bottom:8px;`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:16px; border-radius:${t.radius}; margin-bottom:8px; box-shadow:${t.shadow};`;
  return `
    <div class="container" style="padding:24px;">
      <div class="text-xl" style="margin-bottom:4px;">Notifications</div>
      <div class="text-sm text-muted" style="margin-bottom:20px;">You have 3 unread messages</div>
      <div class="flex flex-col">
        ${[
          { ic: 'bell', title: 'New comment on your post', desc: 'Sarah replied to your design review', time: '2 min ago', unread: true, color: t.primary },
          { ic: 'users', title: 'Welcome to the team!', desc: 'You\'ve been added to the Design team workspace', time: '1 hour ago', unread: true, color: t.accent },
          { ic: 'check-circle', title: 'Task completed', desc: 'Your export "Dashboard v2" has finished processing', time: '3 hours ago', unread: true, color: t.success },
          { ic: 'package', title: 'Version 2.0 released', desc: 'Check out the newest features and improvements', time: 'Yesterday', unread: false, color: t.warning },
          { ic: 'shield', title: 'Security update', desc: 'Your password was changed successfully', time: '2 days ago', unread: false, color: t.textMuted },
        ].map(n => `
          <div style="${notifStyle} ${n.unread ? `border-left:3px solid ${t.primary};` : 'opacity:0.7;'}">
            <div class="flex gap-3">
              <div style="width:36px;height:36px;border-radius:${t.radius};background:${n.color}12;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${icon(n.ic, 18, n.color)}
              </div>
              <div style="flex:1;">
                <div class="flex justify-between items-center">
                  <div class="text-sm" style="font-weight:${n.unread ? '600' : '400'};">${n.title}</div>
                  <div class="text-xs text-muted">${n.time}</div>
                </div>
                <div class="text-sm text-muted" style="margin-top:2px;">${n.desc}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function calendarTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cellStyle = `padding:8px; text-align:center; font-size:13px; border-radius:${t.radiusSm}; cursor:pointer;`;
  const today = 14;
  return `
    <div class="container" style="padding:24px;">
      <div class="flex justify-between items-center" style="margin-bottom:20px;">
        <div class="text-xl">February 2026</div>
        <div class="flex gap-2">
          <button class="btn-secondary" style="width:auto; padding:6px 10px; font-size:12px;">←</button>
          <button class="btn-secondary" style="width:auto; padding:6px 10px; font-size:12px;">Today</button>
          <button class="btn-secondary" style="width:auto; padding:6px 10px; font-size:12px;">→</button>
        </div>
      </div>
      <div style="${glass ? gs : `background:${t.surface}; border:1px solid ${t.border};`} border-radius:${t.radius}; padding:16px;">
        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:8px;">
          ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d =>
            `<div style="${cellStyle} font-weight:600; color:${t.textMuted}; font-size:11px;">${d}</div>`
          ).join('')}
        </div>
        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px;">
          ${Array(35).fill(0).map((_, i) => {
            const day = i - 2; // offset for month start
            if (day < 1 || day > 28) return `<div style="${cellStyle} color:${t.textMuted}; opacity:0.3;">${day < 1 ? 28 + day + 1 : day - 28}</div>`;
            const isToday = day === today;
            const hasEvent = [3, 8, 14, 19, 22].includes(day);
            return `<div style="${cellStyle} ${isToday ? `background:${t.primary}; color:${t.primaryText}; font-weight:600;` : ''} position:relative;">
              ${day}${hasEvent && !isToday ? `<div style="width:4px;height:4px;border-radius:50%;background:${t.primary};margin:2px auto 0;"></div>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="margin-top:20px;">
        <div class="text-lg" style="margin-bottom:12px;">Upcoming Events</div>
        ${[
          { time: '9:00 AM', title: 'Team Standup', color: t.primary },
          { time: '11:30 AM', title: 'Design Review', color: t.accent },
          { time: '2:00 PM', title: 'Client Presentation', color: t.success },
        ].map(e => `
          <div class="flex items-center gap-3" style="padding:10px 0; border-bottom:1px solid ${t.border};">
            <div class="text-sm text-muted" style="width:70px; flex-shrink:0;">${e.time}</div>
            <div style="width:3px; height:24px; border-radius:2px; background:${e.color}; flex-shrink:0;"></div>
            <div class="text-sm" style="font-weight:500;">${e.title}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── New dedicated templates (de-aliased + new types) ──── */

function navbarTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const title = safeTitle(prompt.replace(/\b(nav(?:bar|igation)?|header|top\s*bar|menu\s*bar|create|make|build|generate|design|a|an|the|with|for|my)\b/gi, '').trim(), 'App');
  return `
    <div class="container container--wide" style="padding:0;">
      <!-- Primary navbar -->
      <div style="padding:12px 24px; border-bottom:1px solid ${t.border}; ${glass ? gs : `background:${t.surface};`}" class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div style="width:32px;height:32px;border-radius:8px;background:${t.primary};display:flex;align-items:center;justify-content:center;">
            ${icon('zap', 18, t.primaryText)}
          </div>
          <span style="font-weight:700;font-size:17px;">${title.charAt(0).toUpperCase() + title.slice(1)}</span>
          <div class="flex items-center gap-1" style="margin-left:12px;">
            ${['Dashboard', 'Projects', 'Team', 'Reports'].map((item, i) =>
              `<div style="padding:6px 12px;border-radius:${t.radiusSm};font-size:14px;${i === 0 ? `background:${t.surfaceHover};font-weight:500;` : `color:${t.textMuted};`}">${item}</div>`
            ).join('')}
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div style="position:relative;">
            <input placeholder="Search…" style="width:200px;padding-left:32px;font-size:13px;" />
            <div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);">${icon('search', 14, t.textMuted)}</div>
          </div>
          <div style="position:relative;cursor:pointer;">
            ${icon('bell', 18, t.textMuted)}
            <div style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:${t.danger};border-radius:50%;border:2px solid ${t.surface};"></div>
          </div>
          <div class="avatar avatar--sm">U</div>
        </div>
      </div>
      <!-- Page content preview -->
      <div style="padding:32px 24px;">
        <div class="flex justify-between items-center" style="margin-bottom:24px;">
          <div>
            <div class="text-xl">Overview</div>
            <div class="text-sm text-muted" style="margin-top:2px;">Welcome back — here's what's new</div>
          </div>
          <button class="btn-primary" style="width:auto;padding:8px 16px;">${icon('plus', 14, t.primaryText)} New project</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
          ${[
            { label: 'Active Projects', value: '12', ic: 'layers', color: t.primary },
            { label: 'Open Tasks', value: '48', ic: 'check-circle', color: t.success },
            { label: 'Team Members', value: '8', ic: 'users', color: t.accent },
          ].map(c => `
            <div style="${glass ? gs : `background:${t.surface};border:1px solid ${t.border};`} padding:20px;border-radius:${t.radius};">
              <div class="flex items-center gap-2 text-sm text-muted" style="margin-bottom:8px;">
                ${icon(c.ic, 16, c.color)}
                ${c.label}
              </div>
              <div class="text-xl">${c.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function sidebarTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const title = safeTitle(prompt.replace(/\b(sidebar|side\s*nav|drawer|left\s*panel|create|make|build|generate|design|a|an|the|with|for|my)\b/gi, '').trim(), 'Workspace');
  const navItems = [
    { ic: 'home', label: 'Home', active: true },
    { ic: 'inbox', label: 'Inbox', badge: '3' },
    { ic: 'calendar', label: 'Calendar' },
    { ic: 'users', label: 'Team' },
    { ic: 'folder', label: 'Documents' },
    { ic: 'bar-chart', label: 'Analytics' },
  ];
  const bottomItems = [
    { ic: 'settings', label: 'Settings' },
    { ic: 'shield', label: 'Security' },
  ];
  return `
    <div class="container container--wide" style="padding:0;display:flex;min-height:580px;">
      <!-- Sidebar -->
      <div style="width:240px;flex-shrink:0;border-right:1px solid ${t.border};${glass ? gs : `background:${t.surface};`} padding:16px 12px;display:flex;flex-direction:column;">
        <div class="flex items-center gap-2" style="padding:8px 12px;margin-bottom:20px;">
          <div style="width:28px;height:28px;border-radius:6px;background:${t.primary};display:flex;align-items:center;justify-content:center;">
            ${icon('zap', 14, t.primaryText)}
          </div>
          <span style="font-weight:600;font-size:15px;">${title.charAt(0).toUpperCase() + title.slice(1)}</span>
          <div style="margin-left:auto;">${icon('chevron-down', 14, t.textMuted)}</div>
        </div>
        <div class="flex flex-col gap-1" style="flex:1;">
          ${navItems.map(item => `
            <div class="flex items-center gap-3" style="padding:8px 12px;border-radius:${t.radiusSm};font-size:14px;cursor:pointer;${item.active ? `background:${t.surfaceHover};font-weight:500;` : `color:${t.textMuted};`}">
              ${icon(item.ic, 16, item.active ? t.text : t.textMuted)}
              <span style="flex:1;">${item.label}</span>
              ${item.badge ? `<span style="background:${t.primary};color:${t.primaryText};font-size:11px;padding:1px 6px;border-radius:9999px;font-weight:500;">${item.badge}</span>` : ''}
            </div>
          `).join('')}
          <div class="divider" style="margin:12px 0;"></div>
          <div style="font-size:11px;font-weight:600;color:${t.textMuted};padding:4px 12px;text-transform:uppercase;letter-spacing:0.05em;">Projects</div>
          ${['Design System', 'Marketing Site', 'Mobile App'].map((p, i) => `
            <div class="flex items-center gap-3" style="padding:8px 12px;font-size:14px;color:${t.textMuted};cursor:pointer;">
              <div style="width:8px;height:8px;border-radius:50%;background:${[t.primary, t.success, t.accent][i]};"></div>
              ${p}
            </div>
          `).join('')}
        </div>
        <div class="flex flex-col gap-1" style="border-top:1px solid ${t.border};padding-top:12px;">
          ${bottomItems.map(item => `
            <div class="flex items-center gap-3" style="padding:8px 12px;border-radius:${t.radiusSm};font-size:14px;color:${t.textMuted};cursor:pointer;">
              ${icon(item.ic, 16, t.textMuted)} ${item.label}
            </div>
          `).join('')}
          <div class="flex items-center gap-3" style="padding:8px 12px;margin-top:4px;">
            <div class="avatar avatar--sm" style="width:28px;height:28px;font-size:12px;">A</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:500;">Alex Johnson</div>
              <div style="font-size:11px;color:${t.textMuted};">alex@email.com</div>
            </div>
          </div>
        </div>
      </div>
      <!-- Main content -->
      <div style="flex:1;padding:24px;">
        <div class="flex justify-between items-center" style="margin-bottom:24px;">
          <div class="text-xl">Home</div>
          <div class="flex gap-2">
            <button class="btn-secondary" style="width:auto;padding:8px 14px;font-size:13px;">${icon('filter', 14, t.textMuted)} Filter</button>
            <button class="btn-primary" style="width:auto;padding:8px 14px;font-size:13px;">${icon('plus', 14, t.primaryText)} Add new</button>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          ${[
            { title: 'Component Library v2', desc: 'Update design tokens and add new variants', tag: 'In Progress', tagColor: t.primary },
            { title: 'Landing Page Redesign', desc: 'New hero section with animated graphics', tag: 'Review', tagColor: t.warning },
            { title: 'Mobile Navigation', desc: 'Bottom tab bar with gesture support', tag: 'Done', tagColor: t.success },
          ].map(item => `
            <div style="${glass ? gs : `background:${t.surface};border:1px solid ${t.border};`} padding:16px;border-radius:${t.radius};cursor:pointer;">
              <div class="flex justify-between items-center" style="margin-bottom:4px;">
                <div style="font-weight:500;font-size:14px;">${item.title}</div>
                <span class="chip" style="background:${item.tagColor}18;color:${item.tagColor};border:none;font-size:11px;">${item.tag}</span>
              </div>
              <div class="text-sm text-muted">${item.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function modalTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const title = safeTitle(prompt.replace(/\b(modal|dialog|popup|overlay|create|make|build|generate|design|a|an|the|with|for|my)\b/gi, '').trim(), 'Confirm Action');
  const isDelete = /\b(delete|remove|destroy)\b/i.test(prompt);
  const isSuccess = /\b(success|done|complet|confirm)\b/i.test(prompt);
  return `
    <div class="container flex items-center justify-center" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);">
      <div style="${glass ? gs : `background:${t.bg};`} border-radius:${t.radiusLg};box-shadow:${t.shadowLg};width:380px;overflow:hidden;">
        <!-- Header -->
        <div style="padding:20px 24px 0; display:flex;justify-content:space-between;align-items:flex-start;">
          <div class="flex items-center gap-3">
            <div style="width:40px;height:40px;border-radius:${t.radius};display:flex;align-items:center;justify-content:center;background:${isDelete ? t.danger : isSuccess ? t.success : t.primary}12;">
              ${icon(isDelete ? 'alert-circle' : isSuccess ? 'check-circle' : 'info', 20, isDelete ? t.danger : isSuccess ? t.success : t.primary)}
            </div>
            <div>
              <div style="font-weight:600;font-size:16px;">${title.charAt(0).toUpperCase() + title.slice(1)}</div>
              <div class="text-sm text-muted" style="margin-top:2px;">${isDelete ? 'This action cannot be undone' : 'Please review before continuing'}</div>
            </div>
          </div>
          <button style="background:none;padding:4px;color:${t.textMuted};border-radius:${t.radiusSm};">${icon('x', 16)}</button>
        </div>
        <!-- Body -->
        <div style="padding:20px 24px;">
          <div class="text-sm" style="line-height:1.6;color:${t.textMuted};">
            ${isDelete
              ? 'Are you sure you want to delete this item? All associated data will be permanently removed from our servers. This includes all files, comments, and activity history.'
              : isSuccess
                ? 'Your changes have been saved successfully. The updates will be reflected across all connected services within a few minutes.'
                : 'You are about to perform an action that will affect your workspace. Please confirm that you want to proceed with these changes.'}
          </div>
          ${!isSuccess ? `
            <div style="margin-top:16px;padding:12px;background:${t.surface};border:1px solid ${t.border};border-radius:${t.radiusSm};">
              <div class="flex items-center gap-2">
                <div style="width:16px;height:16px;border:1.5px solid ${t.inputBorder};border-radius:4px;"></div>
                <span class="text-sm">I understand the consequences</span>
              </div>
            </div>
          ` : ''}
        </div>
        <!-- Footer -->
        <div style="padding:16px 24px;border-top:1px solid ${t.border};display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn-secondary" style="width:auto;padding:8px 16px;">Cancel</button>
          <button class="btn-primary" style="width:auto;padding:8px 16px;${isDelete ? `background:${t.danger};` : ''}">${isDelete ? 'Delete' : isSuccess ? 'Done' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  `;
}

function onboardingTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const steps = [
    { ic: 'user', title: 'Create Profile', desc: 'Tell us about yourself', done: true },
    { ic: 'mail', title: 'Verify Email', desc: 'Confirm your email address', done: true },
    { ic: 'settings', title: 'Preferences', desc: 'Customize your experience', current: true },
    { ic: 'zap', title: 'Get Started', desc: 'You\'re all set!' },
  ];
  return `
    <div class="container" style="padding:0;display:flex;min-height:580px;">
      <!-- Step indicator (left panel) -->
      <div style="width:220px;flex-shrink:0;${glass ? gs : `background:${t.surface};`} padding:32px 20px;border-right:1px solid ${t.border};">
        <div style="font-weight:700;font-size:18px;margin-bottom:4px;">Setup</div>
        <div class="text-sm text-muted" style="margin-bottom:32px;">Step 3 of 4</div>
        <div class="flex flex-col" style="gap:0;">
          ${steps.map((step, i) => `
            <div class="flex gap-3" style="position:relative;">
              ${i < steps.length - 1 ? `<div style="position:absolute;left:14px;top:30px;width:2px;height:calc(100% - 4px);background:${step.done ? t.primary : t.border};"></div>` : ''}
              <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1;${step.done ? `background:${t.primary};` : step.current ? `border:2px solid ${t.primary};background:${t.bg};` : `border:2px solid ${t.border};background:${t.bg};`}">
                ${step.done ? icon('check', 14, t.primaryText) : `<span style="font-size:12px;font-weight:600;color:${step.current ? t.primary : t.textMuted};">${i + 1}</span>`}
              </div>
              <div style="padding-bottom:32px;">
                <div style="font-size:14px;font-weight:${step.current ? '600' : '400'};color:${step.done || step.current ? t.text : t.textMuted};">${step.title}</div>
                <div style="font-size:12px;color:${t.textMuted};margin-top:2px;">${step.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <!-- Current step content -->
      <div style="flex:1;padding:32px;display:flex;flex-direction:column;">
        <div style="flex:1;">
          <div class="text-xl" style="margin-bottom:4px;">Preferences</div>
          <div class="text-sm text-muted" style="margin-bottom:28px;">Customize how the app works for you</div>
          <div class="flex flex-col gap-4" style="${glass ? gs + 'padding:20px;border-radius:' + t.radiusLg + ';' : ''}">
            <div class="flex flex-col gap-2">
              <label class="text-sm" style="font-weight:500;">Role</label>
              <select style="padding:10px 12px;border:1px solid ${t.inputBorder};border-radius:${t.radiusSm};background:${t.inputBg};color:${t.text};font-size:14px;">
                <option>Designer</option>
                <option>Developer</option>
                <option>Product Manager</option>
                <option>Other</option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm" style="font-weight:500;">Team size</label>
              <div class="flex gap-2">
                ${['1-5', '6-20', '21-50', '50+'].map((s, i) => `
                  <div style="flex:1;text-align:center;padding:8px;border:1px solid ${i === 1 ? t.primary : t.inputBorder};border-radius:${t.radiusSm};font-size:13px;cursor:pointer;${i === 1 ? `background:${t.primary}10;color:${t.primary};font-weight:500;` : ''}">${s}</div>
                `).join('')}
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <label class="text-sm" style="font-weight:500;">Notifications</label>
              ${['Email updates', 'Push notifications', 'Weekly digest'].map((label, i) => `
                <div class="flex justify-between items-center">
                  <span class="text-sm">${label}</span>
                  <div class="toggle-track${i < 2 ? ' toggle-track--on' : ''}"><div class="toggle-thumb"></div></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="flex justify-between" style="margin-top:24px;padding-top:20px;border-top:1px solid ${t.border};">
          <button class="btn-secondary" style="width:auto;padding:8px 20px;">${icon('arrow-left', 14, t.textMuted)} Back</button>
          <button class="btn-primary" style="width:auto;padding:8px 20px;">Continue ${icon('arrow-right', 14, t.primaryText)}</button>
        </div>
      </div>
    </div>
  `;
}

function searchTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} padding:16px; border-radius:${t.radiusLg};`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:16px; border-radius:${t.radius};`;
  const query = safeTitle(prompt.replace(/\b(search|explore|discover|browse|results?|page|create|make|build|generate|design|a|an|the|with|for|my)\b/gi, '').trim(), 'design templates');
  const results = [
    { title: 'Getting Started with Components', desc: 'Learn how to build reusable UI components from scratch with best practices and common patterns.', tags: ['Tutorial', 'Components'], time: '5 min read' },
    { title: 'Advanced Layout Techniques', desc: 'Master CSS Grid and Flexbox for complex, responsive user interfaces that scale beautifully.', tags: ['CSS', 'Layout'], time: '8 min read' },
    { title: 'Design System Documentation', desc: 'Comprehensive guide to building and maintaining a design system for your team and organization.', tags: ['Design', 'Guide'], time: '12 min read' },
    { title: 'Performance Optimization Tips', desc: 'Practical strategies for improving load times and runtime performance in modern web apps.', tags: ['Performance'], time: '6 min read' },
  ];
  return `
    <div class="container container--wide" style="padding:24px;">
      <!-- Search bar -->
      <div style="margin-bottom:24px;">
        <div style="position:relative;margin-bottom:12px;">
          <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);">${icon('search', 20, t.textMuted)}</div>
          <input value="${escapeHTML(query)}" style="width:100%;padding:14px 14px 14px 44px;font-size:16px;border-radius:${t.radiusLg};border:2px solid ${t.primary};box-shadow:${t.shadow};" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted">238 results</span>
          <div class="flex gap-2">
            ${['All', 'Articles', 'Docs', 'Videos'].map((f, i) =>
              `<div style="padding:4px 12px;border-radius:9999px;font-size:13px;cursor:pointer;${i === 0 ? `background:${t.primary};color:${t.primaryText};font-weight:500;` : `background:${t.surface};border:1px solid ${t.border};color:${t.textMuted};`}">${f}</div>`
            ).join('')}
          </div>
          <div style="margin-left:auto;" class="flex gap-2">
            <button class="btn-secondary" style="width:auto;padding:6px 10px;">${icon('grid', 14, t.textMuted)}</button>
            <button class="btn-secondary" style="width:auto;padding:6px 10px;background:${t.surfaceHover};">${icon('list', 14, t.text)}</button>
          </div>
        </div>
      </div>
      <!-- Results -->
      <div class="flex flex-col gap-3">
        ${results.map(r => `
          <div style="${cardStyle} cursor:pointer;">
            <div class="flex justify-between items-start">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:15px;margin-bottom:4px;color:${t.primary};">${r.title}</div>
                <div class="text-sm text-muted" style="line-height:1.5;margin-bottom:8px;">${r.desc}</div>
                <div class="flex items-center gap-3">
                  <div class="flex gap-2">
                    ${r.tags.map(tg => `<span class="chip" style="font-size:11px;">${tg}</span>`).join('')}
                  </div>
                  <span class="text-xs text-muted">${icon('clock', 12, t.textMuted)} ${r.time}</span>
                </div>
              </div>
              <div style="margin-left:12px;color:${t.textMuted};">${icon('chevron-right', 16, t.textMuted)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <!-- Pagination -->
      <div class="flex justify-center items-center gap-2" style="margin-top:20px;">
        ${['←', '1', '2', '3', '…', '12', '→'].map((p) =>
          `<div style="width:32px;height:32px;border-radius:${t.radiusSm};display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;${p === '2' ? `background:${t.primary};color:${t.primaryText};font-weight:500;` : `color:${t.textMuted};border:1px solid ${t.border};`}">${p}</div>`
        ).join('')}
      </div>
    </div>
  `;
}

function emailTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const emails = [
    { from: 'Sarah Chen', subject: 'Design Review — Q4 Dashboard', preview: 'Hey, I\'ve finished the review of the dashboard designs. Overall looking great! A few notes…', time: '10:45 AM', unread: true, starred: true },
    { from: 'Alex Thompson', subject: 'Meeting Notes: Sprint Planning', preview: 'Here are the notes from today\'s sprint planning. We agreed on the following priorities…', time: '9:30 AM', unread: true, starred: false },
    { from: 'Team Updates', subject: 'Weekly Engineering Digest', preview: 'This week: 23 PRs merged, 4 releases shipped, 2 incidents resolved. Great work everyone!', time: 'Yesterday', unread: false, starred: false },
    { from: 'Maya Rodriguez', subject: 'Re: Component Library RFC', preview: 'I like the approach for variant tokens. Let me think about the composability aspect…', time: 'Yesterday', unread: false, starred: true },
    { from: 'CI/CD Pipeline', subject: 'Build Succeeded: main@a3f21c8', preview: 'All 847 tests passed. Coverage: 94.2%. Deploy to staging completed.', time: 'Mon', unread: false, starred: false },
  ];
  return `
    <div class="container container--wide" style="padding:0;display:flex;min-height:580px;">
      <!-- Mail sidebar -->
      <div style="width:64px;flex-shrink:0;${glass ? gs : `background:${t.surface};`} border-right:1px solid ${t.border};padding:16px 0;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:36px;height:36px;border-radius:8px;background:${t.primary};display:flex;align-items:center;justify-content:center;margin-bottom:12px;">${icon('mail', 18, t.primaryText)}</div>
        ${[
          { ic: 'inbox', active: true, badge: '2' },
          { ic: 'send', active: false },
          { ic: 'star', active: false },
          { ic: 'file', active: false },
          { ic: 'trash', active: false },
          { ic: 'archive', active: false },
        ].map(item => `
          <div style="width:40px;height:40px;border-radius:${t.radiusSm};display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;${item.active ? `background:${t.surfaceHover};` : ''}">
            ${icon(item.ic, 18, item.active ? t.text : t.textMuted)}
            ${item.badge ? `<div style="position:absolute;top:4px;right:4px;background:${t.primary};color:${t.primaryText};font-size:9px;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;">${item.badge}</div>` : ''}
          </div>
        `).join('')}
        <div style="margin-top:auto;">
          <div style="width:40px;height:40px;border-radius:${t.radiusSm};display:flex;align-items:center;justify-content:center;">${icon('settings', 18, t.textMuted)}</div>
        </div>
      </div>
      <!-- Email list -->
      <div style="width:320px;flex-shrink:0;border-right:1px solid ${t.border};display:flex;flex-direction:column;">
        <div style="padding:16px;border-bottom:1px solid ${t.border};">
          <div style="font-weight:700;font-size:18px;margin-bottom:12px;">Inbox</div>
          <div style="position:relative;">
            <div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);">${icon('search', 14, t.textMuted)}</div>
            <input placeholder="Search mail…" style="width:100%;padding-left:32px;font-size:13px;" />
          </div>
        </div>
        <div style="flex:1;overflow:auto;">
          ${emails.map((e, i) => `
            <div style="padding:12px 16px;border-bottom:1px solid ${t.border};cursor:pointer;${i === 0 ? `background:${t.surfaceHover};border-left:3px solid ${t.primary};` : ''} ${e.unread ? '' : 'opacity:0.75;'}">
              <div class="flex justify-between items-center" style="margin-bottom:2px;">
                <div style="font-size:13px;font-weight:${e.unread ? '600' : '400'};${e.unread ? '' : `color:${t.textMuted};`}">${e.from}</div>
                <div class="flex items-center gap-2">
                  ${e.starred ? iconFilled('star', 12, t.warning) : ''}
                  <span class="text-xs text-muted">${e.time}</span>
                </div>
              </div>
              <div style="font-size:13px;font-weight:${e.unread ? '500' : '400'};margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.subject}</div>
              <div style="font-size:12px;color:${t.textMuted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.preview}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <!-- Email preview -->
      <div style="flex:1;display:flex;flex-direction:column;">
        <div style="padding:16px;border-bottom:1px solid ${t.border};">
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              ${['archive', 'trash', 'mail-open', 'tag'].map(ic =>
                `<button class="btn-secondary" style="width:auto;padding:6px 8px;">${icon(ic, 14, t.textMuted)}</button>`
              ).join('')}
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary" style="width:auto;padding:6px 8px;">${icon('reply', 14, t.textMuted)}</button>
              <button class="btn-secondary" style="width:auto;padding:6px 8px;">${icon('forward', 14, t.textMuted)}</button>
              <button class="btn-secondary" style="width:auto;padding:6px 8px;">${icon('more-horizontal', 14, t.textMuted)}</button>
            </div>
          </div>
        </div>
        <div style="flex:1;padding:20px;">
          <div style="font-size:18px;font-weight:600;margin-bottom:12px;">Design Review — Q4 Dashboard</div>
          <div class="flex items-center gap-3" style="margin-bottom:20px;">
            <div class="avatar avatar--sm" style="background:${t.accent};">S</div>
            <div>
              <div style="font-size:13px;"><strong>Sarah Chen</strong> <span class="text-muted">sarah@example.com</span></div>
              <div style="font-size:12px;color:${t.textMuted};">to me — 10:45 AM</div>
            </div>
          </div>
          <div class="text-sm" style="line-height:1.7;color:${t.textMuted};">
            Hey,<br/><br/>
            I've finished the review of the dashboard designs. Overall looking great! A few notes:<br/><br/>
            • The chart colors could use more contrast for accessibility<br/>
            • Love the new card layout — very clean<br/>
            • Can we add a date range picker to the header?<br/><br/>
            Let me know what you think.
          </div>
        </div>
      </div>
    </div>
  `;
}

function mediaPlayerTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  return `
    <div class="container" style="padding:0;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(180deg, ${t.primary}40 0%, ${t.accent}60 50%, ${t.bg} 100%);min-height:580px;">
      <!-- Album art area -->
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px;">
        <div style="width:260px;height:260px;border-radius:${t.radiusLg};background:linear-gradient(135deg, ${t.primary}, ${t.accent});box-shadow:${t.shadowLg};display:flex;align-items:center;justify-content:center;">
          ${icon('music', 64, 'rgba(255,255,255,0.3)')}
        </div>
      </div>
      <!-- Now playing info -->
      <div style="${glass ? gs : `background:${t.bg};`} padding:28px 32px;border-radius:${t.radiusLg} ${t.radiusLg} 0 0;">
        <div class="flex justify-between items-start" style="margin-bottom:20px;">
          <div>
            <div style="font-size:20px;font-weight:700;">Midnight Drive</div>
            <div class="text-sm text-muted" style="margin-top:2px;">Lunar Echoes · Studio Sessions</div>
          </div>
          <div class="flex items-center gap-3">
            ${icon('heart', 18, t.textMuted)}
            ${icon('share', 18, t.textMuted)}
          </div>
        </div>
        <!-- Progress bar -->
        <div style="margin-bottom:8px;">
          <div style="width:100%;height:4px;background:${t.border};border-radius:2px;position:relative;">
            <div style="width:35%;height:100%;background:${t.primary};border-radius:2px;position:relative;">
              <div style="position:absolute;right:-5px;top:-3px;width:10px;height:10px;background:${t.primary};border-radius:50%;"></div>
            </div>
          </div>
          <div class="flex justify-between text-xs text-muted" style="margin-top:6px;">
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>
        <!-- Controls -->
        <div class="flex items-center justify-center gap-6" style="margin-bottom:16px;">
          ${icon('shuffle', 18, t.textMuted)}
          ${icon('skip-back', 22, t.text)}
          <div style="width:52px;height:52px;border-radius:50%;background:${t.primary};display:flex;align-items:center;justify-content:center;box-shadow:${t.shadow};">
            ${icon('play', 22, t.primaryText)}
          </div>
          ${icon('skip-forward', 22, t.text)}
          ${icon('repeat', 18, t.textMuted)}
        </div>
        <!-- Volume -->
        <div class="flex items-center justify-center gap-3">
          ${icon('volume', 16, t.textMuted)}
          <div style="width:120px;height:4px;background:${t.border};border-radius:2px;">
            <div style="width:65%;height:100%;background:${t.textMuted};border-radius:2px;"></div>
          </div>
        </div>
        <!-- Queue hint -->
        <div class="flex justify-between items-center" style="margin-top:20px;padding-top:16px;border-top:1px solid ${t.border};">
          <div class="text-sm text-muted">Up next: Solar Wind · Cosmic Keys</div>
          ${icon('list', 16, t.textMuted)}
        </div>
      </div>
    </div>
  `;
}

function kanbanTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const cardStyle = glass
    ? `${gs} padding:12px; border-radius:${t.radiusSm}; margin-bottom:8px;`
    : `background:${t.bg}; border:1px solid ${t.border}; padding:12px; border-radius:${t.radiusSm}; box-shadow:${t.shadow}; margin-bottom:8px;`;
  const columns = [
    {
      title: 'To Do', count: 4, color: t.textMuted,
      cards: [
        { title: 'Update design tokens', tags: ['Design'], priority: 'medium', assignee: 'S', done: false },
        { title: 'Write API documentation', tags: ['Docs'], priority: 'low', assignee: 'A', done: false },
        { title: 'Add dark mode support', tags: ['Feature'], priority: 'high', assignee: 'M', done: false },
      ],
    },
    {
      title: 'In Progress', count: 3, color: t.primary,
      cards: [
        { title: 'Refactor auth module', tags: ['Backend'], priority: 'high', assignee: 'J', done: false },
        { title: 'Mobile responsive layout', tags: ['Frontend'], priority: 'medium', assignee: 'S', done: false },
      ],
    },
    {
      title: 'Review', count: 2, color: t.warning,
      cards: [
        { title: 'Search component tests', tags: ['Testing'], priority: 'medium', assignee: 'A', done: false },
        { title: 'Accessibility audit fixes', tags: ['A11y'], priority: 'high', assignee: 'M', done: false },
      ],
    },
    {
      title: 'Done', count: 8, color: t.success,
      cards: [
        { title: 'Setup CI/CD pipeline', tags: ['DevOps'], priority: 'low', assignee: 'J', done: true },
        { title: 'User onboarding flow', tags: ['UX'], priority: 'medium', assignee: 'S', done: true },
      ],
    },
  ];
  return `
    <div class="container container--full" style="padding:20px;overflow:hidden;">
      <div class="flex justify-between items-center" style="margin-bottom:20px;">
        <div class="flex items-center gap-3">
          <div class="text-xl">Sprint Board</div>
          <span class="chip" style="font-size:11px;">Sprint 14</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex" style="margin-right:8px;">
            ${['S', 'A', 'M', 'J'].map((a, i) =>
              `<div class="avatar avatar--sm" style="width:28px;height:28px;font-size:11px;margin-left:${i > 0 ? '-6' : '0'}px;border:2px solid ${t.bg};background:${[t.primary, t.accent, t.success, t.warning][i]};">${a}</div>`
            ).join('')}
          </div>
          <button class="btn-secondary" style="width:auto;padding:6px 12px;font-size:12px;">${icon('filter', 12, t.textMuted)} Filter</button>
          <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:12px;">${icon('plus', 12, t.primaryText)} Task</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;height:calc(100% - 60px);overflow:hidden;">
        ${columns.map(col => `
          <div style="${glass ? gs : `background:${t.surface};`} border-radius:${t.radius};padding:12px;display:flex;flex-direction:column;overflow:hidden;">
            <div class="flex justify-between items-center" style="margin-bottom:12px;">
              <div class="flex items-center gap-2">
                <div style="width:8px;height:8px;border-radius:50%;background:${col.color};"></div>
                <span style="font-size:13px;font-weight:600;">${col.title}</span>
                <span style="font-size:11px;color:${t.textMuted};background:${t.surfaceHover};padding:0 6px;border-radius:9999px;">${col.count}</span>
              </div>
              ${icon('plus', 14, t.textMuted)}
            </div>
            <div style="flex:1;overflow:auto;">
              ${col.cards.map(card => `
                <div style="${cardStyle} ${card.done ? 'opacity:0.6;' : ''}">
                  <div style="font-size:13px;font-weight:500;margin-bottom:6px;${card.done ? 'text-decoration:line-through;' : ''}">${card.title}</div>
                  <div class="flex items-center gap-2" style="margin-bottom:8px;">
                    ${card.tags.map(tg => `<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${t.primary}12;color:${t.primary};">${tg}</span>`).join('')}
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1">
                      ${card.priority === 'high' ? icon('flag', 12, t.danger) : card.priority === 'medium' ? icon('flag', 12, t.warning) : icon('flag', 12, t.textMuted)}
                    </div>
                    <div class="avatar" style="width:22px;height:22px;font-size:10px;">${card.assignee}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function todoTemplate(t: ThemeTokens, _prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const itemStyle = glass
    ? `${gs} padding:12px 16px; border-radius:${t.radiusSm}; margin-bottom:6px;`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:12px 16px; border-radius:${t.radiusSm}; margin-bottom:6px;`;
  const tasks = [
    { text: 'Review pull request #234', done: false, priority: 'high', category: 'Work', dueToday: true },
    { text: 'Update project dependencies', done: false, priority: 'medium', category: 'Work' },
    { text: 'Write unit tests for auth module', done: false, priority: 'high', category: 'Work' },
    { text: 'Prepare weekly report', done: false, priority: 'low', category: 'Work' },
    { text: 'Schedule dentist appointment', done: true, priority: 'medium', category: 'Personal' },
    { text: 'Buy groceries', done: true, priority: 'low', category: 'Personal' },
    { text: 'Read chapter 5 of Design Patterns', done: true, priority: 'low', category: 'Learning' },
  ];
  return `
    <div class="container" style="padding:24px;">
      <div class="flex justify-between items-center" style="margin-bottom:20px;">
        <div>
          <div class="text-xl">My Tasks</div>
          <div class="text-sm text-muted" style="margin-top:2px;">4 remaining · 3 completed</div>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary" style="width:auto;padding:6px 12px;font-size:13px;">${icon('filter', 14, t.textMuted)} Filter</button>
          <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:13px;">${icon('plus', 14, t.primaryText)} Add task</button>
        </div>
      </div>
      <!-- Category tabs -->
      <div class="flex gap-2" style="margin-bottom:20px;">
        ${['All', 'Work', 'Personal', 'Learning'].map((cat, i) =>
          `<div style="padding:6px 14px;border-radius:9999px;font-size:13px;cursor:pointer;${i === 0 ? `background:${t.primary};color:${t.primaryText};font-weight:500;` : `background:${t.surface};border:1px solid ${t.border};color:${t.textMuted};`}">${cat}</div>`
        ).join('')}
      </div>
      <!-- Today section -->
      <div style="font-size:12px;font-weight:600;color:${t.textMuted};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Today</div>
      <div class="flex flex-col" style="margin-bottom:20px;">
        ${tasks.filter(t => !t.done).map(task => `
          <div style="${itemStyle}" class="flex items-center gap-3">
            <div style="width:18px;height:18px;border:2px solid ${task.priority === 'high' ? t.danger : task.priority === 'medium' ? t.warning : t.border};border-radius:50%;flex-shrink:0;"></div>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:400;">${task.text}</div>
              <div class="flex items-center gap-2" style="margin-top:4px;">
                <span style="font-size:11px;color:${t.textMuted};">${task.category}</span>
                ${task.dueToday ? `<span style="font-size:11px;color:${t.danger};font-weight:500;">${icon('clock', 10, t.danger)} Due today</span>` : ''}
              </div>
            </div>
            ${icon('more-horizontal', 14, t.textMuted)}
          </div>
        `).join('')}
      </div>
      <!-- Completed section -->
      <div class="flex items-center gap-2" style="margin-bottom:8px;">
        <div style="font-size:12px;font-weight:600;color:${t.textMuted};text-transform:uppercase;letter-spacing:0.05em;">Completed</div>
        ${icon('chevron-down', 12, t.textMuted)}
      </div>
      <div class="flex flex-col" style="opacity:0.6;">
        ${tasks.filter(t => t.done).map(task => `
          <div style="${itemStyle}" class="flex items-center gap-3">
            <div style="width:18px;height:18px;border-radius:50%;background:${t.success};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('check', 10, t.primaryText)}
            </div>
            <div style="flex:1;">
              <div style="font-size:14px;text-decoration:line-through;color:${t.textMuted};">${task.text}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function genericTemplate(t: ThemeTokens, prompt: string, glass: boolean): string {
  const gs = glass ? glassStyles(t) : '';
  const sectionStyle = glass
    ? `${gs} padding:20px; border-radius:${t.radiusLg};`
    : `background:${t.surface}; border:1px solid ${t.border}; padding:20px; border-radius:${t.radius};`;
  const title = safeTitle(prompt, 'Component');
  return `
    <div class="container" style="padding:32px;">
      <div class="text-xl" style="margin-bottom:4px;">${title.charAt(0).toUpperCase() + title.slice(1)}</div>
      <div class="text-sm text-muted" style="margin-bottom:24px;">Generated UI mockup</div>
      <div class="flex flex-col gap-4">
        <div style="${sectionStyle}">
          <div class="flex items-center gap-3" style="margin-bottom:16px;">
            <div class="avatar">P</div>
            <div>
              <div class="text-sm" style="font-weight:600;">Pollin Design</div>
              <div class="text-xs text-muted">Auto-generated component</div>
            </div>
          </div>
          <div class="text-sm" style="line-height:1.6; margin-bottom:16px;">
            This is a generated UI mockup based on your prompt. The design uses your selected
            design system's tokens for consistent styling.
          </div>
          <div class="flex gap-2">
            <span class="chip">Component</span>
            <span class="chip">Generated</span>
          </div>
        </div>
        <div style="${sectionStyle}">
          <div class="text-sm" style="font-weight:600; margin-bottom:12px;">Actions</div>
          <div class="flex gap-3">
            <button class="btn-primary">Primary Action</button>
            <button class="btn-secondary">Secondary</button>
          </div>
        </div>
        <div style="${sectionStyle}">
          <div class="text-sm" style="font-weight:600; margin-bottom:12px;">Details</div>
          <div class="flex flex-col gap-3">
            ${['Status', 'Created', 'Updated'].map((label, i) => `
              <div class="flex justify-between items-center text-sm" style="${i > 0 ? `border-top:1px solid ${t.border}; padding-top:8px;` : ''}">
                <span class="text-muted">${label}</span>
                <span style="font-weight:500;">${label === 'Status' ? 'Active' : label === 'Created' ? 'Today' : 'Just now'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ─── Template router ───────────────────────────────────── */

const TEMPLATE_MAP: Record<UIType, (t: ThemeTokens, prompt: string, glass: boolean) => string> = {
  login: loginTemplate,
  signup: signupTemplate,
  finance: financeTemplate,
  dashboard: dashboardTemplate,
  settings: settingsTemplate,
  profile: profileTemplate,
  pricing: pricingTemplate,
  landing: landingTemplate,
  navbar: navbarTemplate,
  sidebar: sidebarTemplate,
  card: cardTemplate,
  form: formTemplate,
  table: tableTemplate,
  chat: chatTemplate,
  modal: modalTemplate,
  notification: notificationTemplate,
  onboarding: onboardingTemplate,
  search: searchTemplate,
  'media-player': mediaPlayerTemplate,
  calendar: calendarTemplate,
  email: emailTemplate,
  ecommerce: ecommerceTemplate,
  kanban: kanbanTemplate,
  todo: todoTemplate,
  generic: genericTemplate,
};

/* ─── Public API ────────────────────────────────────────── */

/* ─── Google Fonts for each theme ───────────────────────── */

const THEME_FONT_URLS: Record<string, string> = {
  'shadcn/ui': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'material ui 3': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'radix ui': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'ant design': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
};

export interface GeneratedUI {
  html: string;
  width: number;
  height: number;
  uiType: UIType;
  theme: string;
}

/**
 * Generate a full self-contained HTML document for a UI mockup.
 * The returned HTML can be rendered in a hidden container and captured
 * with html2canvas.
 */
export function generateUIHTML(
  prompt: string,
  libraryName?: string,
): GeneratedUI {
  const uiType = classifyPrompt(prompt);
  const theme = getTheme(libraryName);
  const glass = isGlassTheme(libraryName);
  const dark = wantsDark(prompt, theme);

  // Apply dark mode override for light-bg themes when user asks for dark
  const isAlreadyDark = theme.bg.startsWith('#0') || theme.bg.startsWith('#1') || theme.bg.startsWith('linear') || theme.bg.startsWith('rgba');
  const finalTheme = dark && !isAlreadyDark
    ? {
        ...theme,
        bg: '#0a0a0a',
        surface: '#171717',
        surfaceHover: '#262626',
        border: '#262626',
        text: '#fafafa',
        textMuted: '#a3a3a3',
        inputBg: '#0a0a0a',
        inputBorder: '#262626',
      }
    : theme;

  const templateFn = TEMPLATE_MAP[uiType];
  const bodyHTML = templateFn(finalTheme, prompt, glass);
  const css = baseCSS(finalTheme);

  // Determine dimensions
  const isWide = ['finance', 'dashboard', 'settings', 'table', 'landing', 'ecommerce', 'pricing', 'navbar', 'sidebar', 'email', 'search', 'kanban'].includes(uiType);
  const isFull = ['finance', 'dashboard', 'kanban'].includes(uiType);
  const width = isFull ? 900 : isWide ? 780 : 420;
  const height = isFull ? 620 : isWide ? 580 : 580;

  const fontUrl = THEME_FONT_URLS[libraryName?.toLowerCase() ?? ''] ?? '';
  const fontLink = fontUrl
    ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${fontUrl}" rel="stylesheet">`
    : '';

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${fontLink}
  <style>${css}</style>
</head>
<body>
  ${bodyHTML}
</body>
</html>`;

  return {
    html: fullHTML,
    width,
    height,
    uiType,
    theme: libraryName || 'default',
  };
}

export { classifyPrompt, getTheme, type UIType, type ThemeTokens as ThemeTokensType };
