/**
 * Mock Component Tree Builder
 *
 * Builds structured ComponentTree objects for each classified UI type.
 * Used by the mock generation path so it produces editable ComponentObjects
 * (instead of flat ImageObjects) — enabling ComponentEditor for all generated
 * content, even without an LLM API key.
 *
 * Each builder returns a ComponentTree whose root is a container with children
 * matching the typical layout for that UI type.
 */

import type { ComponentNode, ComponentTree, ComponentNodeType } from '@/types/component-tree';
import { makeNodeId } from '@/types/component-tree';

/* ─── Helpers ───────────────────────────────────────────── */

/** Shorthand node factory */
function n(
  type: ComponentNodeType,
  styles: Record<string, string> = {},
  props: Record<string, unknown> = {},
  children?: (ComponentNode | string)[],
): ComponentNode {
  return { id: makeNodeId(), type, props, styles, children };
}

/** Extract a short title from the user prompt */
function titleFrom(prompt: string, fallback: string, max = 40): string {
  const clean = prompt.replace(/^(create|build|make|design|generate|show)\s+(me\s+)?(a|an|the)?\s*/i, '').trim();
  const capped = clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
  return capped || fallback;
}

/* ─── Tree builders per UI type ─────────────────────────── */

function loginTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '48px 32px', gap: '24px' }, {}, [
    n('heading', { fontSize: '28px', fontWeight: '700', textAlign: 'center' }, { level: 1 }, ['Welcome back']),
    n('paragraph', { textAlign: 'center', color: '#6b7280', fontSize: '14px' }, {}, ['Sign in to your account to continue']),
    n('container', { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '340px' }, {}, [
      n('input', { width: '100%' }, { placeholder: 'Email address', type: 'email' }),
      n('input', { width: '100%' }, { placeholder: 'Password', type: 'password' }),
      n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
        n('checkbox', {}, { label: 'Remember me' }),
        n('link', { fontSize: '13px' }, { href: '#' }, ['Forgot password?']),
      ]),
      n('button', { width: '100%' }, { variant: 'primary' }, ['Sign in']),
    ]),
    n('divider', { width: '100%', maxWidth: '340px' }, {}),
    n('paragraph', { fontSize: '13px', color: '#6b7280', textAlign: 'center' }, {}, [
      'Don\'t have an account? ',
      n('link', {}, { href: '#' }, ['Sign up']),
    ]),
  ]);
}

function signupTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '48px 32px', gap: '24px' }, {}, [
    n('heading', { fontSize: '28px', fontWeight: '700', textAlign: 'center' }, { level: 1 }, ['Create account']),
    n('paragraph', { textAlign: 'center', color: '#6b7280', fontSize: '14px' }, {}, ['Get started with your free account']),
    n('container', { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '340px' }, {}, [
      n('container', { display: 'flex', gap: '12px' }, {}, [
        n('input', { flex: '1' }, { placeholder: 'First name' }),
        n('input', { flex: '1' }, { placeholder: 'Last name' }),
      ]),
      n('input', { width: '100%' }, { placeholder: 'Email address', type: 'email' }),
      n('input', { width: '100%' }, { placeholder: 'Password', type: 'password' }),
      n('input', { width: '100%' }, { placeholder: 'Confirm password', type: 'password' }),
      n('checkbox', {}, { label: 'I agree to the Terms of Service and Privacy Policy' }),
      n('button', { width: '100%' }, { variant: 'primary' }, ['Create account']),
    ]),
    n('paragraph', { fontSize: '13px', color: '#6b7280', textAlign: 'center' }, {}, [
      'Already have an account? ',
      n('link', {}, { href: '#' }, ['Sign in']),
    ]),
  ]);
}

function dashboardTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    // Top navbar with nav links + actions
    n('navbar', { padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('container', { display: 'flex', alignItems: 'center', gap: '20px' }, {}, [
        n('heading', { fontSize: '18px', fontWeight: '700' }, { level: 2 }, ['Dashboard']),
        n('container', { display: 'flex', gap: '16px', alignItems: 'center' }, {}, [
          n('link', { fontSize: '13px', fontWeight: '500' }, { href: '#', active: true }, ['Overview']),
          n('link', { fontSize: '13px', color: '#6b7280' }, { href: '#' }, ['Analytics']),
          n('link', { fontSize: '13px', color: '#6b7280' }, { href: '#' }, ['Reports']),
          n('link', { fontSize: '13px', color: '#6b7280' }, { href: '#' }, ['Settings']),
        ]),
      ]),
      n('container', { display: 'flex', gap: '12px', alignItems: 'center' }, {}, [
        n('input', { width: '200px' }, { placeholder: 'Search…' }),
        n('button', { padding: '8px 14px' }, { variant: 'primary' }, ['New']),
        n('avatar', { width: '32px', height: '32px' }, { initials: 'JD' }),
      ]),
    ]),
    n('divider', {}, {}),
    // Main content
    n('container', { display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', flex: '1' }, {}, [
      // Tabs
      n('tabs', {}, { items: ['Summary', 'Performance', 'Usage', 'Logs'], activeIndex: 0 }),
      // Stats row
      n('grid', { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }, {}, [
        n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
          n('stat', {}, { label: 'Total Users', value: '12,847', change: '+12%' }),
        ]),
        n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
          n('stat', {}, { label: 'Revenue', value: '$48.2K', change: '+8.3%' }),
        ]),
        n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
          n('stat', {}, { label: 'Active Now', value: '573', change: '+4%' }),
        ]),
        n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
          n('stat', {}, { label: 'Conversion', value: '3.24%', change: '-0.2%' }),
        ]),
      ]),
      // Chart + activity row
      n('container', { display: 'flex', gap: '16px' }, {}, [
        n('card', { flex: '2', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }, { title: 'Revenue Over Time' }, [
          n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
            n('heading', { fontSize: '15px', fontWeight: '600' }, { level: 3 }, ['Revenue Over Time']),
            n('select', { width: '130px', padding: '4px 8px', fontSize: '12px' }, { options: ['Last 7 days', 'Last 30 days', '3 months', '12 months'] }),
          ]),
          n('chart', { width: '100%', height: '180px' }, { chartType: 'area', data: [30, 45, 28, 55, 43, 62, 48, 70, 58, 75, 65, 80] }),
        ]),
        n('card', { flex: '1', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }, { title: 'Recent Activity' }, [
          n('heading', { fontSize: '15px', fontWeight: '600' }, { level: 3 }, ['Recent Activity']),
          n('list', {}, {}, [
            n('listItem', { fontSize: '13px' }, {}, ['New user registered']),
            n('listItem', { fontSize: '13px' }, {}, ['Payment received — $250']),
            n('listItem', { fontSize: '13px' }, {}, ['Report generated']),
            n('listItem', { fontSize: '13px' }, {}, ['Settings updated']),
            n('listItem', { fontSize: '13px' }, {}, ['User feedback submitted']),
          ]),
        ]),
      ]),
      // Table section
      n('card', { padding: '0', overflow: 'hidden' }, {}, [
        n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }, {}, [
          n('heading', { fontSize: '15px', fontWeight: '600' }, { level: 3 }, ['Recent Entries']),
          n('container', { display: 'flex', gap: '8px', alignItems: 'center' }, {}, [
            n('badge', {}, { variant: 'primary' }, ['5 new']),
            n('button', { padding: '6px 12px', fontSize: '12px' }, { variant: 'secondary' }, ['Export']),
          ]),
        ]),
        n('table', { width: '100%' }, {
          columns: ['Name', 'Status', 'Amount', 'Date'],
          rows: [
            ['Alice Johnson', 'Completed', '$520.00', 'Mar 02'],
            ['Bob Smith', 'Pending', '$184.50', 'Mar 01'],
            ['Carol White', 'In Review', '$312.00', 'Feb 28'],
            ['Dave Brown', 'Completed', '$96.75', 'Feb 27'],
          ],
        }),
      ]),
    ]),
  ]);
}

function financeTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    n('navbar', { padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('container', { display: 'flex', flexDirection: 'column', gap: '2px' }, {}, [
        n('heading', { fontSize: '20px', fontWeight: '700' }, { level: 1 }, ['Finance Home']),
        n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['Your personal money snapshot']),
      ]),
      n('container', { display: 'flex', gap: '10px' }, {}, [
        n('button', { width: 'auto', padding: '8px 12px' }, { variant: 'secondary' }, ['Insights']),
        n('button', { width: 'auto', padding: '8px 12px' }, { variant: 'primary' }, ['Add transaction']),
      ]),
    ]),
    n('divider', {}, {}),
    n('container', { display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', flex: '1' }, {}, [
      n('grid', { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }, {}, [
        n('card', { padding: '20px' }, { title: 'Total Balance' }, [
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['Total balance']),
          n('heading', { fontSize: '34px', fontWeight: '700', letterSpacing: '-0.02em', marginTop: '8px' }, { level: 2 }, ['$128,430.24']),
          n('badge', { marginTop: '10px' }, { variant: 'primary' }, ['+2.8% this month']),
          n('container', { display: 'flex', gap: '8px', marginTop: '12px' }, {}, [
            n('badge', {}, { variant: 'secondary' }, ['Cash $18,210']),
            n('badge', {}, { variant: 'secondary' }, ['Investments $92,040']),
          ]),
        ]),
        n('card', { padding: '20px' }, { title: 'Quick Actions' }, [
          n('list', {}, {}, [
            n('listItem', {}, {}, ['Transfer funds']),
            n('listItem', {}, {}, ['Pay bill']),
            n('listItem', {}, {}, ['Create savings goal']),
          ]),
        ]),
      ]),
      n('grid', { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px' }, {}, [
        n('card', { padding: '20px' }, { title: 'Spending Trend' }, [
          n('chart', { width: '100%', height: '170px' }, { chartType: 'bar', data: [35, 52, 46, 64, 60, 58, 72, 67, 74, 68, 76, 83] }),
        ]),
        n('card', { padding: '20px' }, { title: 'Budget Health' }, [
          n('progress', {}, { value: 74, label: 'Housing' }),
          n('progress', {}, { value: 58, label: 'Food' }),
          n('progress', {}, { value: 42, label: 'Transport' }),
          n('progress', {}, { value: 65, label: 'Entertainment' }),
        ]),
        n('card', { padding: '20px' }, { title: 'Recent Transactions' }, [
          n('list', {}, {}, [
            n('listItem', {}, {}, ['Salary +$4,200']),
            n('listItem', {}, {}, ['Rent -$1,450']),
            n('listItem', {}, {}, ['Coffee Shop -$12.40']),
            n('listItem', {}, {}, ['ETF Buy -$600']),
            n('listItem', {}, {}, ['Dividend +$84']),
          ]),
        ]),
      ]),
    ]),
  ]);
}

function settingsTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', minHeight: '100%' }, {}, [
    // Sidebar nav
    n('sidebar', { width: '220px', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
      n('heading', { fontSize: '16px', fontWeight: '700', padding: '0 8px', marginBottom: '16px' }, { level: 2 }, ['Settings']),
      n('link', { padding: '8px', borderRadius: '6px' }, { href: '#', active: true }, ['General']),
      n('link', { padding: '8px', borderRadius: '6px' }, { href: '#' }, ['Profile']),
      n('link', { padding: '8px', borderRadius: '6px' }, { href: '#' }, ['Notifications']),
      n('link', { padding: '8px', borderRadius: '6px' }, { href: '#' }, ['Security']),
      n('link', { padding: '8px', borderRadius: '6px' }, { href: '#' }, ['Billing']),
      n('link', { padding: '8px', borderRadius: '6px' }, { href: '#' }, ['Integrations']),
    ]),
    n('divider', { alignSelf: 'stretch' }, { orientation: 'vertical' }),
    // Main content
    n('container', { flex: '1', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }, {}, [
      n('heading', { fontSize: '22px', fontWeight: '700' }, { level: 1 }, ['General Settings']),
      n('container', { display: 'flex', flexDirection: 'column', gap: '20px' }, {}, [
        n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Display name']),
          n('input', { maxWidth: '400px' }, { placeholder: 'John Doe', value: 'John Doe' }),
        ]),
        n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Email']),
          n('input', { maxWidth: '400px' }, { placeholder: 'john@example.com', type: 'email' }),
        ]),
        n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Language']),
          n('select', { maxWidth: '400px' }, { options: ['English', 'Spanish', 'French', 'German'] }),
        ]),
        n('divider', {}, {}),
        n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
          n('container', { display: 'flex', flexDirection: 'column', gap: '2px' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Dark mode']),
            n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['Use dark theme across the app']),
          ]),
          n('toggle', {}, { checked: false }),
        ]),
        n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
          n('container', { display: 'flex', flexDirection: 'column', gap: '2px' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Email notifications']),
            n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['Receive email for important updates']),
          ]),
          n('toggle', {}, { checked: true }),
        ]),
      ]),
      n('container', { display: 'flex', gap: '12px' }, {}, [
        n('button', {}, { variant: 'primary' }, ['Save changes']),
        n('button', {}, { variant: 'secondary' }, ['Cancel']),
      ]),
    ]),
  ]);
}

function profileTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', gap: '24px', minHeight: '100%' }, {}, [
    n('avatar', { width: '96px', height: '96px' }, { initials: 'JD', size: 'lg' }),
    n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }, {}, [
      n('heading', { fontSize: '24px', fontWeight: '700' }, { level: 1 }, ['John Doe']),
      n('text', { fontSize: '14px', color: '#6b7280' }, {}, ['Senior Product Designer']),
      n('text', { fontSize: '13px', color: '#9ca3af' }, {}, ['San Francisco, CA']),
    ]),
    n('container', { display: 'flex', gap: '32px' }, {}, [
      n('stat', {}, { label: 'Projects', value: '142' }),
      n('stat', {}, { label: 'Followers', value: '8.5K' }),
      n('stat', {}, { label: 'Following', value: '312' }),
    ]),
    n('container', { display: 'flex', gap: '12px' }, {}, [
      n('button', {}, { variant: 'primary' }, ['Follow']),
      n('button', {}, { variant: 'secondary' }, ['Message']),
    ]),
    n('divider', { width: '100%', maxWidth: '500px' }, {}),
    n('container', { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '500px' }, {}, [
      n('heading', { fontSize: '16px', fontWeight: '600' }, { level: 3 }, ['About']),
      n('paragraph', { fontSize: '14px', lineHeight: '1.6', color: '#4b5563' }, {}, [
        'Passionate designer with 8+ years of experience creating beautiful and functional user interfaces. Currently focused on design systems and accessibility.',
      ]),
    ]),
  ]);
}

function pricingTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: '40px', minHeight: '100%' }, {}, [
    n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }, {}, [
      n('heading', { fontSize: '32px', fontWeight: '700', textAlign: 'center' }, { level: 1 }, ['Simple, transparent pricing']),
      n('paragraph', { fontSize: '16px', color: '#6b7280', textAlign: 'center' }, {}, ['Choose the plan that works for you']),
    ]),
    n('grid', { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%', maxWidth: '900px' }, {}, [
      // Free
      n('card', { padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }, {}, [
        n('text', { fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }, {}, ['Free']),
        n('container', { display: 'flex', alignItems: 'baseline', gap: '4px' }, {}, [
          n('heading', { fontSize: '36px', fontWeight: '700' }, { level: 2 }, ['$0']),
          n('text', { fontSize: '14px', color: '#6b7280' }, {}, ['/month']),
        ]),
        n('divider', {}, {}),
        n('list', { display: 'flex', flexDirection: 'column', gap: '10px' }, {}, [
          n('listItem', {}, {}, ['5 projects']),
          n('listItem', {}, {}, ['1 GB storage']),
          n('listItem', {}, {}, ['Community support']),
        ]),
        n('button', { marginTop: 'auto', width: '100%' }, { variant: 'secondary' }, ['Get started']),
      ]),
      // Pro
      n('card', { padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', borderWidth: '2px', borderStyle: 'solid' }, { highlighted: true }, [
        n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }, {}, ['Pro']),
          n('badge', {}, { variant: 'primary' }, ['Popular']),
        ]),
        n('container', { display: 'flex', alignItems: 'baseline', gap: '4px' }, {}, [
          n('heading', { fontSize: '36px', fontWeight: '700' }, { level: 2 }, ['$19']),
          n('text', { fontSize: '14px', color: '#6b7280' }, {}, ['/month']),
        ]),
        n('divider', {}, {}),
        n('list', { display: 'flex', flexDirection: 'column', gap: '10px' }, {}, [
          n('listItem', {}, {}, ['Unlimited projects']),
          n('listItem', {}, {}, ['50 GB storage']),
          n('listItem', {}, {}, ['Priority support']),
          n('listItem', {}, {}, ['Advanced analytics']),
        ]),
        n('button', { marginTop: 'auto', width: '100%' }, { variant: 'primary' }, ['Upgrade to Pro']),
      ]),
      // Enterprise
      n('card', { padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }, {}, [
        n('text', { fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }, {}, ['Enterprise']),
        n('container', { display: 'flex', alignItems: 'baseline', gap: '4px' }, {}, [
          n('heading', { fontSize: '36px', fontWeight: '700' }, { level: 2 }, ['$99']),
          n('text', { fontSize: '14px', color: '#6b7280' }, {}, ['/month']),
        ]),
        n('divider', {}, {}),
        n('list', { display: 'flex', flexDirection: 'column', gap: '10px' }, {}, [
          n('listItem', {}, {}, ['Everything in Pro']),
          n('listItem', {}, {}, ['Unlimited storage']),
          n('listItem', {}, {}, ['Dedicated support']),
          n('listItem', {}, {}, ['Custom integrations']),
          n('listItem', {}, {}, ['SSO & SAML']),
        ]),
        n('button', { marginTop: 'auto', width: '100%' }, { variant: 'secondary' }, ['Contact sales']),
      ]),
    ]),
  ]);
}

function landingTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    // Navbar
    n('navbar', { padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('heading', { fontSize: '20px', fontWeight: '800' }, { level: 1 }, ['Acme']),
      n('container', { display: 'flex', gap: '24px', alignItems: 'center' }, {}, [
        n('link', { fontSize: '14px' }, { href: '#' }, ['Features']),
        n('link', { fontSize: '14px' }, { href: '#' }, ['Pricing']),
        n('link', { fontSize: '14px' }, { href: '#' }, ['Docs']),
        n('button', {}, { variant: 'primary' }, ['Get Started']),
      ]),
    ]),
    // Hero
    n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '1', padding: '64px 32px', gap: '24px', textAlign: 'center' }, {}, [
      n('badge', { marginBottom: '8px' }, {}, ['Now in Beta']),
      n('heading', { fontSize: '42px', fontWeight: '800', lineHeight: '1.1', maxWidth: '600px' }, { level: 1 }, ['Build amazing products faster than ever']),
      n('paragraph', { fontSize: '18px', color: '#6b7280', maxWidth: '500px', lineHeight: '1.5' }, {}, [
        'The all-in-one platform that helps teams design, develop, and ship beautiful software.',
      ]),
      n('container', { display: 'flex', gap: '12px', marginTop: '8px' }, {}, [
        n('button', {}, { variant: 'primary' }, ['Start free trial']),
        n('button', {}, { variant: 'secondary' }, ['Watch demo']),
      ]),
    ]),
  ]);
}

function navbarTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', gap: '16px', padding: '0' }, {}, [
    n('navbar', { padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('heading', { fontSize: '18px', fontWeight: '700' }, { level: 1 }, ['AppName']),
      n('container', { display: 'flex', gap: '20px', alignItems: 'center' }, {}, [
        n('link', { fontSize: '14px' }, { href: '#' }, ['Home']),
        n('link', { fontSize: '14px' }, { href: '#' }, ['Products']),
        n('link', { fontSize: '14px' }, { href: '#' }, ['About']),
        n('link', { fontSize: '14px' }, { href: '#' }, ['Contact']),
      ]),
      n('container', { display: 'flex', gap: '12px', alignItems: 'center' }, {}, [
        n('input', { width: '180px' }, { placeholder: 'Search…' }),
        n('button', {}, { variant: 'primary' }, ['Sign in']),
      ]),
    ]),
    n('divider', {}, {}),
    n('container', { padding: '32px 24px', textAlign: 'center' }, {}, [
      n('text', { fontSize: '14px', color: '#9ca3af' }, {}, ['Your page content will appear here']),
    ]),
  ]);
}

function sidebarTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', minHeight: '100%' }, {}, [
    n('sidebar', { width: '240px', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
      n('container', { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '16px' }, {}, [
        n('avatar', { width: '28px', height: '28px' }, { initials: 'A' }),
        n('heading', { fontSize: '16px', fontWeight: '700' }, { level: 1 }, ['Workspace']),
      ]),
      n('text', { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', padding: '8px', marginTop: '8px' }, {}, ['Menu']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#', active: true, icon: 'home' }, ['Home']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#', icon: 'inbox' }, ['Inbox']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#', icon: 'file' }, ['Documents']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#', icon: 'chart' }, ['Analytics']),
      n('text', { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', padding: '8px', marginTop: '12px' }, {}, ['Teams']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#' }, ['Engineering']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#' }, ['Design']),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#' }, ['Marketing']),
      n('spacer', { flex: '1' }, {}),
      n('divider', {}, {}),
      n('link', { padding: '8px 12px', borderRadius: '6px' }, { href: '#', icon: 'settings' }, ['Settings']),
    ]),
    n('divider', { alignSelf: 'stretch' }, { orientation: 'vertical' }),
    n('container', { flex: '1', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }, {}, [
      n('heading', { fontSize: '22px', fontWeight: '700' }, { level: 1 }, ['Home']),
      n('paragraph', { color: '#6b7280', fontSize: '14px' }, {}, ['Welcome back! Here\'s what\'s happening today.']),
    ]),
  ]);
}

function cardTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '32px', gap: '20px' }, {}, [
    n('card', { width: '100%', maxWidth: '380px', padding: '0', overflow: 'hidden' }, {}, [
      n('image', { width: '100%', height: '200px', objectFit: 'cover' }, { src: 'placeholder', alt: 'Card image' }),
      n('container', { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }, {}, [
        n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
          n('badge', {}, { variant: 'primary' }, ['Featured']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['3 min read']),
        ]),
        n('heading', { fontSize: '18px', fontWeight: '600' }, { level: 3 }, ['Getting Started with Design Systems']),
        n('paragraph', { fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }, {}, [
          'Learn how to build consistent, scalable user interfaces with a well-structured design system.',
        ]),
        n('container', { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }, {}, [
          n('avatar', { width: '28px', height: '28px' }, { initials: 'JD' }),
          n('text', { fontSize: '13px', color: '#6b7280' }, {}, ['Jane Doe']),
        ]),
      ]),
    ]),
  ]);
}

function formTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '48px 32px', gap: '32px' }, {}, [
    n('container', { display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }, {}, [
      n('heading', { fontSize: '24px', fontWeight: '700' }, { level: 1 }, ['Contact Us']),
      n('paragraph', { fontSize: '14px', color: '#6b7280' }, {}, ['We\'d love to hear from you. Fill out the form below.']),
    ]),
    n('container', { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '420px' }, {}, [
      n('container', { display: 'flex', gap: '12px' }, {}, [
        n('container', { flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['First name']),
          n('input', {}, { placeholder: 'John' }),
        ]),
        n('container', { flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Last name']),
          n('input', {}, { placeholder: 'Doe' }),
        ]),
      ]),
      n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Email']),
        n('input', {}, { placeholder: 'john@example.com', type: 'email' }),
      ]),
      n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Subject']),
        n('select', {}, { options: ['General inquiry', 'Support', 'Sales', 'Partnership'] }),
      ]),
      n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Message']),
        n('textarea', { minHeight: '100px' }, { placeholder: 'Tell us how we can help…' }),
      ]),
      n('button', { width: '100%' }, { variant: 'primary' }, ['Send message']),
    ]),
  ]);
}

function tableTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '24px', gap: '20px' }, {}, [
    n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
      n('heading', { fontSize: '22px', fontWeight: '700' }, { level: 1 }, ['Users']),
      n('container', { display: 'flex', gap: '12px', alignItems: 'center' }, {}, [
        n('input', { width: '220px' }, { placeholder: 'Search users…' }),
        n('button', {}, { variant: 'primary' }, ['Add user']),
      ]),
    ]),
    n('table', { width: '100%' }, {
      columns: ['Name', 'Email', 'Role', 'Status', 'Joined'],
      rows: [
        ['Alice Johnson', 'alice@example.com', 'Admin', 'Active', 'Jan 12, 2024'],
        ['Bob Smith', 'bob@example.com', 'Editor', 'Active', 'Feb 3, 2024'],
        ['Carol White', 'carol@example.com', 'Viewer', 'Inactive', 'Mar 15, 2024'],
        ['Dave Brown', 'dave@example.com', 'Editor', 'Active', 'Apr 22, 2024'],
        ['Eve Wilson', 'eve@example.com', 'Admin', 'Active', 'May 8, 2024'],
      ],
    }),
    n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }, {}, [
      n('text', { color: '#6b7280' }, {}, ['Showing 1-5 of 48 users']),
      n('container', { display: 'flex', gap: '8px' }, {}, [
        n('button', {}, { variant: 'secondary', disabled: true }, ['Previous']),
        n('button', {}, { variant: 'secondary' }, ['Next']),
      ]),
    ]),
  ]);
}

function chatTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    // Chat header
    n('navbar', { padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }, {}, [
      n('avatar', { width: '36px', height: '36px' }, { initials: 'AK' }),
      n('container', { display: 'flex', flexDirection: 'column', gap: '0' }, {}, [
        n('text', { fontSize: '15px', fontWeight: '600' }, {}, ['Anna Kim']),
        n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['Online']),
      ]),
    ]),
    n('divider', {}, {}),
    // Messages
    n('container', { flex: '1', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }, {}, [
      // Received
      n('container', { display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '75%' }, {}, [
        n('avatar', { width: '28px', height: '28px' }, { initials: 'AK' }),
        n('card', { padding: '10px 14px', borderRadius: '16px' }, {}, [
          n('paragraph', { fontSize: '14px', margin: '0' }, {}, ['Hey! Have you seen the new design mockups?']),
        ]),
      ]),
      // Sent
      n('container', { display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '75%', alignSelf: 'flex-end', flexDirection: 'row-reverse' }, {}, [
        n('card', { padding: '10px 14px', borderRadius: '16px' }, { variant: 'primary' }, [
          n('paragraph', { fontSize: '14px', margin: '0' }, {}, ['Yes! They look great. Love the new color scheme.']),
        ]),
      ]),
      // Received
      n('container', { display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '75%' }, {}, [
        n('avatar', { width: '28px', height: '28px' }, { initials: 'AK' }),
        n('card', { padding: '10px 14px', borderRadius: '16px' }, {}, [
          n('paragraph', { fontSize: '14px', margin: '0' }, {}, ['Awesome! Should we schedule a review meeting for tomorrow?']),
        ]),
      ]),
    ]),
    n('divider', {}, {}),
    // Input area
    n('container', { padding: '12px 20px', display: 'flex', gap: '12px', alignItems: 'center' }, {}, [
      n('input', { flex: '1' }, { placeholder: 'Type a message…' }),
      n('button', {}, { variant: 'primary' }, ['Send']),
    ]),
  ]);
}

function modalTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '32px' }, {}, [
    n('dialog', { width: '100%', maxWidth: '440px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }, {}, [
      n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, {}, [
        n('container', { display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
          n('heading', { fontSize: '18px', fontWeight: '600' }, { level: 2 }, ['Delete project?']),
          n('paragraph', { fontSize: '14px', color: '#6b7280' }, {}, [
            'This action cannot be undone. All data associated with this project will be permanently removed.',
          ]),
        ]),
      ]),
      n('alert', { padding: '12px 16px', fontSize: '13px' }, { variant: 'warning' }, [
        'This will affect 12 team members who have access to this project.',
      ]),
      n('container', { display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Type "DELETE" to confirm']),
        n('input', {}, { placeholder: 'DELETE' }),
      ]),
      n('container', { display: 'flex', justifyContent: 'flex-end', gap: '12px' }, {}, [
        n('button', {}, { variant: 'secondary' }, ['Cancel']),
        n('button', {}, { variant: 'destructive' }, ['Delete project']),
      ]),
    ]),
  ]);
}

function notificationTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', padding: '32px', gap: '16px', minHeight: '100%' }, {}, [
    n('heading', { fontSize: '22px', fontWeight: '700' }, { level: 1 }, ['Notifications']),
    n('tabs', {}, { items: ['All', 'Unread', 'Mentions'], activeIndex: 0 }),
    n('container', { display: 'flex', flexDirection: 'column', gap: '8px' }, {}, [
      n('card', { padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }, {}, [
        n('avatar', { width: '36px', height: '36px', flexShrink: '0' }, { initials: 'SK' }),
        n('container', { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }, {}, [
          n('text', { fontSize: '14px' }, {}, ['Sarah Kim commented on your design']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['2 minutes ago']),
        ]),
        n('badge', { flexShrink: '0' }, { variant: 'primary' }, ['New']),
      ]),
      n('card', { padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }, {}, [
        n('avatar', { width: '36px', height: '36px', flexShrink: '0' }, { initials: 'MJ' }),
        n('container', { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }, {}, [
          n('text', { fontSize: '14px' }, {}, ['Mike Johnson invited you to a project']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['1 hour ago']),
        ]),
        n('badge', { flexShrink: '0' }, { variant: 'primary' }, ['New']),
      ]),
      n('card', { padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }, {}, [
        n('avatar', { width: '36px', height: '36px', flexShrink: '0' }, { initials: 'LS' }),
        n('container', { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }, {}, [
          n('text', { fontSize: '14px', color: '#4b5563' }, {}, ['Lisa Smith completed the review']),
          n('text', { fontSize: '12px', color: '#9ca3af' }, {}, ['3 hours ago']),
        ]),
      ]),
      n('card', { padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }, {}, [
        n('avatar', { width: '36px', height: '36px', flexShrink: '0' }, { initials: 'TC' }),
        n('container', { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1' }, {}, [
          n('text', { fontSize: '14px', color: '#4b5563' }, {}, ['Tom Chen shared a file with you']),
          n('text', { fontSize: '12px', color: '#9ca3af' }, {}, ['Yesterday']),
        ]),
      ]),
    ]),
  ]);
}

function onboardingTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '48px 32px', gap: '40px' }, {}, [
    n('progress', { width: '200px' }, { value: 40, max: 100 }),
    n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }, {}, [
      n('heading', { fontSize: '28px', fontWeight: '700' }, { level: 1 }, ['What brings you here?']),
      n('paragraph', { fontSize: '16px', color: '#6b7280', maxWidth: '400px' }, {}, [
        'Help us customize your experience by choosing what best describes you.',
      ]),
    ]),
    n('grid', { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%', maxWidth: '420px' }, {}, [
      n('card', { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', cursor: 'pointer' }, {}, [
        n('icon', { fontSize: '28px' }, { name: 'design' }),
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Designer']),
      ]),
      n('card', { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', cursor: 'pointer' }, {}, [
        n('icon', { fontSize: '28px' }, { name: 'code' }),
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Developer']),
      ]),
      n('card', { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', cursor: 'pointer' }, {}, [
        n('icon', { fontSize: '28px' }, { name: 'chart' }),
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Product Manager']),
      ]),
      n('card', { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', cursor: 'pointer' }, {}, [
        n('icon', { fontSize: '28px' }, { name: 'users' }),
        n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Marketer']),
      ]),
    ]),
    n('container', { display: 'flex', gap: '12px' }, {}, [
      n('button', {}, { variant: 'secondary' }, ['Back']),
      n('button', {}, { variant: 'primary' }, ['Continue']),
    ]),
  ]);
}

function searchTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '24px 32px', gap: '24px' }, {}, [
    n('container', { display: 'flex', gap: '12px', alignItems: 'center' }, {}, [
      n('input', { flex: '1' }, { placeholder: 'Search anything…', type: 'search' }),
      n('button', {}, { variant: 'primary' }, ['Search']),
    ]),
    n('container', { display: 'flex', gap: '8px', flexWrap: 'wrap' }, {}, [
      n('badge', { cursor: 'pointer' }, { variant: 'primary' }, ['All']),
      n('badge', { cursor: 'pointer' }, {}, ['Images']),
      n('badge', { cursor: 'pointer' }, {}, ['Videos']),
      n('badge', { cursor: 'pointer' }, {}, ['Documents']),
      n('badge', { cursor: 'pointer' }, {}, ['People']),
    ]),
    n('text', { fontSize: '13px', color: '#6b7280' }, {}, ['Showing 24 results for "design system"']),
    n('container', { display: 'flex', flexDirection: 'column', gap: '12px' }, {}, [
      n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('link', { fontSize: '16px', fontWeight: '500' }, { href: '#' }, ['Introduction to Design Systems']),
        n('text', { fontSize: '13px', color: '#6b7280' }, {}, ['docs.example.com/design-systems']),
        n('paragraph', { fontSize: '14px', color: '#4b5563' }, {}, ['A comprehensive guide to building and maintaining design systems for modern applications…']),
      ]),
      n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('link', { fontSize: '16px', fontWeight: '500' }, { href: '#' }, ['Design System Components Library']),
        n('text', { fontSize: '13px', color: '#6b7280' }, {}, ['components.example.com']),
        n('paragraph', { fontSize: '14px', color: '#4b5563' }, {}, ['Browse our collection of reusable UI components built with accessibility in mind…']),
      ]),
      n('card', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
        n('link', { fontSize: '16px', fontWeight: '500' }, { href: '#' }, ['Best Practices for Design Tokens']),
        n('text', { fontSize: '13px', color: '#6b7280' }, {}, ['blog.example.com/tokens']),
        n('paragraph', { fontSize: '14px', color: '#4b5563' }, {}, ['Learn how design tokens bridge the gap between design and development teams…']),
      ]),
    ]),
  ]);
}

function mediaPlayerTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '32px', gap: '24px' }, {}, [
    n('card', { width: '100%', maxWidth: '380px', padding: '0', overflow: 'hidden' }, {}, [
      n('image', { width: '100%', height: '220px', objectFit: 'cover' }, { src: 'placeholder', alt: 'Album art' }),
      n('container', { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }, {}, [
        n('container', { display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'center' }, {}, [
          n('heading', { fontSize: '18px', fontWeight: '600' }, { level: 3 }, ['Midnight Dreams']),
          n('text', { fontSize: '14px', color: '#6b7280' }, {}, ['The Wanderers']),
        ]),
        n('progress', {}, { value: 65, max: 100 }),
        n('container', { display: 'flex', justifyContent: 'space-between', fontSize: '12px' }, {}, [
          n('text', { color: '#6b7280' }, {}, ['2:34']),
          n('text', { color: '#6b7280' }, {}, ['3:52']),
        ]),
        n('container', { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }, {}, [
          n('button', {}, { variant: 'ghost', icon: 'skip-back' }, ['⏮']),
          n('button', { width: '48px', height: '48px', borderRadius: '50%' }, { variant: 'primary' }, ['▶']),
          n('button', {}, { variant: 'ghost', icon: 'skip-forward' }, ['⏭']),
        ]),
        n('slider', {}, { label: 'Volume', value: 70, min: 0, max: 100 }),
      ]),
    ]),
  ]);
}

function calendarTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '24px', gap: '20px' }, {}, [
    n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
      n('heading', { fontSize: '22px', fontWeight: '700' }, { level: 1 }, ['January 2025']),
      n('container', { display: 'flex', gap: '8px' }, {}, [
        n('button', {}, { variant: 'secondary' }, ['←']),
        n('button', {}, { variant: 'secondary' }, ['Today']),
        n('button', {}, { variant: 'secondary' }, ['→']),
      ]),
    ]),
    n('grid', { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }, {}, [
      ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d =>
        n('text', { padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }, {}, [d])
      ),
      ...[29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1].map((d, i) => {
        const isOutside = i < 3 || i > 33;
        const isToday = d === 10 && !isOutside;
        return n('container', {
          padding: '8px',
          textAlign: 'center',
          borderRadius: '6px',
        }, {}, [
          n('text', { fontSize: '14px', ...(isOutside ? { opacity: '0.3' } : {}), ...(isToday ? { fontWeight: '700' } : {}) }, {}, [String(d)]),
          ...(d === 15 && !isOutside ? [n('badge', { fontSize: '10px', marginTop: '2px' }, { variant: 'primary' }, ['Meeting'])] : []),
          ...(d === 22 && !isOutside ? [n('badge', { fontSize: '10px', marginTop: '2px' }, {}, ['Deadline'])] : []),
        ]);
      }),
    ]),
  ]);
}

function emailTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', minHeight: '100%' }, {}, [
    // Left panel
    n('container', { width: '280px', display: 'flex', flexDirection: 'column' }, {}, [
      n('container', { padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
        n('heading', { fontSize: '16px', fontWeight: '700' }, { level: 2 }, ['Inbox']),
        n('button', {}, { variant: 'primary' }, ['Compose']),
      ]),
      n('input', { margin: '0 16px 12px' }, { placeholder: 'Search mail…' }),
      n('container', { display: 'flex', flexDirection: 'column', flex: '1', overflowY: 'auto' }, {}, [
        n('card', { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeftWidth: '3px', borderLeftStyle: 'solid', borderRadius: '0' }, { highlighted: true }, [
          n('container', { display: 'flex', justifyContent: 'space-between' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '600' }, {}, ['Alex Rivera']),
            n('text', { fontSize: '11px', color: '#6b7280' }, {}, ['10:32 AM']),
          ]),
          n('text', { fontSize: '13px', fontWeight: '500' }, {}, ['Design Review Notes']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['Here are my notes from the design review meeting…']),
        ]),
        n('card', { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '0' }, {}, [
          n('container', { display: 'flex', justifyContent: 'space-between' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '600' }, {}, ['Team Updates']),
            n('text', { fontSize: '11px', color: '#6b7280' }, {}, ['9:15 AM']),
          ]),
          n('text', { fontSize: '13px' }, {}, ['Weekly Sync Summary']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['This week\'s highlights and action items…']),
        ]),
        n('card', { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '0' }, {}, [
          n('container', { display: 'flex', justifyContent: 'space-between' }, {}, [
            n('text', { fontSize: '14px' }, {}, ['Sarah Chen']),
            n('text', { fontSize: '11px', color: '#6b7280' }, {}, ['Yesterday']),
          ]),
          n('text', { fontSize: '13px' }, {}, ['Project Proposal']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['I\'ve attached the updated project proposal…']),
        ]),
      ]),
    ]),
    n('divider', { alignSelf: 'stretch' }, { orientation: 'vertical' }),
    // Email content
    n('container', { flex: '1', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }, {}, [
      n('heading', { fontSize: '20px', fontWeight: '600' }, { level: 2 }, ['Design Review Notes']),
      n('container', { display: 'flex', alignItems: 'center', gap: '12px' }, {}, [
        n('avatar', { width: '36px', height: '36px' }, { initials: 'AR' }),
        n('container', { display: 'flex', flexDirection: 'column', gap: '0' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Alex Rivera']),
          n('text', { fontSize: '12px', color: '#6b7280' }, {}, ['alex@example.com · 10:32 AM']),
        ]),
      ]),
      n('divider', {}, {}),
      n('paragraph', { fontSize: '14px', lineHeight: '1.7' }, {}, [
        'Hi team, here are my notes from today\'s design review meeting. Overall the new dashboard looks great — a few items to address before we ship.',
      ]),
      n('list', { fontSize: '14px', lineHeight: '1.7' }, {}, [
        n('listItem', {}, {}, ['Update the chart colors to match the new brand palette']),
        n('listItem', {}, {}, ['Add loading skeleton states to the cards']),
        n('listItem', {}, {}, ['Review accessibility contrast ratios on the sidebar']),
      ]),
    ]),
  ]);
}

function ecommerceTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    n('navbar', { padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('heading', { fontSize: '20px', fontWeight: '800' }, { level: 1 }, ['Store']),
      n('container', { display: 'flex', gap: '20px', alignItems: 'center' }, {}, [
        n('input', { width: '240px' }, { placeholder: 'Search products…' }),
        n('link', {}, { href: '#' }, ['Cart (3)']),
        n('avatar', { width: '28px', height: '28px' }, { initials: 'U' }),
      ]),
    ]),
    n('divider', {}, {}),
    n('container', { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: '1' }, {}, [
      n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
        n('heading', { fontSize: '20px', fontWeight: '600' }, { level: 2 }, ['Featured Products']),
        n('select', { width: '160px' }, { options: ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular'] }),
      ]),
      n('grid', { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }, {}, [
        n('card', { padding: '0', overflow: 'hidden' }, {}, [
          n('image', { width: '100%', height: '160px', objectFit: 'cover' }, { src: 'placeholder', alt: 'Product' }),
          n('container', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Wireless Headphones']),
            n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
              n('text', { fontSize: '16px', fontWeight: '700' }, {}, ['$129.99']),
              n('badge', {}, { variant: 'primary' }, ['New']),
            ]),
          ]),
        ]),
        n('card', { padding: '0', overflow: 'hidden' }, {}, [
          n('image', { width: '100%', height: '160px', objectFit: 'cover' }, { src: 'placeholder', alt: 'Product' }),
          n('container', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Smart Watch Pro']),
            n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
              n('text', { fontSize: '16px', fontWeight: '700' }, {}, ['$299.00']),
              n('text', { fontSize: '12px', color: '#6b7280', textDecoration: 'line-through' }, {}, ['$349.00']),
            ]),
          ]),
        ]),
        n('card', { padding: '0', overflow: 'hidden' }, {}, [
          n('image', { width: '100%', height: '160px', objectFit: 'cover' }, { src: 'placeholder', alt: 'Product' }),
          n('container', { padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }, {}, [
            n('text', { fontSize: '14px', fontWeight: '500' }, {}, ['Bluetooth Speaker']),
            n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
              n('text', { fontSize: '16px', fontWeight: '700' }, {}, ['$79.99']),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

function kanbanTree(_prompt: string): ComponentNode {
  const col = (title: string, items: string[]) =>
    n('container', { flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }, {}, [
      n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }, {}, [
        n('text', { fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }, {}, [title]),
        n('badge', { fontSize: '11px' }, {}, [String(items.length)]),
      ]),
      ...items.map((item, idx) =>
        n('card', { padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'grab' }, {}, [
          n('text', { fontSize: '14px', fontWeight: '500' }, {}, [item]),
          n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, {}, [
            n('avatar', { width: '22px', height: '22px' }, { initials: item[0] }),
            n('text', { fontSize: '11px', color: '#9ca3af' }, {}, [['Jan 8', 'Jan 12', 'Jan 15', 'Dec 28', 'Jan 3'][idx % 5]]),
          ]),
        ])
      ),
    ]);

  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    n('navbar', { padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('heading', { fontSize: '18px', fontWeight: '700' }, { level: 1 }, ['Project Board']),
      n('container', { display: 'flex', gap: '12px' }, {}, [
        n('input', { width: '180px' }, { placeholder: 'Filter tasks…' }),
        n('button', {}, { variant: 'primary' }, ['Add task']),
      ]),
    ]),
    n('divider', {}, {}),
    n('container', { display: 'flex', gap: '16px', padding: '20px 24px', flex: '1', overflowX: 'auto' }, {}, [
      col('To Do', ['Research competitors', 'Write user stories', 'Design wireframes']),
      col('In Progress', ['Build login page', 'API integration']),
      col('Review', ['Dashboard layout']),
      col('Done', ['Setup project', 'Database schema']),
    ]),
  ]);
}

function todoTree(_prompt: string): ComponentNode {
  return n('container', { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', gap: '24px', minHeight: '100%' }, {}, [
    n('heading', { fontSize: '28px', fontWeight: '700' }, { level: 1 }, ['My Tasks']),
    n('container', { display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }, {}, [
      n('input', { flex: '1' }, { placeholder: 'Add a new task…' }),
      n('button', {}, { variant: 'primary' }, ['Add']),
    ]),
    n('tabs', { marginBottom: '8px' }, { items: ['All', 'Active', 'Completed'], activeIndex: 0 }),
    n('container', { display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '500px' }, {}, [
      n('container', { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }, {}, [
        n('checkbox', {}, { checked: true }),
        n('text', { fontSize: '14px', textDecoration: 'line-through', color: '#6b7280' }, {}, ['Set up project repository']),
      ]),
      n('container', { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }, {}, [
        n('checkbox', {}, { checked: true }),
        n('text', { fontSize: '14px', textDecoration: 'line-through', color: '#6b7280' }, {}, ['Design database schema']),
      ]),
      n('container', { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }, {}, [
        n('checkbox', {}, {}),
        n('text', { fontSize: '14px' }, {}, ['Build authentication flow']),
      ]),
      n('container', { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }, {}, [
        n('checkbox', {}, {}),
        n('text', { fontSize: '14px' }, {}, ['Create API endpoints']),
      ]),
      n('container', { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }, {}, [
        n('checkbox', {}, {}),
        n('text', { fontSize: '14px' }, {}, ['Write unit tests']),
      ]),
    ]),
    n('text', { fontSize: '13px', color: '#9ca3af' }, {}, ['3 of 5 remaining']),
  ]);
}

