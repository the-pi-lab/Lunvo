/**
 * LUNVO Unified AI Router (Phase 17)
 * Single entry point for ALL AI calls — server plan-mode AND client BYOK profile-mode.
 *
 *   unifiedAI({...})  -> full response { text, finishReason, usage? }
 *   unifiedText({...}) -> plain string convenience
 *
 * Routing:
 *   profile provided  -> BYOK adapter chain (OpenAI-compat / Gemini / Anthropic / Ollama / LMStudio)
 *   plan provided     -> server provider chain (NVIDIA DeepSeek/Moonshot -> Gemini -> Groq)
 *
 * parseAIJson is re-exported here so call sites import AI from one module only.
 */

import { callAI, parseAIJson, type AICustomKeys, type UserPlan } from "./router";
import { callUniversalAI } from "./universalRouter";
import type { AIProfile, Message, AIFullResponse } from "./types";

export { parseAIJson };
export type { AICustomKeys, UserPlan, AIProfile, Message };

export interface UnifiedAIOptions {
  /** Full message array (profile mode preferred). */
  messages?: Message[];
  /** Simple two-part prompt (plan mode, or profile mode auto-wrapped). */
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  maxTokens?: number;

  /** BYOK mode — works on client and server. */
  profile?: AIProfile;
  /** Server plan mode — uses platform keys with weighted fallback. */
  plan?: UserPlan;
  customKeys?: AICustomKeys;
}

function buildMessages(opts: UnifiedAIOptions): Message[] {
  if (opts.messages && opts.messages.length > 0) return opts.messages;
  const messages: Message[] = [];
  if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  if (opts.userPrompt) messages.push({ role: "user", content: opts.userPrompt });
  return messages;
}

export async function unifiedAI(opts: UnifiedAIOptions): Promise<AIFullResponse> {
  const messages = buildMessages(opts);
  if (messages.length === 0) {
    throw new Error("unifiedAI: no messages provided");
  }

  // BYOK profile mode (client or server) — user's own key, user's own provider.
  if (opts.profile) {
    return callUniversalAI(opts.profile, {
      messages,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    });
  }

  // Server plan mode — platform keys, plan-based quality + fallback chain.
  const systemPrompt = messages.find((m) => m.role === "system")?.content ?? "";
  const userPrompt = messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n");

  const text = await callAI(
    systemPrompt,
    userPrompt,
    opts.plan ?? "free",
    opts.temperature ?? 0.5,
    opts.maxTokens ?? 1000,
    opts.customKeys
  );

  return { text, finishReason: "stop" };
}

/** Convenience: returns just the text. */
export async function unifiedText(opts: UnifiedAIOptions): Promise<string> {
  const res = await unifiedAI(opts);
  return res.text;
}
