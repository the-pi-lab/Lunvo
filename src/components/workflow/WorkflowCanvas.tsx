"use client";

import React, { useState, useRef } from "react";
import type {
  Workflow,
  WorkflowNode,
  NodeType,
  WorkflowExecutionContext,
} from "@/lib/workflow/types";
import {
  Play,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
  RotateCw,
  Share2,
  Clock,
  Code2,
  Copy,
  Check,
  Layers,
} from "lucide-react";
import type { AIProfile } from "@/lib/ai/types";
import { executeWorkflow } from "@/lib/workflow/workflowRunner";

interface WorkflowCanvasProps {
  workflow: Workflow;
  onUpdateWorkflow: (updated: Workflow) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export function WorkflowCanvas({
  workflow,
  onUpdateWorkflow,
  selectedNodeId,
  onSelectNode,
}: WorkflowCanvasProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepNodeId, setActiveStepNodeId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionContext | null>(null);
  const [copied, setCopied] = useState(false);
  const [topicInput, setTopicInput] = useState("Next.js 15 Partial Prerendering & Server Actions");

  // Dragging state
  const draggingNodeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    draggingNodeRef.current = {
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: node.position.x,
      initY: node.position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingNodeRef.current) return;
      const dx = moveEvent.clientX - draggingNodeRef.current.startX;
      const dy = moveEvent.clientY - draggingNodeRef.current.startY;

      const newX = Math.max(20, draggingNodeRef.current.initX + dx);
      const newY = Math.max(20, draggingNodeRef.current.initY + dy);

      onUpdateWorkflow({
        ...workflow,
        nodes: workflow.nodes.map((n) =>
          n.id === draggingNodeRef.current?.id ? { ...n, position: { x: newX, y: newY } } : n
        ),
      });
    };

    const handleMouseUp = () => {
      draggingNodeRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Run Workflow execution
  const handleRunPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionResult(null);

    const profile: AIProfile = {
      id: "canvas-profile",
      label: "Canvas Profile",
      provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as any) || "groq",
      apiKey: "",
      model: "llama-3.3-70b-versatile",
    };

