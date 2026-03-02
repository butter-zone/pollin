/**
 * LLM API client for Pollin.
 *
 * Sends prompts (and optional reference images) to OpenAI or Anthropic APIs,
 * returning a structured ComponentTree JSON response.
 */

import type { ComponentTree, ComponentNode, ComponentNodeType } from '@/types/component-tree';
import { COMPONENT_TREE_JSON_SCHEMA } from '@/types/component-tree';
import type { AdapterPack } from '@/services/adapters/types';

// ── Types ───────────────────────────────────────────────

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
}

// ── Defaults ────────────────────────────────────────────

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
};

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';

const LOCAL_STORAGE_KEY = 'pollin:llm';

// ── Runtime config ──────────────────────────────────────

let runtimeConfig: LLMConfig | null = null;

/**
 * Set the LLM configuration at runtime. This takes the highest priority.
 */
export function configureLLM(config: {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}): void {
  runtimeConfig = {
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model ?? DEFAULT_MODELS[config.provider],
  };
}

/**
 * Resolve the active LLM config.
 *
 * Priority: runtime config > localStorage > env vars.
 * Returns `null` if nothing is configured.
 */
export function getLLMConfig(): LLMConfig | null {
  // 1. Runtime config (highest priority)
  if (runtimeConfig) return runtimeConfig;

  // 2. localStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LLMConfig>;
      if (parsed.provider && parsed.apiKey) {
        return {
          provider: parsed.provider,
          apiKey: parsed.apiKey,
          model: parsed.model ?? DEFAULT_MODELS[parsed.provider],
        };
      }
    }
  } catch {
    // Ignore parse errors
  }

  // 3. Environment variables
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (openaiKey) {
    return { provider: 'openai', apiKey: openaiKey, model: DEFAULT_MODELS.openai };
  }

  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (anthropicKey) {
    return { provider: 'anthropic', apiKey: anthropicKey, model: DEFAULT_MODELS.anthropic };
  }

  return null;
}

/**
 * Returns true if at least one LLM provider is configured.
 */
export function isLLMConfigured(): boolean {
  return getLLMConfig() !== null;
}

// ── System prompt ───────────────────────────────────────

// ── Allowed node types (derived from TypeScript type) ───

const VALID_NODE_TYPES: ReadonlySet<string> = new Set<ComponentNodeType>([
  'container', 'stack', 'grid', 'spacer', 'divider', 'scroll', 'section',
  'text', 'heading', 'paragraph', 'image', 'icon', 'badge', 'avatar', 'code',
  'button', 'input', 'textarea', 'select', 'checkbox', 'radio', 'toggle', 'slider',
  'navbar', 'sidebar', 'tabs', 'breadcrumb', 'link', 'menu',
  'alert', 'toast', 'progress', 'spinner', 'skeleton', 'tooltip', 'dialog',
  'table', 'card', 'list', 'listItem', 'stat', 'chart',
]);

const SYSTEM_PROMPT = `You are a UI design generator for a design tool called Pollin. Your job is to produce structured component trees that describe pixel-perfect, production-quality user interfaces.

You MUST respond with ONLY valid JSON matching the ComponentTree schema. Do not include any text, markdown, or explanation outside the JSON object.

## ComponentNode structure

Each node has the following shape:

{
  "id": string,       // unique ID within the tree, use format "n1", "n2", "n3", etc.
  "type": string,     // one of the allowed ComponentNodeType values listed below
  "props": object,    // component-specific props (label, placeholder, src, alt, href, etc.)
  "styles": object,   // CSS properties in camelCase — values must be STRINGS (e.g. "16px" not 16)
  "children": array   // optional — array of child ComponentNode objects or strings (text content)
}

## Available ComponentNodeType values

Layout:     container, stack, grid, spacer, divider, scroll, section
Content:    text, heading, paragraph, image, icon, badge, avatar, code
Input:      button, input, textarea, select, checkbox, radio, toggle, slider
Navigation: navbar, sidebar, tabs, breadcrumb, link, menu
Feedback:   alert, toast, progress, spinner, skeleton, tooltip, dialog
Data:       table, card, list, listItem, stat, chart

## Rules

1. Every "styles" value MUST be a string (e.g. "fontSize": "14px", "gap": "16px"). Never use numbers.
2. "children" can be strings (for text content) or nested ComponentNode objects.
3. Use flexbox or CSS grid for layout (e.g. "display": "flex", "flexDirection": "column", "gap": "16px").
4. Generate realistic placeholder content — real-looking names, emails, statistics, and copy. Never use "Lorem ipsum" or generic placeholders.
5. Each node must have a unique "id" using the format "n1", "n2", "n3", etc.
6. The root node should typically be a "container" or "section" with explicit width/height matching the viewport.
7. Every leaf node must have "props" and "styles" objects (can be empty {}).
8. Use at least 20–50 nodes for full-screen layouts (dashboards, settings, etc.). Be thorough — include navbars, sidebars, cards, stats, tables, and realistic content.
9. Always set "background", "color", and "fontFamily" on the root node to establish the visual baseline.
10. Use consistent spacing (4px/8px/12px/16px/24px grid) and a cohesive color palette.

## Design System Guidelines

When a design system is specified, strictly follow its visual language:

- **Material UI 3**: Use rounded corners (12–16px), elevation shadows, surface containers, primary (#6750A4), on-primary (#FFF), surface (#FFFBFE), font: Roboto.
- **Apple Liquid Glass**: Use backdrop-filter blur, translucent backgrounds (rgba), large corner radii (20px+), SF Pro font, high contrast text on glass.
- **Ant Design**: Use compact 4px grid, #1677FF primary, border-radius 6px, clean borders, font: -apple-system/Segoe UI.
- **Fluent UI**: Use subtle shadows, #0078D4 primary, Segoe UI font, 4px corners, acrylic effects.
- **shadcn/ui**: Use zinc/slate neutrals, minimal borders, 6–8px radii, small text (13–14px), Inter/system font.
- **Radix UI**: Use clean minimal style, accessible contrast, 6px radii, system fonts, subtle hover states.

## Response format

Return a JSON object with this structure:

{
  "root": { /* root ComponentNode */ },
  "metadata": {
    "name": string,         // human-readable name for this screen/component
    "description": string,  // brief description of what was generated
    "designSystem": string, // design system used (if any)
    "viewport": { "width": number, "height": number },
    "prompt": string,       // the original prompt
    "generatedAt": string,  // ISO timestamp
    "model": string         // the LLM model used
  }
}`;

