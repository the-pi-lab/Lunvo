"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { runBootMaintenance } from "@/lib/cacheBust";
import PWARegister from "@/components/PWARegister";
import SilkCanvas from "@/components/fx/SilkCanvas";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandK from "./CommandK";

export interface UserProfile {
  name: string;
  plan: string;
}

interface AppShellProps {
  profile: UserProfile | null;
  localMode: boolean;
  children: React.ReactNode;
}

const SIDEBAR_KEY = "lunvo-sidebar-collapsed";

export default function AppShell({ profile, localMode, children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);

  useEffect(() => {
    runBootMaintenance();
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "true");
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          window.localStorage.setItem(SIDEBAR_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    };
    window.addEventListener("lunvo:toggle-sidebar", handler);
    return () => window.removeEventListener("lunvo:toggle-sidebar", handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = useCallback(async () => {
    window.location.href = "/";
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen bg-background text-on-background font-sans">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        onLogout={handleLogout}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <SilkCanvas intensity={0.4} speed={0.45} />
        </div>

        <Topbar
          userName={profile?.name ?? "Loading..."}
          plan={localMode ? "offline" : (profile?.plan ?? "free")}
          localMode={localMode}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenCmdK={() => setCmdkOpen(true)}
        />

        {localMode && !pathname?.startsWith("/dashboard/workflow") && (
          <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <div className="max-w-7xl mx-auto flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] bg-tertiary/10 border border-tertiary/25">
              <Zap className="w-3.5 h-3.5 text-tertiary shrink-0" />
              <p className="text-xs font-semibold text-on-background">
                Local Mode — no login needed. Everything runs on your machine; add an API key in
                Settings for AI.
              </p>
            </div>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
          className={
            pathname?.startsWith("/dashboard/workflow")
              ? "flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden p-0"
              : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10"
          }
        >
          {children}
        </main>
      </div>

      <CommandK open={cmdkOpen} onClose={() => setCmdkOpen(false)} onLogout={handleLogout} />

      <PWARegister />
    </div>
  );
}
