"use client";

import { useState, useEffect, useCallback } from "react";
import { AIProvider, AIProfile } from "@/lib/ai/types";
import { ConnectionTestButton } from "./ConnectionTestButton";
import { saveProfileToStorage } from "@/lib/settings/storage";
import { discoverLocalModels, LocalModelInfo } from "@/lib/ai/protocols/localModelDiscovery";
import ProviderGrid from "./ProviderGrid";
import { getProviderDef, type ProviderDef } from "@/lib/ai/providers/registry";
import {
  getVault,
  getActiveProfileId,
  setActiveProfileId,
  addToVault,
  removeFromVault,
  updateInVault,
  reorderVault,
  clearVault,
  makeProfileId,
} from "@/lib/ai/profileVault";
import { GripVertical, Star, Trash2, Plus, Check, KeyRound, ShieldCheck } from "lucide-react";

function ProviderAvatar({
  def,
  providerId,
  size = 28,
}: {
  def: ProviderDef | undefined;
  providerId: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!def) {
    return (
      <div
        className="flex items-center justify-center rounded-[8px] font-bold text-white shrink-0"
        style={{ width: size, height: size, backgroundColor: "#6B7280", fontSize: size * 0.45 }}
      >
        {providerId.charAt(0).toUpperCase()}
      </div>
    );
  }
  if (def.iconSlug && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.simpleicons.org/${def.iconSlug}/${def.color.replace("#", "")}`}
        alt={def.name}
        width={size}
        height={size}
        className="rounded-[8px] object-contain bg-surface-container-low shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-[8px] font-bold text-white shrink-0"
      style={{ width: size, height: size, backgroundColor: def.color, fontSize: size * 0.45 }}
    >
      {def.name.charAt(0)}
    </div>
  );
}

export function AIConfigCard() {
  const [vault, setVault] = useState<AIProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<ProviderDef | null>(null);
  const [draft, setDraft] = useState<AIProfile>({
    provider: "groq" as AIProvider,
    apiKey: "",
    baseURL: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [localModels, setLocalModels] = useState<LocalModelInfo[]>([]);

  const refresh = useCallback(() => {
    setVault(getVault());
    setActiveId(getActiveProfileId());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Background discovery of local models
  useEffect(() => {
    if (draft.provider === "ollama" || draft.provider === "lmstudio") {
      discoverLocalModels().then(setLocalModels);
    }
  }, [draft.provider]);

  const handleProviderSelect = (def: ProviderDef) => {
    setSelectedDef(def);
    setDraft({
      provider: def.id as AIProvider,
      apiKey: "",
      baseURL: def.baseURL ?? "",
      model: def.defaultModel,
    });
    setAddError(null);
  };

  const needsBaseUrl =
    !draft.baseURL ||
    ["custom"].includes(draft.provider) ||
    (selectedDef ? !selectedDef.baseURL : false);

  const handleAddToVault = async () => {
    setAddError(null);
    const def = getProviderDef(draft.provider);
    if (!draft.apiKey && !def?.local) {
      setAddError("API key is required.");
      return;
    }
    const result = addToVault({ ...draft, id: makeProfileId(draft.provider) });
    if (!result.ok) {
      setAddError(result.error ?? "Could not add profile.");
      return;
    }
    // Also set as active legacy profile so existing flows keep working.
    await saveProfileToStorage({ ...draft, id: makeProfileId(draft.provider) });
    refresh();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSetActive = async (profile: AIProfile) => {
    if (!profile.id) return;
    setActiveProfileId(profile.id);
    await saveProfileToStorage(profile);
    refresh();
  };

  const handleRemove = (id: string) => {
    removeFromVault(id);
    refresh();
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const targetIndex = vault.findIndex((p) => p.id === targetId);
    if (targetIndex === -1) return;
    reorderVault(dragId, targetIndex);
    setDragId(null);
    refresh();
  };

  const activeProfile = vault.find((p) => p.id === activeId) ?? vault[0] ?? null;
  const activeDef = activeProfile ? getProviderDef(activeProfile.provider) : undefined;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-[16px] p-6 shadow-premium space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-background">AI Providers</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            100% BYOK — {getProviderDef("openai") ? "50+" : ""} providers, multiple keys, automatic
            failover.
          </p>
        </div>
        <ShieldCheck className="w-6 h-6 text-secondary shrink-0" />
      </div>

      {/* Active profile strip */}
      {activeProfile && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-primary/5 border border-primary/15">
          <ProviderAvatar def={activeDef} providerId={activeProfile.provider} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-on-background truncate">
              {activeProfile.label || activeProfile.provider}
              <span className="ml-2 text-xs font-medium text-on-surface-variant">
                {activeProfile.model}
              </span>
            </p>
            <p className="text-[0.6875rem] text-on-surface-variant/70">
              Active — failover order follows vault priority below
            </p>
          </div>
          <Check className="w-4 h-4 text-secondary shrink-0" />
        </div>
      )}

      {/* Vault list (drag to reorder priority) */}
      {vault.length > 0 && (
        <div>
          <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
            Key Vault — order = failover priority (drag to reorder)
          </p>
          <div className="space-y-2">
            {vault.map((profile, index) => {
              const def = getProviderDef(profile.provider);
              const isActive = profile.id === activeId;
              return (
                <div
                  key={profile.id}
                  draggable
                  onDragStart={() => setDragId(profile.id ?? null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(profile.id ?? "")}
                  onDragEnd={() => setDragId(null)}
                  className={`flex items-center gap-2 p-2.5 rounded-[10px] ring-1 transition-all cursor-grab active:cursor-grabbing ${
                    isActive
                      ? "bg-primary/5 ring-primary/30"
                      : "bg-surface-container-low ring-[rgba(229,226,218,0.4)]"
                  } ${dragId === profile.id ? "opacity-50" : ""}`}
                >
                  <GripVertical className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                  <span className="text-[0.625rem] font-mono font-bold text-on-surface-variant/50 w-4">
                    {index + 1}
                  </span>
                  <ProviderAvatar def={def} providerId={profile.provider} size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-on-background truncate">
                      {profile.label || profile.provider}
                      <span className="ml-1.5 font-medium text-on-surface-variant/70">
                        {profile.model}
                      </span>
                    </p>
                    <p className="text-[0.5625rem] font-mono text-on-surface-variant/40 truncate">
                      {profile.apiKey.slice(0, 6)}...{profile.apiKey.slice(-4)}
                    </p>
                  </div>
                  {!isActive ? (
                    <button
                      onClick={() => handleSetActive(profile)}
                      title="Set active"
                      className="p-1.5 rounded-[6px] text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[0.5625rem] font-bold uppercase tracking-widest">
                      Active
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(profile.id ?? "")}
                    title="Remove"
                    className="p-1.5 rounded-[6px] text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          {vault.length > 1 && (
            <button
              onClick={() => {
                clearVault();
                refresh();
              }}
              className="mt-2 text-[0.625rem] font-bold uppercase tracking-widest font-mono text-on-surface-variant/40 hover:text-error transition-colors"
            >
              Clear entire vault
            </button>
          )}
        </div>
      )}

      {/* Provider picker */}
      <div>
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
          <Plus className="w-3 h-3 inline mr-1 -mt-0.5" />
          Add a provider
        </p>
        <ProviderGrid
          selectedId={selectedDef?.id ?? null}
          onSelect={handleProviderSelect}
          compact
        />
      </div>

      {/* Config form for selected provider */}
      {selectedDef && (
        <div className="space-y-4 p-4 rounded-[12px] bg-surface-container-low ring-1 ring-[rgba(229,226,218,0.4)]">
          <div className="flex items-center gap-2.5">
            <ProviderAvatar def={selectedDef} providerId={selectedDef.id} size={32} />
            <div>
              <p className="text-sm font-bold text-on-background">{selectedDef.name}</p>
              {selectedDef.keyUrl && (
                <a
                  href={selectedDef.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> Get API Key
                </a>
              )}
            </div>
            {selectedDef.freeTier && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[0.5625rem] font-bold uppercase tracking-widest">
                Free Tier
              </span>
            )}
          </div>

          {/* API key */}
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder={selectedDef.keyHint ?? "Paste your API key"}
              className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm font-mono text-on-background placeholder:text-on-surface-variant/40 outline-none transition-all"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1.5">
              Model
            </label>
            {draft.provider === "ollama" &&
            localModels.filter((m) => m.engine === "ollama").length > 0 ? (
              <select
                value={draft.model}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] px-3 py-2 text-sm font-mono text-on-background outline-none"
              >
                {localModels
                  .filter((m) => m.engine === "ollama")
                  .map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
              </select>
            ) : (
              <>
                <input
                  list="provider-models"
                  value={draft.model}
                  onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                  className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm font-mono text-on-background outline-none transition-all"
                />
                <datalist id="provider-models">
                  {selectedDef.models.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </>
            )}
          </div>

          {/* Base URL (when needed) */}
          {(needsBaseUrl || !selectedDef.baseURL) && (
            <div>
              <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-1.5">
                Base URL {selectedDef.keyHint ? `— ${selectedDef.keyHint}` : "(OpenAI-compatible)"}
              </label>
              <input
                type="text"
                value={draft.baseURL || ""}
                onChange={(e) => setDraft({ ...draft, baseURL: e.target.value })}
                placeholder="https://your-endpoint.com/v1"
                className="w-full rounded-[8px] bg-surface-container-lowest ring-1 ring-[rgba(229,226,218,0.5)] focus:ring-2 focus:ring-primary/30 px-3 py-2 text-sm font-mono text-on-background placeholder:text-on-surface-variant/40 outline-none transition-all"
              />
            </div>
          )}

          {addError && <p className="text-xs font-semibold text-error">{addError}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToVault}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-br from-primary to-primary-container text-on-primary text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-premium transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Add to Vault
            </button>
            <ConnectionTestButton profile={draft} />
          </div>
        </div>
      )}

      {isSaved && (
        <p className="text-xs font-semibold text-secondary flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Added to vault — auto-failover enabled across{" "}
          {vault.length} provider{vault.length > 1 ? "s" : ""}.
        </p>
      )}
    </div>
  );
}