function modelCompatibleWithProvider(provider: LLMProvider, model: string): boolean {
  const m = model.toLowerCase();
  if (provider === 'openai') {
    return m.startsWith('gpt') || m.startsWith('o1') || m.startsWith('o3') || m.includes('openai');
  }
  return m.startsWith('claude') || m.includes('anthropic');
}

function composeSystemPrompt(adapterPrompt?: string): string {
  if (!adapterPrompt) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}\n\n## Adapter Pack Constraints\n${adapterPrompt}`;
}

// ── OpenAI ──────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; [key: string]: unknown }>;
}

async function callOpenAI(
  config: LLMConfig,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'component_tree',
          strict: true,
          schema: COMPONENT_TREE_JSON_SCHEMA,
        },
      },
      temperature: 0.4,
      max_tokens: 16384,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid API key. Check your LLM configuration.');
    }
    if (res.status === 429) {
      throw new Error('Rate limited. Please wait and try again.');
    }
    const body = await res.text().catch(() => '');
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = await res.json();

  // Detect truncation
  const choice = data.choices?.[0];
  if (choice?.finish_reason === 'length') {
    throw new Error('LLM output was truncated. The UI may be too complex for a single request.');
  }

  return choice.message.content as string;
}

// ── Anthropic ───────────────────────────────────────────

async function callAnthropic(
  config: LLMConfig,
  messages: ChatMessage[],
): Promise<string> {
  // Separate system message and convert user/assistant messages to Anthropic format
  const systemMessage = messages.find((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  const anthropicMessages = nonSystemMessages.map((msg) => {
    if (typeof msg.content === 'string') {
      return { role: msg.role, content: msg.content };
    }

    // Convert OpenAI-style content blocks to Anthropic format
    const contentBlocks = (msg.content as Array<{ type: string; [key: string]: unknown }>).map(
      (block) => {
        if (block.type === 'image_url') {
          const imageUrl = (block as { type: string; image_url: { url: string } }).image_url.url;
          // Extract base64 data and media type from data URI
          const match = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (match) {
            return {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: match[1],
                data: match[2],
              },
            };
          }
          // Fallback — return as-is if not a data URI
          return { type: 'text' as const, text: `[Image: ${imageUrl}]` };
        }
        if (block.type === 'text') {
          return { type: 'text' as const, text: block.text as string };
        }
        return block;
      },
    );

    return { role: msg.role, content: contentBlocks };
  });

  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      system: typeof systemMessage?.content === 'string' ? systemMessage.content : SYSTEM_PROMPT,
      messages: anthropicMessages,
      max_tokens: 16384,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Invalid API key. Check your LLM configuration.');
    }
    if (res.status === 429) {
      throw new Error('Rate limited. Please wait and try again.');
    }
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();

  // Detect truncation
  if (data.stop_reason === 'max_tokens') {
    throw new Error('LLM output was truncated. The UI may be too complex for a single request.');
  }

  return data.content[0].text as string;
}

// ── Tree validation ─────────────────────────────────────

/**
 * Recursively validate a ComponentNode tree, auto-fixing minor issues
 * and throwing on structural errors the renderer can't handle.
 */
