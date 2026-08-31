"use client";

import React, { useState, useMemo } from "react";
import { PREBUILT_WORKFLOWS } from "@/lib/workflow/templates";
import type { Workflow } from "@/lib/workflow/types";
import {
  X,
  Sparkles,
  Layers,
  Search,
  ArrowRight,
  Zap,
  Radio,
  Share2,
  RotateCw,
  GitBranch,
} from "lucide-react";

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (workflow: Workflow) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "creation", label: "Creation" },
  { id: "repurpose", label: "Repurposing" },
  { id: "quality", label: "Quality & Gatekeepers" },
  { id: "multiplatform", label: "Multi-Platform" },
  { id: "scheduling", label: "Scheduling & Remote" },
];

export function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateGalleryModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredWorkflows = useMemo(() => {
    return PREBUILT_WORKFLOWS.filter((wf) => {
      const matchSearch =
        wf.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
        wf.metadata.description.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (activeCategory === "all") return true;
      return wf.metadata.category === activeCategory;
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "creation":
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case "repurpose":
        return <Share2 className="w-4 h-4 text-purple-500" />;
      case "quality":
        return <RotateCw className="w-4 h-4 text-emerald-500" />;
      case "multiplatform":
        return <GitBranch className="w-4 h-4 text-amber-500" />;
      case "scheduling":
        return <Zap className="w-4 h-4 text-rose-500" />;
      default:
        return <Layers className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/40 bg-surface-container/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-on-background">LUNVO 2.0 Template Gallery</h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                12 Production Workflows
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Select a prebuilt n8n-style automation pipeline to populate your visual canvas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-6 pb-2 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface-container/60 border border-outline-variant/60 focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container/50 text-on-surface-variant hover:bg-surface-container hover:text-on-background"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((wf) => (
            <div
              key={wf.metadata.id}
              onClick={() => {
                onSelectTemplate(wf);
                onClose();
              }}
              className="group relative bg-surface-container/40 hover:bg-surface-container/90 border border-outline-variant/40 hover:border-primary/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5"
            >
              <div>
                {/* Category and Node count badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-xs font-medium text-on-surface-variant">
                    {getCategoryIcon(wf.metadata.category)}
                    <span className="capitalize">{wf.metadata.category || "General"}</span>
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container-high px-2 py-0.5 rounded-md">
                    {wf.nodes.length} Nodes · {wf.edges.length} Edges
                  </span>
                </div>

                <h3 className="text-sm font-bold text-on-background group-hover:text-primary transition-colors mb-1.5">
                  {wf.metadata.name}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                  {wf.metadata.description}
                </p>
              </div>

              <div>
                {/* Action CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs font-bold text-primary group-hover:text-primary transition-all">
                  <span>Load into Canvas</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
