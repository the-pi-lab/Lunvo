/**
 * LUNVO 2.0 — 24/7 Telegram Remote Bot Service
 * Complete stateful smartphone control of your local or cloud LUNVO instance.
 */

import { runContentPipeline } from "@/lib/ai/agents/orchestrator";
import { searchTrendingArticles } from "@/lib/rss/searchService";
import { executeWorkflow } from "@/lib/workflow/workflowRunner";
import { PREBUILT_WORKFLOWS } from "@/lib/workflow/templates";
import { humanizeLocal, isHumanScore } from "@/lib/ai/humanizer";
import { saveScheduledPost, getScheduledQueue } from "@/lib/scheduler/queueStore";
import type { AIProfile } from "@/lib/ai/types";
import type { ScheduledPost } from "@/lib/scheduler/types";

export interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name?: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
}

export interface TelegramCallbackQuery {
  id: string;
  from: { id: number; first_name?: string; username?: string };
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

// In-memory cache of recent generated drafts per chat for interactive approve/humanize flows
export const lastDraftCache: Record<
  string | number,
  {
    topic: string;
    post: string;
    score: number;
    timestamp: number;
  }
> = {};

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
 * Sends a standard Markdown/HTML message to Telegram.
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
 * Sends a message with interactive Inline Keyboard Buttons.
 */
export async function sendTelegramWithKeyboard(
  chatId: number | string,
  text: string,
  keyboard: InlineKeyboardButton[][],
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
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Telegram keyboard send failed:", error);
    return false;
  }
}

