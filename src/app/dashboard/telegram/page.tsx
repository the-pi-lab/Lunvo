"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Send,
  Check,
  Zap,
  Key,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Smartphone,
  Copy,
  Activity,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Reveal from "@/components/motion/Reveal";

export default function TelegramSettingsPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBotToken(localStorage.getItem("lunvo_telegram_token") || "");
      setChatId(localStorage.getItem("lunvo_telegram_chat_id") || "");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("lunvo_telegram_token", botToken.trim());
    localStorage.setItem("lunvo_telegram_chat_id", chatId.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestPing = async () => {
    if (!botToken || !chatId) {
      alert("Please enter both Bot Token and Chat ID to send a test ping.");
      return;
    }

    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🚀 *LUNVO 2.0 Connected!*\n\nYour 24/7 Telegram Remote Bot is successfully paired with your machine.\n\nTry sending \`/idea Next.js 15\` or \`/trending\` right now!`,
          parse_mode: "Markdown",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setTestResult({ success: true, msg: "Message delivered to your Telegram app!" });
      } else {
        setTestResult({ success: false, msg: `Telegram Error: ${data.description || "Failed"}` });
      }
    } catch (e: any) {
      setTestResult({ success: false, msg: `Network Error: ${e?.message}` });
    } finally {
      setTestSending(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npm run telegram:bot");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        kicker="Smartphone Companion"
        title="24/7 Telegram Remote Bot"
        description="Control your autonomous LinkedIn content factory directly from your phone — generate posts, approve drafts, and trigger n8n workflows."
      />

      {/* Hero Pairing Card */}
      <Reveal>
        <div className="p-8 rounded-3xl bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 text-white border border-sky-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Zero Port Forwarding · 100% Local</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Leave your laptop running, control LinkedIn on the go.
              </h2>
              <p className="text-xs text-sky-100/80 leading-relaxed">
                Your bot connects directly to Telegram using long-polling. No public IP, no cloud
                server, and no proxy setup required.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono text-sky-200">Local Daemon:</span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> Ready
                </span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-200">
                <code>npm run telegram:bot</code>
                <button
                  onClick={handleCopyCommand}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy command"
                >
                  {copiedCmd ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Bot Credentials Form */}
      <Reveal>
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/30">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-on-background">Telegram Bot Credentials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-background mb-1">
                Bot Token (from @BotFather)
              </label>
              <input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWxYz..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none font-mono"
              />
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                Open Telegram → Search <strong>@BotFather</strong> → send <code>/newbot</code> to
                get your token.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-background mb-1">
                Authorized Chat ID
              </label>
              <input
                type="text"
                placeholder="e.g. 987654321"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none font-mono"
              />
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                Message <strong>@userinfobot</strong> on Telegram to find your personal numeric Chat
                ID.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{isSaved ? "Saved Locally!" : "Save Credentials"}</span>
              </button>

              <button
                onClick={handleTestPing}
                disabled={testSending || !botToken || !chatId}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container hover:bg-surface-container-high text-on-background transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testSending ? "Pinging Phone..." : "Send Test Ping"}</span>
              </button>
            </div>

            {testResult && (
              <span
                className={`text-xs font-semibold ${
                  testResult.success ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {testResult.msg}
              </span>
            )}
          </div>
        </div>
      </Reveal>

      {/* Available Commands Cheatsheet */}
      <Reveal>
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-background">Remote Commands Cheatsheet</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-1">
              <code className="font-bold text-blue-600">/idea &lt;topic&gt;</code>
              <p className="text-on-surface-variant text-[11px]">
                Runs the 3-Agent pipeline and returns a full LinkedIn post with Virality Score in
                10s.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-1">
              <code className="font-bold text-emerald-600">/approve</code>
              <p className="text-on-surface-variant text-[11px]">
                Queues the last generated post for tomorrow's scheduled outbound webhook dispatch.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-1">
              <code className="font-bold text-purple-600">/humanize</code>
              <p className="text-on-surface-variant text-[11px]">
                Strips out AI clichés and boosts sentence burstiness toward an 85%+ human score
                (heuristic).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-1">
              <code className="font-bold text-amber-600">/trending</code>
              <p className="text-on-surface-variant text-[11px]">
                Fetches today's top 5 AI & tech trends from Hacker News, Dev.to, and GitHub.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-1">
              <code className="font-bold text-sky-600">/workflow &lt;id&gt;</code>
              <p className="text-on-surface-variant text-[11px]">
                Executes an n8n workflow (e.g. <code>rss-tech-trends</code>) headlessly from your
                phone.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-1">
              <code className="font-bold text-rose-600">/queue</code>
              <p className="text-on-surface-variant text-[11px]">
                Views all upcoming scheduled posts and target dispatch times.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
