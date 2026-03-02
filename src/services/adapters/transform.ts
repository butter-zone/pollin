import type { ComponentNode, ComponentTree } from '@/types/component-tree';
import type { AdapterDensity, AdapterPack } from './types';

function densityScale(density: AdapterDensity): number {
  switch (density) {
    case 'compact':
      return 0.9;
    case 'spacious':
      return 1.12;
    default:
      return 1;
  }
}

function scaleCssLength(value: string, scale: number): string {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(px)$/);
  if (!match) return value;
  const next = Math.max(0, Number(match[1]) * scale);
  return `${Math.round(next * 100) / 100}px`;
}

function scaleSpacingLike(style: Record<string, string>, scale: number): Record<string, string> {
  const next = { ...style };
  const keys = [
    'gap', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderRadius', 'fontSize', 'minHeight', 'minWidth', 'height', 'width',
  ];

  for (const key of keys) {
    const val = next[key];
    if (!val) continue;

    if (val.includes(' ')) {
      next[key] = val
        .split(' ')
        .map((part) => scaleCssLength(part, scale))
        .join(' ');
    } else {
      next[key] = scaleCssLength(val, scale);
    }
  }

  return next;
}

function applyRuleDefaults(node: ComponentNode, pack: AdapterPack): ComponentNode {
  const rule = pack.componentRules.find((item) => item.nodeType === node.type);
  if (!rule) return node;

  const mergedProps = { ...rule.defaultProps, ...node.props };
  const mergedStyles = { ...rule.defaultStyles, ...node.styles };
  return { ...node, props: mergedProps, styles: mergedStyles };
}

function snapToSpacingGrid(value: string, base: number): string {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(px)$/);
  if (!match) return value;
  const n = Number(match[1]);
  const snapped = Math.max(0, Math.round(n / base) * base);
  return `${snapped}px`;
}

function enforceSupportedNodeType(node: ComponentNode, pack: AdapterPack): ComponentNode {
  if (pack.supportedNodeTypes.includes(node.type)) return node;

  // Strict fallback: preserve content while coercing unknown type to safe primitive
  if (node.children && node.children.some((c) => typeof c === 'string')) {
    return {
      ...node,
      type: 'text',
      props: { ...node.props },
      styles: {
        ...node.styles,
        display: node.styles.display ?? 'block',
      },
    };
  }

  return {
    ...node,
    type: 'container',
    props: { ...node.props },
    styles: {
      ...node.styles,
      display: node.styles.display ?? 'flex',
      flexDirection: node.styles.flexDirection ?? 'column',
    },
  };
}

function adaptNode(node: ComponentNode, pack: AdapterPack): ComponentNode {
  const scale = densityScale(pack.density);
  let nextNode = enforceSupportedNodeType(node, pack);
  nextNode = applyRuleDefaults(nextNode, pack);
  nextNode = {
    ...nextNode,
    styles: {
      ...nextNode.styles,
      fontFamily: nextNode.styles.fontFamily ?? pack.tokens.fontFamily,
      borderRadius: nextNode.styles.borderRadius ?? pack.tokens.radiusMd,
      borderWidth: nextNode.styles.borderWidth ?? pack.tokens.borderWidth,
    },
  };

  if (nextNode.type === 'button') {
    nextNode = {
      ...nextNode,
      props: {
        ...nextNode.props,
        variant: (nextNode.props.variant as string | undefined)
          ?? (pack.variants.buttonPrimary === 'default' ? 'primary' : 'primary'),
      },
      styles: {
        ...nextNode.styles,
        borderRadius: nextNode.styles.borderRadius ?? pack.tokens.radiusSm,
      },
    };
  }

  if (nextNode.type === 'input' || nextNode.type === 'textarea' || nextNode.type === 'select') {
    nextNode = {
      ...nextNode,
      styles: {
        ...nextNode.styles,
        borderRadius: nextNode.styles.borderRadius ?? pack.tokens.radiusSm,
      },
    };
  }

  const scaled = scaleSpacingLike(nextNode.styles, scale);
  const normalized = Object.fromEntries(
    Object.entries(scaled).map(([key, value]) => {
      if (key.startsWith('padding') || key.startsWith('margin') || key === 'gap') {
        return [
          key,
          value
            .split(' ')
            .map((part) => snapToSpacingGrid(part, Math.max(2, pack.tokens.spacingBase)))
            .join(' '),
        ];
      }
      return [key, value];
    }),
  );
  const children = nextNode.children?.map((child) => (typeof child === 'string' ? child : adaptNode(child, pack)));

  return {
    ...nextNode,
    styles: normalized,
    children,
  };
}

export function applyAdapterPackToTree(tree: ComponentTree, pack: AdapterPack): ComponentTree {
  const adaptedRoot = adaptNode(tree.root, pack);

  return {
    ...tree,
    root: adaptedRoot,
    metadata: {
      ...tree.metadata,
      designSystem: tree.metadata.designSystem ?? pack.designSystem,
      adapterPack: pack.id,
      adapterMode: 'strict',
    },
  };
}
