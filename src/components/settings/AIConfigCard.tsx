"use client";

import { useState, useEffect } from "react";
import { AIProvider, AIProfile } from "@/lib/ai/types";
import { ConnectionTestButton } from "./ConnectionTestButton";
import { getActiveAIProfile, setActiveAIProfile } from "@/lib/apiHelper";
import { saveProfileToStorage } from "@/lib/settings/storage";
import { discoverLocalModels, LocalModelInfo } from "@/lib/ai/protocols/localModelDiscovery";

const PROVIDERS: { id: AIProvider; name: string; defaultUrl?: string; defaultModel: string }[] = [
  { id: "groq", name: "Groq (Fast / Llama 3)", defaultUrl: "https://api.groq.com/openai/v1", defaultModel: "llama-3.3-70b-versatile" },
  { id: "gemini", name: "Google Gemini", defaultModel: "gemini-2.0-flash" },
  { id: "openai", name: "OpenAI", defaultUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  { id: "anthropic", name: "Anthropic", defaultModel: "claude-3-5-sonnet-20241022" },
  { id: "openrouter", name: "OpenRouter", defaultUrl: "https://openrouter.ai/api/v1", defaultModel: "meta-llama/llama-3.3-70b-instruct" },
  { id: "ollama", name: "Ollama (Local)", defaultUrl: "http://localhost:11434/v1", defaultModel: "llama3.2" },
  { id: "lmstudio", name: "LM Studio (Local)", defaultUrl: "http://localhost:1234/v1", defaultModel: "local-model" },
  { id: "custom", name: "Custom (OpenAI Compatible)", defaultUrl: "https://your-api.com/v1", defaultModel: "your-model-name" },
];

export function AIConfigCard() {
  const [profile, setProfile] = useState<AIProfile>({
    provider: "groq",
    apiKey: "",
    baseURL: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile"
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [localModels, setLocalModels] = useState<LocalModelInfo[]>([]);

  useEffect(() => {
    const saved = getActiveAIProfile();
    if (saved) {
      // Don't wipe real keys with REDACTED placeholder on client side refresh
      if (saved.apiKey !== 'REDACTED_LOCAL_ONLY') {
         setProfile(saved);
      }
    }
  }, []);

  // Background discovery of local models
  useEffect(() => {
    if (profile.provider === 'ollama' || profile.provider === 'lmstudio') {
      discoverLocalModels().then(setLocalModels);
    }
  }, [profile.provider]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvider = e.target.value as AIProvider;
    const providerConfig = PROVIDERS.find(p => p.id === selectedProvider);
    
    if (providerConfig) {
      setProfile(prev => ({
        ...prev,
        provider: selectedProvider,
        baseURL: providerConfig.defaultUrl || "",
        model: providerConfig.defaultModel,
        // Optional: clear api key when switching, or keep it. Let's keep it in case they switch back by mistake.
      }));
    }
  };

  const handleSave = async () => {
    await saveProfileToStorage(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const needsBaseUrl = ["custom", "ollama", "lmstudio", "openrouter"].includes(profile.provider) || !!profile.baseURL;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Provider Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">
          LUNVO is 100% BYOK (Bring Your Own Key). You can use cloud models or run them locally on your own machine.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            AI Provider
          </label>
          <select 
            value={profile.provider}
            onChange={handleProviderChange}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {needsBaseUrl && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Base URL
            </label>
            <input 
              type="text" 
              value={profile.baseURL || ""}
              onChange={(e) => setProfile({...profile, baseURL: e.target.value})}
              placeholder="https://api.openai.com/v1"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Model Name
          </label>
          {profile.provider === 'ollama' && localModels.filter(m => m.engine === 'ollama').length > 0 ? (
             <select 
              value={profile.model}
              onChange={(e) => setProfile({...profile, model: e.target.value})}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100"
            >
              {localModels.filter(m => m.engine === 'ollama').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              value={profile.model}
              onChange={(e) => setProfile({...profile, model: e.target.value})}
              placeholder="e.g., gpt-4o"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100"
            />
          )}
          {profile.provider === 'ollama' && localModels.length === 0 && (
             <p className="text-xs text-slate-500 mt-1">Type the exact model tag (e.g., llama3.2). Start Ollama to auto-detect models.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            API Key
          </label>
          <input 
            type="password" 
            value={profile.apiKey}
            onChange={(e) => setProfile({...profile, apiKey: e.target.value})}
            placeholder={profile.provider === "ollama" || profile.provider === "lmstudio" ? "Not required for local models" : "sk-..."}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 mt-1">
            Keys are stored securely in your browser's local storage and are never saved to our database.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <ConnectionTestButton profile={profile} />
          
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            {isSaved ? "Saved Successfully!" : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
