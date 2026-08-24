"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, User } from "lucide-react";
import CreditBadge from "@/components/shared/CreditBadge";
import { getPageTitle } from "./nav-config";

interface TopbarProps {
  userName: string;
  plan: string;
  localMode: boolean;
  onOpenMobile: () => void;
  onOpenCmdK: () => void;
}

export default function Topbar({
  userName,
  plan,
  localMode,
  onOpenMobile,
  onOpenCmdK,
}: TopbarProps) {
  const pathname = usePathname();

  return (
    <header className="glass-strong sticky top-0 z-40 h-12 shrink-0 !border-0 border-b border-white/70">
      <div className="flex h-full items-center gap-2 px-3 sm:px-4">
        {/* Mobile menu */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 -ml-1 rounded-[8px] text-on-surface-variant hover:bg-surface-container hover:text-on-background transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <h1 className="text-sm font-bold text-on-background truncate hidden sm:block">
          {getPageTitle(pathname)}
        </h1>
        {localMode && (
          <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[0.6rem] font-bold uppercase tracking-widest">
            Local
          </span>
        )}

        <div className="flex-1" />

        {/* Cmd+K trigger */}
        <button
          onClick={onOpenCmdK}
          className="flex items-center gap-2 h-8 px-2.5 rounded-[8px] text-on-surface-variant/70 hover:text-on-background hover:bg-surface-container transition-colors"
          aria-label="Open command palette"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-semibold">Search</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-md bg-surface-container px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-on-surface-variant">
            Ctrl K
          </kbd>
        </button>

        {/* Credits */}
        <div className="hidden lg:block">
          <CreditBadge />
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div className="hidden md:flex flex-col items-end leading-none mr-1">
            <span className="text-xs font-bold text-on-background max-w-[140px] truncate">
              {userName}
            </span>
            <span className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 capitalize">
              {plan}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
