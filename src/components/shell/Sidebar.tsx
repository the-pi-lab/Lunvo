"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { NAV_ITEMS, isNavActive } from "./nav-config";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  isSigningOut: boolean;
}

function SidebarInner({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onLogout,
  isSigningOut,
}: SidebarProps) {
  const pathname = usePathname();
  const isCollapsed = collapsed;

  return (
    <aside
      className={`glass flex h-full flex-col !border-0 border-r border-white/70 transition-[width] duration-200 ease-out ${
        isCollapsed ? "w-[72px]" : "w-[280px]"
      }`}
    >
      {/* Logo row */}
      <div
        className={`flex h-14 items-center border-b border-[rgba(229,226,218,0.35)] ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0"
          onClick={onCloseMobile}
        >
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-sm">
            <span className="text-on-primary font-bold text-sm">L</span>
          </div>
          {!isCollapsed && (
            <span className="font-serif italic text-xl text-on-background truncate">LUNVO</span>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("lunvo:toggle-sidebar"))}
            className="hidden lg:flex p-1.5 rounded-[8px] text-on-surface-variant/60 hover:text-on-background hover:bg-surface-container transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-[10px] text-sm font-semibold transition-all ${
                isCollapsed ? "justify-center px-0 h-10 w-full" : "px-3 py-2.5"
              } ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-background"
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${active ? "text-primary" : "text-on-surface-variant/70 group-hover:text-on-background"} transition-colors`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom utilities */}
      <div className={`border-t border-[rgba(229,226,218,0.35)] py-3 px-2 space-y-0.5`}>
        <Link
          href="/dashboard/settings"
          onClick={onCloseMobile}
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 rounded-[8px] text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-background transition-colors ${
            isCollapsed ? "h-9 justify-center px-0 w-full" : "px-3 py-2"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={onLogout}
          disabled={isSigningOut}
          title={isCollapsed ? "Sign out" : undefined}
          className={`w-full flex items-center gap-3 rounded-[8px] text-sm font-semibold text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50 ${
            isCollapsed ? "h-9 justify-center px-0" : "px-3 py-2"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
        </button>

        {/* Expand button when collapsed (desktop) */}
        {isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("lunvo:toggle-sidebar"))}
            className="hidden lg:flex w-full h-9 items-center justify-center rounded-[8px] text-on-surface-variant/60 hover:text-on-background hover:bg-surface-container transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </aside>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { mobileOpen, onCloseMobile } = props;

  return (
    <>
      {/* Desktop static */}
      <div className="hidden lg:block h-screen sticky top-0">
        <SidebarInner {...props} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu overlay"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
          />
          <div className="absolute left-0 top-0 h-full w-[280px] shadow-premium animate-in slide-in-from-left duration-200">
            <SidebarInner {...props} collapsed={false} />
          </div>
        </div>
      )}
    </>
  );
}
