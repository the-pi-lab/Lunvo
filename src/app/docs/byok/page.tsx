export const metadata = { title: "BYOK — LUNVO Docs" };
export default function BYOKPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="kicker">Docs / BYOK</p>
      <h1 className="font-serif text-3xl mt-2">Bring Your Own Key</h1>
      <p className="mt-4 text-sm text-zinc-600">
        48 providers + Ollama local. Keys stay on device, never sent to us.
      </p>
      <pre className="mt-6 p-4 rounded-xl bg-zinc-950 text-white text-xs font-mono overflow-auto">{`import { unifiedAI } from "@/lib/ai/router.unified";
await unifiedAI({ profile, messages: [{role:"user", content:"Write a post"}] });`}</pre>
    </main>
  );
}
