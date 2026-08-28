"use client";

import { useEffect, useState } from "react";
import {
  Newspaper,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Panel from "@/components/premium/Panel";
import Reveal from "@/components/motion/Reveal";
import { NEWS_PROVIDERS, getNewsKey, setNewsKey } from "@/lib/news/providers";

export default function NewsConnectorsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const m: Record<string, string> = {};
    for (const p of NEWS_PROVIDERS) {
      m[p.id] = getNewsKey(p.id) || "";
    }
    setKeys(m);
  }, []);

  const save = (id: string) => {
    setNewsKey(id, keys[id] || "");
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageHeader
        kicker="Connectors"
        title={
          <>
            News <em className="italic">APIs.</em>
          </>
        }
        description="Connect any news API you already pay for. Keys stay on this device. Trending + search will use all connected sources."
      />

      <div className="grid gap-4">
        {NEWS_PROVIDERS.map((p, idx) => (
          <Reveal key={p.id} delay={idx * 0.04}>
            <Panel
              icon={Newspaper}
              eyebrow={p.freeTier ? "Free tier" : "Paid"}
              title={p.name}
              subtitle={`${keys[p.id] ? "Connected" : "Not connected"} — ${p.color}`}
              aside={
                keys[p.id] ? (
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-[0.625rem] font-bold uppercase tracking-widest">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/30 text-[0.625rem] font-bold uppercase tracking-widest">
                    Idle
                  </span>
                )
              }
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={visible[p.id] ? "text" : "password"}
                      value={keys[p.id] || ""}
                      onChange={(e) => setKeys((m) => ({ ...m, [p.id]: e.target.value }))}
                      placeholder="Paste API key"
                      className="w-full rounded-lg bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3.5 py-2.5 pr-10 text-sm font-mono text-on-background outline-none"
                    />
                    <button
                      onClick={() => setVisible((v) => ({ ...v, [p.id]: !v[p.id] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant/50 hover:text-primary"
                    >
                      {visible[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => save(p.id)}
                    className="shrink-0 px-5 py-2.5 rounded-lg bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 active:scale-[0.98] transition-all"
                  >
                    {saved === p.id ? <Check className="w-4 h-4" /> : "Save"}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={p.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Get key <ExternalLink className="w-3 h-3" />
                  </a>
                  {p.docsUrl && (
                    <a
                      href={p.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-on-surface-variant/60 hover:text-primary"
                    >
                      Docs
                    </a>
                  )}
                  <span className="ml-auto text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/40">
                    Stored locally
                  </span>
                </div>
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Panel
        icon={ImageIcon}
        eyebrow="Image studio"
        title="Tip"
        subtitle="News keys also power Image Studio relevancy"
      >
        <p className="text-sm text-on-surface-variant leading-relaxed">
          When you generate in{" "}
          <span className="font-semibold text-on-background">
            Create → Also generate image (Relevancy)
          </span>
          , we pull trending context from all connected news APIs. More keys = richer relevancy, no
          extra cost to us.
        </p>
      </Panel>
    </div>
  );
}
