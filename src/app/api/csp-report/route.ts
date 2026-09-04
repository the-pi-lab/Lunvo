import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Browsers can firehose this endpoint; attackers too. Cap both.
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:csp-report`, 5, MINUTE_MS);
    if (!rl.allowed) return new NextResponse(null, { status: 429 });
    const text = (await req.text().catch(() => "")).slice(0, 4096);
    if (process.env.NODE_ENV !== "production" && text) {
      console.warn("CSP Violation Report:", text.slice(0, 300));
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
