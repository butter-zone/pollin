import type { ComponentNode, ComponentTree } from '@/types/component-tree';
import type { AdapterPack } from './types';

export interface AdapterQualityCheck {
  check: string;
  pass: boolean;
  detail: string;
}

export interface AdapterQualityReport {
  adapterId: string;
  score: number;
  checks: AdapterQualityCheck[];
}

function walk(node: ComponentNode, visit: (node: ComponentNode) => void): void {
  visit(node);
  for (const child of node.children ?? []) {
    if (typeof child !== 'string') walk(child, visit);
  }
}

export function auditTreeAgainstAdapter(tree: ComponentTree, pack: AdapterPack): AdapterQualityReport {
  let nodeCount = 0;
  let unsupportedCount = 0;
  let fontFamilyHits = 0;
  let radiusHits = 0;

  walk(tree.root, (node) => {
    nodeCount += 1;
    if (!pack.supportedNodeTypes.includes(node.type)) unsupportedCount += 1;

    const ff = node.styles.fontFamily?.toLowerCase() ?? '';
    if (ff.includes(pack.tokens.fontFamily.split(',')[0].replace(/['"]/g, '').trim().toLowerCase())) {
      fontFamilyHits += 1;
    }

    const br = node.styles.borderRadius;
    if (br && [pack.tokens.radiusSm, pack.tokens.radiusMd, pack.tokens.radiusLg].includes(br)) {
      radiusHits += 1;
    }
  });

  const checks: AdapterQualityCheck[] = [
    {
      check: 'supported-node-types',
      pass: unsupportedCount === 0,
      detail: unsupportedCount === 0
        ? 'All nodes map to adapter-supported node types.'
        : `${unsupportedCount} nodes are outside adapter support.`,
    },
    {
      check: 'font-family-alignment',
      pass: fontFamilyHits >= Math.max(1, Math.floor(nodeCount * 0.25)),
      detail: `${fontFamilyHits}/${nodeCount} nodes explicitly align with adapter font family.`,
    },
    {
      check: 'radius-alignment',
      pass: radiusHits >= Math.max(1, Math.floor(nodeCount * 0.12)),
      detail: `${radiusHits}/${nodeCount} nodes use adapter radius tokens.`,
    },
    {
      check: 'metadata-adapter',
      pass: tree.metadata.adapterPack === pack.id,
      detail: tree.metadata.adapterPack === pack.id
        ? `metadata.adapterPack matches ${pack.id}.`
        : `metadata.adapterPack missing or mismatched (got "${tree.metadata.adapterPack ?? 'none'}").`,
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    adapterId: pack.id,
    score,
    checks,
  };
}

export interface GoldenPromptFixture {
  id: string;
  prompt: string;
  targetAdapter: string;
  expectedUiType: string;
}

export const ADAPTER_GOLDEN_FIXTURES: GoldenPromptFixture[] = [
  {
    id: 'mui-dashboard-admin',
    prompt: 'Design an analytics admin dashboard with KPI cards, revenue chart, users table, and right utility panel.',
    targetAdapter: 'material-ui-3',
    expectedUiType: 'dashboard',
  },
  {
    id: 'shadcn-settings-security',
    prompt: 'Create a security settings page with sections for password, sessions, 2FA toggle, and danger zone actions.',
    targetAdapter: 'shadcn-ui',
    expectedUiType: 'settings',
  },
  {
    id: 'ant-login-enterprise',
    prompt: 'Build an enterprise login page with SSO button, email/password fields, remember me, and legal footer.',
    targetAdapter: 'ant-design',
    expectedUiType: 'login',
  },
  {
    id: 'fluent-profile-work',
    prompt: 'Generate a workplace profile page with identity card, organization details, notification prefs, and activity list.',
    targetAdapter: 'fluent-ui',
    expectedUiType: 'profile',
  },
  {
    id: 'radix-form-checkout',
    prompt: 'Create a checkout form with address, shipping selector, payment method tabs, and order summary card.',
    targetAdapter: 'radix-ui',
    expectedUiType: 'form',
  },
];
