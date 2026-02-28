/**
 * Layout Composition Templates
 *
 * Predefined layout shells (sidebar+main, card grid, dashboard, etc.)
 * that produce editable ComponentTree structures for instant prototyping.
 *
 * Each template returns a ComponentTree with realistic placeholder content
 * that users can edit via the ComponentEditor panel.
 */

import type { ComponentTree, ComponentNode } from '@/types/component-tree';
import { makeNodeId } from '@/types/component-tree';

// ── Template metadata ──────────────────────────────────

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'page' | 'section' | 'pattern';
  /** Preview icon (emoji for now) */
  icon: string;
  /** Viewport dimensions for the generated tree */
  viewport: { width: number; height: number };
  /** Factory function that produces a fresh ComponentTree */
  build: () => ComponentTree;
}

// ── Helpers ────────────────────────────────────────────

function node(
  type: ComponentNode['type'],
  overrides: Partial<Omit<ComponentNode, 'id' | 'type'>> = {},
): ComponentNode {
  return {
    id: makeNodeId(),
    type,
    props: {},
    styles: {},
    ...overrides,
  };
}

function text(content: string, styles: Record<string, string> = {}): ComponentNode {
  return node('text', { children: [content], styles });
}

function heading(content: string, level = 2, styles: Record<string, string> = {}): ComponentNode {
  return node('heading', { props: { level }, children: [content], styles });
}

function button(label: string, variant = 'primary'): ComponentNode {
  return node('button', { props: { variant }, children: [label] });
}

function input(placeholder: string, type = 'text'): ComponentNode {
  return node('input', { props: { placeholder, type } });
}

function card(children: (ComponentNode | string)[], styles: Record<string, string> = {}): ComponentNode {
  return node('card', { children, styles });
}

// ── Templates ──────────────────────────────────────────

