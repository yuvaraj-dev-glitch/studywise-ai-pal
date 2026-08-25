import {
  AIProviderError,
  EMBEDDING_DIMENSIONS,
  type AIProvider,
  type CompletionRequest,
  type CompletionResult,
  type EmbeddingResult,
} from "./provider";

/**
 * Cloud inference implementation of `AIProvider`, backed by the Lovable AI
 * Gateway. Nothing outside this file knows which vendor serves the request.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const CHAT_MODEL = "google/gemini-3-flash";
const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBED_BATCH = 64;

function apiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AIProviderError("AI is not configured (missing gateway key).", 401);
  return key;
}

async function gatewayFetch(path: string, body: unknown): Promise<Response> {
  const res = await fetch(`${GATEWAY}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let message = detail;
    try {
      const parsed = JSON.parse(detail) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? detail;
    } catch {
      /* keep raw text */
    }
    if (res.status === 429) message = "AI rate limit reached. Please try again in a moment.";
    if (res.status === 402) message = message || "AI credits exhausted for this workspace.";
    throw new AIProviderError(message || `AI request failed (${res.status})`, res.status);
  }
  return res;
}

export const lovableGatewayProvider: AIProvider = {
  id: "lovable-gateway",

  isAvailable() {
    return Boolean(process.env["LOVABLE_API_KEY"]);
  },

  async embed(texts: string[]): Promise<EmbeddingResult> {
    const vectors: number[][] = [];
    for (let i = 0; i < texts.length; i += EMBED_BATCH) {
      const batch = texts.slice(i, i + EMBED_BATCH);
      const res = await gatewayFetch("/embeddings", {
        model: EMBEDDING_MODEL,
        input: batch,
      });
      const json = (await res.json()) as {
        data: { index: number; embedding: number[] }[];
      };
      const sorted = [...json.data].sort((a, b) => a.index - b.index);
      for (const item of sorted) vectors.push(item.embedding);
    }
    return {
      vectors,
      model: EMBEDDING_MODEL,
      provider: "lovable-gateway",
      dimensions: EMBEDDING_DIMENSIONS,
    };
  },

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const model = request.model ?? CHAT_MODEL;
    const res = await gatewayFetch("/chat/completions", {
      model,
      messages: request.messages,
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.maxOutputTokens !== undefined ? { max_tokens: request.maxOutputTokens } : {}),
    });
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content ?? "";
    return { text, model, provider: "lovable-gateway" };
  },
};
