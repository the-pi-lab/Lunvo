import { AIProfile, AIRequestPayload, AIFullResponse, AIError, AIResponseChunk } from "../types";

export async function callAnthropic(
  profile: AIProfile,
  payload: AIRequestPayload
): Promise<AIFullResponse> {
  // Uses Anthropic Messages API format
  // See: https://docs.anthropic.com/en/api/messages

  if (!profile.apiKey) {
    throw new AIError("API Key is required for Anthropic.", "anthropic", 401);
  }

  const endpoint = "https://api.anthropic.com/v1/messages";

  // Anthropic requires alternating roles starting with user.
  // System prompt is passed separately at the top level.
  const messages = payload.messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

  const requestBody: Record<string, unknown> = {
    model: profile.model || "claude-3-5-sonnet-20241022",
    messages,
    max_tokens: payload.maxTokens || 4096, // required field for anthropic
    temperature: payload.temperature ?? 0.7,
  };

  if (payload.systemPrompt) {
    requestBody.system = payload.systemPrompt;
  }

  const startTime = Date.now();
  const shouldStream = Boolean(payload.stream && payload.onChunk);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": profile.apiKey,
        "anthropic-version": "2023-06-01",
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
      throw new AIError(`Anthropic API Error: ${errorMessage}`, "anthropic", response.status);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    if (!data.content || data.content.length === 0) {
      throw new AIError("Invalid response format: Missing content", "anthropic", 500);
    }

    const text = data.content[0]?.text || "";

    // map finish reason
    let finishReason: AIResponseChunk["finishReason"] = "stop";
    if (data.stop_reason === "end_turn" || data.stop_reason === "stop_sequence")
      finishReason = "stop";
    else if (data.stop_reason === "max_tokens") finishReason = "length";
    else finishReason = "stop";

    if (shouldStream && payload.onChunk) {
      // No per-word sleep (see geminiAdapter note). Cap mirrored.
      const words = text.slice(0, 4000).split(/(\s+)/);
      for (const w of words) {
        payload.onChunk({ text: w, isDone: false });
      }
      payload.onChunk({ text: "", isDone: true, finishReason });
    }

    return {
      text,
      finishReason,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens || 0,
            completionTokens: data.usage.output_tokens || 0,
            totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
          }
        : undefined,
      latencyMs,
    };
  } catch (error: any) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      `Network or unexpected error: ${error.message || String(error)}`,
      "anthropic",
      0
    );
  }
}