const sidebarMain: LayoutTemplate = {
  id: 'sidebar-main',
  name: 'Sidebar + Main',
  description: 'Classic app layout with navigation sidebar and content area',
  category: 'page',
  icon: '📐',
  viewport: { width: 960, height: 640 },
  build: () => ({
    root: node('container', {
      styles: { display: 'flex', height: '100%', background: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
      children: [
        node('sidebar', {
          props: { width: '240px' },
          styles: { background: '#f9fafb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
          children: [
            heading('Pollin', 3, { fontWeight: '700', fontSize: '18px', marginBottom: '16px', color: '#111827' }),
            node('divider'),
            node('link', { children: ['Dashboard'], styles: { padding: '8px 12px', borderRadius: '6px', background: '#e5e7eb', color: '#111827', fontWeight: '500', textDecoration: 'none', display: 'block' } }),
            node('link', { children: ['Projects'], styles: { padding: '8px 12px', borderRadius: '6px', color: '#6b7280', textDecoration: 'none', display: 'block' } }),
            node('link', { children: ['Team'], styles: { padding: '8px 12px', borderRadius: '6px', color: '#6b7280', textDecoration: 'none', display: 'block' } }),
            node('link', { children: ['Settings'], styles: { padding: '8px 12px', borderRadius: '6px', color: '#6b7280', textDecoration: 'none', display: 'block' } }),
            node('spacer'),
            node('divider'),
            node('avatar', { props: { name: 'User' }, styles: { width: '32px', height: '32px', fontSize: '13px' } }),
          ],
        }),
        node('container', {
          styles: { flex: '1', padding: '24px 32px', overflow: 'auto' },
          children: [
            heading('Dashboard', 1, { fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111827' }),
            text('Welcome back. Here\u2019s what\u2019s happening.', { color: '#6b7280', marginBottom: '24px' }),
            node('grid', {
              props: { columns: 'repeat(3, 1fr)', gap: '16px' },
              children: [
                card([
                  text('Total Users', { fontSize: '13px', color: '#6b7280' }),
                  node('stat', { props: { value: '2,847', label: '', change: '+12.5%' } }),
                ]),
                card([
                  text('Revenue', { fontSize: '13px', color: '#6b7280' }),
                  node('stat', { props: { value: '$48.2k', label: '', change: '+8.3%' } }),
                ]),
                card([
                  text('Active Projects', { fontSize: '13px', color: '#6b7280' }),
                  node('stat', { props: { value: '14', label: '', change: '-2' } }),
                ]),
              ],
            }),
          ],
        }),
      ],
    }),
    metadata: {
      name: 'Sidebar + Main Layout',
      description: 'Classic app layout with navigation sidebar and content area',
      viewport: { width: 960, height: 640 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

const cardGrid: LayoutTemplate = {
  id: 'card-grid',
  name: 'Card Grid',
  description: 'Responsive grid of cards with header and search',
  category: 'section',
  icon: '🗂️',
  viewport: { width: 800, height: 600 },
  build: () => ({
    root: node('container', {
      styles: { padding: '24px 32px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#ffffff' },
      children: [
        node('stack', {
          props: { direction: 'horizontal', gap: '12px' },
          styles: { justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
          children: [
            heading('Projects', 2, { fontSize: '20px', fontWeight: '700', color: '#111827' }),
            node('stack', {
              props: { direction: 'horizontal', gap: '8px' },
              children: [
                input('Search projects…'),
                button('New Project'),
              ],
            }),
          ],
        }),
        node('grid', {
          props: { columns: 'repeat(3, 1fr)', gap: '16px' },
          children: Array.from({ length: 6 }, (_, i) =>
            card([
              node('image', { styles: { height: '120px', borderRadius: '4px', marginBottom: '12px' } }),
              heading(`Project ${i + 1}`, 3, { fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#111827' }),
              text('A short description of this project and what it does.', { fontSize: '13px', color: '#6b7280', marginBottom: '12px' }),
              node('stack', {
                props: { direction: 'horizontal', gap: '8px' },
                children: [
                  node('badge', { children: ['Active'], styles: { background: '#dcfce7', color: '#166534', fontSize: '11px' } }),
                  text('Updated 2d ago', { fontSize: '11px', color: '#9ca3af' }),
                ],
              }),
            ], { padding: '16px' }),
          ),
        }),
      ],
    }),
    metadata: {
      name: 'Card Grid',
      description: 'Responsive grid of cards with header and search',
      viewport: { width: 800, height: 600 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

const dashboardLayout: LayoutTemplate = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Stats bar, chart area, and recent activity table',
  category: 'page',
  icon: '📊',
  viewport: { width: 960, height: 700 },
  build: () => ({
    root: node('container', {
      styles: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#ffffff', height: '100%' },
      children: [
        node('navbar', {
          styles: { justifyContent: 'space-between' },
          children: [
            heading('Analytics', 3, { fontSize: '16px', fontWeight: '600', color: '#111827' }),
            node('stack', {
              props: { direction: 'horizontal', gap: '8px' },
              children: [
                button('Export', 'outline'),
                button('Share', 'primary'),
              ],
            }),
          ],
        }),
        node('container', {
          styles: { padding: '24px 24px', flex: '1', overflow: 'auto' },
          children: [
            node('grid', {
              props: { columns: 'repeat(4, 1fr)', gap: '16px' },
              styles: { marginBottom: '24px' },
              children: [
                card([node('stat', { props: { value: '12,847', label: 'Total Views', change: '+14.2%' } })]),
                card([node('stat', { props: { value: '3,291', label: 'Visitors', change: '+7.1%' } })]),
                card([node('stat', { props: { value: '24.8%', label: 'Bounce Rate', change: '-2.3%' } })]),
                card([node('stat', { props: { value: '4m 32s', label: 'Avg. Session', change: '+0.8%' } })]),
              ],
            }),
            node('grid', {
              props: { columns: '2fr 1fr', gap: '16px' },
              children: [
                card([
                  heading('Traffic Overview', 3, { fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#111827' }),
                  node('chart', { props: { name: 'Traffic' }, styles: { height: '200px' } }),
                ]),
                card([
                  heading('Top Pages', 3, { fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#111827' }),
                  node('list', {
                    children: [
                      node('listItem', { children: ['/home — 4,291 views'] }),
                      node('listItem', { children: ['/pricing — 2,103 views'] }),
                      node('listItem', { children: ['/docs — 1,847 views'] }),
                      node('listItem', { children: ['/blog — 1,203 views'] }),
                      node('listItem', { children: ['/about — 892 views'] }),
                    ],
                  }),
                ]),
              ],
            }),
          ],
        }),
      ],
    }),
    metadata: {
      name: 'Dashboard',
      description: 'Analytics dashboard with stats, chart, and top pages',
      viewport: { width: 960, height: 700 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

const formLayout: LayoutTemplate = {
  id: 'form',
  name: 'Settings Form',
  description: 'Form with sections, labels, inputs, and action buttons',
  category: 'section',
  icon: '📝',
  viewport: { width: 640, height: 700 },
  build: () => ({
    root: node('container', {
      styles: { padding: '32px', maxWidth: '560px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#ffffff' },
      children: [
        heading('Account Settings', 1, { fontSize: '22px', fontWeight: '700', marginBottom: '4px', color: '#111827' }),
        text('Manage your account information and preferences.', { color: '#6b7280', marginBottom: '24px' }),
        node('divider'),
        node('spacer', { props: { size: '20px' } }),
        node('section', {
          children: [
            heading('Profile', 3, { fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#111827' }),
            node('stack', { props: { direction: 'column', gap: '16px' }, children: [
              node('container', { styles: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
                text('Full Name', { fontSize: '13px', fontWeight: '500', color: '#374151' }),
                input('Enter your name'),
              ]}),
              node('container', { styles: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
                text('Email', { fontSize: '13px', fontWeight: '500', color: '#374151' }),
                input('you@example.com', 'email'),
              ]}),
              node('container', { styles: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
                text('Bio', { fontSize: '13px', fontWeight: '500', color: '#374151' }),
                node('textarea', { props: { placeholder: 'Tell us about yourself…', rows: 3 } }),
              ]}),
            ]}),
          ],
        }),
        node('spacer', { props: { size: '24px' } }),
        node('divider'),
        node('spacer', { props: { size: '20px' } }),
        node('section', {
          children: [
            heading('Notifications', 3, { fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#111827' }),
            node('stack', { props: { direction: 'column', gap: '12px' }, children: [
              node('checkbox', { props: { label: 'Email notifications', checked: true } }),
              node('checkbox', { props: { label: 'Push notifications' } }),
              node('checkbox', { props: { label: 'Weekly digest', checked: true } }),
            ]}),
          ],
        }),
        node('spacer', { props: { size: '24px' } }),
        node('divider'),
        node('spacer', { props: { size: '16px' } }),
        node('stack', {
          props: { direction: 'horizontal', gap: '8px' },
          styles: { justifyContent: 'flex-end' },
          children: [
            button('Cancel', 'outline'),
            button('Save Changes', 'primary'),
          ],
        }),
      ],
    }),
    metadata: {
      name: 'Settings Form',
      description: 'Form with sections, labels, inputs, and action buttons',
      viewport: { width: 640, height: 700 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

const heroSection: LayoutTemplate = {
  id: 'hero',
  name: 'Hero Section',
  description: 'Landing page hero with headline, tagline, and CTA buttons',
  category: 'section',
  icon: '🚀',
  viewport: { width: 800, height: 480 },
  build: () => ({
    root: node('section', {
      styles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '64px 48px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        height: '100%',
      },
      children: [
        node('badge', { children: ['Now in Public Beta'], styles: { background: 'rgba(255,255,255,0.2)', color: '#ffffff', marginBottom: '24px', padding: '4px 14px' } }),
        heading('Build beautiful interfaces\nwithout the complexity', 1, {
          fontSize: '42px', fontWeight: '800', color: '#ffffff', lineHeight: '1.15', marginBottom: '16px', maxWidth: '600px',
        }),
        text('Ship polished UI in half the time. Pollin helps you go from idea to production-ready design with AI assistance.', {
          fontSize: '18px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', maxWidth: '520px', marginBottom: '32px',
        }),
        node('stack', {
          props: { direction: 'horizontal', gap: '12px' },
          children: [
            node('button', { props: { variant: 'primary' }, children: ['Get Started Free'], styles: { background: '#ffffff', color: '#4c1d95', fontWeight: '600', padding: '12px 24px', fontSize: '15px' } }),
            node('button', { props: { variant: 'outline' }, children: ['View Demo'], styles: { borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff', padding: '12px 24px', fontSize: '15px' } }),
          ],
        }),
      ],
    }),
    metadata: {
      name: 'Hero Section',
      description: 'Landing page hero with headline, tagline, and CTA buttons',
      viewport: { width: 800, height: 480 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

const tableView: LayoutTemplate = {
  id: 'table-view',
  name: 'Data Table',
  description: 'Filterable table with header actions and pagination',
  category: 'pattern',
  icon: '📋',
  viewport: { width: 800, height: 500 },
  build: () => ({
    root: node('container', {
      styles: { padding: '24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#ffffff' },
      children: [
        node('stack', {
          props: { direction: 'horizontal', gap: '12px' },
          styles: { justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
          children: [
            heading('Users', 2, { fontSize: '18px', fontWeight: '700', color: '#111827' }),
            node('stack', {
              props: { direction: 'horizontal', gap: '8px' },
              children: [
                input('Filter users…'),
                button('Add User'),
              ],
            }),
          ],
        }),
        card([
          node('table', {
            props: {
              headers: ['Name', 'Email', 'Role', 'Status'],
              rows: [
                ['Alice Chen', 'alice@example.com', 'Admin', 'Active'],
                ['Bob Smith', 'bob@example.com', 'Editor', 'Active'],
                ['Carol Wu', 'carol@example.com', 'Viewer', 'Inactive'],
                ['Dan Park', 'dan@example.com', 'Editor', 'Active'],
                ['Eve Johnson', 'eve@example.com', 'Admin', 'Active'],
              ],
            },
          }),
        ], { padding: '0', overflow: 'hidden' }),
        node('stack', {
          props: { direction: 'horizontal', gap: '8px' },
          styles: { justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
          children: [
            text('Showing 1–5 of 23 users', { fontSize: '13px', color: '#6b7280' }),
            node('stack', {
              props: { direction: 'horizontal', gap: '4px' },
              children: [
                button('Previous', 'outline'),
                button('Next', 'outline'),
              ],
            }),
          ],
        }),
      ],
    }),
    metadata: {
      name: 'Data Table',
      description: 'Filterable table with header actions and pagination',
      viewport: { width: 800, height: 500 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

const authForm: LayoutTemplate = {
  id: 'auth-form',
  name: 'Login Form',
  description: 'Centered authentication form with social login options',
  category: 'pattern',
  icon: '🔒',
  viewport: { width: 480, height: 600 },
  build: () => ({
    root: node('container', {
      styles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '32px',
        background: '#f9fafb',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      children: [
        card([
          heading('Welcome back', 2, { fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '4px', color: '#111827' }),
          text('Sign in to your account', { fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' }),
          node('stack', { props: { direction: 'column', gap: '16px' }, children: [
            node('container', { styles: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
              text('Email', { fontSize: '13px', fontWeight: '500', color: '#374151' }),
              input('you@example.com', 'email'),
            ]}),
            node('container', { styles: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [
              node('stack', {
                props: { direction: 'horizontal' },
                styles: { justifyContent: 'space-between' },
                children: [
                  text('Password', { fontSize: '13px', fontWeight: '500', color: '#374151' }),
                  node('link', { props: { href: '#' }, children: ['Forgot?'], styles: { fontSize: '12px' } }),
                ],
              }),
              input('••••••••', 'password'),
            ]}),
            button('Sign In'),
          ]}),
          node('divider', { styles: { margin: '20px 0' } }),
          node('stack', { props: { direction: 'column', gap: '8px' }, children: [
            node('button', { props: { variant: 'outline' }, children: ['Continue with Google'], styles: { width: '100%' } }),
            node('button', { props: { variant: 'outline' }, children: ['Continue with GitHub'], styles: { width: '100%' } }),
          ]}),
          node('spacer', { props: { size: '16px' } }),
          text('Don\u2019t have an account? Sign up', { fontSize: '13px', color: '#6b7280', textAlign: 'center' }),
        ], { padding: '32px', maxWidth: '400px', width: '100%' }),
      ],
    }),
    metadata: {
      name: 'Login Form',
      description: 'Centered authentication form with social login options',
      viewport: { width: 480, height: 600 },
      prompt: 'layout template',
      generatedAt: new Date().toISOString(),
    },
  }),
};

// ── Registry ───────────────────────────────────────────

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  sidebarMain,
  dashboardLayout,
  cardGrid,
  heroSection,
  formLayout,
  tableView,
  authForm,
];

/** Lookup by ID */
export function getLayoutTemplate(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((t) => t.id === id);
}
