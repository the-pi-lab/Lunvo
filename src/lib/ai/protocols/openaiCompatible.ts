import { AIProfile, AIRequestPayload, AIFullResponse, AIError, AIResponseChunk } from "../types";

export async function callOpenAICompatible(
  profile: AIProfile,
  payload: AIRequestPayload
): Promise<AIFullResponse> {
  const baseUrl = profile.baseURL || "https://api.openai.com/v1";
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(profile.apiKey && { Authorization: `Bearer ${profile.apiKey}` }),
    ...profile.customHeaders,
  };

  const messages = [...payload.messages];
  const hasSystemRole = messages.some((m) => m.role === "system");
  if (payload.systemPrompt && !hasSystemRole) {
    // Add system prompt to the beginning if not already present in messages
    messages.unshift({ role: "system", content: payload.systemPrompt });
  }

  const requestBody: Record<string, unknown> = {
    model: profile.model,
    messages: messages,
    temperature: payload.temperature ?? 0.7,
    max_tokens: payload.maxTokens,
    stream: payload.stream ?? false,
  };

  const startTime = Date.now();

  // Phase 23: streaming via SSE when payload.stream && onChunk
  if (payload.stream && payload.onChunk) {
    const streamBody = { ...requestBody, stream: true };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { ...headers, Accept: "text/event-stream" },
      body: JSON.stringify(streamBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorText;
      } catch {}
      throw new AIError(
        `OpenAI-Compatible API Error: ${errorMessage}`,
        profile.provider,
        response.status
      );
    }

    // Try true SSE streaming
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let finishReason: AIResponseChunk["finishReason"] = "stop";
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                fullText += delta;
                payload.onChunk({ text: delta, isDone: false });
              }
              const fr = json.choices?.[0]?.finish_reason;
              if (fr) {
                const mapped: Record<string, AIResponseChunk["finishReason"]> = {
                  stop: "stop",
                  length: "length",
                  content_filter: "content_filter",
                };
                finishReason = mapped[fr] ?? "stop";
              }
            } catch {}
          }
        }
        // flush buffer
        if (buffer.trim().startsWith("data:")) {
          try {
            const data = buffer.trim().slice(5).trim();
            if (data && data !== "[DONE]") {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                fullText += delta;
                payload.onChunk({ text: delta, isDone: false });
              }
            }
          } catch {}
        }
        payload.onChunk({ text: "", isDone: true, finishReason });
        return { text: fullText, finishReason, latencyMs: Date.now() - startTime };
      } catch {
        // fall through to non-streaming fallback
      }
    }
    // Fallback if streaming not supported: non-streaming then simulate word-by-word
    const fallback = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...requestBody, stream: false }),
    });
    if (!fallback.ok) {
      const t = await fallback.text();
      throw new AIError(`OpenAI-Compatible API Error: ${t}`, profile.provider, fallback.status);
    }
    const data = await fallback.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    // simulate streaming word-by-word for UI
    const words = text.split(/(\s+)/);
    let acc = "";
    for (const w of words) {
      acc += w;
      payload.onChunk({ text: w, isDone: false });
      // micro delay to allow UI to render word-by-word without blocking
      await new Promise((r) => setTimeout(r, 12));
    }
    payload.onChunk({
      text: "",
      isDone: true,
      finishReason: data.choices?.[0]?.finish_reason ?? "stop",
    });
    return {
      text,
      finishReason: data.choices?.[0]?.finish_reason ?? "stop",
      latencyMs: Date.now() - startTime,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorText;
      } catch (e) {
        // Not JSON
      }
      throw new AIError(
        `OpenAI-Compatible API Error: ${errorMessage}`,
        profile.provider,
        response.status
      );
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    if (!data.choices || data.choices.length === 0) {
      throw new AIError("Invalid response format: Missing choices", profile.provider, 500);
    }

    const choice = data.choices[0];

    return {
      text: choice.message?.content || "",
      finishReason: choice.finish_reason || "unknown",
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      latencyMs,
    };
  } catch (error: any) {
    if (error instanceof AIError) {
      throw error;
    }
    throw new AIError(
      `Network or unexpected error: ${error.message || String(error)}`,
      profile.provider,
      0
    );
  }
}
