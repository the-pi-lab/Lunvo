import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

let _gemini: GoogleGenerativeAI | null = null;
let _groq: Groq | null = null;

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

type UsageEntry = {
  count: number;
  lastReset: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_MINUTE = 40;

const usage: Record<string, UsageEntry> = {};

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
    baseURL: getEnvValue("NVIDIA_BASE_URL", "NVIDIA_SHARED_BASE_URL", "NVIDIA_NIM_BASE_URL_2", "NVIDIA_NIM_BASE_URL") || DEFAULT_NVIDIA_BASE_URL,
    model: getEnvValue("NVIDIA_MODEL_DEEPSEEK", "NVIDIA_SHARED_MODEL", "NVIDIA_NIM_MODEL_2", "NVIDIA_NIM_MODEL") || DEFAULT_DEEPSEEK_MODEL,
  },
  moonshot: {
    name: "nvidia_moonshot",
    modelKey: "moonshot",
    apiKey: getEnvValue("NVIDIA_API_KEY_MOONSHOT", "NVIDIA_PREMIUM_API_KEY", "NVIDIA_NIM_API_KEY_1"),
    baseURL: getEnvValue("NVIDIA_BASE_URL", "NVIDIA_PREMIUM_BASE_URL", "NVIDIA_NIM_BASE_URL_1", "NVIDIA_NIM_BASE_URL") || DEFAULT_NVIDIA_BASE_URL,
    model: getEnvValue("NVIDIA_MODEL_MOONSHOT", "NVIDIA_PREMIUM_MODEL", "NVIDIA_NIM_MODEL_1", "NVIDIA_NIM_MODEL") || DEFAULT_MOONSHOT_MODEL,
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

function getUsageEntry(clientName: string): UsageEntry {
  const now = Date.now();
  const existing = usage[clientName];

  if (!existing) {
    const next: UsageEntry = { count: 0, lastReset: now };
    usage[clientName] = next;
    return next;
  }

  if (now - existing.lastReset >= RATE_LIMIT_WINDOW_MS) {
    existing.count = 0;
    existing.lastReset = now;
  }

  return existing;
}

function canUseClient(clientName: string): boolean {
  const entry = getUsageEntry(clientName);
  return entry.count < MAX_REQUESTS_PER_MINUTE;
}

function markClientUsed(clientName: string): void {
  const entry = getUsageEntry(clientName);
  entry.count += 1;
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

function getGemini(): GoogleGenerativeAI {
  if (!_gemini) {
    _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _gemini;
}

function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  }
  return _groq;
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
      console.warn("Custom Gemini failed:", error);
    }
  }

  if (customKeys?.groq) {
    try {
      return await callGroq(systemPrompt, userPrompt, MODELS.groqFallback, temperature, maxTokens, customKeys.groq);
    } catch (error) {
      providerErrors.push(`custom groq: ${normalizeError(error)}`);
      console.warn("Custom Groq failed:", error);
    }
  }

  // 2. Try Default Providers
  const nvidiaCandidates = getPlanCandidates(plan);

  for (const client of nvidiaCandidates) {
    if (!client.apiKey) {
      providerErrors.push(`${client.name}: missing API key`);
      continue;
    }

    if (!canUseClient(client.name)) {
      providerErrors.push(`${client.name}: rate limit reached (${MAX_REQUESTS_PER_MINUTE}/min)`);
      continue;
    }

    markClientUsed(client.name);

    try {
      const profile = getQualityProfile(plan, client.modelKey);
      return await callNvidia(client, profile, systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      const message = normalizeError(error);
      providerErrors.push(`${client.name}: ${message}`);
      console.warn(`NVIDIA call failed (${client.name}):`, message);
    }
  }

  if (hasGemini) {
    try {
      return await callGemini(systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      providerErrors.push(`gemini fallback: ${normalizeError(error)}`);
      console.warn("Gemini fallback failed:", error);
    }
  } else {
    providerErrors.push("gemini fallback unavailable (missing GEMINI_API_KEY)");
  }

  if (hasGroq) {
    try {
      return await callGroq(systemPrompt, userPrompt, MODELS.groqFallback, temperature, maxTokens);
    } catch (error) {
      providerErrors.push(`groq fallback: ${normalizeError(error)}`);
      console.warn("Groq fallback failed:", error);
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
        "Authorization": `Bearer ${client.apiKey}`,
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

    const payload: any = await response.json();
    const text =
      payload?.choices?.[0]?.message?.content ||
      payload?.output_text ||
      payload?.text ||
      "";

    if (!text || typeof text !== "string") {
      throw new Error("empty response payload from NVIDIA NIM");
    }

    return text;
  } catch (error: any) {
    if (error?.name === "AbortError") {
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

export function parseAIJson<T>(rawText: string): T {
  let cleaned = rawText.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const startIndex = cleaned.indexOf("{");
    const endIndex = cleaned.lastIndexOf("}");

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonContent = cleaned.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(jsonContent) as T;
      } catch {
        console.error("Failed to parse extracted JSON block:", jsonContent);
      }
    }

    const repaired = cleaned
      .replace(/,\s*([\]}])/g, "$1")
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    try {
      return JSON.parse(repaired) as T;
    } catch {
      console.error("All AI JSON parsing attempts failed for text:", rawText);
      throw new Error("Could not parse AI response as valid data structure.");
    }
  }
}
