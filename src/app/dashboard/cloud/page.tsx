"use client";

import { useEffect, useState } from "react";
import { Cloud, Check, ExternalLink, Eye, EyeOff, Database, HardDrive } from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Panel from "@/components/premium/Panel";
import Reveal from "@/components/motion/Reveal";
import {
  CLOUD_PROVIDERS,
  getCloudConfig,
  setCloudConfig,
  getActiveCloudProvider,
  setActiveCloudProvider,
} from "@/lib/cloud/providers";

export default function CloudPage() {
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const m: Record<string, Record<string, string>> = {};
    for (const p of CLOUD_PROVIDERS) {
      m[p.id] = getCloudConfig(p.id) || {};
    }
    setConfigs(m);
    setActive(getActiveCloudProvider());
  }, []);

  const handleSave = (id: string) => {
    setCloudConfig(id, configs[id] || {});
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  };

  const handleActivate = (id: string) => {
    const cfg = configs[id];
    const hasData = cfg && Object.values(cfg).some((v) => v && v.trim());
    if (!hasData) {
      alert("Save credentials first");
      return;
    }
    setActiveCloudProvider(id);
    setActive(id);
  };

  const handleUseLocal = () => {
    setActiveCloudProvider(null);
    setActive(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageHeader
        kicker="Cloud Sync"
        title={
          <>
            Your data, <em className="italic">your cloud.</em>
          </>
        }
        description="Local-first by default. Want cloud sync? Connect your own Supabase, Convex, Firebase, Turso, or PlanetScale — keys stay on this device."
      />

      {/* Local-first banner */}
      <Reveal delay={0.05}>
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50 ring-1 ring-outline-variant/30 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white ring-1 ring-black/5 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-on-background">Local-first — cloud optional</h3>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              By default everything lives in <b>localStorage</b> on this device. No server, no
              tracking. If you clone this repo and want team sync or backup, connect <b>your own</b>{" "}
              cloud — we never see your keys.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono">
              <span
                className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ring-1 ${active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-primary ring-primary/20"}`}
              >
                {active
                  ? `Active: ${CLOUD_PROVIDERS.find((p) => p.id === active)?.name}`
                  : "Active: Local"}
              </span>
              {active && (
                <button onClick={handleUseLocal} className="text-primary hover:underline">
                  Use local
                </button>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4">
        {CLOUD_PROVIDERS.map((p, idx) => {
          const cfg = configs[p.id] || {};
          const isActive = active === p.id;
          const hasConfig = Object.values(cfg).some((v) => v && v.trim());
          return (
            <Reveal key={p.id} delay={idx * 0.04}>
              <Panel
                icon={p.id === "supabase" ? Database : p.id === "convex" ? Cloud : Database}
                eyebrow={hasConfig ? "Configured" : "Not connected"}
                title={p.name}
                subtitle={p.desc}
                aside={
                  isActive ? (
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[0.625rem] font-bold uppercase tracking-widest">
                      Active
                    </span>
                  ) : hasConfig ? (
                    <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-[0.625rem] font-bold uppercase tracking-widest">
                      Saved
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/30 text-[0.625rem] font-bold uppercase tracking-widest">
                      Idle
                    </span>
                  )
                }
              >
                <div className="space-y-3">
                  {p.fields.map((f) => (
                    <div key={f.key}>
                      <label className="kicker block mb-1.5">{f.label}</label>
                      <div className="relative">
                        <input
                          type={
                            f.type === "password" && !visible[`${p.id}-${f.key}`]
                              ? "password"
                              : "text"
                          }
                          value={cfg[f.key] || ""}
                          onChange={(e) =>
                            setConfigs((m) => ({
                              ...m,
                              [p.id]: { ...(m[p.id] || {}), [f.key]: e.target.value },
                            }))
                          }
                          placeholder={f.placeholder}
                          className="w-full rounded-lg bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3.5 py-2.5 pr-10 text-sm font-mono text-on-background outline-none"
                        />
                        {f.type === "password" && (
                          <button
                            onClick={() =>
                              setVisible((v) => ({
                                ...v,
                                [`${p.id}-${f.key}`]: !v[`${p.id}-${f.key}`],
                              }))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant/50 hover:text-primary"
                          >
                            {visible[`${p.id}-${f.key}`] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSave(p.id)}
                      className="px-5 py-2.5 rounded-lg bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 active:scale-[0.98] transition-all"
                    >
                      {saved === p.id ? <Check className="w-4 h-4" /> : "Save"}
                    </button>
                    <button
                      onClick={() => handleActivate(p.id)}
                      disabled={!hasConfig}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ring-1 transition-colors ${isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-primary ring-primary/20 hover:bg-primary/5 disabled:opacity-40"}`}
                    >
                      {isActive ? "Active" : "Use this cloud"}
                    </button>
                    <a
                      href={p.keyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Get key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Panel>
            </Reveal>
          );
        })}
      </div>

      <Panel
        icon={Cloud}
        eyebrow="How it works"
        title="Local-first, cloud when you want"
        subtitle="For GitHub cloners"
      >
        <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
          <p>
            <b className="text-on-background">1. Default:</b> All drafts, Voice DNA, images stay in{" "}
            <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
              localStorage
            </code>{" "}
            — no account, instant.
          </p>
          <p>
            <b className="text-on-background">2. Want cloud?</b> Click <b>Use this cloud</b> above —
            we store a flag{" "}
            <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
              lunvo_cloud_active
            </code>{" "}
            locally. Your app will then sync via your own DB (future: drafts → Supabase table).
          </p>
          <p className="text-xs font-mono text-on-surface-variant/60">
            We never see your keys. Everything stays on this device until you connect.
          </p>
        </div>
      </Panel>
    </div>
  );
}