function validateNode(node: ComponentNode): void {
  // Ensure required fields exist
  if (!node.id || typeof node.id !== 'string') {
    node.id = `n-fix-${Math.random().toString(36).slice(2, 6)}`;
  }
  if (!node.type || !VALID_NODE_TYPES.has(node.type)) {
    // Map unknown types to container as a safe fallback
    node.type = 'container' as ComponentNodeType;
  }
  if (!node.props || typeof node.props !== 'object') {
    node.props = {};
  }
  if (!node.styles || typeof node.styles !== 'object') {
    node.styles = {};
  }

  // Coerce numeric style values to strings (common LLM mistake)
  for (const [key, val] of Object.entries(node.styles)) {
    if (typeof val === 'number') {
      (node.styles as Record<string, string>)[key] = `${val}px`;
    } else if (typeof val !== 'string') {
      delete (node.styles as Record<string, string>)[key];
    }
  }

  // Validate children recursively
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (typeof child !== 'string') {
        validateNode(child);
      }
    }
  }
}

// ── Main entry point ────────────────────────────────────

export async function generateComponentTree(
  prompt: string,
  options?: {
    imageRefs?: string[];
    designSystem?: string;
    model?: string;
    adapterPack?: AdapterPack | null;
    adapterPrompt?: string;
    viewport?: { width: number; height: number };
    onStep?: (step: { id: string; label: string; detail?: string }) => void;
  },
): Promise<ComponentTree> {
  const { imageRefs, designSystem, viewport, onStep, model, adapterPack, adapterPrompt } = options ?? {};

  // Step 1 — Init
  onStep?.({ id: 'llm-init', label: 'Connecting to LLM' });

  const config = getLLMConfig();
  if (!config) {
    throw new Error(
      'No LLM provider configured. Set an API key via environment variables, localStorage, or configureLLM().',
    );
  }

  const activeModel =
    model && modelCompatibleWithProvider(config.provider, model)
      ? model
      : config.model;

  const effectiveConfig: LLMConfig = {
    ...config,
    model: activeModel,
  };

  // Step 2 — Build user message
  let userText = prompt;
  if (designSystem) {
    userText += `\n\nUse the ${designSystem} design system.`;
  }
  if (viewport) {
    userText += `\n\nTarget viewport: ${viewport.width}x${viewport.height}px.`;
  }
  if (adapterPack) {
    userText += `\n\nUse adapter pack: ${adapterPack.name} (${adapterPack.id}) with strict adherence to its token and variant constraints.`;
  }

  const userContent: Array<{ type: string; [key: string]: unknown }> = [
    { type: 'text', text: userText },
  ];

  if (imageRefs && imageRefs.length > 0) {
    for (const dataUri of imageRefs) {
      userContent.push({
        type: 'image_url',
        image_url: { url: dataUri, detail: 'high' },
      });
    }
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: composeSystemPrompt(adapterPrompt) },
    { role: 'user', content: userContent },
  ];

  // Step 3 — Call LLM
  onStep?.({ id: 'llm-generate', label: 'Generating component tree', detail: activeModel });

  let raw: string;
  try {
    raw =
      effectiveConfig.provider === 'openai'
        ? await callOpenAI(effectiveConfig, messages)
        : await callAnthropic(effectiveConfig, messages);
  } catch (err) {
    // Re-throw known errors as-is
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  }

  // Step 4 — Parse & validate
  onStep?.({ id: 'llm-validate', label: 'Validating component tree' });

  let tree: ComponentTree;
  try {
    tree = JSON.parse(raw) as ComponentTree;
  } catch {
    throw new Error('LLM returned invalid JSON. Try again.');
  }

  if (!tree.root || !tree.metadata) {
    throw new Error('LLM response missing root or metadata. Try again.');
  }

  // Deep-validate every node in the tree
  validateNode(tree.root);

  // Ensure metadata has required fields
  if (!tree.metadata.viewport?.width || !tree.metadata.viewport?.height) {
    tree.metadata.viewport = viewport ?? { width: 780, height: 580 };
  }

  // Fill in metadata defaults
  tree.metadata.generatedAt = tree.metadata.generatedAt || new Date().toISOString();
  tree.metadata.model = tree.metadata.model || activeModel;
  tree.metadata.prompt = tree.metadata.prompt || prompt;
  if (viewport && !tree.metadata.viewport) {
    tree.metadata.viewport = viewport;
  }
  if (designSystem) {
    tree.metadata.designSystem = designSystem;
  }
  if (adapterPack) {
    tree.metadata.adapterPack = adapterPack.id;
    tree.metadata.adapterMode = 'strict';
  }

  // Step 5 — Done
  onStep?.({ id: 'llm-complete', label: 'Component tree ready' });

  return tree;
}
