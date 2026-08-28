/**
 * Known providers get autocomplete; registry ids (see providers/registry.ts)
 * are all valid too. The `(string & {})` trick keeps IntelliSense while
 * allowing any registry id.
 */
export type KnownAIProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "nvidia"
  | "ollama"
  | "lmstudio"
  | "openrouter"
  | "custom";

export type AIProvider = KnownAIProvider | (string & {});

export interface AIProfile {
  /** Stable id for vault management (set by profileVault on save). */
  id?: string;
  /** Display label for vault list (defaults to provider name). */
  label?: string;
  provider: AIProvider;
  apiKey: string;
  baseURL?: string; // Optional for standard providers, required for custom/local
  model: string;
  customHeaders?: Record<string, string>;
}

export type Role = "system" | "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export interface AIRequestPayload {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
  onChunk?: (chunk: AIResponseChunk) => void;
}

export interface AIResponseChunk {
  text: string;
  isDone: boolean;
  finishReason?: "stop" | "length" | "content_filter" | null;
}

export interface AIFullResponse {
  text: string;
  finishReason: "stop" | "length" | "content_filter" | "unknown" | null;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
}

export class AIError extends Error {
  public provider: AIProvider;
  public statusCode?: number;
  public code?: string;

  constructor(message: string, provider: AIProvider, statusCode?: number, code?: string) {
    super(message);
    this.name = "AIError";
    this.provider = provider;
    this.statusCode = statusCode;
    this.code = code;
  }
}
