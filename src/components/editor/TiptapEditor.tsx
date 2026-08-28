"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback, useRef } from "react";
import { normalizePostText } from "@/lib/ai/voiceDna/ingestor";
import type { Editor } from "@tiptap/react";

interface TiptapEditorProps {
  content: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

const SLASH_COMMANDS = [
  {
    id: "hook",
    label: "/hook",
    title: "Insert Hook",
    desc: "Bold claim hook template",
    insert: "Most LinkedIn advice is designed to make you invisible.\n\n",
  },
  {
    id: "cta",
    label: "/cta",
    title: "Insert CTA",
    desc: "Specific question CTA",
    insert: "\nWhat is the one thing you wish you knew before your first win?\n",
  },
  {
    id: "bullets",
    label: "/bullets",
    title: "Bullet List",
    desc: "Insert bullet list template",
    insert: "\n• Lesson 1:\n• Lesson 2:\n• Lesson 3:\n",
  },
];

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing... Type / for commands",
}: TiptapEditorProps) {
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content
      ? `<p>${content
          .split("\n")
          .map((l) => l || "<br>")
          .join("</p><p>")}</p>`
      : "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-6 text-[0.9375rem] leading-relaxed text-on-background",
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          event.preventDefault();
          const normalized = normalizePostText(text);
          const ed = (view as unknown as { editor?: Editor })?.editor || editorRef.current;
          // Use view dispatch for reliability (avoids stale closure)
          const html = normalized
            .split("\n")
            .map((l) => (l ? `<p>${l}</p>` : "<p><br></p>"))
            .join("");
          // Insert via view's dispatcher after tick
          setTimeout(() => {
            const target = ed || editorRef.current;
            if (target) {
              target.chain().focus().insertContent(html).run();
            } else {
              // fallback: insert via view
              const { state, dispatch } = view;
              const tr = state.tr.insertText(normalized);
              dispatch(tr);
            }
          }, 0);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      editorRef.current = ed as unknown as Editor;
      const text = ed.getText();
      onChange(text);

      // Slash detection: check if last word starts with /
      const { from } = ed.state.selection;
      const textBefore = ed.state.doc.textBetween(Math.max(0, from - 20), from, " ");
      const match = textBefore.match(/(?:^|\s)\/(\w*)$/);
      if (match) {
        setSlashQuery(match[1] ?? "");
        setShowSlash(true);
        setSlashIndex(0);
      } else {
        setShowSlash(false);
      }
    },
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed as unknown as Editor;
    },
  });

  // Keep ref in sync when editor instance changes
  useEffect(() => {
    if (editor) editorRef.current = editor as unknown as Editor;
  }, [editor]);

  // Sync external content changes (e.g., optimizer) — only when not focused to avoid cursor jump
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const current = editor.getText();
    if (current !== content) {
      editor.commands.setContent(
        content
          ? `<p>${content
              .split("\n")
              .map((l) => l || "<br>")
              .join("</p><p>")}</p>`
          : "<p></p>"
      );
    }
  }, [content, editor]);

  const filtered = SLASH_COMMANDS.filter(
    (c) => c.label.includes(slashQuery.toLowerCase()) || c.id.includes(slashQuery.toLowerCase())
  );

  const insertCommand = useCallback(
    (cmd: (typeof SLASH_COMMANDS)[number]) => {
      if (!editor) return;
      // Remove the "/" query
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, " ");
      const match = textBefore.match(/(?:^|\s)\/(\w*)$/);
      if (match) {
        const slashLen = (match[1]?.length ?? 0) + 1; // "/" + query
        editor
          .chain()
          .focus()
          .deleteRange({ from: from - slashLen, to: from })
          .run();
      }
      editor.chain().focus().insertContent(cmd.insert.replace(/\n/g, "<br>")).run();
      setShowSlash(false);
    },
    [editor]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSlash) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        if (filtered[slashIndex]) {
          e.preventDefault();
          insertCommand(filtered[slashIndex]!);
        }
      } else if (e.key === "Escape") {
        setShowSlash(false);
      }
    },
    [showSlash, filtered, slashIndex, insertCommand]
  );

  return (
    <div className="relative flex flex-col" onKeyDown={handleKeyDown}>
      <EditorContent editor={editor} className="w-full flex-1 min-h-[300px] bg-transparent" />
      {showSlash && filtered.length > 0 && (
        <div className="absolute left-6 top-[3.5rem] z-50 w-72 rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/40 shadow-premium overflow-hidden">
          <div className="px-3 py-2 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono border-b border-outline-variant/20">
            Slash commands — type /hook or /cta
          </div>
          {filtered.map((cmd, idx) => (
            <button
              key={cmd.id}
              onClick={() => insertCommand(cmd)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors ${idx === slashIndex ? "bg-surface-container-low" : ""}`}
            >
              <div>
                <div className="text-sm font-semibold text-on-background">{cmd.label}</div>
                <div className="text-xs text-on-surface-variant">{cmd.desc}</div>
              </div>
              <div className="text-[0.625rem] font-mono text-on-surface-variant/40">
                {cmd.title}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* Hint bar */}
      <div className="px-6 py-2 border-t border-outline-variant/20 bg-surface-container-low/30 flex items-center gap-3 text-[0.6875rem] text-on-surface-variant/60">
        <span className="font-mono">Tip: Type</span>
        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-background font-mono text-xs">
          /
        </span>
        <span>for hook/CTA templates</span>
        <span className="ml-auto hidden sm:inline">
          Paste auto-normalizes with normalizePostText
        </span>
      </div>
    </div>
  );
}
