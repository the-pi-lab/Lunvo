"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Calendar, Share2, Check, Zap, AlertCircle } from "lucide-react";
import { saveScheduledPost, getWebhookConfigs } from "@/lib/scheduler/queueStore";
import type { ScheduledPost, WebhookConfig } from "@/lib/scheduler/types";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent: string;
  criticScore?: number;
  humanScore?: number;
  onSuccess?: () => void;
}

export function ScheduleModal({
  isOpen,
  onClose,
  postContent,
  criticScore,
  humanScore,
  onSuccess,
}: ScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [selectedWebhookId, setSelectedWebhookId] = useState("");
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split("T")[0] || "");

      const loaded = getWebhookConfigs();
      setWebhooks(loaded);
      const active = loaded.find((w) => w.isActive && w.url);
      if (active) setSelectedWebhookId(active.id);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) return;

    const targetIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    const chosenWebhook = webhooks.find((w) => w.id === selectedWebhookId);

    const newScheduledPost: ScheduledPost = {
      id: `sched-${Date.now()}`,
      title: postContent.slice(0, 40) + "...",
      content: postContent,
      criticScore,
      humanScore,
      scheduledTime: targetIso,
      status: "queued",
      targetWebhookId: chosenWebhook?.id,
      targetWebhookUrl: chosenWebhook?.url,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      source: "studio",
    };

    saveScheduledPost(newScheduledPost);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSuccess?.();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-background">Schedule LinkedIn Post</h3>
              <p className="text-xs text-on-surface-variant">Autonomous Webhook Dispatcher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Post Snippet */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Post Preview
            </label>
            <div className="p-3 bg-surface-container/50 rounded-xl text-xs text-on-surface-variant/90 max-h-24 overflow-y-auto border border-outline-variant/40 leading-relaxed font-sans line-clamp-3">
              {postContent || "No draft content provided."}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-background mb-1">Target Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-background mb-1">Time (24h)</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Target Webhook Destination */}
          <div>
            <label className="block text-xs font-bold text-on-background mb-1">
              Dispatch Destination (Zapier / Make / Buffer)
            </label>
            <select
              value={selectedWebhookId}
              onChange={(e) => setSelectedWebhookId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/60 focus:border-primary focus:outline-none"
            >
              {webhooks.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.url ? `(${w.platform})` : "— (URL Not Set)"}
                </option>
              ))}
            </select>
          </div>

          {/* Zero-Ban Guarantee Note */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-tight">
              <strong>100% Zero-Ban:</strong> Outbound webhooks transmit payloads safely without
              storing LinkedIn cookies or using unauthorized scrapers.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 transition-all"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span>{isSaved ? "Scheduled!" : "Confirm Schedule"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
