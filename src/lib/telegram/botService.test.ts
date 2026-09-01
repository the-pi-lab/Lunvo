import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleTelegramUpdate, lastDraftCache, type TelegramUpdate } from "./botService";

describe("LUNVO 2.0 Telegram Bot Service", () => {
  beforeEach(() => {
    // Clear in-memory draft cache
    for (const k of Object.keys(lastDraftCache)) {
      delete lastDraftCache[k];
    }
  });

  it("handles /help command and returns available command list", async () => {
    const update: TelegramUpdate = {
      update_id: 101,
      message: {
        message_id: 1,
        chat: { id: 123456, type: "private" },
        text: "/help",
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(res.reply).toContain("LUNVO 2.0 Autonomous Telegram Remote");
    expect(res.reply).toContain("/idea");
  });

  it("handles /status command returning server status", async () => {
    const update: TelegramUpdate = {
      update_id: 102,
      message: {
        message_id: 2,
        chat: { id: 123456, type: "private" },
        text: "/status",
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(res.reply).toContain("LUNVO 2.0 Local Engine Online");
  });

  it("handles empty draft state gracefully on /approve", async () => {
    const update: TelegramUpdate = {
      update_id: 103,
      message: {
        message_id: 3,
        chat: { id: 123456, type: "private" },
        text: "/approve",
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(res.reply).toContain("No recent draft found");
  });

  it("handles /humanize on cached draft", async () => {
    lastDraftCache[123456] = {
      topic: "AI Agents",
      post: "Let us delve into the tapestry of AI agents and synergize workflows.",
      score: 85,
      timestamp: Date.now(),
    };

    const update: TelegramUpdate = {
      update_id: 104,
      message: {
        message_id: 4,
        chat: { id: 123456, type: "private" },
        text: "/humanize",
      },
    };

    const res = await handleTelegramUpdate(update);
    expect(res.handled).toBe(true);
    expect(res.reply).toContain("Humanized Post");
    expect(lastDraftCache[123456]?.post).not.toContain("delve");
  });
});
