import type { ComponentNodeType } from '@/types/component-tree';

export type AdapterDensity = 'comfortable' | 'compact' | 'spacious';

export interface AdapterTokenMap {
  fontFamily: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  spacingBase: number;
  borderWidth: string;
  focusRing: string;
  shadowCard: string;
}

export interface AdapterVariantMap {
  buttonPrimary: string;
  buttonSecondary: string;
  inputTone: string;
  cardTone: string;
}

export interface AdapterComponentRule {
  nodeType: ComponentNodeType;
  defaultProps?: Record<string, string | number | boolean>;
  defaultStyles?: Record<string, string>;
}

export interface AdapterPack {
  id: string;
  name: string;
  designSystem: string;
  sourceUrl: string;
  storybookUrl?: string;
  docsUrl: string;
  tokenDocsUrl?: string;
  supportedNodeTypes: ComponentNodeType[];
  density: AdapterDensity;
  tokens: AdapterTokenMap;
  variants: AdapterVariantMap;
  componentRules: AdapterComponentRule[];
}
