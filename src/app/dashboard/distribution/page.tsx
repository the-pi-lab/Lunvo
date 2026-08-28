"use client";

import { useEffect, useState } from "react";
import {
  Share2,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Twitter,
  MessageSquare,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Panel from "@/components/premium/Panel";
import Reveal from "@/components/motion/Reveal";

type Platform = "zapier" | "twitter" | "reddit";

const CONNECTORS: {
  id: Platform;
  name: string;
  desc: string;
  placeholder: string;
  keyUrl: string;
  color: string;
}[] = [
  {
    id: "zapier",
    name: "Zapier (LinkedIn)",
    desc: "Paste your Zap webhook URL — we POST {text, image} to YOUR Zap, it posts to YOUR LinkedIn",
    placeholder: "https://hooks.zapier.com/hooks/catch/...",
    keyUrl: "https://zapier.com/shared/lunvo-linkedin-template",
    color: "#FF4A00",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    desc: "BYOK — paste Bearer token from developer.twitter.com (App → Keys)",
    placeholder: "AAAAAAAAAAAAAAAA...",
    keyUrl: "https://developer.twitter.com/en/portal/dashboard",
    color: "#1DA1F2",
  },
  {
    id: "reddit",
    name: "Reddit",
    desc: "BYOK — paste OAuth token (script app) or webhook",
    placeholder: " paste token or https://hooks...",
    keyUrl: "https://www.reddit.com/prefs/apps",
    color: "#FF4500",
  },
];

const PREFIX = "lunvo_dist_";

export default function DistributionPage() {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const m: Record<string, string> = {};
    for (const c of CONNECTORS) m[c.id] = localStorage.getItem(`${PREFIX}${c.id}`) || "";
    setVals(m);
  }, []);

  const save = (id: string) => {
    localStorage.setItem(`${PREFIX}${id}`, (vals[id] || "").trim());
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  };

  const test = async (id: string) => {
    const url = vals[id];
    if (!url) return alert("Paste webhook/token first");
    try {
      // For Zapier, POST test payload
      if (id === "zapier") {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "linkedin",
            content: "Test from LUNVO — ignore",
            source: "test",
          }),
          mode: "no-cors",
        });
        alert("Sent test to Zapier (check Zap history)");
      } else {
        alert("Saved — will be used on Post via Connector");
      }
    } catch (e) {
      alert("Test failed: " + (e as Error).message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageHeader
        kicker="Distribution"
        title={
          <>
            Ship <em className="italic">everywhere.</em>
          </>
        }
        description="BYOC — your keys, your accounts. LinkedIn via Zapier (your webhook), Twitter/Reddit direct. No central API approval needed."
      />

      <div className="grid gap-4">
        {CONNECTORS.map((c, idx) => (
          <Reveal key={c.id} delay={idx * 0.04}>
            <Panel
              icon={c.id === "zapier" ? Zap : c.id === "twitter" ? Twitter : MessageSquare}
              eyebrow={vals[c.id] ? "Connected" : "Not connected"}
              title={c.name}
              subtitle={c.desc}
              aside={
                vals[c.id] ? (
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
                      type={visible[c.id] ? "text" : "password"}
                      value={vals[c.id] || ""}
                      onChange={(e) => setVals((m) => ({ ...m, [c.id]: e.target.value }))}
                      placeholder={c.placeholder}
                      className="w-full rounded-lg bg-surface-container-low ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30 px-3.5 py-2.5 pr-10 text-sm font-mono text-on-background outline-none"
                    />
                    <button
                      onClick={() => setVisible((v) => ({ ...v, [c.id]: !v[c.id] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant/50 hover:text-primary"
                    >
                      {visible[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => save(c.id)}
                    className="shrink-0 px-5 py-2.5 rounded-lg bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 active:scale-[0.98] transition-all"
                  >
                    {saved === c.id ? <Check className="w-4 h-4" /> : "Save"}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={c.keyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Get key <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => test(c.id)}
                    className="ml-auto text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary"
                  >
                    Test
                  </button>
                  <span className="text-[0.625rem] font-mono uppercase tracking-widest text-on-surface-variant/40">
                    Stored locally
                  </span>
                </div>
                {c.id === "zapier" && (
                  <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                    Create Zap: Trigger <b>Catch Hook</b> → Action <b>LinkedIn Create Share</b>.
                    Copy webhook URL, paste above. Each user uses <b>their own</b> Zap (free 100
                    tasks/month ≈ 3 posts/day).
                  </p>
                )}
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Panel
        icon={Share2}
        eyebrow="How it ships"
        title="1 post → 3 platforms"
        subtitle="Full machine"
      >
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Write once in <b>Create</b>, generate image in <b>Image Studio</b> (toggle
          Relevancy/Prompt), then <b>Distribute</b>:{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">Copy</code>{" "}
          +{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
            Share
          </code>{" "}
          +{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
            Connector
          </code>
          . Repurpose page will also use these connectors for Thread/Newsletter/Video.
        </p>
      </Panel>
    </div>
  );
}
