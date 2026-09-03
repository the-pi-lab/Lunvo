import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const report = await req.json().catch(() => null);
    if (process.env.NODE_ENV !== "production" && report) {
      console.warn("CSP Violation Report:", JSON.stringify(report).slice(0, 300));
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
