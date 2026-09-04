import { AIProfile, AIRequestPayload, AIFullResponse, AIError, AIResponseChunk } from "../types";

export async function callGemini(
  profile: AIProfile,
  payload: AIRequestPayload
): Promise<AIFullResponse> {
  // Uses Gemini REST API format (v1beta or v1)
  // See: https://ai.google.dev/api/rest/v1beta/models/generateContent

  if (!profile.apiKey) {
    throw new AIError("API Key is required for Gemini.", "gemini", 401);
  }

  const model = profile.model || "gemini-1.5-flash";
  // Use generateContent for non-streaming with header-based auth
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // Convert our messages array to Gemini Content format
  let systemInstruction: unknown = undefined;
  if (payload.systemPrompt) {
    systemInstruction = {
      parts: [{ text: payload.systemPrompt }],
    };
  }

  const contents = payload.messages.map((msg) => {
    // Gemini roles: 'user' or 'model'
    // If msg.role is 'system', we should theoretically skip it if we handle it via systemInstruction,
    // but our openai parser handled system prompt separately.
    let role = msg.role === "assistant" ? "model" : "user";

    // If a system message somehow leaks into the array, treat it as user (or ideally throw)
    if (msg.role === "system") {
      role = "user"; // Or ignore it if systemInstruction is used
    }

    return {
      role,
      parts: [{ text: msg.content }],
    };
  });

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: payload.temperature ?? 0.7,
      ...(payload.maxTokens && { maxOutputTokens: payload.maxTokens }),
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = systemInstruction;
  }

  const startTime = Date.now();

  // Phase 23: if streaming requested, we simulate word-by-word after non-streaming fetch
  // (true Gemini streamGenerateContent SSE is enterprise; local-first simulates for all)
  const shouldStream = Boolean(payload.stream && payload.onChunk);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": profile.apiKey,
        ...profile.customHeaders,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;
      } catch (e) {}
      throw new AIError(`Gemini API Error: ${errorMessage}`, "gemini", response.status);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    if (!data.candidates || data.candidates.length === 0) {
      throw new AIError("Invalid response format: Missing candidates", "gemini", 500);
    }

    const candidate = data.candidates[0];
    const text = candidate.content?.parts?.[0]?.text || "";

    // map finish reason
    let finishReason: AIResponseChunk["finishReason"] = "stop";
    if (candidate.finishReason === "STOP") finishReason = "stop";
    else if (candidate.finishReason === "MAX_TOKENS") finishReason = "length";
    else if (candidate.finishReason === "SAFETY") finishReason = "content_filter";
    else finishReason = "stop";

    if (shouldStream && payload.onChunk) {
      // No per-word sleep: 12ms/word on long outputs added tens of seconds;
      // UI throttles rerenders itself. Cap mirrored from openaiCompatible.
      const words = text.slice(0, 4000).split(/(\s+)/);
      for (const w of words) {
        payload.onChunk({ text: w, isDone: false });
      }
      payload.onChunk({ text: "", isDone: true, finishReason });
    }

    return {
      text,
      finishReason,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
      latencyMs,
    };
  } catch (error: any) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      `Network or unexpected error: ${error.message || String(error)}`,
      "gemini",
      0
    );
  }
}
