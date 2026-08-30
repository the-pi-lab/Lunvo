export const metadata = { title: "API — LUNVO Docs" };
export default function APIPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <p className="kicker">Docs / API</p>
      <h1 className="font-serif text-3xl mt-2">API Reference</h1>
      <p className="mt-4 text-sm text-zinc-600">unifiedAI + MCP tools (read-only).</p>
      <pre className="mt-6 p-4 rounded-xl bg-zinc-950 text-white text-xs font-mono overflow-auto">{`// MCP
npx lunvo-mcp
// tools: search_trending({query, limit}), analyze_draft({content})`}</pre>
    </main>
  );
}
