/**
 * LLM API client for Pollin.
 *
 * Sends prompts (and optional reference images) to OpenAI or Anthropic APIs,
 * returning a structured ComponentTree JSON response.
 */

import type { ComponentTree } from '@/types/component-tree';

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

const SYSTEM_PROMPT = `You are a UI design generator for a design tool called Pollin. Your job is to produce structured component trees that describe user interfaces.

You MUST respond with ONLY valid JSON matching the ComponentTree schema. Do not include any text, markdown, or explanation outside the JSON object.

## ComponentNode structure

Each node has the following shape:

{
  "id": string,       // unique ID within the tree, use format "n1", "n2", "n3", etc.
  "type": string,     // one of the allowed ComponentNodeType values listed below
  "props": object,    // component-specific props (label, placeholder, src, alt, href, etc.)
  "styles": object,   // CSS properties in camelCase (e.g. "fontSize", "backgroundColor")
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

1. The "styles" object must contain valid CSS properties in camelCase (e.g. "fontSize", "backgroundColor", "borderRadius", "padding", "gap").
2. "children" can be strings (for text content) or nested ComponentNode objects.
3. Use flexbox or CSS grid for layout by setting appropriate styles on container, stack, and grid nodes (e.g. "display": "flex", "flexDirection": "column", "gap": "16px").
4. Generate realistic placeholder content — use real-looking names, emails, statistics, and copy instead of "Lorem ipsum" or "placeholder".
5. Each node must have a unique "id" using the format "n1", "n2", "n3", etc.
6. The root node should typically be a "container" or "section".
7. If a design system is specified, follow its conventions (rounded corners, spacing scale, color palette, typography, etc.).

## Response format

Return a JSON object with this structure:

{
  "root": { /* root ComponentNode */ },
  "metadata": {
    "name": string,         // human-readable name for this screen/component
    "description": string,  // brief description of what was generated
    "designSystem": string, // optional — design system used
    "viewport": { "width": number, "height": number },
    "prompt": string,       // the original prompt
    "generatedAt": string,  // ISO timestamp
    "model": string         // the LLM model used
  }
}`;

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
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
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
  return data.choices[0].message.content as string;
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
      max_tokens: 4096,
      temperature: 0.7,
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
  return data.content[0].text as string;
}

// ── Main entry point ────────────────────────────────────

export async function generateComponentTree(
  prompt: string,
  options?: {
    imageRefs?: string[];
    designSystem?: string;
    viewport?: { width: number; height: number };
    onStep?: (step: { id: string; label: string; detail?: string }) => void;
  },
): Promise<ComponentTree> {
  const { imageRefs, designSystem, viewport, onStep } = options ?? {};

  // Step 1 — Init
  onStep?.({ id: 'llm-init', label: 'Connecting to LLM' });

  const config = getLLMConfig();
  if (!config) {
    throw new Error(
      'No LLM provider configured. Set an API key via environment variables, localStorage, or configureLLM().',
    );
  }

  // Step 2 — Build user message
  let userText = prompt;
  if (designSystem) {
    userText += `\n\nUse the ${designSystem} design system.`;
  }
  if (viewport) {
    userText += `\n\nTarget viewport: ${viewport.width}x${viewport.height}px.`;
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
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];

  // Step 3 — Call LLM
  onStep?.({ id: 'llm-generate', label: 'Generating component tree', detail: config.model });

  let raw: string;
  try {
    raw =
      config.provider === 'openai'
        ? await callOpenAI(config, messages)
        : await callAnthropic(config, messages);
  } catch (err) {
    // Re-throw known errors as-is
    if (err instanceof Error) throw err;
    throw new Error(String(err));
  }

  // Step 4 — Parse & validate
  let tree: ComponentTree;
  try {
    tree = JSON.parse(raw) as ComponentTree;
  } catch {
    throw new Error('LLM returned invalid JSON. Try again.');
  }

  if (!tree.root || !tree.metadata) {
    throw new Error('LLM returned invalid JSON. Try again.');
  }

  // Fill in metadata defaults
  tree.metadata.generatedAt = tree.metadata.generatedAt || new Date().toISOString();
  tree.metadata.model = tree.metadata.model || config.model;
  tree.metadata.prompt = tree.metadata.prompt || prompt;
  if (viewport && !tree.metadata.viewport) {
    tree.metadata.viewport = viewport;
  }
  if (designSystem) {
    tree.metadata.designSystem = designSystem;
  }

  // Step 5 — Done
  onStep?.({ id: 'llm-complete', label: 'Component tree ready' });

  return tree;
}
