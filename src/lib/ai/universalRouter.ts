import { AIProfile, AIRequestPayload, AIFullResponse, AIError } from './types';
import { callOpenAICompatible } from './protocols/openaiCompatible';
import { callGemini } from './protocols/geminiAdapter';
import { callAnthropic } from './protocols/anthropicAdapter';

export async function callUniversalAI(
  profile: AIProfile,
  payload: AIRequestPayload
): Promise<AIFullResponse> {
  
  if (!profile || !profile.provider) {
    throw new AIError('Invalid AI Profile provided.', 'custom', 400);
  }

  try {
    switch (profile.provider) {
      case 'anthropic':
        return await callAnthropic(profile, payload);
      
      case 'gemini':
        // If the user supplied a custom base URL that implies OpenAI compatibility (v1beta/openai)
        // we might want to route to callOpenAICompatible. For now, use Gemini adapter.
        if (profile.baseURL && profile.baseURL.includes('/openai')) {
           return await callOpenAICompatible(profile, payload);
        }
        return await callGemini(profile, payload);
      
      case 'openai':
      case 'groq':
      case 'nvidia':
      case 'openrouter':
      case 'custom':
        return await callOpenAICompatible(profile, payload);

      case 'ollama':
        // Default Ollama endpoint if not provided
        if (!profile.baseURL) profile.baseURL = 'http://localhost:11434/v1';
        return await callOpenAICompatible(profile, payload);
        
      case 'lmstudio':
        // Default LM Studio endpoint if not provided
        if (!profile.baseURL) profile.baseURL = 'http://localhost:1234/v1';
        return await callOpenAICompatible(profile, payload);

      default:
        throw new AIError(`Unsupported provider: ${profile.provider}`, profile.provider, 400);
    }
  } catch (error: any) {
    if (error instanceof AIError) {
      // Enhance specific errors with actionable tips
      if (profile.provider === 'ollama' && error.message.includes('fetch')) {
        error.message += `\n\nTip: Make sure Ollama is running. Open your terminal and run: ollama run ${profile.model}`;
      }
      if (profile.provider === 'lmstudio' && error.message.includes('fetch')) {
        error.message += `\n\nTip: Make sure LM Studio is running and the Local Server is started on port 1234.`;
      }
      throw error;
    }
    
    throw new AIError(`Universal Router Error: ${error.message || String(error)}`, profile.provider, 500);
  }
}
