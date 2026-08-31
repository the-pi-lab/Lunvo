import { NextRequest, NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/botService";

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();
    const result = await handleTelegramUpdate(update);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "LUNVO 2.0 Telegram Bot Webhook Endpoint",
    timestamp: new Date().toISOString(),
  });
}
