import { lovableGatewayProvider } from "./lovable-gateway.server";
import { huggingFaceProvider } from "./huggingface.server";
import { AIProviderError, type AIProvider } from "./provider";

/**
 * Provider registry.
 *
 * Register additional providers here (e.g. a WebGPU / llama.cpp on-device
 * runtime) and switch with the AI_PROVIDER env var. Feature code never
 * imports a concrete provider — it calls `getAIProvider()`.
 */

const providers = new Map<string, AIProvider>();

export function registerAIProvider(provider: AIProvider) {
  providers.set(provider.id, provider);
}

registerAIProvider(lovableGatewayProvider);
registerAIProvider(huggingFaceProvider);

/**
 * Placeholder for future local inference. Kept registered so the UI/service
 * layer can already reason about provider availability.
 */
registerAIProvider({
  id: "on-device",
  isAvailable: () => false,
  async embed() {
    throw new AIProviderError("On-device embeddings are not available yet.", 400);
  },
  async complete() {
    throw new AIProviderError("On-device inference is not available yet.", 400);
  },
});

export function getAIProvider(preferredId?: string): AIProvider {
  const wanted =
    preferredId ?? process.env["AI_PROVIDER"] ?? (process.env["HUGGINGFACE_API_KEY"] ? "huggingface" : "lovable-gateway");
  const provider = providers.get(wanted);
  if (provider?.isAvailable()) return provider;
  const fallback = [...providers.values()].find((p) => p.isAvailable());
  if (!fallback) throw new AIProviderError("No AI provider is currently available.", 503);
  return fallback;
}
