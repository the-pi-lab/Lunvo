/**
 * LUNVO Unified AI Router (Phase 17 + 17b)
 * Single entry point for ALL AI calls — server plan-mode AND client BYOK profile-mode.
 *
 *   unifiedAI({...})  -> full response { text, finishReason, usage? }
 *   unifiedText({...}) -> plain string convenience
 *
 * Routing:
 *   profile provided  -> BYOK adapter chain (OpenAI-compat / Gemini / Anthropic / Ollama / LMStudio)
 *   useVault: true    -> multi-profile auto-failover (429/quota/5xx -> next profile in priority order)
 *   plan provided     -> server provider chain (NVIDIA DeepSeek/Moonshot -> Gemini -> Groq)
 *
 * parseAIJson is re-exported here so call sites import AI from one module only.
 */

import { callAI, parseAIJson, type AICustomKeys, type UserPlan } from "./router";
import { callUniversalAI } from "./universalRouter";
import { getVault, getActiveProfileId, isFailoverEligible } from "./profileVault";
import { isFailoverEnabled } from "./../failoverPref";
import type { AIProfile, Message, AIFullResponse, AIResponseChunk } from "./types";

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
  /** Enable vault auto-failover across saved profiles (priority order). */
  useVault?: boolean;
  /** Server plan mode — uses platform keys with weighted fallback. */
  plan?: UserPlan;
  customKeys?: AICustomKeys;

  /** Streaming: when true, onChunk is called per token */
  stream?: boolean;
  onChunk?: (chunk: AIResponseChunk) => void;
}

function buildMessages(opts: UnifiedAIOptions): Message[] {
  if (opts.messages && opts.messages.length > 0) return opts.messages;
  const messages: Message[] = [];
  if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  if (opts.userPrompt) messages.push({ role: "user", content: opts.userPrompt });
  return messages;
}

async function callProfile(
  profile: AIProfile,
  messages: Message[],
  opts: UnifiedAIOptions
): Promise<AIFullResponse> {
  return callUniversalAI(profile, {
    messages,
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
    stream: opts.stream,
    onChunk: opts.onChunk,
  });
}

async function callWithVaultFailover(
  startProfile: AIProfile,
  messages: Message[],
  opts: UnifiedAIOptions
): Promise<AIFullResponse> {
  const vault = getVault();
  if (vault.length <= 1) {
    return callProfile(startProfile, messages, opts);
  }

  const startIdx = Math.max(
    0,
    vault.findIndex((p) => p.id === (startProfile.id ?? getActiveProfileId()))
  );
  const ordered = [...vault.slice(startIdx), ...vault.slice(0, startIdx)];

  const errors: string[] = [];
  for (const profile of ordered) {
    try {
      return await callProfile(profile, messages, opts);
    } catch (error) {
      const label = profile.label || profile.provider;
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`${label}: ${msg.slice(0, 120)}`);
      if (!isFailoverEligible(error)) {
        // Auth/config error — failover won't help, surface immediately.
        throw new Error(`${label} failed: ${msg}\n\nVault failover skipped (non-retryable error).`);
      }
      // Rate-limit/quota/5xx -> try next profile in priority order.
    }
  }

  throw new Error(`All ${vault.length} vault providers failed:\n${errors.join("\n")}`);
}

export async function unifiedAI(opts: UnifiedAIOptions): Promise<AIFullResponse> {
  const messages = buildMessages(opts);
  if (messages.length === 0) {
    throw new Error("unifiedAI: no messages provided");
  }

  // BYOK profile mode (client or server) — user's own key, user's own provider.
  if (opts.profile || opts.useVault) {
    const startProfile = opts.profile ?? null;
    if (opts.useVault && isFailoverEnabled()) {
      const active = startProfile ?? getVault().find((p) => p.id === getActiveProfileId()) ?? null;
      if (!active) throw new Error("Vault is empty — add a provider in Settings first.");
      return callWithVaultFailover(active, messages, opts);
    }
    if (!startProfile) throw new Error("unifiedAI: profile required");
    return callProfile(startProfile, messages, opts);
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
