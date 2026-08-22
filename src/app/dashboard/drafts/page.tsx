"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { isLocalMode } from "@/lib/localMode";
import { FileText, Calendar, PenTool } from "lucide-react";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Basic fetch setup (assuming a 'drafts' table exists in Supabase)
    const fetchDrafts = async () => {
      if (isLocalMode()) {
        setIsLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDrafts(data);
      }
      setIsLoading(false);
    };

    fetchDrafts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Drafts & History</h1>
        <p className="text-slate-500 mt-2">Manage your AI-generated posts and version history.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading drafts...</div>
        ) : drafts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No drafts yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              When you generate posts in the Content Factory and save them, they will appear here.
            </p>
            <a
              href="/dashboard/create"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Content Factory
            </a>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {draft.topic || "Untitled Draft"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{draft.content}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <PenTool className="w-3.5 h-3.5 mr-1" />
                      Score: {draft.score}/100
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
