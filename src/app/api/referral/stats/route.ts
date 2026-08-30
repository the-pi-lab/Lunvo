import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory leaderboard — local-first, per-instance
// For production with many instances, swap with Upstash Redis via serverLimiter connector
declare global {
  // eslint-disable-next-line no-var
  var __referralStats: Map<string, number> | undefined;
}

function getStore(): Map<string, number> {
  if (!globalThis.__referralStats) {
    globalThis.__referralStats = new Map<string, number>();
    // Seed with demo data for leaderboard preview
    globalThis.__referralStats.set("vinayak", 42);
    globalThis.__referralStats.set("lunvo-early", 31);
    globalThis.__referralStats.set("the-pi-lab", 28);
  }
  return globalThis.__referralStats;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref")?.trim().toLowerCase();
  const store = getStore();

  // If ?ref=CODE is present, count it as a referral hit (idempotent per IP per day could be added)
  if (ref && /^[a-z0-9_-]{3,20}$/.test(ref)) {
    store.set(ref, (store.get(ref) || 0) + 1);
  }

  const leaderboard = Array.from(store.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const total = Array.from(store.values()).reduce((a, b) => a + b, 0);

  return NextResponse.json({
    leaderboard,
    total,
    top: leaderboard[0] || null,
    // For client to show their own code
    yourCode: ref || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code: string = (body.code ?? "").toString().trim().toLowerCase();
    if (!code || !/^[a-z0-9_-]{3,20}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code (3-20 chars, a-z0-9_-)" }, { status: 400 });
    }
    const store = getStore();
    store.set(code, (store.get(code) || 0) + 1);
    return NextResponse.json({ ok: true, code, count: store.get(code) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