function genericTree(prompt: string): ComponentNode {
  const title = titleFrom(prompt, 'Dashboard');
  return n('container', { display: 'flex', flexDirection: 'column', minHeight: '100%' }, {}, [
    // Navbar
    n('navbar', { padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, {}, [
      n('container', { display: 'flex', alignItems: 'center', gap: '16px' }, {}, [
        n('heading', { fontSize: '18px', fontWeight: '700' }, { level: 2 }, [title]),
        n('container', { display: 'flex', gap: '14px', alignItems: 'center' }, {}, [
          n('link', { fontSize: '13px', fontWeight: '500' }, { href: '#', active: true }, ['Home']),
          n('link', { fontSize: '13px', color: '#6b7280' }, { href: '#' }, ['Activity']),
          n('link', { fontSize: '13px', color: '#6b7280' }, { href: '#' }, ['Settings']),
        ]),
      ]),
      n('container', { display: 'flex', gap: '10px', alignItems: 'center' }, {}, [
        n('input', { width: '180px' }, { placeholder: 'Search…' }),
        n('avatar', { width: '32px', height: '32px' }, { initials: 'U' }),
      ]),
    ]),
    n('divider', {}, {}),
    // Content
    n('container', { display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', flex: '1' }, {}, [
      // Welcome row
      n('container', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, {}, [
        n('container', { display: 'flex', flexDirection: 'column', gap: '4px' }, {}, [
          n('heading', { fontSize: '22px', fontWeight: '700' }, { level: 1 }, [title]),
          n('paragraph', { fontSize: '14px', color: '#6b7280' }, {}, ['Here\'s an overview of your activity']),
        ]),
        n('container', { display: 'flex', gap: '8px' }, {}, [
          n('button', { padding: '8px 14px' }, { variant: 'secondary' }, ['Export']),
          n('button', { padding: '8px 14px' }, { variant: 'primary' }, ['Create New']),
        ]),
      ]),
      // Stats
      n('grid', { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }, {}, [
        n('card', { padding: '16px' }, {}, [
          n('stat', {}, { label: 'Total Items', value: '2,847', change: '+6%' }),
        ]),
        n('card', { padding: '16px' }, {}, [
          n('stat', {}, { label: 'Active', value: '184', change: '+12' }),
        ]),
        n('card', { padding: '16px' }, {}, [
          n('stat', {}, { label: 'Completion', value: '76%', change: '+3%' }),
        ]),
      ]),
      // Cards row
      n('container', { display: 'flex', gap: '16px' }, {}, [
        n('card', { flex: '2', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }, {}, [
          n('heading', { fontSize: '15px', fontWeight: '600' }, { level: 3 }, ['Trend']),
          n('chart', { width: '100%', height: '160px' }, { chartType: 'area' }),
        ]),
        n('card', { flex: '1', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }, {}, [
          n('heading', { fontSize: '15px', fontWeight: '600' }, { level: 3 }, ['Recent']),
          n('list', {}, {}, [
            n('listItem', { fontSize: '13px' }, {}, ['Item updated']),
            n('listItem', { fontSize: '13px' }, {}, ['Report ready']),
            n('listItem', { fontSize: '13px' }, {}, ['New entry added']),
            n('listItem', { fontSize: '13px' }, {}, ['Feedback received']),
          ]),
        ]),
      ]),
    ]),
  ]);
}

/* ─── Template map ──────────────────────────────────────── */

type UIType =
  | 'login' | 'signup' | 'finance' | 'dashboard' | 'settings' | 'profile' | 'pricing'
  | 'landing' | 'navbar' | 'sidebar' | 'card' | 'form' | 'table' | 'chat'
  | 'modal' | 'notification' | 'onboarding' | 'search' | 'media-player'
  | 'calendar' | 'email' | 'ecommerce' | 'kanban' | 'todo' | 'generic';

const TREE_BUILDERS: Record<UIType, (prompt: string) => ComponentNode> = {
  login: loginTree,
  signup: signupTree,
  finance: financeTree,
  dashboard: dashboardTree,
  settings: settingsTree,
  profile: profileTree,
  pricing: pricingTree,
  landing: landingTree,
  navbar: navbarTree,
  sidebar: sidebarTree,
  card: cardTree,
  form: formTree,
  table: tableTree,
  chat: chatTree,
  modal: modalTree,
  notification: notificationTree,
  onboarding: onboardingTree,
  search: searchTree,
  'media-player': mediaPlayerTree,
  calendar: calendarTree,
  email: emailTree,
  ecommerce: ecommerceTree,
  kanban: kanbanTree,
  todo: todoTree,
  generic: genericTree,
};

/* ─── Public API ────────────────────────────────────────── */

/**
 * Build a ComponentTree from a classified UI type.
 * Returns a full tree with metadata, ready for rendering via
 * `renderTreeToHTML()` → `renderHTMLToImage()`.
 */
export function buildMockComponentTree(
  prompt: string,
  uiType: UIType,
  options: {
    designSystem?: string;
    width?: number;
    height?: number;
  } = {},
): ComponentTree {
  const builder = TREE_BUILDERS[uiType] ?? TREE_BUILDERS.generic;
  const root = builder(prompt);

  // Determine viewport dimensions
  const isWide = ['finance', 'dashboard', 'settings', 'table', 'landing', 'ecommerce', 'pricing', 'navbar', 'sidebar', 'email', 'search', 'kanban', 'generic'].includes(uiType);
  const isFull = ['finance', 'dashboard', 'kanban', 'generic'].includes(uiType);
  const width = options.width ?? (isFull ? 900 : isWide ? 780 : 420);
  const height = options.height ?? (isFull ? 620 : isWide ? 580 : 580);

  const label = uiType.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ').replace(/^./, (s) => s.toUpperCase()).trim();

  return {
    root,
    metadata: {
      name: `${label} — ${titleFrom(prompt, 'UI')}`,
      description: `Mock-generated ${label} component`,
      designSystem: options.designSystem,
      viewport: { width, height },
      prompt,
      generatedAt: new Date().toISOString(),
      model: 'mock-template',
    },
  };
}
