/**
 * AI provider abstraction.
 *
 * The whole application talks to AI through this interface only. The current
 * implementation is the Lovable AI Gateway (cloud inference), but an
 * on-device/local model can be registered later without touching any feature
 * code — see `src/lib/ai/registry.server.ts`.
 *
 * This module is client-safe: it contains types only, no provider logic.
 */

export type AIRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface CompletionRequest {
  messages: AIMessage[];
  /** Optional model hint. Providers may ignore it. */
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface CompletionResult {
  text: string;
  model: string;
  provider: string;
}

export interface EmbeddingResult {
  vectors: number[][];
  model: string;
  provider: string;
  /** Vector dimensionality — must match the `document_chunks.embedding` column. */
  dimensions: number;
}

export interface AIProvider {
  /** Stable identifier, e.g. "lovable-gateway" or "on-device". */
  readonly id: string;
  /** Whether the provider can run right now (keys present, model downloaded, ...). */
  isAvailable(): boolean;
  embed(texts: string[]): Promise<EmbeddingResult>;
  complete(request: CompletionRequest): Promise<CompletionResult>;
}

export class AIProviderError extends Error {
  status: number;
  retryable: boolean;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "AIProviderError";
    this.status = status;
    this.retryable = status === 429 || status >= 500;
  }
}

/** Embedding dimensionality used across the RAG pipeline. */
export const EMBEDDING_DIMENSIONS = 1536;
