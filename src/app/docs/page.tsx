import Link from "next/link";

export const metadata = {
  title: "Docs — LUNVO",
  description: "BYOK, Self-Host, and API guides",
};

export default function DocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="kicker mb-3">Docs</p>
      <h1 className="font-serif text-4xl font-medium tracking-tight text-zinc-900">LUNVO Docs</h1>
      <p className="mt-3 text-zinc-600 leading-relaxed">
        BYOK, Self-Host, and API — hosted at <b>lunvo-tawny.vercel.app/docs</b>. Local-first, 0% vendor
        lock-in.
      </p>

      <div className="mt-10 grid gap-4">
        <Link
          href="/docs/self-host"
          className="group block rounded-2xl bg-white ring-1 ring-zinc-200 p-6 hover:ring-zinc-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="text-xs font-bold uppercase tracking-widest text-violet-600 font-mono">
            Self-Host
          </div>
          <div className="font-serif text-xl mt-1">Self-Host in 3 Steps</div>
          <div className="text-sm text-zinc-600 mt-2">
            Clone → Env → Run (local or Docker). No cloud needed.
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-zinc-900">
            Open →
          </div>
        </Link>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/docs/byok"
            className="group block rounded-2xl bg-white ring-1 ring-zinc-200 p-6 hover:ring-zinc-300 transition-all"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 font-mono">
              BYOK
            </div>
            <div className="font-serif text-lg mt-1">Bring Your Own Key</div>
            <div className="text-sm text-zinc-600 mt-1">
              48 providers + Ollama. Keys stay on device.
            </div>
          </Link>
          <Link
            href="/docs/api"
            className="group block rounded-2xl bg-white ring-1 ring-zinc-200 p-6 hover:ring-zinc-300 transition-all"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
              API
            </div>
            <div className="font-serif text-lg mt-1">API Reference</div>
            <div className="text-sm text-zinc-600 mt-1">unifiedAI() + MCP tools.</div>
          </Link>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-zinc-950 text-white p-8">
        <div className="text-xs font-bold uppercase tracking-widest text-white/50 font-mono">
          Self-Host — 3 Steps
        </div>
        <ol className="mt-3 space-y-2 text-sm text-white/80 list-decimal list-inside">
          <li>
            <span className="font-mono text-white">
              git clone https://github.com/the-pi-lab/Lunvo.git && cd Lunvo
            </span>
          </li>
          <li>
            <span className="font-mono text-white">cp .env.example .env.local</span> — paste{" "}
            <b>GEMINI_API_KEY</b> or <b>GROQ_API_KEY</b>
          </li>
          <li>
            <span className="font-mono text-white">npm install && npm run dev</span> —{" "}
            <b>http://localhost:3000</b> or{" "}
            <span className="font-mono">chmod +x setup.sh && ./setup.sh</span> → Docker
          </li>
        </ol>
        <div className="mt-4 text-xs font-mono text-white/40">Verified: docs/self-host 3 steps</div>
      </div>

      <p className="text-center kicker mt-10">lunvo-tawny.vercel.app/docs — live</p>
    </main>
  );
}
