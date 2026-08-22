import { AIProfile } from './ai/types';

const LUNVO_PROFILE_KEY = 'lunvo_ai_profile';

export function getActiveAIProfile(): AIProfile | null {
  if (typeof window === "undefined") return null;
  
  const saved = localStorage.getItem(LUNVO_PROFILE_KEY);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved) as AIProfile;
  } catch (e) {
    console.error("Failed to parse active AI profile", e);
    return null;
  }
}

export function setActiveAIProfile(profile: AIProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LUNVO_PROFILE_KEY, JSON.stringify(profile));
}

export function getApiHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 
    "Content-Type": "application/json",
    ...additionalHeaders 
  };
  
  const profile = getActiveAIProfile();
  
  if (profile) {
    if (profile.provider) headers["x-ai-provider"] = profile.provider;
    if (profile.apiKey) headers["x-ai-key"] = profile.apiKey;
    if (profile.baseURL) headers["x-ai-url"] = profile.baseURL;
    if (profile.model) headers["x-ai-model"] = profile.model;
    
    // Also pass custom headers as a base64 encoded JSON string to survive HTTP headers
    if (profile.customHeaders && Object.keys(profile.customHeaders).length > 0) {
      headers["x-ai-custom-headers"] = btoa(JSON.stringify(profile.customHeaders));
    }
  }
  
  return headers;
}

