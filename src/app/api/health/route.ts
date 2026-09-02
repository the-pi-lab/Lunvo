import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "LUNVO Autonomous OS Server",
    version: "2.0.0",
    mode: "server-cluster",
    timestamp: new Date().toISOString(),
    services: {
      api: "healthy",
      router: "active",
      scheduler: "ready",
      telegramBot: process.env.TELEGRAM_BOT_TOKEN ? "configured" : "unconfigured",
      mcp: "supported",
    },
  });
}
