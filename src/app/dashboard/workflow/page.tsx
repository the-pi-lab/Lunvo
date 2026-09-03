"use client";

import React, { useState, useEffect } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodeInspector } from "@/components/workflow/NodeInspector";
import { TemplateGalleryModal } from "@/components/workflow/TemplateGalleryModal";
import { AddNodeModal } from "@/components/workflow/AddNodeModal";
import { RunWorkflowModal } from "@/components/workflow/RunWorkflowModal";
import { ModeSwitcher } from "@/components/workflow/ModeSwitcher";
import { PREBUILT_WORKFLOWS } from "@/lib/workflow/templates";
import {
  saveWorkflow,
  getAllWorkflows,
  exportWorkflowToJson,
  importWorkflowFromJson,
} from "@/lib/workflow/workflowStore";
import type { Workflow, WorkflowNode, NodeType } from "@/lib/workflow/types";
import { Layers, Download, Upload, Save, Plus, Check, Play } from "lucide-react";

export default function WorkflowBuilderPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow>(PREBUILT_WORKFLOWS[0]!);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from local storage or fallback to default prebuilt
  useEffect(() => {
    const saved = getAllWorkflows();
    if (saved && saved.length > 0 && saved[0]) {
      setActiveWorkflow(saved[0]);
    }
  }, []);

  const selectedNode = activeWorkflow.nodes.find((n) => n.id === selectedNodeId) || null;

  const handleUpdateNode = (updatedNode: WorkflowNode) => {
    setActiveWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
    }));
  };

  const handleDeleteNode = (nodeId: string) => {
    setActiveWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
    setSelectedNodeId(null);
  };

  const handleSaveWorkflow = () => {
    saveWorkflow(activeWorkflow);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = exportWorkflowToJson(activeWorkflow);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lunvo-workflow-${activeWorkflow.metadata.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importWorkflowFromJson(content);
      if (imported) {
        setActiveWorkflow(imported);
        saveWorkflow(imported);
      }
    };
    reader.readAsText(file);
  };

  const handleAddNode = (type: NodeType) => {
    const newId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newId,
      type,
      position: { x: 120 + Math.random() * 160, y: 120 + Math.random() * 160 },
      data: {
        label: `New ${type.replace(/_/g, " ")}`,
      },
    };

    setActiveWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setSelectedNodeId(newId);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Top Studio Control Bar */}
      <header className="h-16 shrink-0 px-6 border-b border-outline-variant/40 bg-surface-container-lowest flex items-center justify-between z-30 shadow-xs">
        {/* Left: Mode Switcher & Title */}
        <div className="flex items-center gap-4">
          <ModeSwitcher />

          <div className="hidden md:block h-6 w-px bg-outline-variant/60" />

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-bold text-on-background">Active Flow:</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {activeWorkflow.metadata.name}
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Run Workflow Button */}
          <button
            onClick={() => setIsRunModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-xs hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Flow</span>
          </button>

          {/* Template Gallery Button */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-container hover:bg-surface-container-high transition-colors text-on-background"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Templates</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-black">
              12
            </span>
          </button>

          {/* Add Node Button -> Opens AddNodeModal */}
          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-background"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          {/* Save Workflow Button */}
          <button
            onClick={handleSaveWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? "Saved!" : "Save"}</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            title="Export JSON"
            className="p-2 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <label
            title="Import JSON"
            className="p-2 text-on-surface-variant hover:text-on-background hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </header>

      {/* Main Canvas & Inspector Viewport */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <WorkflowCanvas
          workflow={activeWorkflow}
          onUpdateWorkflow={setActiveWorkflow}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onOpenAddNode={() => setIsAddNodeOpen(true)}
        />

        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      {/* Template Gallery Modal */}
      <TemplateGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectTemplate={(template) => {
          setActiveWorkflow(template);
          saveWorkflow(template);
        }}
      />

      {/* Add Node Modal */}
      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={handleAddNode}
      />

      {/* Run Live Workflow Modal */}
      <RunWorkflowModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        workflow={activeWorkflow}
      />
    </div>
  );
}
