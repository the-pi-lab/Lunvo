import { AIProfile, AIRequestPayload, AIFullResponse, AIError, AIResponseChunk } from '../types';

export async function callOpenAICompatible(
  profile: AIProfile,
  payload: AIRequestPayload
): Promise<AIFullResponse> {
  const baseUrl = profile.baseURL || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(profile.apiKey && { 'Authorization': `Bearer ${profile.apiKey}` }),
    ...profile.customHeaders
  };

  const messages = [...payload.messages];
  if (payload.systemPrompt) {
    // Add system prompt to the beginning if supported, or inject it
    messages.unshift({ role: 'system', content: payload.systemPrompt });
  }

  const requestBody = {
    model: profile.model,
    messages: messages,
    temperature: payload.temperature ?? 0.7,
    max_tokens: payload.maxTokens,
    stream: payload.stream ?? false,
  };

  const startTime = Date.now();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
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
      throw new AIError('Invalid response format: Missing choices', profile.provider, 500);
    }

    const choice = data.choices[0];

    return {
      text: choice.message?.content || '',
      finishReason: choice.finish_reason || 'unknown',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
      latencyMs
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
