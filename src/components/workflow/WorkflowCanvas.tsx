"use client";

import React, { useState, useRef, useEffect } from "react";
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  WorkflowExecutionContext,
} from "@/lib/workflow/types";
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  RotateCw,
  Share2,
  Clock,
  Code2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Trash2,
  Layers,
  Plus,
} from "lucide-react";
import { executeWorkflow } from "@/lib/workflow/workflowRunner";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { getVoiceDNA } from "@/lib/voice-dna/memory";

interface WorkflowCanvasProps {
  workflow: Workflow;
  onUpdateWorkflow: (updated: Workflow) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onOpenAddNode?: () => void;
}

export function WorkflowCanvas({
  workflow,
  onUpdateWorkflow,
  selectedNodeId,
  onSelectNode,
  onOpenAddNode,
}: WorkflowCanvasProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepNodeId, setActiveStepNodeId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionContext | null>(null);
  const [copied, setCopied] = useState(false);
  const [topicInput, setTopicInput] = useState("Next.js 15 Partial Prerendering & Server Actions");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Canvas Pan state (left-click drag canvas)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({ x: 0, y: 0 });
  panRef.current = pan;

  // Dragging state
  const draggingNodeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle Dragging Canvas (Pan on left-click drag)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.closest(".workflow-node") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest(".canvas-control")
    ) {
      return;
    }

    onSelectNode(null);
    setConnectingSourceId(null);
    setIsPanning(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initX = panRef.current.x;
    const initY = panRef.current.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPan({
        x: initX + dx,
        y: initY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Wheel pan / zoom
  const handleCanvasWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setZoomLevel((prev) => Math.min(1.8, Math.max(0.4, prev * zoomFactor)));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Handle Dragging Nodes
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    let hasDragged = false;

    draggingNodeRef.current = {
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: node.position.x,
      initY: node.position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingNodeRef.current) return;
      const dx = (moveEvent.clientX - draggingNodeRef.current.startX) / zoomLevel;
      const dy = (moveEvent.clientY - draggingNodeRef.current.startY) / zoomLevel;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }

      const newX = Math.max(20, Math.round(draggingNodeRef.current.initX + dx));
      const newY = Math.max(20, Math.round(draggingNodeRef.current.initY + dy));

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

  // Connect edges by clicking ports
  const handleStartConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
  };

  const handleEndConnection = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetNodeId) {
      setConnectingSourceId(null);
      return;
    }

    const edgeExists = workflow.edges.some(
      (edge) => edge.source === connectingSourceId && edge.target === targetNodeId
    );

    if (!edgeExists) {
      const newEdge: WorkflowEdge = {
        id: `e-${connectingSourceId}-${targetNodeId}-${Date.now()}`,
        source: connectingSourceId,
        target: targetNodeId,
      };
      onUpdateWorkflow({
        ...workflow,
        edges: [...workflow.edges, newEdge],
      });
    }
    setConnectingSourceId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    onUpdateWorkflow({
      ...workflow,
      edges: workflow.edges.filter((e) => e.id !== edgeId),
    });
  };

  // Run Workflow execution
  const handleRunPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionResult(null);

    const savedProfile = getActiveAIProfile();
    const profile = savedProfile || {
      id: "default-profile",
      label: "Default Local Profile",
      provider: "groq" as any,
      apiKey: "",
      model: "llama-3.3-70b-versatile",
    };

    const voiceDna = getVoiceDNA();

    try {
      const result = await executeWorkflow({
        workflow,
        profile,
        voiceDna,
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
            <span className="text-xs font-bold text-on-surface-variant">Input Topic:</span>
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
          {connectingSourceId && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold animate-pulse">
              <span>Click target node input port to connect</span>
              <button
                onClick={() => setConnectingSourceId(null)}
                className="p-0.5 hover:bg-amber-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

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
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleCanvasWheel}
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
        className={`relative flex-1 w-full h-full overflow-hidden select-none bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] ${
          isPanning ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "0 0",
            width: "5000px",
            height: "3500px",
            position: "relative",
          }}
        >
          {/* SVG Bezier Connection Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
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

              // Node dimensions: 240px wide, ~85px high
              const startX = sourceNode.position.x + 240;
              const startY = sourceNode.position.y + 42;
              const endX = targetNode.position.x;
              const endY = targetNode.position.y + 42;

              const dx = Math.abs(endX - startX) * 0.5;
              const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
              const isEdgeActive =
                activeStepNodeId === edge.source || activeStepNodeId === edge.target;

              return (
                <g key={edge.id} className="group pointer-events-auto">
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isEdgeActive ? "#3B82F6" : "#94A3B8"}
                    strokeWidth={isEdgeActive ? "3.5" : "2.5"}
                    strokeDasharray={isEdgeActive ? "6,6" : undefined}
                    className={`${isEdgeActive ? "animate-[dash_1s_linear_infinite]" : ""} transition-colors`}
                    markerEnd="url(#arrow)"
                  />
                  {/* Midpoint Delete / Label */}
                  <g
                    transform={`translate(${(startX + endX) / 2}, ${(startY + endY) / 2})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEdge(edge.id);
                    }}
                  >
                    <rect
                      x="-20"
                      y="-10"
                      width="40"
                      height="20"
                      rx="6"
                      fill="white"
                      stroke="#CBD5E1"
                      className="group-hover:stroke-rose-400 group-hover:fill-rose-50"
                    />
                    <text
                      x="0"
                      y="3"
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="group-hover:fill-rose-600 select-none"
                    >
                      {edge.label || "✕"}
                    </text>
                  </g>
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
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                }}
                className={`workflow-node absolute w-60 bg-white/95 backdrop-blur-md rounded-2xl border ${border} p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 ${
                  isSelected ? `ring-2 ${ring} shadow-lg ring-offset-2` : ""
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
                  {node.type === "trigger_schedule" &&
                    `Schedule: ${node.data.timeOfDay || "09:00"}`}
                  {node.type === "trigger_manual" && "Manual Prompt Trigger"}
                  {node.type === "voice_dna_transform" && "Voice DNA Tone Ingest"}
                  {node.type === "repurpose_transformer" && "Multi-Channel Formats"}
                  {node.type === "output_draft_store" && "Local Draft Store"}
                </div>

                {/* Input Port (Left) */}
                <div
                  onClick={(e) => handleEndConnection(e, node.id)}
                  title="Input Port (Click to connect here)"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-xs hover:scale-125 hover:bg-blue-500 transition-all cursor-crosshair z-20"
                />

                {/* Output Port (Right) */}
                <div
                  onClick={(e) => handleStartConnection(e, node.id)}
                  title="Output Port (Click to draw connection wire)"
                  className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-xs hover:scale-125 transition-all cursor-crosshair z-20 ${
                    connectingSourceId === node.id
                      ? "bg-amber-500 scale-125 ring-4 ring-amber-200"
                      : "bg-slate-400 hover:bg-blue-500"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas Bottom-Right Zoom Controls */}
      <div className="canvas-control absolute bottom-6 right-6 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-outline-variant/50 shadow-lg z-20">
        {onOpenAddNode && (
          <button
            onClick={onOpenAddNode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary-dark rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        )}
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
          className="p-2 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-bold px-2 text-on-surface-variant">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
          className="p-2 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-xl transition-colors"
          title="Reset View (100% & Pan)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
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
