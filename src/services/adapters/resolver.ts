import { ADAPTER_PACKS } from './registry';
import type { AdapterPack } from './types';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s/_-]+/g, ' ').trim();
}

const ALIASES: Array<{ matcher: RegExp; adapterId: string }> = [
  { matcher: /material|mui/i, adapterId: 'material-ui-3' },
  { matcher: /shadcn/i, adapterId: 'shadcn-ui' },
  { matcher: /ant\s*design|antd/i, adapterId: 'ant-design' },
  { matcher: /fluent/i, adapterId: 'fluent-ui' },
  { matcher: /radix/i, adapterId: 'radix-ui' },
];

export function listAdapterPacks(): AdapterPack[] {
  return ADAPTER_PACKS;
}

export function resolveAdapterPack(designSystem?: string): AdapterPack | null {
  if (!designSystem) return null;

  const normalized = normalize(designSystem);
  const exact = ADAPTER_PACKS.find((pack) => normalize(pack.designSystem) === normalized);
  if (exact) return exact;

  for (const alias of ALIASES) {
    if (alias.matcher.test(designSystem)) {
      const found = ADAPTER_PACKS.find((pack) => pack.id === alias.adapterId);
      if (found) return found;
    }
  }

  return null;
}

export function buildAdapterPromptSection(pack: AdapterPack): string {
  const sampleNodeTypes = pack.supportedNodeTypes.slice(0, 14).join(', ');
  return [
    `Adapter Pack: ${pack.name}`,
    `Design System: ${pack.designSystem}`,
    `Density: ${pack.density}`,
    `Token Guidance: fontFamily=${pack.tokens.fontFamily}; radiusSm=${pack.tokens.radiusSm}; radiusMd=${pack.tokens.radiusMd}; radiusLg=${pack.tokens.radiusLg}; spacingBase=${pack.tokens.spacingBase}px; borderWidth=${pack.tokens.borderWidth}.`,
    `Variant Guidance: buttonPrimary=${pack.variants.buttonPrimary}; buttonSecondary=${pack.variants.buttonSecondary}; inputTone=${pack.variants.inputTone}; cardTone=${pack.variants.cardTone}.`,
    `Prioritize these component node types: ${sampleNodeTypes}.`,
    'Use these adapter constraints as hard styling targets; do not invent conflicting radius/spacing conventions.',
  ].join('\n');
}
