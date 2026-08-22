"use client";

import { useState } from "react";
import { getActiveAIProfile } from "@/lib/apiHelper";
import { runContentPipeline, PipelineProgress } from "@/lib/ai/agents/orchestrator";
import { BrainCircuit, PenTool, CheckCircle, Search, AlertTriangle, ArrowRight } from "lucide-react";
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
      await runContentPipeline(profile, topic, null, (p) => {
        setProgress(p);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isGenerating = progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error';

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
      <div className="text-center md:text-left mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Content Factory</h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl">
          Deploy our 3-Agent Neural Pipeline (Scout → Writer → Critic) to synthesize highly optimized LinkedIn posts from a single prompt.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        
        <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          Initialize Context Directive
        </label>
        <p className="text-sm text-slate-500 mb-6">What specific topic, angle, or framework should the agents focus on?</p>
        
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="E.g., Analyze why open-source models are replacing proprietary SaaS wrappers..."
          className="w-full h-40 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-[0.9375rem] text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 resize-none shadow-inner"
        />
        
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Voice DNA Active</p>
              <p className="text-xs text-slate-500">Tone will be auto-injected</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-500 transition-all disabled:opacity-50 disabled:hover:shadow-[0_4px_14px_0_rgb(37,99,235,0.39)]"
          >
            {isGenerating ? "Executing Pipeline..." : "Initialize Agents"}
            {!isGenerating && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Visualizer */}
      {progress.stage !== 'idle' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-sm font-bold mb-8 text-slate-900 uppercase tracking-widest">Neural Pipeline Status</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            {/* Scout */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${progress.stage === 'scouting' ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)] animate-pulse' : (progress.scoutResult ? 'bg-emerald-500' : 'bg-slate-200')} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10`}>
                <Search className={`w-4 h-4 ${progress.stage === 'scouting' || progress.scoutResult ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">Scout Agent</h4>
                  <span className={`text-xs font-bold uppercase tracking-widest ${progress.stage === 'scouting' ? 'text-blue-600' : (progress.scoutResult ? 'text-emerald-600' : 'text-slate-400')}`}>
                    {progress.scoutResult ? 'Complete' : (progress.stage === 'scouting' ? 'Scanning' : 'Waiting')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Analyzes market trends and retrieves high-performing viral structures.</p>
              </div>
            </div>

            {/* Writer */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${progress.stage === 'writing' ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)] animate-pulse' : (progress.draft ? 'bg-emerald-500' : 'bg-slate-200')} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10`}>
                <PenTool className={`w-4 h-4 ${progress.stage === 'writing' || progress.draft ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">Writer Agent</h4>
                  <span className={`text-xs font-bold uppercase tracking-widest ${progress.stage === 'writing' ? 'text-blue-600' : (progress.draft ? 'text-emerald-600' : 'text-slate-400')}`}>
                    {progress.draft ? 'Complete' : (progress.stage === 'writing' ? 'Drafting' : 'Waiting')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Synthesizes the framework with your Voice DNA to craft the initial draft.</p>
              </div>
            </div>

            {/* Critic */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${progress.stage === 'critiquing' ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)] animate-pulse' : (progress.criticResult ? 'bg-emerald-500' : 'bg-slate-200')} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10`}>
                <CheckCircle className={`w-4 h-4 ${progress.stage === 'critiquing' || progress.criticResult ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">Critic Agent</h4>
                  <span className={`text-xs font-bold uppercase tracking-widest ${progress.stage === 'critiquing' ? 'text-blue-600' : (progress.criticResult ? 'text-emerald-600' : 'text-slate-400')}`}>
                    {progress.criticResult ? 'Complete' : (progress.stage === 'critiquing' ? 'Auditing' : 'Waiting')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Scores the draft against 20+ viral parameters and refines hook velocity.</p>
              </div>
            </div>

            {progress.stage === 'error' && (
              <div className="relative z-10 flex items-center justify-center mt-8">
                <div className="flex items-center space-x-3 text-red-600 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-medium shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Pipeline Error: {progress.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Results */}
      {progress.stage === 'complete' && progress.criticResult && (
        <div className="mt-12">
          <PostEditor 
            content={progress.criticResult.improvedPost} 
            score={progress.criticResult.finalScore}
            notes={progress.criticResult.critiqueNotes}
          />
        </div>
      )}
    </div>
  );
}
