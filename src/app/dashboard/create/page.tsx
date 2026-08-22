"use client";

import { useState } from "react";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { runContentPipeline, PipelineProgress } from "@/lib/ai/agents/orchestrator";
import { BrainCircuit, PenTool, CheckCircle, Search, AlertTriangle } from "lucide-react";
import { PostEditor } from "@/components/create/PostEditor";

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [progress, setProgress] = useState<PipelineProgress>({ stage: 'idle', message: '' });

  const handleGenerate = async () => {
    const profile = getActiveAIProfile();
    if (!profile || profile.apiKey === 'REDACTED_LOCAL_ONLY' && profile.provider !== 'ollama' && profile.provider !== 'lmstudio') {
      alert("Please configure your AI Provider in Settings first.");
      return;
    }

    if (!topic.trim()) return;

    try {
      // Pass null for voiceDna for now until we link it to the DB state
      await runContentPipeline(profile, topic, null, (p) => {
        setProgress(p);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isGenerating = progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Factory</h1>
        <p className="text-slate-500 mt-2">Powered by our 3-Agent AI Pipeline (Scout → Writer → Critic).</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          What do you want to post about today?
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="E.g., I want to talk about how open-source software is eating SaaS alive because..."
          className="w-full h-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center">
            <BrainCircuit className="w-4 h-4 mr-1" />
            Voice DNA will be automatically applied.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isGenerating ? "Agents at work..." : "Generate Post"}
          </button>
        </div>
      </div>

      {/* Progress Visualizer */}
      {progress.stage !== 'idle' && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">Pipeline Status</h3>
          <div className="space-y-4">
            
            <div className={`flex items-center space-x-3 ${progress.stage === 'scouting' ? 'text-blue-600' : (progress.scoutResult ? 'text-emerald-600' : 'text-slate-400')}`}>
              <Search className="w-5 h-5" />
              <span className="text-sm font-medium">Scout Agent: {progress.scoutResult ? 'Strategic Framework Created' : (progress.stage === 'scouting' ? 'Analyzing...' : 'Waiting')}</span>
            </div>

            <div className={`flex items-center space-x-3 ${progress.stage === 'writing' ? 'text-blue-600' : (progress.draft ? 'text-emerald-600' : 'text-slate-400')}`}>
              <PenTool className="w-5 h-5" />
              <span className="text-sm font-medium">Writer Agent: {progress.draft ? 'First Draft Written' : (progress.stage === 'writing' ? 'Drafting...' : 'Waiting')}</span>
            </div>

            <div className={`flex items-center space-x-3 ${progress.stage === 'critiquing' ? 'text-blue-600' : (progress.criticResult ? 'text-emerald-600' : 'text-slate-400')}`}>
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Critic Agent: {progress.criticResult ? 'Post Optimized & Scored' : (progress.stage === 'critiquing' ? 'Auditing...' : 'Waiting')}</span>
            </div>
            
            {progress.stage === 'error' && (
              <div className="flex items-center space-x-3 text-red-600 p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">{progress.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Results */}
      {progress.stage === 'complete' && progress.criticResult && (
        <PostEditor 
          content={progress.criticResult.improvedPost} 
          score={progress.criticResult.finalScore}
          notes={progress.criticResult.critiqueNotes}
        />
      )}
    </div>
  );
}
