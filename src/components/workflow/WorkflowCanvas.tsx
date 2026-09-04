"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Minus,
  Focus,
  Crosshair,
  Scan,
  RotateCcw,
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
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const workflowRef = useRef(workflow);
  const dragRafRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    panRef.current = pan;
    zoomRef.current = zoomLevel;
    workflowRef.current = workflow;
  });

  // Dragging state
  const draggingNodeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const triggerAnimation = () => {
    setIsAnimating(true);
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 280);
  };

  // Compute bounding box of all nodes in the workflow.
  // NaN/undefined positions (corrupt imports) are filtered — otherwise the
  // canvas centers on NaN and the graph is lost in the void forever.
  const getNodeBounds = () => {
    const fallback = { minX: 100, maxX: 850, minY: 100, maxY: 500 };
    if (!workflow.nodes || workflow.nodes.length === 0) return fallback;
    const xs = workflow.nodes
      .map((n) => n.position?.x)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const ys = workflow.nodes
      .map((n) => n.position?.y)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (xs.length === 0 || ys.length === 0) return fallback;
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs) + 260, // node card width + buffer
      minY: Math.min(...ys),
      maxY: Math.max(...ys) + 120, // node card height + buffer
    };
  };

  // Free infinite canvas (n8n-style): no pan bounds. If you ever lose your
  // nodes in the void, press F / Fit View to jump back. Zoom stays 0.4–1.8
  // so text never becomes unreadable — movement itself is unbounded.

  // Fit View / Recenter (n8n Style)
  const handleFitView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !workflow.nodes || workflow.nodes.length === 0) {
      triggerAnimation();
      setZoomLevel(1);
      setPan({ x: 80, y: 80 });
      return;
    }

    const vWidth = canvas.clientWidth || 1200;
    const vHeight = canvas.clientHeight || 800;

    const bounds = getNodeBounds();
    const contentWidth = Math.max(120, bounds.maxX - bounds.minX);
    const contentHeight = Math.max(120, bounds.maxY - bounds.minY);

    // Padding inside viewport
    const paddingX = Math.min(140, vWidth * 0.12);
    const paddingY = Math.min(120, vHeight * 0.12);
    const availableWidth = Math.max(100, vWidth - paddingX * 2);
    const availableHeight = Math.max(100, vHeight - paddingY * 2);

    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    const targetZoom = Math.min(1.15, Math.max(0.45, Math.min(scaleX, scaleY)));

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const targetPanX = vWidth / 2 - centerX * targetZoom;
    const targetPanY = vHeight / 2 - centerY * targetZoom;

    triggerAnimation();
    const finalZoom = Number(targetZoom.toFixed(2));
    setZoomLevel(finalZoom);
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.nodes]);

  // Auto-fit on initial mount or when switching workflow
  const hasAutoFittedRef = useRef<string | null>(null);
  useEffect(() => {
    if (workflow?.metadata?.id && hasAutoFittedRef.current !== workflow.metadata.id) {
      hasAutoFittedRef.current = workflow.metadata.id;
      const timer = setTimeout(() => {
        handleFitView();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [workflow?.metadata?.id, workflow.nodes.length, handleFitView]);

  // n8n-style keyboard shortcuts: F / Ctrl+1 fit, Ctrl+0 reset 100%, Ctrl +/- zoom
  const handleZoomStep = useCallback(
    (delta: number) => {
      triggerAnimation();
      const z = zoomRef.current;
      const newZoom = Math.min(1.8, Math.max(0.4, Number((z + delta).toFixed(2))));
      setZoomLevel(newZoom);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleResetZoom = useCallback(() => {
    triggerAnimation();
    setZoomLevel(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut for fit view ('f' or 'Ctrl+1')
  // Unmount safety: never setState on timers after unmount
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never steal keys from typing surfaces, selects, or open dialogs
      const t = e.target as HTMLElement | null;
      if (
        t?.closest?.('input,textarea,select,[contenteditable="true"],[role="dialog"],[data-modal]')
      )
        return;
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      if (e.key === "Escape") {
        setConnectingSourceId(null);
        onSelectNode(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "0" || e.key === "1")) {
        e.preventDefault();
        if (e.key === "0") handleResetZoom();
        else handleFitView();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoomStep(0.1);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        handleZoomStep(-0.1);
      } else if (e.key === "f" || e.key === "F") {
        handleFitView();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomStep(0.1);
      } else if (e.key === "-" || e.key === "_") {
        handleZoomStep(-0.1);
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFitView, handleZoomStep, handleResetZoom]);

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
      setPan({ x: initX + dx, y: initY + dy });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Wheel pan / zoom — native non-passive listener (React attaches wheel as
  // passive at root, so ctrl+wheel preventDefault would silently fail and the
  // browser would page-zoom instead of canvas-zooming).
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const z = zoomRef.current;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const newZoom = Math.min(1.8, Math.max(0.4, Number((z * zoomFactor).toFixed(2))));

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const p = panRef.current;
        const newPanX = mouseX - (mouseX - p.x) * (newZoom / z);
        const newPanY = mouseY - (mouseY - p.y) * (newZoom / z);
        triggerAnimation();
        setZoomLevel(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        e.preventDefault();
        setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Dragging Nodes — rAF-throttled, reads latest workflow via ref
  // (the mousedown closure goes stale mid-drag and would overwrite
  // concurrent edge/node edits on every pixel without this).
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
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
      if (dragRafRef.current) return;
      const { clientX, clientY } = moveEvent;
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        const drag = draggingNodeRef.current;
        if (!drag) return;
        const z = zoomRef.current || 1;
        const dx = (clientX - drag.startX) / z;
        const dy = (clientY - drag.startY) / z;

        const newX = Math.max(20, Math.min(4500, Math.round(drag.initX + dx)));
        const newY = Math.max(20, Math.min(3000, Math.round(drag.initY + dy)));
        if (!Number.isFinite(newX) || !Number.isFinite(newY)) return;

        const latest = workflowRef.current;
        onUpdateWorkflow({
          ...latest,
          nodes: latest.nodes.map((n) =>
            n.id === drag.id ? { ...n, position: { x: newX, y: newY } } : n
          ),
        });
      });
    };

    const handleMouseUp = () => {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
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
      const uid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newEdge: WorkflowEdge = {
        id: `e-${connectingSourceId}-${targetNodeId}-${uid}`,
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

  const handleCopyPost = async () => {
    if (!executionResult?.currentDraft) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(executionResult.currentDraft);
      } else {
        const ta = document.createElement("textarea");
        ta.value = executionResult.currentDraft;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard denied (insecure context/permissions) — leave text selectable
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
    <div className="relative flex-1 min-h-0 w-full flex flex-col bg-[#F8F9FB] overflow-hidden select-none">
      {/* Canvas Top Bar */}
      <div className="h-14 shrink-0 px-5 border-b border-outline-variant/40 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between z-20 shadow-xs">
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
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
        className={`relative flex-1 min-h-0 w-full overflow-hidden select-none touch-none bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] ${
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
            transition: isAnimating ? "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Connect input for ${node.id}`}
                  onClick={(e) => handleEndConnection(e, node.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEndConnection(e as unknown as React.MouseEvent, node.id);
                    }
                  }}
                  title="Input Port (Click to connect here)"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-xs hover:scale-125 hover:bg-blue-500 transition-all cursor-crosshair z-20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                />

                {/* Output Port (Right) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Connect output for ${node.id}`}
                  onClick={(e) => handleStartConnection(e, node.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStartConnection(e as unknown as React.MouseEvent, node.id);
                    }
                  }}
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

        {/* Canvas Floating Controls Dock (n8n-style: fit / zoom-in / zoom-out / reset) */}
        <div className="canvas-control absolute bottom-6 right-6 flex items-center gap-2 z-30">
          {onOpenAddNode && (
            <button
              onClick={onOpenAddNode}
              className="flex items-center gap-1.5 px-3.5 h-9 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-95 mr-1"
              title="Add Node to Canvas"
            >
              <Plus className="w-4 h-4" />
              <span>Add Node</span>
            </button>
          )}

          {/* 1. Fit to Screen (4-Corner Frame / Scan) */}
          <button
            onClick={handleFitView}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-xs hover:shadow-sm text-slate-700 hover:text-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
            title="Fit to Screen (Center all nodes) — Press 'F'"
            aria-label="Fit View"
          >
            <Scan className="w-4 h-4" />
          </button>

          {/* 2. Zoom In (Magnifying glass with +) */}
          <button
            onClick={() => handleZoomStep(0.1)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-xs hover:shadow-sm text-slate-700 hover:text-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
            title="Zoom In (Ctrl + +)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* 3. Zoom Out (Magnifying glass with -) */}
          <button
            onClick={() => handleZoomStep(-0.1)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-xs hover:shadow-sm text-slate-700 hover:text-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
            title="Zoom Out (Ctrl + -)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* 4. Reset Zoom (Counter-clockwise curved arrow) */}
          <button
            onClick={() => handleResetZoom()}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-xs hover:shadow-sm text-slate-700 hover:text-primary hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
            title="Reset zoom to 100% & Recenter"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zoom level percentage badge */}
          <div
            onClick={() => handleResetZoom()}
            className="h-9 px-2.5 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-xs text-xs font-mono font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors select-none"
            title="Click to reset zoom to 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>

        {/* Canvas Bottom-Left Helper Badge */}
        <div className="canvas-control absolute bottom-6 left-6 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-outline-variant/50 text-[11px] text-on-surface-variant/80 font-mono pointer-events-none z-10 shadow-sm">
          <span>🖱️ Drag canvas to pan</span>
          <span>•</span>
          <span>Wheel to scroll</span>
          <span>•</span>
          <span>
            Press{" "}
            <kbd className="px-1 py-0.5 bg-surface-container rounded font-bold text-[10px]">F</kbd>{" "}
            to Fit View
          </span>
        </div>
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
