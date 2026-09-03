/**
 * @deprecated Since Phase 17 - use `@/lib/ai/router.unified` (unifiedAI / unifiedText).
 * This module remains as the server plan-mode implementation consumed by the unified router.
 * Do NOT add new call sites here.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";
import Groq from "groq-sdk";
import { checkRateLimit, MINUTE_MS } from "./serverLimiter";

type NvidiaModelKey = "deepseek" | "moonshot";
type ResolvedPlan = "free" | "starter" | "pro";

export type UserPlan = "free" | "starter" | "pro" | "premium";

type NvidiaTextClient = {
  name: string;
  modelKey: NvidiaModelKey;
  apiKey: string;
  baseURL: string;
  model: string;
};

type QualityProfile = {
  temperature: number;
  topP: number;
  maxTokensCap: number;
  thinking: boolean;
};

const MAX_REQUESTS_PER_MINUTE = 40;

const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-ai/deepseek-v3.1-terminus";
const DEFAULT_MOONSHOT_MODEL = "moonshotai/kimi-k2-instruct";

const PLAN_MODEL_ATTENTION: Record<ResolvedPlan, Record<NvidiaModelKey, number>> = {
  // Free users get majority DeepSeek attention.
  free: { deepseek: 95, moonshot: 5 },
  // Starter shares both: less DeepSeek and heavier Moonshot.
  starter: { deepseek: 20, moonshot: 80 },
  // Pro also shares Moonshot, but Starter is intentionally heavier as requested.
  pro: { deepseek: 25, moonshot: 75 },
};

const nvidiaClients: Record<NvidiaModelKey, NvidiaTextClient> = {
  deepseek: {
    name: "nvidia_deepseek",
    modelKey: "deepseek",
    apiKey: getEnvValue("NVIDIA_API_KEY_DEEPSEEK", "NVIDIA_SHARED_API_KEY", "NVIDIA_NIM_API_KEY_2"),
    baseURL:
      getEnvValue(
        "NVIDIA_BASE_URL",
        "NVIDIA_SHARED_BASE_URL",
        "NVIDIA_NIM_BASE_URL_2",
        "NVIDIA_NIM_BASE_URL"
      ) || DEFAULT_NVIDIA_BASE_URL,
    model:
      getEnvValue(
        "NVIDIA_MODEL_DEEPSEEK",
        "NVIDIA_SHARED_MODEL",
        "NVIDIA_NIM_MODEL_2",
        "NVIDIA_NIM_MODEL"
      ) || DEFAULT_DEEPSEEK_MODEL,
  },
  moonshot: {
    name: "nvidia_moonshot",
    modelKey: "moonshot",
    apiKey: getEnvValue(
      "NVIDIA_API_KEY_MOONSHOT",
      "NVIDIA_PREMIUM_API_KEY",
      "NVIDIA_NIM_API_KEY_1"
    ),
    baseURL:
      getEnvValue(
        "NVIDIA_BASE_URL",
        "NVIDIA_PREMIUM_BASE_URL",
        "NVIDIA_NIM_BASE_URL_1",
        "NVIDIA_NIM_BASE_URL"
      ) || DEFAULT_NVIDIA_BASE_URL,
    model:
      getEnvValue(
        "NVIDIA_MODEL_MOONSHOT",
        "NVIDIA_PREMIUM_MODEL",
        "NVIDIA_NIM_MODEL_1",
        "NVIDIA_NIM_MODEL"
      ) || DEFAULT_MOONSHOT_MODEL,
  },
};

function getEnvValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function hasEnv(key: string): boolean {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function resolveNvidiaEndpoint(baseURL: string): string {
  const trimmed = baseURL.trim().replace(/\/+$/, "");

  if (/\/chat\/completions$/i.test(trimmed)) {
    return trimmed;
  }
  if (/\/v1$/i.test(trimmed)) {
    return `${trimmed}/chat/completions`;
  }

  return `${trimmed}/v1/chat/completions`;
}

function resolvePlanTier(userPlan: UserPlan): ResolvedPlan {
  if (userPlan === "pro") {
    return "pro";
  }
  if (userPlan === "starter" || userPlan === "premium") {
    return "starter";
  }
  return "free";
}

function pickModelByWeight(plan: ResolvedPlan): NvidiaModelKey {
  const weights = PLAN_MODEL_ATTENTION[plan];
  const total = weights.deepseek + weights.moonshot;

  if (total <= 0) {
    return "deepseek";
  }

  const roll = Math.random() * total;
  return roll < weights.deepseek ? "deepseek" : "moonshot";
}

function getPlanCandidates(plan: ResolvedPlan): NvidiaTextClient[] {
  const primaryModel = pickModelByWeight(plan);
  const secondaryModel: NvidiaModelKey = primaryModel === "deepseek" ? "moonshot" : "deepseek";

  return [nvidiaClients[primaryModel], nvidiaClients[secondaryModel]];
}

function getQualityProfile(plan: ResolvedPlan, modelKey: NvidiaModelKey): QualityProfile {
  if (modelKey === "deepseek") {
    if (plan === "free") {
      return {
        temperature: 0.2,
        topP: 0.7,
        maxTokensCap: 1000,
        thinking: false,
      };
    }

    if (plan === "starter") {
      return {
        temperature: 0.2,
        topP: 0.7,
        maxTokensCap: 2400,
        thinking: false,
      };
    }

    return {
      temperature: 0.2,
      topP: 0.7,
      maxTokensCap: 4096,
      thinking: true,
    };
  }

  if (plan === "free") {
    return {
      temperature: 0.5,
      topP: 0.85,
      maxTokensCap: 1000,
      thinking: false,
    };
  }

  return {
    temperature: 0.6,
    topP: 0.9,
    maxTokensCap: 4096,
    thinking: false,
  };
}

const MODELS = {
  gemini: "gemini-1.5-flash",
  groqFallback: "llama-3.1-8b-instant",
};

export type AICustomKeys = {
  gemini?: string;
  groq?: string;
};

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  userPlan: UserPlan,
  temperature: number = 0.5,
  maxTokens: number = 1000,
  customKeys?: AICustomKeys
): Promise<string> {
  const plan = resolvePlanTier(userPlan);
  const hasDeepseek = nvidiaClients.deepseek.apiKey.length > 0;
  const hasMoonshot = nvidiaClients.moonshot.apiKey.length > 0;
  const hasGemini = Boolean(customKeys?.gemini || hasEnv("GEMINI_API_KEY"));
  const hasGroq = Boolean(customKeys?.groq || hasEnv("GROQ_API_KEY"));

  if (!hasDeepseek && !hasMoonshot && !hasGemini && !hasGroq) {
    throw new Error("No AI provider configured. Set API keys in your .env file or Settings page.");
  }

  const providerErrors: string[] = [];

  // 1. Try Custom Keys First
  if (customKeys?.gemini) {
    try {
      return await callGemini(systemPrompt, userPrompt, temperature, maxTokens, customKeys.gemini);
    } catch (error) {
      providerErrors.push(`custom gemini: ${normalizeError(error)}`);
      logger.warn("Custom Gemini failed", { provider: "custom-gemini" }, error);
    }
  }

  if (customKeys?.groq) {
    try {
      return await callGroq(
        systemPrompt,
        userPrompt,
        MODELS.groqFallback,
        temperature,
        maxTokens,
        customKeys.groq
      );
    } catch (error) {
      providerErrors.push(`custom groq: ${normalizeError(error)}`);
      logger.warn("Custom Groq failed", { provider: "custom-groq" }, error);
    }
  }

  // 2. Try Default Providers
  const nvidiaCandidates = getPlanCandidates(plan);

  for (const client of nvidiaCandidates) {
    if (!client.apiKey) {
      providerErrors.push(`${client.name}: missing API key`);
      continue;
    }

    // Phase 18: serverless limiter (pluggable — memory default, Upstash/custom if env set)
    // BYOK path is exempt (handled in router.unified.ts); this is server plan-mode only.
    const rl = await checkRateLimit(`provider:${client.name}`, MAX_REQUESTS_PER_MINUTE, MINUTE_MS);
    if (!rl.allowed) {
      providerErrors.push(
        `${client.name}: rate limit reached (${MAX_REQUESTS_PER_MINUTE}/min) retry after ${Math.ceil(rl.retryAfterMs / 1000)}s`
      );
      continue;
    }

    try {
      const profile = getQualityProfile(plan, client.modelKey);
      return await callNvidia(client, profile, systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      const message = normalizeError(error);
      providerErrors.push(`${client.name}: ${message}`);
      logger.warn("NVIDIA call failed", { client: client.name, message });
    }
  }

  if (hasGemini) {
    try {
      return await callGemini(systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      providerErrors.push(`gemini fallback: ${normalizeError(error)}`);
      logger.warn("Gemini fallback failed", { provider: "gemini" }, error);
    }
  } else {
    providerErrors.push("gemini fallback unavailable (missing GEMINI_API_KEY)");
  }

  if (hasGroq) {
    try {
      return await callGroq(systemPrompt, userPrompt, MODELS.groqFallback, temperature, maxTokens);
    } catch (error) {
      providerErrors.push(`groq fallback: ${normalizeError(error)}`);
      logger.warn("Groq fallback failed", { provider: "groq" }, error);
    }
  } else {
    providerErrors.push("groq fallback unavailable (missing GROQ_API_KEY)");
  }

  throw new Error(`All AI providers failed. ${providerErrors.join(" | ")}`.trim());
}

async function callNvidia(
  client: NvidiaTextClient,
  profile: QualityProfile,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(resolveNvidiaEndpoint(client.baseURL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${client.apiKey}`,
      },
      body: JSON.stringify({
        model: client.model,
        temperature: clamp((profile.temperature + temperature) / 2, 0, 2),
        top_p: clamp(profile.topP, 0, 1),
        max_tokens: Math.max(1, Math.min(maxTokens, profile.maxTokensCap)),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...(profile.thinking
          ? {
              extra_body: {
                chat_template_kwargs: {
                  thinking: true,
                },
              },
            }
          : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`status ${response.status}: ${errorText.slice(0, 240)}`);
    }

    type NvidiaResponse = {
      choices?: Array<{ message?: { content?: string } }>;
      output_text?: string;
      text?: string;
    };
    const payload = (await response.json()) as NvidiaResponse;
    const text =
      payload.choices?.[0]?.message?.content || payload.output_text || payload.text || "";

    if (!text || typeof text !== "string") {
      throw new Error("empty response payload from NVIDIA NIM");
    }

    return text;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("request timeout after 15s");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini API key is required");
  const model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: MODELS.gemini,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();

  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  modelName: string,
  temperature: number,
  maxTokens: number,
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is required");
  const groqClient = new Groq({ apiKey: key });
  const completion = await groqClient.chat.completions.create({
    model: modelName,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

/**
 * Balanced brace JSON extractor — safely ignores braces/colons inside string literals.
 */
