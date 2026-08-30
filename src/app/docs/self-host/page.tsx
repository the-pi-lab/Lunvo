export const metadata = { title: "Self-Host — LUNVO Docs" };

export default function SelfHostPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="kicker">Docs / Self-Host</p>
      <h1 className="font-serif text-3xl mt-2">Self-Host in 3 Steps</h1>
      <ol className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-700 list-decimal list-inside">
        <li>
          <b>Clone:</b>{" "}
          <code className="px-2 py-1 rounded bg-zinc-100 font-mono text-xs">
            git clone https://github.com/the-pi-lab/Lunvo.git && cd Lunvo
          </code>
        </li>
        <li>
          <b>Env:</b>{" "}
          <code className="px-2 py-1 rounded bg-zinc-100 font-mono text-xs">
            cp .env.example .env.local
          </code>{" "}
          — paste <b>GEMINI_API_KEY</b> or <b>GROQ_API_KEY</b> (or use Dashboard → Studio →
          Providers, localStorage).
        </li>
        <li>
          <b>Run:</b>{" "}
          <code className="px-2 py-1 rounded bg-zinc-100 font-mono text-xs">
            npm install && npm run dev
          </code>{" "}
          → <b>http://localhost:3000</b> or{" "}
          <code className="px-2 py-1 rounded bg-zinc-100 font-mono text-xs">
            chmod +x setup.sh && ./setup.sh
          </code>{" "}
          → Docker <code>node:20-alpine</code> <code>http://localhost:3000</code>
        </li>
      </ol>
      <p className="mt-6 text-xs font-mono text-zinc-500">
        Verified: curl http://localhost:3000/api/health → {"{ok:true}"}
      </p>
    </main>
  );
}
