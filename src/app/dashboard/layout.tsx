"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  PenTool, 
  BarChart2, 
  Bookmark, 
  BookOpen,
  Settings,
  LogOut,
  CreditCard,
  User
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- Navigation Configuration ---
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Create Post", href: "/dashboard/create", icon: PenTool },
  { label: "Analyze Post", href: "/dashboard/analyze", icon: BarChart2 },
  { label: "Saved Drafts", href: "/dashboard/drafts", icon: Bookmark },
  { label: "Daily Learn", href: "/dashboard/learn", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Create Post", href: "/dashboard/create", icon: PenTool },
  { label: "Analyze Post", href: "/dashboard/analyze", icon: BarChart2 },
  { label: "Saved Drafts", href: "/dashboard/drafts", icon: Bookmark },
  { label: "Daily Learn", href: "/dashboard/learn", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [userProfile, setUserProfile] = useState<{ name: string; plan: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("full_name, plan, persona_complete")
        .eq("id", user.id)
        .single();

      if (!isMounted) {
        return;
      }

      if (data && data.persona_complete === false) {
        router.replace("/onboarding");
        return;
      }

      setUserProfile({
        name: data?.full_name || "Creative User",
        plan: data?.plan || "free"
      });
    };

    void getProfile();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      // Clear auth cookies on the server first to prevent middleware bounce-back.
      await fetch("/api/auth/signout", { method: "POST" });
      // Also clear local session cache in the browser.
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-on-background font-sans">
      {/* Sidebar - Desktop (Dark Atelier) */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen z-10" style={{ background: "#1A1814" }}>
        {/* Logo */}
        <div className="px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5">
            <img src="/brand/lunvo-logo.png" alt="LUNVO logo" className="w-5 h-5 rounded-[4px] object-contain" />
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white/90">LUNVO</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-white/[0.06]" />

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-[8px] font-medium transition-all ${
                  isActive
                    ? "text-[#2563eb] bg-white/[0.04]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                {/* Active needle indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#2563eb] rounded-r-full" />
                )}
                <Icon className="w-[1.1rem] h-[1.1rem] flex-shrink-0" />
                <span className="text-[0.8125rem] font-bold uppercase tracking-[0.06em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom utility section */}
        <div className="mx-6 h-px bg-white/[0.06]" />
        <nav className="p-4 py-2 space-y-1">
          <Link
            href="/support"
            className="flex items-center gap-3 px-4 py-2 rounded-[8px] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all"
          >
            Support
          </Link>
          <Link
            href="/changelog"
            className="flex items-center gap-3 px-4 py-2 rounded-[8px] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all"
          >
            Changelog
          </Link>
          <a
            href="https://www.thepilab.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-[8px] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all"
          >
            THE Π LAB
          </a>
          <a
            href="https://www.linkedin.com/company/the-%CF%80-lab/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-[8px] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-all"
          >
            LinkedIn
          </a>
        </nav>

        {/* User Profile Footer */}
        <div className="mx-6 h-px bg-white/[0.06]" />
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 border border-white/[0.05]">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[0.75rem] font-bold text-white/80 truncate leading-tight">
                {userProfile?.name || "Loading..."}
              </span>
              <span className="text-[0.625rem] font-bold uppercase tracking-widest text-[#2563eb] font-mono">
                {userProfile?.plan || "Free"} Entity
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-white/30 hover:text-red-400 hover:bg-white/[0.03] rounded-[8px] transition-all group"
          >
            <LogOut className="w-[0.9rem] h-[0.9rem] transition-colors" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]">
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-background border-t border-[rgba(229,226,218,0.4)] overflow-x-auto no-scrollbar">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-none min-w-[72px] flex flex-col items-center gap-1.5 px-2 py-2 rounded-[8px] transition-all ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon className="w-[1.15rem] h-[1.15rem]" />
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