function extractBalancedJson(raw: string): string | null {
  let inString = false;
  let escape = false;
  let startIdx = -1;
  let braceCount = 0;
  let bracketCount = 0;
  let targetType: "object" | "array" | null = null;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (startIdx === -1) {
        if (char === "{") {
          startIdx = i;
          braceCount = 1;
          targetType = "object";
        } else if (char === "[") {
          startIdx = i;
          bracketCount = 1;
          targetType = "array";
        }
      } else {
        if (targetType === "object") {
          if (char === "{") braceCount++;
          else if (char === "}") {
            braceCount--;
            if (braceCount === 0) return raw.substring(startIdx, i + 1);
          }
        } else if (targetType === "array") {
          if (char === "[") bracketCount++;
          else if (char === "]") {
            bracketCount--;
            if (bracketCount === 0) return raw.substring(startIdx, i + 1);
          }
        }
      }
    }
  }

  return null;
}

export function parseAIJson<T>(rawText: string): T {
  let cleaned = rawText.trim();

  // Strip markdown code fences if wrapped
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 2. Extract balanced JSON structure
    const balanced = extractBalancedJson(cleaned);
    const jsonTarget = balanced || cleaned;

    try {
      return JSON.parse(jsonTarget) as T;
    } catch {
      // 3. Repair trailing commas only (safe: structural chars outside strings).
      // NOTE: unquoted-key and single-quote repairs removed — they corrupted
      // values like "a: b" / "it's" inside strings. Keep strict JSON contract.
      const repaired = jsonTarget.replace(/,\s*([\]}])/g, "$1");

      try {
        return JSON.parse(repaired) as T;
      } catch {
        logger.error("All AI JSON parsing attempts failed for text", rawText);
        throw new Error("Could not parse AI response as valid data structure.");
      }
    }
  }
}
