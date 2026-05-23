/**
 * AI Service — Generates diagram data from natural language descriptions
 * using LLM APIs (OpenAI / Anthropic).
 *
 * Supports:
 * - Text → Diagram JSON generation
 * - Diagram analysis (check for issues)
 * - Layout optimization descriptions
 */

const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface AIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

function getConfig(): AIConfig {
  return {
    endpoint: localStorage.getItem('sd-ai-endpoint') || DEFAULT_ENDPOINT,
    apiKey: localStorage.getItem('sd-ai-key') || '',
    model: localStorage.getItem('sd-ai-model') || 'gpt-4o',
  };
}

export function isAIConfigured(): boolean {
  return !!localStorage.getItem('sd-ai-key');
}

export function configureAI(apiKey: string, model?: string, endpoint?: string) {
  localStorage.setItem('sd-ai-key', apiKey);
  if (model) localStorage.setItem('sd-ai-model', model);
  if (endpoint) localStorage.setItem('sd-ai-endpoint', endpoint);
}

const SYSTEM_PROMPT = `You are a diagram generation AI. Given a natural language description, output a JSON object with "nodes" and "edges" arrays.

Node format: { "id": "string", "type": "rectangle|ellipse|diamond|cylinder|process|decision|startEnd|database|umlClass|text", "label": "string", "width": number, "height": number, "x": number, "y": number, "fill": "#hex", "stroke": "#hex" }
Edge format: { "id": "string", "source": "nodeId", "target": "nodeId", "type": "bezier|straight|step", "label": "" }

Rules:
- Layout should be clean, top-to-bottom or left-to-right
- Use appropriate shapes: diamond for decisions, rounded for start/end, rectangle for processes, cylinder for databases
- Assign visually pleasing colors
- Only output valid JSON, no markdown, no explanation`;

export async function generateDiagram(prompt: string): Promise<{
  nodes: any[];
  edges: any[];
}> {
  const config = getConfig();
  if (!config.apiKey) {
    throw new Error('请先配置 AI API Key');
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API 错误: ${response.status} — ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract JSON from the response (sometimes wrapped in markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : content;

  try {
    const result = JSON.parse(jsonStr.trim());
    return {
      nodes: result.nodes || [],
      edges: result.edges || [],
    };
  } catch {
    throw new Error('AI 返回了无效的 JSON，请重试');
  }
}

export async function analyzeDiagram(nodes: any[], edges: any[]): Promise<string> {
  const config = getConfig();
  if (!config.apiKey) throw new Error('请先配置 AI API Key');

  const diagramJson = JSON.stringify({ nodes, edges });

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You analyze diagrams for structural issues. Look for: orphaned nodes (no connections), cycles that might cause confusion, nodes with too many connections, layout suggestions. Be concise. Reply in Chinese.',
        },
        {
          role: 'user',
          content: `Analyze this diagram: ${diagramJson}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '分析完成，未发现问题。';
}

export async function suggestLayout(nodes: any[], edges: any[]): Promise<{
  nodes: any[];
  edges: any[];
} | null> {
  const config = getConfig();
  if (!config.apiKey) return null;

  const diagramJson = JSON.stringify({ nodes, edges });

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You optimize diagram layouts. Given a diagram JSON, improve the x/y positions for better readability. Keep same node/edge structure, only adjust positions. Output full diagram JSON with improved positions. Only output JSON.',
          },
          { role: 'user', content: diagramJson },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;

    return JSON.parse(jsonStr.trim());
  } catch {
    return null;
  }
}