export function escapeTelegramMarkdown(text: string): string {
  if (!text) return "";
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

/**
 * Handles incoming Telegram bot updates and commands.
 */
export async function handleTelegramUpdate(
  update: TelegramUpdate
): Promise<{ handled: boolean; reply?: string }> {
  // Extract effective chat ID from message or callback query
  const incomingChatId =
    update.message?.chat.id ??
    update.callback_query?.message?.chat.id ??
    update.callback_query?.from?.id;
  const { allowedChatId } = getTelegramConfig();

  // Security check: If allowedChatId is configured, strictly enforce on all messages and callbacks
  if (allowedChatId && incomingChatId && String(incomingChatId) !== String(allowedChatId)) {
    await sendTelegramMessage(
      incomingChatId,
      "⚠️ *Unauthorized Access:* This LUNVO server is locked to its owner."
    );
    return { handled: true, reply: "Unauthorized" };
  }

  // 1. Handle Callback Query (Button clicks)
  if (update.callback_query) {
    return handleCallbackQuery(update.callback_query);
  }

  const msg = update.message;
  if (!msg || !msg.text) return { handled: false };

  const chatId = msg.chat.id;
  const rawText = msg.text.trim();

  // Command: /start or /help
  if (rawText.startsWith("/start") || rawText.startsWith("/help")) {
    const helpText = `🚀 *LUNVO 2.0 Autonomous Telegram Remote*

*Core Commands:*
• \`/idea <topic>\` — Generate 3-Agent post with live score
• \`/approve\` — Queue last generated draft for webhook dispatch
• \`/humanize\` — Strip AI clichés & enhance burstiness
• \`/trending\` — Fetch top 5 AI & tech news trends
• \`/workflow <id>\` — Trigger an n8n workflow (e.g. \`rss-tech-trends\`)
• \`/queue\` — View scheduled posts queue
• \`/status\` — Local machine uptime & active AI model

_Local-First · Zero-Ban · Autonomous Content OS_`;

    const keyboard: InlineKeyboardButton[][] = [
      [
        { text: "🔥 Trending Tech", callback_data: "cmd_trending" },
        { text: "⚡ Status", callback_data: "cmd_status" },
      ],
      [{ text: "📋 View Queue", callback_data: "cmd_queue" }],
    ];

    await sendTelegramWithKeyboard(chatId, helpText, keyboard);
    return { handled: true, reply: helpText };
  }

  // Command: /status
  if (rawText.startsWith("/status")) {
    const profile = getFallbackAIProfile();
    const queue = getScheduledQueue();
    const statusText = `🟢 *LUNVO 2.0 Local Engine Online*
• *Active Provider:* \`${profile.provider}\`
• *Active Model:* \`${profile.model}\`
• *Queued Posts:* \`${queue.filter((p) => p.status === "queued").length}\`
• *Uptime:* System responsive & listening 24/7`;
    await sendTelegramMessage(chatId, statusText);
    return { handled: true, reply: statusText };
  }

  // Command: /queue
  if (rawText.startsWith("/queue")) {
    const queue = getScheduledQueue().filter((p) => p.status === "queued");
    if (queue.length === 0) {
      const reply = `📭 *Scheduled Queue is Empty*\n\nUse \`/idea <topic>\` to generate a post and click *Approve* to queue it.`;
      await sendTelegramMessage(chatId, reply);
      return { handled: true, reply };
    }

    const items = queue
      .slice(0, 5)
      .map(
        (p, i) =>
          `${i + 1}. *${p.title}*\n⏰ \`${new Date(p.scheduledTime).toLocaleString()}\` (Score: ${p.criticScore || 90}/100)`
      )
      .join("\n\n");

    const reply = `📅 *Upcoming Scheduled Posts (${queue.length}):*\n\n${items}`;
    await sendTelegramMessage(chatId, reply);
    return { handled: true, reply };
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

  // Command: /humanize
  if (rawText.startsWith("/humanize")) {
    const cached = lastDraftCache[chatId];
    if (!cached) {
      const reply = "⚠️ *No recent draft found.* Generate a post first using `/idea <topic>`.";
      await sendTelegramMessage(chatId, reply);
      return { handled: true, reply };
    }

    const cleaned = humanizeLocal(cached.post);
    const humanScore = isHumanScore(cleaned);
    cached.post = cleaned;

    const reply = `🛡️ *Humanized Post* (Human Score: *${humanScore}%*)\n\n━━━━━━━━━━━━━━━━━━━━\n\n${cleaned}\n\n━━━━━━━━━━━━━━━━━━━━`;
    const keyboard: InlineKeyboardButton[][] = [
      [
        { text: "🚀 Approve & Schedule", callback_data: "approve_draft" },
        { text: "❌ Discard", callback_data: "discard_draft" },
      ],
    ];
    await sendTelegramWithKeyboard(chatId, reply, keyboard);
    return { handled: true, reply };
  }

  // Command: /approve
  if (rawText.startsWith("/approve")) {
    const cached = lastDraftCache[chatId];
    if (!cached) {
      const reply = "⚠️ *No recent draft found.* Generate a post first with `/idea <topic>`.";
      await sendTelegramMessage(chatId, reply);
      return { handled: true, reply };
    }

    // Schedule for tomorrow 09:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const newPost: ScheduledPost = {
      id: `tg-${Date.now()}`,
      title: cached.topic.slice(0, 40),
      content: cached.post,
      criticScore: cached.score,
      scheduledTime: tomorrow.toISOString(),
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      source: "telegram",
    };

    saveScheduledPost(newPost);
    delete lastDraftCache[chatId];

    const reply = `✅ *Post Approved & Queued!*\n\n⏰ Scheduled for: \`${tomorrow.toLocaleString()}\`\n\nWill automatically dispatch to your active Zapier / Make webhook.`;
    await sendTelegramMessage(chatId, reply);
    return { handled: true, reply };
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

      // Cache draft
      lastDraftCache[chatId] = {
        topic,
        post: result.improvedPost,
        score: result.finalScore,
        timestamp: Date.now(),
      };

      const reply = `✨ *LUNVO Generation Complete!* (Score: *${result.finalScore}/100*)\n\n━━━━━━━━━━━━━━━━━━━━\n\n${result.improvedPost}\n\n━━━━━━━━━━━━━━━━━━━━\n\n💡 *Critique:* ${result.critiqueNotes.join(" · ")}`;

      const keyboard: InlineKeyboardButton[][] = [
        [
          { text: "🚀 Approve & Schedule", callback_data: "approve_draft" },
          { text: "🛡️ Humanize", callback_data: "humanize_draft" },
        ],
        [{ text: "❌ Discard", callback_data: "discard_draft" }],
      ];

      await sendTelegramWithKeyboard(chatId, reply, keyboard);
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

  // Fallback for casual messages
  await sendTelegramMessage(
    chatId,
    `🤖 *Got your message!* Type \`/idea ${rawText}\` to turn this into a viral LinkedIn post.`
  );
  return { handled: true };
}

/**
 * Handles button clicks (Callback Queries) from Inline Keyboards.
 */
async function handleCallbackQuery(
  callbackQuery: TelegramCallbackQuery
): Promise<{ handled: boolean; reply?: string }> {
  const chatId = callbackQuery.message?.chat.id;
  const action = callbackQuery.data;
  if (!chatId || !action) return { handled: false };

  if (action === "approve_draft") {
    const cached = lastDraftCache[chatId];
    if (!cached) {
      await sendTelegramMessage(
        chatId,
        "⚠️ *Draft expired.* Use `/idea <topic>` to generate a new post."
      );
      return { handled: true };
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const newPost: ScheduledPost = {
      id: `tg-${Date.now()}`,
      title: cached.topic.slice(0, 40),
      content: cached.post,
      criticScore: cached.score,
      scheduledTime: tomorrow.toISOString(),
      status: "queued",
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      source: "telegram",
    };

    saveScheduledPost(newPost);
    delete lastDraftCache[chatId];

    await sendTelegramMessage(
      chatId,
      `🚀 *Approved & Scheduled!*\n\nPost queued for: \`${tomorrow.toLocaleString()}\``
    );
    return { handled: true };
  }

  if (action === "humanize_draft") {
    const cached = lastDraftCache[chatId];
    if (!cached) {
      await sendTelegramMessage(chatId, "⚠️ *Draft expired.*");
      return { handled: true };
    }

    const cleaned = humanizeLocal(cached.post);
    const score = isHumanScore(cleaned);
    cached.post = cleaned;

    const reply = `🛡️ *Refined & Humanized* (Score: *${score}%*)\n\n━━━━━━━━━━━━━━━━━━━━\n\n${cleaned}\n\n━━━━━━━━━━━━━━━━━━━━`;
    const keyboard: InlineKeyboardButton[][] = [
      [
        { text: "🚀 Approve & Schedule", callback_data: "approve_draft" },
        { text: "❌ Discard", callback_data: "discard_draft" },
      ],
    ];
    await sendTelegramWithKeyboard(chatId, reply, keyboard);
    return { handled: true };
  }

  if (action === "discard_draft") {
    delete lastDraftCache[chatId];
    await sendTelegramMessage(chatId, "🗑️ *Draft discarded.*");
    return { handled: true };
  }

  if (action === "cmd_trending") {
    return handleTelegramUpdate({
      update_id: Date.now(),
      message: { message_id: 1, chat: { id: chatId, type: "private" }, text: "/trending" },
    });
  }

  if (action === "cmd_status") {
    return handleTelegramUpdate({
      update_id: Date.now(),
      message: { message_id: 1, chat: { id: chatId, type: "private" }, text: "/status" },
    });
  }

  if (action === "cmd_queue") {
    return handleTelegramUpdate({
      update_id: Date.now(),
      message: { message_id: 1, chat: { id: chatId, type: "private" }, text: "/queue" },
    });
  }

  return { handled: false };
}
