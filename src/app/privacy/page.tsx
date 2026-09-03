import Link from "next/link";
import Image from "next/image";
import { Check, Shield, Database, Download, Trash2, Edit, Mail, Sparkles } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LUNVO",
  description: "Read how LUNVO protects and governs your creative data.",
};

const SECTIONS = [
  {
    title: "Local-First — Your Data Stays With You",
    bg: "bg-surface",
    content: (
      <>
        <p>
          LUNVO is <b>local-first by default</b>. Drafts, Voice DNA, image styles, news API keys,
          and distribution webhooks are stored in{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
            localStorage
          </code>{" "}
          on this device only. No account, no tracking, no server copy — until you choose to connect
          a cloud.
        </p>
        <ul className="space-y-4 mt-6">
          <DataItem
            icon={<Check />}
            bold="What we store locally:"
            text="Drafts (lunvo_drafts), Voice DNA (lunvo-voice-dna), provider vault (lunvo_ai_profiles), news keys (lunvo_news_key_*), distribution webhooks (lunvo_dist_*), cloud config (lunvo_cloud_*)."
          />
          <DataItem
            icon={<Check />}
            bold="What we never store:"
            text="We never see your API keys. BYOK keys are sent directly from your browser to the AI provider (OpenAI/Gemini/Groq/Ollama) — never via our servers."
          />
          <DataItem
            icon={<Check />}
            bold="Cloud is opt-in:"
            text="Want sync? Connect your own Supabase/Convex/Firebase/Turso/PlanetScale in Dashboard → Cloud. Keys stay on device, we never see them."
          />
        </ul>
      </>
    ),
  },
  {
    title: "AI Architecture & Privacy",
    bg: "bg-surface-container",
    isSpecial: true,
    content: (
      <div className="bg-[#1A1814] text-white p-10 md:p-12 rounded-[16px] relative overflow-hidden">
        <div className="relative z-10 font-mono text-[0.8125rem] space-y-5 opacity-90 leading-relaxed">
          <p className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> ZERO-RETENTION INFERENCE PROTOCOL
          </p>
          <p>
            The LUNVO platform utilizes Large Language Models (LLMs) including Google Gemini 1.5
            Flash and Llama 3 (via Groq) via BYOK.
          </p>
          <p>
            BY DEFAULT, WE EMPLOY ZERO-RETENTION TRANSFERS. YOUR DATA IS SENT FOR REAL-TIME ANALYSIS
            AND GENERATION ONLY. NEITHER WE NOR OUR INFERENCE PARTNERS USE YOUR CREATIVE ASSETS TO
            TRAIN PUBLIC AI MODELS. See provider policies (OpenAI, Google, Groq) for their
            retention.
          </p>
          <p className="text-white/60">
            Tip: Use Ollama/LM Studio locally for 100% offline inference — no data leaves your
            machine.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
      </div>
    ),
  },
  {
    title: "Cookies, Analytics & PostHog (Optional)",
    bg: "bg-surface",
    content: (
      <>
        <p>
          We use <b>no cookies</b> by default. Analytics is <b>off</b> unless you set{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
            NEXT_PUBLIC_POSTHOG_KEY
          </code>
          . When enabled, PostHog loads from{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
            us.i.posthog.com
          </code>{" "}
          with `opt_out_capturing` default — no tracking until you opt in.
        </p>
        <ul className="space-y-4 mt-6">
          <DataItem
            icon={<Shield />}
            bold="Without PostHog:"
            text="Zero tracking, zero cookies, 100% local."
          />
          <DataItem
            icon={<Database />}
            bold="With PostHog:"
            text="Anonymous pageviews + post generation counts only — no post content, no keys, no personal data."
          />
        </ul>
      </>
    ),
  },
  {
    title: "Security & Sovereign Rights",
    bg: "bg-background",
    content: (
      <>
        <p>
          Local data lives in your browser's{" "}
          <code className="px-1.5 py-0.5 rounded bg-surface-container text-xs font-mono">
            localStorage
          </code>{" "}
          (cleared when you clear site data). If you connect a cloud
          (Supabase/Convex/Firebase/Turso/PlanetScale), data is housed in <b>your own project</b>{" "}
          with that provider's AES-256 at rest + TLS 1.3 in transit — we never operate a central DB.
        </p>
        <p className="mt-8">Under GDPR/CCPA/DPDP, you retain full sovereignty:</p>
        <div className="space-y-3 mt-6">
          <RightRow
            icon={<Download className="w-5 h-5 text-primary" />}
            label="Export: Settings → Cloud → Export (JSON)"
          />
          <RightRow
            icon={<Trash2 className="w-5 h-5 text-error" />}
            label="Delete: Clear site data or Cloud → Use local"
          />
          <RightRow
            icon={<Edit className="w-5 h-5 text-primary" />}
            label="Edit: Studio → Voice DNA / Persona"
          />
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/brand/lunvo-logo.png"
            alt="LUNVO logo"
            width={16}
            height={16}
            className="rounded-[3px] object-contain"
          />
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em]">LUNVO</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[0.8125rem] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider font-mono"
          >
            App Dashboard
          </Link>
          <Link
            href="/support"
            className="text-[0.8125rem] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider font-mono"
          >
            Help Center
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[680px] mx-auto px-6 pt-16 pb-12">
        <nav className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-6">
          <span>Legal</span>
          <span className="text-[0.5rem]">›</span>
          <span className="text-primary font-bold">Privacy Protocol</span>
        </nav>
        <h1 className="text-6xl md:text-7xl font-serif leading-tight mb-8">Data Privacy.</h1>
        <p className="text-lg text-on-surface-variant leading-[1.7]">
          We treat your kreative assets with high-signal editorial precision. This policy outlines
          exactly how we govern the intelligence that drives your digital influence.
        </p>
        <div className="mt-8 flex items-center gap-4 text-[0.6875rem] font-mono text-on-surface-variant/40">
          <span className="bg-surface-container px-3 py-1 rounded-[4px]">
            Revision: v2.0.0 (September 2026)
          </span>
        </div>
      </section>

      {/* Sections */}
      <div>
        {SECTIONS.map((s, i) => (
          <section
            key={i}
            className={`${s.bg} py-20 ${i === 0 ? "border-t border-[rgba(229,226,218,0.3)]" : ""}`}
          >
            <div className="max-w-[680px] mx-auto px-6">
              <h2 className="text-4xl font-serif mb-8 text-on-background">{s.title}</h2>
              <div className="text-on-surface-variant leading-[1.7] text-[0.9375rem]">
                {s.content}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Contact CTA */}
      <section className="bg-[#1A1814] text-white py-28 border-t border-white/5">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif mb-8 text-white">Trust Inquiries</h2>
          <p className="opacity-70 mb-12 leading-[1.7]">
            Should you have questions regarding our data governance or wish to exercise your legal
            rights, our specialized team is available for consultation.
          </p>
          <a
            href="mailto:hello@thepilab.in"
            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-[8px] hover:scale-105 transition-transform font-bold"
          >
            <Mail className="w-5 h-5" /> hello@thepilab.in
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-12 border-t border-[rgba(229,226,218,0.3)]">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="font-serif italic text-xl text-on-background">LUNVO</span>
            <p className="text-[0.6875rem] text-on-surface-variant/50 font-mono mt-1">
              © 2026 THE Π LAB. ALL RIGHTS RESERVED.
            </p>
          </div>
          <div className="flex gap-8 text-[0.875rem] font-medium text-on-surface-variant">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span className="text-primary underline underline-offset-4">Privacy Policy</span>
            <a
              href="https://www.thepilab.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              THE Π LAB Website
            </a>
            <a
              href="https://www.linkedin.com/company/the-%CF%80-lab/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              THE Π LAB LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function DataItem({ icon, bold, text }: { icon: React.ReactNode; bold: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="w-5 h-5 text-primary flex-shrink-0 mt-0.5">{icon}</span>
      <span>
        <strong className="text-on-background">{bold}</strong> {text}
      </span>
    </li>
  );
}

function RightRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)] hover:shadow-md transition-shadow">
      <span className="font-medium text-on-background">{label}</span>
      {icon}
    </div>
  );
}
