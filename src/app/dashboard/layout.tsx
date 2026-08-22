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
  User,
  Zap,
  Menu,
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Create", href: "/dashboard/create", icon: PenTool },
  { label: "Analyze", href: "/dashboard/analyze", icon: BarChart2 },
  { label: "Drafts", href: "/dashboard/drafts", icon: Bookmark },
  { label: "Learn", href: "/dashboard/learn", icon: BookOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [userProfile, setUserProfile] = useState<{ name: string; plan: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      const isLocalMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === '';
      
      if (isLocalMode) {
        if (isMounted) {
          setUserProfile({
            name: "Local Commander",
            plan: "offline"
          });
        }
        return;
      }

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

      if (!isMounted) return;

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
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  const isLocalMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Left Section */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_2px_10px_rgba(37,99,235,0.3)]">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-[0.875rem] font-bold tracking-widest text-slate-900 hidden sm:block">LUNVO</span>
                {isLocalMode && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.6rem] font-bold uppercase tracking-widest">
                    Local
                  </span>
                )}
              </Link>
              
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section: Profile & Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard/settings" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{userProfile?.name || "Loading..."}</p>
                  <p className="text-xs font-medium text-slate-500 capitalize">{userProfile?.plan || "Free"} Plan</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="ml-2 p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-slate-600">
                <Settings className="w-5 h-5" /> Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-red-600">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        {children}
      </main>
    </div>
  );
}
