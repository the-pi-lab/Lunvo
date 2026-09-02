"use client";

import React, { useState } from "react";
import type { NodeType } from "@/lib/workflow/types";
import {
  X,
  Search,
  Sparkles,
  PenTool,
  BrainCircuit,
  ShieldCheck,
  Clock,
  Send,
  Radio,
  Share2,
  Video,
  Sliders,
  Layers,
  FileCheck2,
  Repeat,
  Bookmark,
  Plus,
} from "lucide-react";

interface NodeDef {
  type: NodeType;
  name: string;
  category: "agents" | "triggers" | "logic" | "output";
  icon: typeof Sparkles;
  color: string;
  badge: string;
  desc: string;
}

const ALL_NODES: NodeDef[] = [
  // AI Agents
  {
    type: "agent_writer",
    name: "AI Writer Agent",
    category: "agents",
    icon: PenTool,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    badge: "AI Agent",
    desc: "Drafts high-engagement LinkedIn posts with active Voice DNA parameters.",
  },
  {
    type: "agent_scout",
    name: "AI Scout Agent",
    category: "agents",
    icon: BrainCircuit,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    badge: "AI Agent",
    desc: "Extracts contrarian angles and 3 viral hooks (Data, Story, Contrarian).",
  },
  {
    type: "agent_critic",
    name: "AI Critic Agent",
    category: "agents",
    icon: ShieldCheck,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    badge: "AI Agent",
    desc: "Audits draft against 100-point virality algorithm and provides actionable critique.",
  },

  // Triggers
  {
    type: "trigger_manual",
    name: "Topic Input Trigger",
    category: "triggers",
    icon: Sparkles,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    badge: "Trigger",
    desc: "Manual entry point to feed any topic, bullet points, or thoughts into the pipeline.",
  },
  {
    type: "trigger_rss",
    name: "RSS Tech News Trigger",
    category: "triggers",
    icon: Radio,
    color: "bg-sky-500/10 text-sky-600 border-sky-200",
    badge: "Trigger",
    desc: "Fetches live trending stories from Hacker News, TechCrunch, or custom RSS feeds.",
  },
  {
    type: "trigger_schedule",
    name: "Cron Scheduler Trigger",
    category: "triggers",
    icon: Clock,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    badge: "Trigger",
    desc: "Triggers execution at scheduled daily time slots (e.g. 09:00 AM weekdays).",
  },
  {
    type: "trigger_telegram",
    name: "Telegram Bot Trigger",
    category: "triggers",
    icon: Send,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
    badge: "Trigger",
    desc: "Executes pipeline remotely when receiving /idea commands from Telegram.",
  },
  {
    type: "trigger_youtube",
    name: "YouTube Transcriber",
    category: "triggers",
    icon: Video,
    color: "bg-rose-500/10 text-rose-600 border-rose-200",
    badge: "Trigger",
    desc: "Extracts video subtitles and key takeaways into structured post outlines.",
  },

  // Logic & Transformers
  {
    type: "condition_gate",
    name: "Quality Gatekeeper",
    category: "logic",
    icon: FileCheck2,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    badge: "Gate",
    desc: "Halts or retries flow if Critic Score or Human Score is below threshold (e.g. >= 85).",
  },
  {
    type: "humanizer_filter",
    name: "Anti-AI Humanizer",
    category: "logic",
    icon: ShieldCheck,
    color: "bg-teal-500/10 text-teal-600 border-teal-200",
    badge: "Filter",
    desc: "Scans and strips 48 canonical AI clichés, corporate jargon, and em-dashes.",
  },
  {
    type: "voice_dna_transform",
    name: "Voice DNA Tone Ingest",
    category: "logic",
    icon: Sliders,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    badge: "Transform",
    desc: "Injects user's calibrated sentence rhythm, vocabulary, and formality style.",
  },
  {
    type: "carousel_formatter",
    name: "Carousel PDF Formatter",
    category: "logic",
    icon: Layers,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    badge: "Format",
    desc: "Converts text points into 5-slide 1080x1350 visual document carousel slides.",
  },
  {
    type: "repurpose_transformer",
    name: "Multi-Platform Matrix",
    category: "logic",
    icon: Repeat,
    color: "bg-violet-500/10 text-violet-600 border-violet-200",
    badge: "Transform",
    desc: "Reformats primary LinkedIn post into X thread, Newsletter intro, and Reddit summary.",
  },

  // Output & Delivery
  {
    type: "output_webhook",
    name: "Outbound Webhook",
    category: "output",
    icon: Share2,
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    badge: "Output",
    desc: "Dispatches final payload with post copy and metrics to Zapier, Make, or Buffer.",
  },
  {
    type: "output_draft_store",
    name: "Save to Local Drafts",
    category: "output",
    icon: Bookmark,
    color: "bg-slate-500/10 text-slate-600 border-slate-200",
    badge: "Output",
    desc: "Saves generated content directly into browser local draft storage bank.",
  },
];

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: NodeType) => void;
}

export function AddNodeModal({ isOpen, onClose, onAddNode }: AddNodeModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!isOpen) return null;

  const filtered = ALL_NODES.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/40 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-background flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <span>Add Node to Canvas</span>
            </h3>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">
              Select any of the 15 autonomous node primitives to chain in your workflow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-on-surface-variant/60 hover:text-on-background hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 pb-3 space-y-3 border-b border-outline-variant/30 bg-surface-container/10">
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by node name, agent, or function..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Nodes (15)" },
              { id: "agents", label: "AI Agents (3)" },
              { id: "triggers", label: "Triggers (5)" },
              { id: "logic", label: "Logic & Gates (5)" },
              { id: "output", label: "Output & Delivery (2)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-background"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Node Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filtered.map((node) => {
            const Icon = node.icon;
            return (
              <button
                key={node.type}
                onClick={() => {
                  onAddNode(node.type);
                  onClose();
                }}
                className="text-left p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-primary hover:bg-surface-container hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${node.color}`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant/80 border border-outline-variant/30">
                      {node.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-on-background group-hover:text-primary transition-colors">
                    {node.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant/70 leading-relaxed mt-1">
                    {node.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Click to add</span>
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
