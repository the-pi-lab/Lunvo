"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, Settings, Sparkles } from "lucide-react";
import { NAV_ITEMS, isNavActive } from "./nav-config";
import { Logo } from "@/components/ui/Logo";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

function SidebarInner({ collapsed, mobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isCollapsed = collapsed;

  return (
    <aside
      className={`glass flex h-full flex-col !border-0 border-r border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-xl transition-[width] duration-200 ease-out shadow-xs ${
        isCollapsed ? "w-[72px]" : "w-[280px]"
      }`}
    >
      {/* Logo row */}
      <div
        className={`flex h-15 items-center border-b border-outline-variant/30 ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 min-w-0 group"
          onClick={onCloseMobile}
        >
          <div className="shrink-0 group-hover:scale-105 transition-transform">
            <Logo size={34} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif italic font-bold text-xl text-on-background tracking-tight leading-none">
                LUNVO
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary/80 leading-tight mt-0.5">
                Autonomous OS
              </span>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("lunvo:toggle-sidebar"))}
            className="hidden lg:flex p-1.5 rounded-lg text-on-surface-variant/60 hover:text-on-background hover:bg-surface-container transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          const isNew = item.href === "/dashboard/workflow";
          const isBot = item.href === "/dashboard/telegram";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl text-xs font-bold transition-all duration-150 ${
                isCollapsed ? "justify-center px-0 h-10 w-full" : "px-3 py-2.5"
              } ${
                active
                  ? "bg-primary/10 text-primary shadow-xs"
                  : "text-on-surface-variant/80 hover:bg-surface-container/70 hover:text-on-background"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
              )}
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110 ${
                  active
                    ? "text-primary"
                    : "text-on-surface-variant/70 group-hover:text-on-background"
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {isNew && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      NEW
                    </span>
                  )}
                  {isBot && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                      BOT
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom utilities */}
      <div className="border-t border-outline-variant/30 py-3 px-2.5 space-y-1 bg-surface-container/20">
        <Link
          href="/dashboard/settings"
          onClick={onCloseMobile}
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 rounded-xl text-xs font-bold text-on-surface-variant/80 hover:bg-surface-container hover:text-on-background transition-colors ${
            isCollapsed ? "h-9 justify-center px-0 w-full" : "px-3 py-2"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings & Vault</span>}
        </Link>
        <button
          onClick={onLogout}
          title={isCollapsed ? "Sign out" : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 ${
            isCollapsed ? "h-9 justify-center px-0" : "px-3 py-2"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Exit Studio</span>}
        </button>

        {/* Expand button when collapsed (desktop) */}
        {isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("lunvo:toggle-sidebar"))}
            className="hidden lg:flex w-full h-9 items-center justify-center rounded-xl text-on-surface-variant/60 hover:text-on-background hover:bg-surface-container transition-colors"
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
      <div className="hidden lg:block h-screen sticky top-0 z-30">
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
          <div className="absolute left-0 top-0 h-full w-[280px] shadow-2xl animate-in slide-in-from-left duration-200 z-50">
            <SidebarInner {...props} collapsed={false} />
          </div>
        </div>
      )}
    </>
  );
}
