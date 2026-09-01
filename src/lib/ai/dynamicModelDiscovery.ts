/**
 * LUNVO 2.0 — Dynamic AI Model Discovery Engine
 * Automatically queries provider endpoints when an API key is entered
 * to populate the model dropdown with live available models (including local models).
 */

import { getProviderDef } from "./providers/registry";

export interface DiscoveredModel {
  id: string;
  name: string;
  isLive?: boolean;
  contextWindow?: number;
}

/**
 * Fetches available models for a given provider and API key.
 */
export async function fetchAvailableModels(
  providerId: string,
  apiKey: string,
  customBaseUrl?: string
): Promise<DiscoveredModel[]> {
  const def = getProviderDef(providerId);
  const baseURL = customBaseUrl || def?.baseURL;

  // 1. Local Models (Ollama, LM Studio)
  if (providerId === "ollama" || def?.local) {
    try {
      const ollamaUrl = baseURL || "http://localhost:11434";
      const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          return data.models.map((m: any) => ({
            id: m.name || m.model,
            name: `${m.name} (Local Ollama)`,
            isLive: true,
          }));
        }
      }
    } catch {
      // fallback to LM Studio / local OpenAI endpoint
    }
  }

  // If no API key provided and not a local engine, return registry defaults
  if (!apiKey || !apiKey.trim()) {
    return (def?.models || []).map((m) => ({
      id: m,
      name: m,
      isLive: false,
    }));
  }

  // 2. Google Gemini
  if (providerId === "gemini" || def?.adapter === "gemini") {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          const geminiModels = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => {
              const cleanId = m.name.replace(/^models\//, "");
              return {
                id: cleanId,
                name: m.displayName ? `${m.displayName} (${cleanId})` : cleanId,
                isLive: true,
              };
            });
          if (geminiModels.length > 0) return geminiModels;
        }
      }
    } catch {
      // ignore & fallback
    }
  }

  // 3. Anthropic
  if (providerId === "anthropic" || def?.adapter === "anthropic") {
    try {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "dangerously-allow-browser": "true",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          return data.data.map((m: any) => ({
            id: m.id,
            name: m.display_name ? `${m.display_name} (${m.id})` : m.id,
            isLive: true,
          }));
        }
      }
    } catch {
      // ignore & fallback
    }
  }

  // 4. OpenAI-Compatible Providers (Groq, OpenAI, DeepSeek, OpenRouter, Mistral, Together, etc.)
  const targetBaseUrl =
    baseURL ||
    (providerId === "groq"
      ? "https://api.groq.com/openai/v1"
      : providerId === "openai"
        ? "https://api.openai.com/v1"
        : providerId === "deepseek"
          ? "https://api.deepseek.com/v1"
          : providerId === "openrouter"
            ? "https://openrouter.ai/api/v1"
            : "");

  if (targetBaseUrl) {
    try {
      const modelsEndpoint = targetBaseUrl.endsWith("/v1")
        ? `${targetBaseUrl}/models`
        : targetBaseUrl.endsWith("/")
          ? `${targetBaseUrl}models`
          : `${targetBaseUrl}/models`;

      const res = await fetch(modelsEndpoint, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data?.data || data?.models;
        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList
            .map((m: any) => {
              const modelId = typeof m === "string" ? m : m.id || m.name;
              return {
                id: modelId,
                name: modelId,
                isLive: true,
              };
            })
            .filter((m) => Boolean(m.id))
            .sort((a, b) => a.id.localeCompare(b.id));
        }
      }
    } catch {
      // ignore & fallback to server-side route
    }
  }

  // Fallback to registry models
  return (def?.models || []).map((m) => ({
    id: m,
    name: m,
    isLive: false,
  }));
}
