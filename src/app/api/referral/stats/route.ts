import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, extractClientIp, DAY_MS } from "@/lib/ai/serverLimiter";

export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __referralStats: Map<string, { count: number; isDemo?: boolean }> | undefined;
  // eslint-disable-next-line no-var
  var __referralIps: Set<string> | undefined;
}

function getStore(): Map<string, { count: number; isDemo?: boolean }> {
  if (!globalThis.__referralStats) {
    globalThis.__referralStats = new Map<string, { count: number; isDemo?: boolean }>();
    // Seed with preview/demo data
    globalThis.__referralStats.set("vinayak", { count: 42, isDemo: true });
    globalThis.__referralStats.set("lunvo-early", { count: 31, isDemo: true });
    globalThis.__referralStats.set("the-pi-lab", { count: 28, isDemo: true });
  }
  return globalThis.__referralStats;
}

function getIpStore(): Set<string> {
  if (!globalThis.__referralIps) {
    globalThis.__referralIps = new Set<string>();
  }
  return globalThis.__referralIps;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref")?.trim().toLowerCase();
  const store = getStore();

  const leaderboard = Array.from(store.entries())
    .map(([code, data]) => ({ code, count: data.count, isDemo: !!data.isDemo }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const total = Array.from(store.values()).reduce((a, b) => a + b.count, 0);

  return NextResponse.json({
    leaderboard,
    total,
    top: leaderboard[0] || null,
    yourCode: ref || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ref:${ip}`, 5, DAY_MS);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const code: string = (body.code ?? "").toString().trim().toLowerCase();

    if (!code || !/^[a-z0-9_-]{3,20}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid referral code (3-20 chars, a-z0-9_-)" },
        { status: 400 }
      );
    }

    const ipKey = `${ip}:${code}`;
    const ipStore = getIpStore();
    if (ipStore.has(ipKey)) {
      // Deduplicated hit
      const store = getStore();
      return NextResponse.json({
        ok: true,
        code,
        count: store.get(code)?.count || 0,
        deduplicated: true,
      });
    }

    ipStore.add(ipKey);
    const store = getStore();
    const current = store.get(code) || { count: 0, isDemo: false };
    store.set(code, { count: current.count + 1, isDemo: false });

    return NextResponse.json({ ok: true, code, count: current.count + 1 });
  } catch {
    return NextResponse.json({ error: "Invalid referral request" }, { status: 500 });
  }
}
