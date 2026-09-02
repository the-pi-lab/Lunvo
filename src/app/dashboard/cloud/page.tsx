"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Database,
  HardDrive,
  Server,
  Activity,
  Terminal,
  Copy,
  Radio,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
} from "lucide-react";
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

const REMOTE_SERVER_KEY = "lunvo_remote_server_url";

export default function CloudPage() {
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // VPS Remote Backend State
  const [remoteUrl, setRemoteUrl] = useState<string>("");
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  useEffect(() => {
    const m: Record<string, Record<string, string>> = {};
    for (const p of CLOUD_PROVIDERS) {
      m[p.id] = getCloudConfig(p.id) || {};
    }
    setConfigs(m);
    setActive(getActiveCloudProvider());

    if (typeof window !== "undefined") {
      setRemoteUrl(localStorage.getItem(REMOTE_SERVER_KEY) || "");
    }
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

  const handleSaveRemoteUrl = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REMOTE_SERVER_KEY, remoteUrl.trim());
      setSaved("remote-vps");
      setTimeout(() => setSaved(null), 1500);
    }
  };

  const handleTestRemotePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const target = remoteUrl.trim() || window.location.origin;
      const res = await fetch(`${target.replace(/\/$/, "")}/api/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setPingResult({
          ok: true,
          message: `Connected! Server is online (v${data.version || "2.0.0"}, Status: Healthy)`,
        });
      } else {
        setPingResult({
          ok: false,
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setPingResult({
        ok: false,
        message: `Connection failed: ${err.message || "Network error. Make sure CORS/ports are open."}`,
      });
    } finally {
      setIsPinging(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <PageHeader
        kicker="Cloud & Infrastructure"
        title={
          <>
            Your data, <em className="italic">your infrastructure.</em>
          </>
        }
        description="Run 100% locally on your laptop, or deploy a 24/7 dedicated VPS backend cluster for continuous Telegram bots, scheduled webhooks, and team sync."
      />

      {/* 1. VPS & Dedicated Server Cluster */}
      <Reveal delay={0.05}>
        <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-300">
                  Dedicated Hosting
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  24/7 Dedicated VPS & Cloud Backend Server
                </h3>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold font-mono uppercase">
              Production Ready
            </span>
          </div>

          <p className="text-sm text-blue-100/80 leading-relaxed max-w-2xl">
            Want to run LUNVO 24/7 without keeping your laptop awake? Host the backend on any Linux
            VPS (DigitalOcean, Hetzner, AWS, Fly.io, Railway) to keep the <b>Telegram Bot</b> and{" "}
            <b>Outbound Webhook Dispatcher</b> running continuously.
          </p>

          {/* Remote Endpoint Config */}
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-200 font-mono">
              Remote VPS API Endpoint (Optional)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="https://lunvo-backend.yourdomain.com (Leave empty for local origin)"
                className="flex-1 bg-black/40 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-white/30 border border-white/15 focus:outline-none focus:border-blue-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveRemoteUrl}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  {saved === "remote-vps" ? "Saved!" : "Save"}
                </button>
                <button
                  onClick={handleTestRemotePing}
                  disabled={isPinging}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/15 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPinging ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Test Health</span>
                </button>
              </div>
            </div>

            {pingResult && (
              <div
                className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                  pingResult.ok
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                }`}
              >
                {pingResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{pingResult.message}</span>
              </div>
            )}
          </div>

          {/* Quick VPS Provisioning Snippets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-200 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>1-Command VPS Deployment Options</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Option A: Docker Compose */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white font-mono">1. Docker Compose (VPS)</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          "git clone https://github.com/the-pi-lab/Lunvo.git && cd Lunvo && docker compose -f docker-compose.prod.yml up -d --build",
                          "docker"
                        )
                      }
                      className="text-blue-300 hover:text-white"
                    >
                      {copiedSnippet === "docker" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-black/60 font-mono text-[11px] text-blue-200 overflow-x-auto whitespace-pre-wrap">
                    docker compose -f docker-compose.prod.yml up -d --build
                  </pre>
                </div>
              </div>

              {/* Option B: PM2 Cluster */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white font-mono">2. PM2 Cluster & Daemon</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          "npm run build && pm2 start ecosystem.config.js && pm2 save",
                          "pm2"
                        )
                      }
                      className="text-blue-300 hover:text-white"
                    >
                      {copiedSnippet === "pm2" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-black/60 font-mono text-[11px] text-blue-200 overflow-x-auto whitespace-pre-wrap">
                    pm2 start ecosystem.config.js && pm2 save
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 2. Local-first banner */}
      <Reveal delay={0.08}>
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50 ring-1 ring-outline-variant/30 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white ring-1 ring-black/5 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-on-background">
              Local-First Storage & Database Bridge
            </h3>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              By default, all drafts, templates, and Voice DNA live in <b>localStorage</b> on this
              device. If you want multi-device cloud synchronization or team database backups,
              connect your own Supabase, Convex, or Firebase account.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono">
              <span
                className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ring-1 ${active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-primary ring-primary/20"}`}
              >
                {active
                  ? `Active Database: ${CLOUD_PROVIDERS.find((p) => p.id === active)?.name}`
                  : "Active Database: Local Storage"}
              </span>
              {active && (
                <button onClick={handleUseLocal} className="text-primary hover:underline">
                  Reset to local
                </button>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* 3. Database Providers Grid */}
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-background"
                            type="button"
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

                  <div className="flex items-center justify-between pt-2">
                    <a
                      href={p.docsUrl || p.keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <span>Provider setup guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-background transition-colors"
                      >
                        {saved === p.id ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={() => handleActivate(p.id)}
                        disabled={isActive}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                      >
                        {isActive ? "Connected" : "Connect"}
                      </button>
                    </div>
                  </div>
                </div>
              </Panel>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