    try {
      const result = await executeWorkflow({
        workflow,
        profile,
        topic: topicInput,
        onStepUpdate: (nodeId, status) => {
          setActiveStepNodeId(
            status === "success" || status === "skipped" || status === "failed" ? null : nodeId
          );
        },
      });
      setExecutionResult(result);
    } catch (e) {
      console.error("Workflow execution failed:", e);
    } finally {
      setIsRunning(false);
      setActiveStepNodeId(null);
    }
  };

  const handleCopyPost = () => {
    if (executionResult?.currentDraft) {
      navigator.clipboard.writeText(executionResult.currentDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Node Type visuals
  const getNodeVisuals = (type: NodeType) => {
    if (type.startsWith("trigger_")) {
      return {
        icon: Zap,
        border: "border-blue-300",
        bg: "bg-blue-50/90 text-blue-700",
        ring: "ring-blue-400",
      };
    }
    if (type.startsWith("agent_")) {
      return {
        icon: Sparkles,
        border: "border-purple-300",
        bg: "bg-purple-50/90 text-purple-700",
        ring: "ring-purple-400",
      };
    }
    if (type.includes("transform") || type.includes("formatter") || type.includes("filter")) {
      return {
        icon: Code2,
        border: "border-amber-300",
        bg: "bg-amber-50/90 text-amber-700",
        ring: "ring-amber-400",
      };
    }
    if (type === "condition_gate") {
      return {
        icon: RotateCw,
        border: "border-emerald-300",
        bg: "bg-emerald-50/90 text-emerald-700",
        ring: "ring-emerald-400",
      };
    }
    if (type.startsWith("output_")) {
      return {
        icon: Share2,
        border: "border-rose-300",
        bg: "bg-rose-50/90 text-rose-700",
        ring: "ring-rose-400",
      };
    }
    return {
      icon: Layers,
      border: "border-gray-300",
      bg: "bg-gray-50/90 text-gray-700",
      ring: "ring-gray-400",
    };
  };

  return (
    <div className="relative flex-1 h-full flex flex-col bg-[#F8F9FB] overflow-hidden select-none">
      {/* Canvas Top Bar */}
      <div className="h-14 px-5 border-b border-outline-variant/40 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter seed topic for automation run..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="w-72 sm:w-96 text-xs px-3 py-1.5 rounded-xl bg-surface-container/60 border border-outline-variant/50 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Run Pipeline Button */}
          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Node Graph...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Run Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas Grid Body */}
      <div
        ref={canvasRef}
        onClick={() => onSelectNode(null)}
        className="relative flex-1 w-full h-full overflow-auto bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] cursor-grab active:cursor-grabbing"
      >
        {/* SVG Bezier Connection Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 min-w-[1400px] min-h-[900px]">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#94A3B8" />
            </marker>
          </defs>

          {workflow.edges.map((edge) => {
            const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
            const targetNode = workflow.nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            // Dimensions: Node is approx 240px wide, 90px high
            const startX = sourceNode.position.x + 240;
            const startY = sourceNode.position.y + 45;
            const endX = targetNode.position.x;
            const endY = targetNode.position.y + 45;

            const dx = Math.abs(endX - startX) * 0.5;
            const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
            const isEdgeActive =
              activeStepNodeId === edge.source || activeStepNodeId === edge.target;

            return (
              <g key={edge.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isEdgeActive ? "#3B82F6" : "#CBD5E1"}
                  strokeWidth={isEdgeActive ? "3" : "2"}
                  strokeDasharray={isEdgeActive ? "6,6" : undefined}
                  className={isEdgeActive ? "animate-[dash_1s_linear_infinite]" : ""}
                  markerEnd="url(#arrow)"
                />
                {edge.label && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 8}
                    fill="#64748B"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-white px-1"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {workflow.nodes.map((node) => {
          const { icon: NodeIcon, border, bg, ring } = getNodeVisuals(node.type);
          const isSelected = selectedNodeId === node.id;
          const isActive = activeStepNodeId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node)}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
              className={`absolute w-60 bg-white/95 backdrop-blur-md rounded-2xl border ${border} p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 ${
                isSelected ? `ring-2 ${ring} shadow-lg` : ""
              } ${isActive ? "ring-4 ring-blue-500 animate-pulse" : ""}`}
            >
              {/* Node Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                    <NodeIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-background truncate max-w-[130px]">
                      {node.data.label || node.id}
                    </h4>
                    <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      {node.type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {isActive && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
              </div>

              {/* Node Summary details */}
              <div className="text-[11px] text-on-surface-variant/80 bg-surface-container/50 px-2.5 py-1.5 rounded-lg font-mono truncate">
                {node.type === "agent_writer" && "Draft Generator"}
                {node.type === "agent_scout" && "Angle & Hooks"}
                {node.type === "agent_critic" && "1-100 Virality Audit"}
                {node.type === "condition_gate" &&
                  `Gate: ${node.data.field || "score"} >= ${node.data.threshold || 85}`}
                {node.type === "output_webhook" && `Target: Zapier / Make`}
                {node.type === "trigger_rss" && `RSS: ${node.data.category || "Tech"}`}
                {node.type === "carousel_formatter" && "1080×1350 PDF Format"}
                {node.type === "humanizer_filter" && "Anti-AI Slop Filter"}
                {node.type === "trigger_schedule" && `Schedule: ${node.data.timeOfDay || "09:00"}`}
                {node.type === "trigger_manual" && "Manual Prompt Trigger"}
                {node.type === "voice_dna_transform" && "Voice DNA Tone Ingest"}
                {node.type === "repurpose_transformer" && "Multi-Channel Formats"}
                {node.type === "output_draft_store" && "Local Draft Store"}
              </div>

              {/* Input & Output Ports */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
            </div>
          );
        })}
      </div>

      {/* Live Output Drawer (if execution is done) */}
      {executionResult && (
        <div className="border-t border-outline-variant/50 bg-white/95 backdrop-blur-md p-5 z-20 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-on-background">Workflow Output Generated</h3>
              {executionResult.criticResult?.finalScore && (
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                  Score: {executionResult.criticResult.finalScore}/100
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPost}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Copied!" : "Copy Post"}</span>
              </button>
              <button
                onClick={() => setExecutionResult(null)}
                className="text-xs text-on-surface-variant hover:text-on-background px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="p-3 bg-surface-container/40 rounded-xl text-xs text-on-background whitespace-pre-wrap font-sans border border-outline-variant/30 leading-relaxed">
            {executionResult.currentDraft || "Workflow completed without generating text."}
          </div>
        </div>
      )}
    </div>
  );
}
