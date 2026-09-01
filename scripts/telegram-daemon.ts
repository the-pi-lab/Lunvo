#!/usr/bin/env node
/**
 * LUNVO 2.0 — Telegram Long-Polling Daemon
 * Run this script to keep your Telegram Remote Bot listening 24/7 on your local machine.
 *
 * Usage:
 *   npx tsx scripts/telegram-daemon.ts
 *   npm run telegram:bot
 */

import * as fs from "fs";
import * as path from "path";
import { handleTelegramUpdate, type TelegramUpdate } from "../src/lib/telegram/botService";

// Helper to load env files without external dependencies
function loadEnv(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed
              .slice(idx + 1)
              .trim()
              .replace(/^["']|["']$/g, "");
            if (!process.env[key]) process.env[key] = val;
          }
        }
      });
    }
  } catch {
    // ignore
  }
}

loadEnv(path.resolve(process.cwd(), ".env.local"));
loadEnv(path.resolve(process.cwd(), ".env"));

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN is not set in your .env.local file.");
  console.error("💡 Create a bot via @BotFather on Telegram and paste your token in .env.local");
  process.exit(1);
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🚀 LUNVO 2.0 Telegram Long-Polling Daemon");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`🤖 Bot Token: ${token.slice(0, 8)}...${token.slice(-4)}`);
console.log(`🔒 Authorized Chat: ${allowedChatId || "Public / All Chats"}`);
console.log("📡 Listening for commands: /idea, /approve, /trending, /workflow, /status, /queue");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

let offset = 0;
let isRunning = true;

async function pollUpdates() {
  while (isRunning) {
    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Telegram] HTTP error: ${res.status}`);
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }

      const data: { ok: boolean; result: TelegramUpdate[] } = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const sender =
            update.message?.from?.username ||
            update.message?.from?.first_name ||
            update.callback_query?.from?.first_name ||
            "User";
          const text = update.message?.text || update.callback_query?.data || "[Action]";
          console.log(`[Telegram] 📩 Received from ${sender}: "${text}"`);

          // Process update
          await handleTelegramUpdate(update);
        }
      }
    } catch (error: any) {
      if (isRunning) {
        console.error("[Telegram] Polling error:", error?.message || error);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }
}

// Handle termination signals
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping Telegram Daemon gracefully...");
  isRunning = false;
  process.exit(0);
});

process.on("SIGTERM", () => {
  isRunning = false;
  process.exit(0);
});

// Start loop
pollUpdates();
