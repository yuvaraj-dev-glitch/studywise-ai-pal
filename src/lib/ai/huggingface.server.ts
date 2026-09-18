import {
  AIProviderError,
  type AIProvider,
  type CompletionRequest,
  type CompletionResult,
  type EmbeddingResult,
} from "./provider";
import { lovableGatewayProvider } from "./lovable-gateway.server";

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen2.5-72B-Instruct";

function token(): string {
  const value = process.env["HUGGINGFACE_API_KEY"];
  if (!value) throw new AIProviderError("Hugging Face is not configured.", 401);
  return value;
}

function messageFromBody(body: string, status: number): string {
  try {
    const parsed = JSON.parse(body) as {
      error?: string | { message?: string };
      message?: string;
    };
    const error = typeof parsed.error === "string" ? parsed.error : parsed.error?.message;
    return error ?? parsed.message ?? `Hugging Face request failed (${status}).`;
  } catch {
    return body || `Hugging Face request failed (${status}).`;
  }
}

async function readStream(response: Response): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const line = event.split("\n").find((part) => part.startsWith("data:"));
      if (!line) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        text += parsed.choices?.[0]?.delta?.content ?? "";
      } catch {
        // Ignore incomplete or provider-specific SSE events.
      }
    }
  }

  return text;
}

export const huggingFaceProvider: AIProvider = {
  id: "huggingface",

  isAvailable() {
    return Boolean(process.env["HUGGINGFACE_API_KEY"]);
  },

  // Hugging Face is used for text generation. Embeddings stay on the existing
  // gateway so stored vectors remain compatible with the pgvector column.
  embed(texts: string[]): Promise<EmbeddingResult> {
    return lovableGatewayProvider.embed(texts);
  },

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    const model = request.model ?? process.env["HUGGINGFACE_MODEL"] ?? DEFAULT_MODEL;
    const response = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: true,
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(request.maxOutputTokens !== undefined ? { max_tokens: request.maxOutputTokens } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new AIProviderError(messageFromBody(detail, response.status), response.status);
    }

    const text = await readStream(response);
    return { text, model, provider: "huggingface" };
  },
};