"use client";

import { useEffect, useState } from "react";
import { FileText, Calendar, Trash2, PenTool } from "lucide-react";
import { getDrafts, deleteDraft, type LocalDraft } from "@/lib/localStore";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDrafts(getDrafts());
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDrafts(getDrafts());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-background">Drafts & History</h1>
        <p className="text-on-surface-variant mt-2">
          Saved locally on your machine. Private by default.
        </p>
      </div>

      <div className="glass rounded-[16px] !border-transparent overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-on-surface-variant shimmer rounded-[16px]">
            Loading drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-on-background mb-1">No drafts yet</h3>
            <p className="text-sm text-on-surface-variant mb-5">
              Create a post in the Studio and hit Save Draft — it lands here, stored only on your
              device.
            </p>
            <a
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold hover:shadow-premium transition-all"
            >
              <PenTool className="w-4 h-4" /> Open Studio
            </a>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="group flex items-start gap-4 p-5 hover:bg-surface-container-low transition-colors"
              >
                <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-background truncate">{draft.title}</p>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 whitespace-pre-line">
                    {draft.content.slice(0, 160)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[0.6875rem] text-on-surface-variant/60">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wide">
                      {draft.source}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(draft.id)}
                  className="p-2 rounded-[8px] text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
