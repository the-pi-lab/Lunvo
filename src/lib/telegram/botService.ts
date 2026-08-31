/**
 * LUNVO 2.0 — 24/7 Telegram Remote Bot Service
 * Enables smartphone control of your locally-hosted or cloud LUNVO server.
 */

import { runContentPipeline } from "@/lib/ai/agents/orchestrator";
import { searchTrendingArticles } from "@/lib/rss/searchService";
import { executeWorkflow } from "@/lib/workflow/workflowRunner";
import { PREBUILT_WORKFLOWS } from "@/lib/workflow/templates";
import type { AIProfile } from "@/lib/ai/types";

export interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name?: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

function getTelegramConfig() {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    allowedChatId: process.env.TELEGRAM_CHAT_ID || "",
  };
}

function getFallbackAIProfile(): AIProfile {
  const provider = process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? "groq" : "gemini");
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";
  const model =
    process.env.AI_MODEL || (provider === "groq" ? "llama-3.3-70b-versatile" : "gemini-1.5-flash");

  return {
    id: "telegram-bot-profile",
    label: "Telegram Bot Profile",
    provider: provider as any,
    apiKey,
    model,
  };
}

/**
 * Sends a message back to a Telegram chat.
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
): Promise<boolean> {
  const { botToken } = getTelegramConfig();
  if (!botToken) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Telegram send failed:", error);
    return false;
  }
}

/**
 * Handles incoming Telegram bot updates and commands.
 */
export async function handleTelegramUpdate(
  update: TelegramUpdate
): Promise<{ handled: boolean; reply?: string }> {
  const msg = update.message;
  if (!msg || !msg.text) return { handled: false };

  const chatId = msg.chat.id;
  const rawText = msg.text.trim();
  const { allowedChatId } = getTelegramConfig();

  // Security check: If allowedChatId is configured, only respond to authorized owner
  if (allowedChatId && String(chatId) !== String(allowedChatId)) {
    await sendTelegramMessage(
      chatId,
      "⚠️ *Unauthorized Access:* This LUNVO server is locked to its owner."
    );
    return { handled: true, reply: "Unauthorized" };
  }

  // Command: /start or /help
  if (rawText.startsWith("/start") || rawText.startsWith("/help")) {
    const helpText = `🚀 *LUNVO 2.0 Autonomous Bot*

*Available Commands:*
• \`/idea <topic>\` — Generate full 3-Agent LinkedIn post
• \`/trending\` — Fetch today's top 5 AI & tech trends
• \`/workflow <id>\` — Run an n8n workflow (e.g. \`rss-tech-trends\`)
• \`/status\` — Server health and active AI profile
• \`/queue\` — View scheduled posts queue

_Your Keys · Your Server · 100% Zero-Ban_`;
    await sendTelegramMessage(chatId, helpText);
    return { handled: true, reply: helpText };
  }

  // Command: /status
  if (rawText.startsWith("/status")) {
    const profile = getFallbackAIProfile();
    const statusText = `🟢 *LUNVO 2.0 Server Online*
• *Active Provider:* \`${profile.provider}\`
• *Active Model:* \`${profile.model}\`
• *Status:* Ready for Autonomous Ingestion & Scheduling`;
    await sendTelegramMessage(chatId, statusText);
    return { handled: true, reply: statusText };
  }

  // Command: /trending
  if (rawText.startsWith("/trending")) {
    await sendTelegramMessage(
      chatId,
      "🔍 *Fetching trending articles across Hacker News, Dev.to, GitHub...*"
    );
    try {
      const result = await searchTrendingArticles("AI technology", 5);
      const items = result.articles
        .map((a, i) => `${i + 1}. *${a.title}* (${a.source})\n🔗 ${a.link}`)
        .join("\n\n");
      const reply = `🔥 *Top Trending Tech Today:*\n\n${items}`;
      await sendTelegramMessage(chatId, reply);
      return { handled: true, reply };
    } catch (e: any) {
      await sendTelegramMessage(chatId, `❌ *Failed to fetch trends:* ${e?.message}`);
      return { handled: true };
    }
  }

  // Command: /idea <topic>
  if (rawText.startsWith("/idea")) {
    const topic = rawText.replace(/^\/idea\s*/i, "").trim();
    if (!topic) {
      await sendTelegramMessage(chatId, "💡 *Usage:* `/idea Next.js 15 Partial Prerendering`");
      return { handled: true };
    }

    await sendTelegramMessage(
      chatId,
      `🧠 *Running 3-Agent Pipeline for:* _${topic}_...\n\n⏳ Scout ➔ Writer ➔ Critic`
    );

    try {
      const profile = getFallbackAIProfile();
      const result = await runContentPipeline(profile, topic, null);

      const reply = `✨ *LUNVO Generation Complete!* (Score: *${result.finalScore}/100*)\n\n━━━━━━━━━━━━━━━━━━━━\n\n${result.improvedPost}\n\n━━━━━━━━━━━━━━━━━━━━\n\n💡 *Critique:* ${result.critiqueNotes.join(" · ")}`;
      await sendTelegramMessage(chatId, reply);
      return { handled: true, reply };
    } catch (e: any) {
      await sendTelegramMessage(chatId, `❌ *Pipeline Error:* ${e?.message}`);
      return { handled: true };
    }
  }

  // Command: /workflow <id>
  if (rawText.startsWith("/workflow")) {
    const parts = rawText
      .replace(/^\/workflow\s*/i, "")
      .trim()
      .split(/\s+(.+)/);
    const workflowId = parts[0] || "rss-tech-trends";
    const customTopic = parts[1] || "AI technology";

    const target =
      PREBUILT_WORKFLOWS.find((w) => w.metadata.id === workflowId) || PREBUILT_WORKFLOWS[0];
    await sendTelegramMessage(chatId, `⚡ *Executing Workflow:* _${target!.metadata.name}_...`);

    try {
      const profile = getFallbackAIProfile();
      const result = await executeWorkflow({
        workflow: target!,
        profile,
        topic: customTopic,
      });

      const reply = `✅ *Workflow ${target!.metadata.name} Finished!*\n\n${result.currentDraft || "Workflow completed successfully."}`;
      await sendTelegramMessage(chatId, reply);
      return { handled: true, reply };
    } catch (e: any) {
      await sendTelegramMessage(chatId, `❌ *Workflow Error:* ${e?.message}`);
      return { handled: true };
    }
  }

  // Default fallback for plain messages
  await sendTelegramMessage(
    chatId,
    `🤖 *Got it!* Type \`/idea ${rawText}\` to generate a post from this thought.`
  );
  return { handled: true };
}
