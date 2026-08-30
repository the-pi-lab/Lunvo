/**
 * @deprecated Since Phase 17 - use `@/lib/ai/router.unified` (unifiedAI / unifiedText).
 * This module remains as the BYOK adapter-chain implementation consumed by the unified router.
 * Do NOT add new call sites here.
 *
 * Phase 17b: registry-driven — any provider in providers/registry.ts works automatically.
 */
import { AIProfile, AIRequestPayload, AIFullResponse, AIError } from "./types";
import { callOpenAICompatible } from "./protocols/openaiCompatible";
import { callGemini } from "./protocols/geminiAdapter";
import { callAnthropic } from "./protocols/anthropicAdapter";
import { getProviderDef } from "./providers/registry";

export async function callUniversalAI(
  profile: AIProfile,
  payload: AIRequestPayload
): Promise<AIFullResponse> {
  if (!profile || !profile.provider) {
    throw new AIError("Invalid AI Profile provided.", "custom", 400);
  }

  const activeProfile: AIProfile = { ...profile };
  const def = getProviderDef(activeProfile.provider);

  try {
    // Registry-driven: adapter comes from the provider definition.
    const adapter = def?.adapter ?? "openai-compatible";

    // Auto-fill baseURL from registry when the profile omits it.
    if (!activeProfile.baseURL && def?.baseURL) {
      activeProfile.baseURL = def.baseURL;
    }

    if (def?.coming) {
      throw new AIError(
        `${def.name} needs enterprise auth (dedicated adapter) — coming soon.`,
        activeProfile.provider,
        501
      );
    }

    if (adapter === "anthropic") {
      return await callAnthropic(activeProfile, payload);
    }

    if (adapter === "gemini") {
      // OpenAI-compatible override if the user pointed Gemini at a /openai endpoint.
      if (activeProfile.baseURL && activeProfile.baseURL.includes("/openai")) {
        return await callOpenAICompatible(activeProfile, payload);
      }
      return await callGemini(activeProfile, payload);
    }

    // openai-compatible (default) — covers ~90% of the registry.
    if (!activeProfile.baseURL) {
      throw new AIError(
        `${def?.name ?? activeProfile.provider} needs a Base URL (OpenAI-compatible endpoint). Set it in Settings.`,
        activeProfile.provider,
        400
      );
    }
    return await callOpenAICompatible(activeProfile, payload);
  } catch (error: unknown) {
    if (error instanceof AIError) {
      // Enhance specific errors with actionable tips
      if (profile.provider === "ollama" && error.message.includes("fetch")) {
        error.message += `\n\nTip: Make sure Ollama is running. Open your terminal and run: ollama run ${profile.model}`;
      }
      if (profile.provider === "lmstudio" && error.message.includes("fetch")) {
        error.message += `\n\nTip: Make sure LM Studio is running and the Local Server is started on port 1234.`;
      }
      throw error;
    }

    throw new AIError(
      `Universal Router Error: ${error instanceof Error ? error.message : String(error)}`,
      profile.provider,
      500
    );
  }
}
