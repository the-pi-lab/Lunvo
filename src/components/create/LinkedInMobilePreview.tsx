"use client";

import { useState } from "react";
import { MoreHorizontal, ThumbsUp, MessageSquare, Repeat2, Send } from "lucide-react";

interface LinkedInMobilePreviewProps {
  content: string;
  authorName?: string;
  authorTitle?: string;
}

export function LinkedInMobilePreview({ 
  content, 
  authorName = "Your Name", 
  authorTitle = "Your Title / Headline" 
}: LinkedInMobilePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // LinkedIn typically truncates after 3-5 lines or roughly 210 characters.
  // For this simulation, we'll split by newline and show max 4 lines, or truncate by length.
  
  const generateTruncatedContent = (text: string) => {
    if (!text) return "";
    
    const lines = text.split("\n");
    if (lines.length <= 4 && text.length < 210) return text;

    if (lines.length > 4) {
      return lines.slice(0, 4).join("\n") + "... ";
    }
    
    return text.substring(0, 210) + "... ";
  };

  const truncatedContent = generateTruncatedContent(content);
  const needsTruncation = content !== truncatedContent;

  return (
    <div className="bg-[#F3F2EF] dark:bg-black p-4 rounded-xl flex justify-center border border-slate-200 dark:border-slate-800">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-[400px] bg-white dark:bg-[#1B1F23] rounded-sm overflow-hidden shadow-sm">
        
        {/* Post Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex space-x-3">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0"></div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{authorName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{authorTitle}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                Just now • <span className="ml-1 inline-block w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
              </p>
            </div>
          </div>
          <button className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Body */}
        <div className="px-4 pb-2 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-[1.4]">
          {isExpanded || !needsTruncation ? (
            content
          ) : (
            <>
              {truncatedContent}
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              >
                see more
              </button>
            </>
          )}
        </div>

        {/* Engagement Bar */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
          <button className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md flex-1">
            <ThumbsUp className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Like</span>
          </button>
          <button className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md flex-1">
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Comment</span>
          </button>
          <button className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md flex-1">
            <Repeat2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Repost</span>
          </button>
          <button className="flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md flex-1">
            <Send className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">Send</span>
          </button>
        </div>

      </div>
    </div>
  );
}
