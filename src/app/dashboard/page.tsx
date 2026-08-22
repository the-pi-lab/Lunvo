"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  PenTool, 
  BarChart2, 
  Repeat, 
  Settings2,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import Link from "next/link";
import CreditBadge from "@/components/shared/CreditBadge";

interface UserData {
  full_name: string;
  plan: string;
  streak_count: number;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const localMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.trim() === '';
    setIsLocalMode(localMode);

    const fetchData = async () => {
      if (localMode) {
        if (isMounted) {
          setUserData({
            full_name: "Local Commander",
            plan: "offline",
            streak_count: 99
          });
          setLoading(false);
        }
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, plan, streak_count")
        .eq("id", user.id)
        .single();

      if (isMounted) {
        setUserData({
          full_name: profile?.full_name || "User",
          plan: profile?.plan || "free",
          streak_count: profile?.streak_count || 0,
        });
        setLoading(false);
      }
    };

    void fetchData();
    return () => { isMounted = false; };
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-1">{greeting}</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {userData?.full_name.split(" ")[0]},<br />
            <span className="text-slate-400 font-medium">welcome to Mission Control.</span>
          </h1>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <CreditBadge />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 font-mono">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Main Action Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* 1. Content Factory */}
        <Link href="/dashboard/create" className="group block bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(37,99,235,0.08)] hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <PenTool className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Content Factory</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed text-sm">
              Deploy our 3-Agent Neural Pipeline (Scout → Writer → Critic) to generate highly optimized LinkedIn posts from a single prompt.
            </p>
            <div className="flex items-center text-sm font-bold text-blue-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Initialize Pipeline <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* 2. Voice DNA */}
        <Link href="/dashboard/settings" className="group block bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.08)] hover:border-emerald-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Settings2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Voice DNA Tuner</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed text-sm">
              Calibrate your unique writing style. The system automatically injects your tone into every generation to ensure authenticity.
            </p>
            <div className="flex items-center text-sm font-bold text-emerald-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Configure DNA <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* 3. Engagement Analyzer */}
        <Link href="/dashboard/analyze" className="group block bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(139,92,246,0.08)] hover:border-indigo-200 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <BarChart2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Engagement Predictor</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed text-sm">
              Audit your existing drafts against our AI scoring matrix. Identify hook weaknesses and structural flaws before you publish.
            </p>
            <div className="flex items-center text-sm font-bold text-indigo-600 uppercase tracking-widest group-hover:gap-3 transition-all gap-2">
              Run Analysis <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* 4. Repurposer Studio */}
        <div className="group block bg-slate-50 rounded-3xl p-8 border border-slate-200 border-dashed relative overflow-hidden opacity-80 hover:opacity-100 transition-all duration-300 cursor-not-allowed">
          <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest">
            Coming Soon
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mb-6">
              <Repeat className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Repurposer Studio</h2>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed text-sm">
              Turn YouTube videos, podcast transcripts, and blog posts into viral LinkedIn threads with a single click.
            </p>
            <div className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-widest gap-2">
              In Development <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Streak</p>
            <p className="text-xl font-bold text-slate-900">{userData?.streak_count} Days</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Algorithmic Match</p>
            <p className="text-xl font-bold text-slate-900">94%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
