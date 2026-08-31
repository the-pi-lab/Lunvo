"use client";

import { useEffect, useState } from "react";
import {
  Share2,
  Check,
  Zap,
  Clock,
  Send,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/premium/PageHeader";
import Panel from "@/components/premium/Panel";
import Reveal from "@/components/motion/Reveal";
import {
  getScheduledQueue,
  deleteScheduledPost,
  getWebhookConfigs,
  saveWebhookConfigs,
} from "@/lib/scheduler/queueStore";
import { dispatchScheduledPost } from "@/lib/scheduler/webhookDispatcher";
import { startSchedulerLoop, runSchedulerTick } from "@/lib/scheduler/localCron";
import type { ScheduledPost, WebhookConfig } from "@/lib/scheduler/types";

export default function DistributionPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "webhooks">("queue");
  const [queue, setQueue] = useState<ScheduledPost[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    id: string;
    success: boolean;
    msg: string;
  } | null>(null);

  // Initialize and start scheduler background loop
  useEffect(() => {
    refreshData();
    startSchedulerLoop(20000); // Check every 20s
  }, []);

  const refreshData = () => {
    setQueue(getScheduledQueue());
    setWebhooks(getWebhookConfigs());
  };

  const handleManualDispatch = async (post: ScheduledPost) => {
    setDispatchingId(post.id);
    const result = await dispatchScheduledPost(post);
    setDispatchingId(null);
    setFeedbackMsg({
      id: post.id,
      success: result.success,
      msg: result.success ? "Successfully dispatched to Webhook!" : result.error || "Failed",
    });
    refreshData();
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDelete = (id: string) => {
    deleteScheduledPost(id);
    refreshData();
  };

  const handleWebhookUrlChange = (id: string, url: string) => {
    const updated = webhooks.map((w) => (w.id === id ? { ...w, url } : w));
    setWebhooks(updated);
    saveWebhookConfigs(updated);
  };

  const handleToggleWebhook = (id: string) => {
    const updated = webhooks.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w));
    setWebhooks(updated);
    saveWebhookConfigs(updated);
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    if (!webhook.url) {
      alert("Please enter a webhook URL first.");
      return;
    }
    setTestingId(webhook.id);
    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lunvo.test.ping",
          timestamp: new Date().toISOString(),
          message: "Hello from LUNVO 2.0 Outbound Dispatcher!",
        }),
        mode: "no-cors",
      });
      setFeedbackMsg({
        id: webhook.id,
        success: true,
        msg: "Test ping sent! Check your Zapier/Make history.",
      });
    } catch (e: any) {
      setFeedbackMsg({
        id: webhook.id,
        success: false,
        msg: `Test failed: ${e?.message}`,
      });
    } finally {
      setTestingId(null);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        kicker="Distribution Engine"
        title="Distribution & Webhook Scheduler"
        description="Schedule posts and dispatch outbound webhooks to Zapier, Make, and Buffer — 100% Zero-Ban."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-container/60 rounded-2xl w-fit border border-outline-variant/40">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "queue"
              ? "bg-white text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-background"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Scheduled Queue ({queue.filter((q) => q.status === "queued").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "webhooks"
              ? "bg-white text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-background"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Webhook Connectors ({webhooks.filter((w) => w.url).length})</span>
        </button>
      </div>

      {/* Tab 1: Scheduled Queue */}
      {activeTab === "queue" && (
        <Reveal>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-background uppercase tracking-wider">
                Upcoming Scheduled Dispatches
              </h3>
              <button
                onClick={() => {
                  runSchedulerTick();
                  refreshData();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Due Posts</span>
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-surface-container/30 border border-outline-variant/40 space-y-3">
                <Clock className="w-8 h-8 text-on-surface-variant/50 mx-auto" />
                <h4 className="text-sm font-bold text-on-background">No Scheduled Posts Yet</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Posts scheduled from the Simple Studio or Node Builder will queue up here and
                  dispatch automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((item) => {
                  const isQueued = item.status === "queued";
                  const isDispatched = item.status === "dispatched";
                  const isFailed = item.status === "failed";

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-outline-variant/80"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isQueued
                                ? "bg-amber-100 text-amber-800"
                                : isDispatched
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(item.scheduledTime).toLocaleString()}
                          </span>
                          {item.criticScore && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                              Score: {item.criticScore}/100
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-on-background line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>

                        {feedbackMsg?.id === item.id && (
                          <div
                            className={`text-xs font-semibold ${
                              feedbackMsg.success ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {feedbackMsg.msg}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isQueued && (
                          <button
                            onClick={() => handleManualDispatch(item)}
                            disabled={dispatchingId === item.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{dispatchingId === item.id ? "Sending..." : "Dispatch Now"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Tab 2: Webhook Connectors */}
      {activeTab === "webhooks" && (
        <Reveal>
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-950">How Safe Scheduling Works</h4>
                <p className="text-[11px] text-blue-900 leading-relaxed mt-0.5">
                  LUNVO sends structured JSON payloads directly to your private Zapier, Make.com, or
                  Buffer webhooks. Your workflow receives the text, scores, and carousels, and
                  publishes them safely through official integrations.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {webhooks.map((w) => (
                <div
                  key={w.id}
                  className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-surface-container text-primary flex items-center justify-center font-bold text-xs">
                        {w.platform[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-background">{w.name}</h4>
                        <span className="text-[10px] text-on-surface-variant font-mono uppercase">
                          Platform: {w.platform}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={w.isActive}
                          onChange={() => handleToggleWebhook(w.id)}
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <span>Active Target</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-background mb-1">
                      Webhook Catch URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        value={w.url}
                        onChange={(e) => handleWebhookUrlChange(w.id, e.target.value)}
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                      />
                      <button
                        onClick={() => handleTestWebhook(w)}
                        disabled={testingId === w.id || !w.url}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-40 shrink-0"
                      >
                        {testingId === w.id ? "Pinging..." : "Test Webhook"}
                      </button>
                    </div>
                    {feedbackMsg?.id === w.id && (
                      <p
                        className={`text-xs font-semibold mt-2 ${
                          feedbackMsg.success ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {feedbackMsg.msg}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
