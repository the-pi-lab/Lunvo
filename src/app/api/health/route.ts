import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return NextResponse.json({
    ok: true,
    version: "2.0.0",
    localMode: !supabaseUrl || supabaseUrl.trim() === "",
    timestamp: new Date().toISOString(),
  });
}
