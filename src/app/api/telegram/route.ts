import { NextRequest, NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/botService";
import { checkRateLimit, extractClientIp, MINUTE_MS } from "@/lib/ai/serverLimiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = extractClientIp(req);
    const rl = await checkRateLimit(`ip:${ip}:telegram-webhook`, 60, MINUTE_MS);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many webhook requests" }, { status: 429 });
    }

    // Secret token verification if TELEGRAM_WEBHOOK_SECRET is configured
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken) {
      const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
      if (!incomingSecret || incomingSecret !== secretToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const raw: unknown = await req.json().catch(() => null);
    const update = raw as TelegramUpdate;
    if (
      !update ||
      typeof update !== "object" ||
      (typeof update.update_id !== "number" && !update.message && !update.callback_query)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await handleTelegramUpdate(update);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Telegram webhook internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal processing error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "LUNVO 2.0 Telegram Bot Webhook Endpoint",
    timestamp: new Date().toISOString(),
  });
}
