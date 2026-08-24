import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "2.0.0",
    mode: "local-studio",
    timestamp: new Date().toISOString(),
  });
}
