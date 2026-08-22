"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Flame, 
  BarChart2, 
  Zap, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  Star
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import CreditBadge from "@/components/shared/CreditBadge";

// --- Types ---
interface UserData {
  full_name: string;
  plan: string;
  daily_analyze_count: number;
  daily_generate_count: number;
  streak_count: number;
  post_count?: number;
}

interface RatingItem {
  display_name: string;
  rating: number;
  opinion: string;
  created_at: string;
}

const RATING_PROMPT_MIN_STREAK_DAYS = 3;
const RATING_PROMPT_MIN_POSTS = 2;
const RATING_PROMPT_COOLDOWN_HOURS = 24;
const RATING_PROMPT_LAST_DISMISSED_KEY = "lunvo_rating_prompt_last_dismissed_at";

function getDailyGenerateLimit(plan: string) {
  if (plan === "pro") return 10;
  if (plan === "starter") return 5;
  return 2;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [ratingsFeed, setRatingsFeed] = useState<RatingItem[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingName, setRatingName] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingOpinion, setRatingOpinion] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const isRatingPromptCoolingDown = () => {
    if (typeof window === "undefined") {
      return false;
    }

    const lastDismissedAt = window.localStorage.getItem(RATING_PROMPT_LAST_DISMISSED_KEY);
    if (!lastDismissedAt) {
      return false;
    }

    const dismissedAtMs = new Date(lastDismissedAt).getTime();
    if (Number.isNaN(dismissedAtMs)) {
      return false;
    }

    const elapsedHours = (Date.now() - dismissedAtMs) / (1000 * 60 * 60);
    return elapsedHours < RATING_PROMPT_COOLDOWN_HOURS;
  };

  const handleRatingLater = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RATING_PROMPT_LAST_DISMISSED_KEY, new Date().toISOString());
    }
    setShowRatingModal(false);
  };

  const refreshRatingsFeed = async () => {
    try {
      const feedRes = await fetch("/api/ratings", { cache: "no-store" });
      if (!feedRes.ok) return;
      const feedJson = await feedRes.json();
      setRatingsFeed(feedJson.ratings || []);
    } catch (error) {
      console.error("Failed to fetch ratings feed:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const [{ data: profile }, { count: postCount }] = await Promise.all([
        supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single(),
        supabase
          .from("posts")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id),
      ]);

      if (!isMounted) {
        return;
      }

      setUserData({
        full_name: profile?.full_name || "User",
        plan: profile?.plan || "free",
        daily_analyze_count: profile?.daily_analyze_count || 0,
        daily_generate_count: profile?.daily_generate_count || 0,
        streak_count: profile?.streak_count || 0,
        post_count: postCount || 0,
      });

      setRatingName(profile?.full_name || "");

      try {
        const myRes = await fetch("/api/ratings/me", { cache: "no-store" });
        if (myRes.ok) {
          const myJson = await myRes.json();
          const streakCount = profile?.streak_count || 0;
          const totalPosts = postCount || 0;
          const hasConsistentUsage =
            streakCount >= RATING_PROMPT_MIN_STREAK_DAYS &&
            totalPosts >= RATING_PROMPT_MIN_POSTS;

          if (!myJson.hasRated && hasConsistentUsage && !isRatingPromptCoolingDown()) {
            setShowRatingModal(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch my rating status:", error);
      }

      await refreshRatingsFeed();

      if (isMounted) {
        setLoading(false);
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-surface-container rounded-[8px] w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-surface-container rounded-[12px]" />
          <div className="h-36 bg-surface-container rounded-[12px]" />
          <div className="h-36 bg-surface-container rounded-[12px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-56 bg-surface-container rounded-[12px]" />
          <div className="h-56 bg-surface-container rounded-[12px]" />
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const submitRating = async () => {
    if (!ratingName.trim() || ratingValue < 1 || !ratingOpinion.trim()) {
      return;
    }

    setRatingSubmitting(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: ratingName.trim(),
          rating: ratingValue,
          opinion: ratingOpinion.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(RATING_PROMPT_LAST_DISMISSED_KEY);
      }
      setShowRatingModal(false);
      await refreshRatingsFeed();
    } catch (error) {
      console.error("Rating submit failed:", error);
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Greeting Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pt-2">
        <div>
          <p className="text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-on-background leading-tight">
            {userData?.full_name.split(" ")[0]},<br />
            <span className="text-on-surface-variant/60">your suite is ready.</span>
          </h1>
        </div>
        <div className="flex flex-col gap-2 md:gap-3 w-full md:w-auto md:items-end">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
            <span className="px-3 py-1 bg-primary/8 text-primary rounded-[6px] text-[0.625rem] font-bold uppercase tracking-[0.1em] ring-1 ring-primary/15 font-mono">
              {userData?.plan} Entity
            </span>
          </div>
          <CreditBadge />
        </div>
      </div>

      {/* Ratings Ticker */}
      {ratingsFeed.length > 0 && (
        <div className="overflow-hidden rounded-[12px] border border-[rgba(229,226,218,0.5)] bg-surface-container-lowest p-3 shadow-premium">
          <div className="rating-track flex w-max items-center gap-3">
            {[...ratingsFeed, ...ratingsFeed].map((item, idx) => (
              <div
                key={`${item.display_name}-${item.created_at}-${idx}`}
                className="min-w-[280px] rounded-[8px] border border-[rgba(229,226,218,0.5)] bg-white px-3 py-2"
              >
                <p className="text-[0.75rem] font-semibold text-on-background">
                  {item.display_name} rated {"★".repeat(item.rating)}
                </p>
                <p className="text-[0.72rem] text-on-surface-variant line-clamp-1">{item.opinion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        <StatCard
          label="Content Assets"
          value={userData?.post_count?.toString() || "0"}
          icon={BarChart2}
          trend="Updated live"
        />
        <StatCard
          label="Writing Streak"
          value={(userData?.streak_count || 0).toString()
          }
          icon={TrendingUp}
          trend="Based on your activity"
        />
        <StatCard
          label="Generation Quota"
          value={`${userData?.daily_generate_count || 0}/${getDailyGenerateLimit(userData?.plan || "free")}`}
          icon={Zap}
          trend="Refreshes 00:00 UTC"
        />
      </div>

      {/* Streak + Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Panel */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[12px] p-6 sm:p-8 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[1rem] font-serif text-on-background flex items-center gap-2">
                <Flame className="w-4 h-4 text-tertiary" /> Writing Streak
              </h2>
              <p className="text-xs text-on-surface-variant/60 mt-1">
                Days you used LinkedIn AI to write or analyze posts
              </p>
            </div>
            <div className="px-3 py-1 bg-surface-container rounded-[6px] font-mono text-[0.6875rem] font-bold text-tertiary ring-1 ring-[rgba(229,226,218,0.5)]">
              🔥 {userData?.streak_count} active days
            </div>
          </div>

          <div className="flex justify-between items-end gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const isToday = day === format(new Date(), "eee");
              const isPast = i < new Date().getDay() - 1;
              return (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[0.6rem] font-bold text-on-surface-variant/50 uppercase tracking-widest font-mono">{day}</span>
                  <div className={`w-full max-w-[48px] aspect-square rounded-[10px] flex items-center justify-center transition-all ${
                    isToday
                      ? "bg-gradient-to-br from-primary to-primary-container shadow-[0_4px_16px_rgba(37,99,235,0.25)] ring-2 ring-primary/20"
                      : isPast
                      ? "bg-surface-container"
                      : "bg-surface-2"
                  }`}>
                    {isPast && <CheckIcon />}
                    {isToday && <Plus className="w-5 h-5 text-on-primary" />}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Based on days you used this tool. Keep your streak alive by analyzing
            or generating a post each day.
          </p>
        </div>

        {/* Priority Action Card */}
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-[12px] p-7 text-on-primary flex flex-col justify-between shadow-premium relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-[0.06] pointer-events-none">
            <Sparkles className="w-40 h-40 text-white" />
          </div>
          <div className="relative z-10">
            <div className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] font-mono opacity-70 mb-5">Priority Objective</div>
            <h3 className="text-xl font-serif mb-3 leading-snug">Vulnerability Arbitrage</h3>
            <p className="text-[0.875rem] opacity-80 leading-relaxed">
              Disclose one tactical failure and the resulting systemic correction. Algorithm strongly favors narrative authenticity.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="mt-7 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-on-primary border border-white/20 py-3 rounded-[8px] font-bold text-[0.8125rem] text-center transition-all flex items-center justify-center gap-2 relative z-10 uppercase tracking-[0.05em]"
          >
            Initiate Draft <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <SuggestionCard
          title="Optimal Broadcasting Window"
          body="Network activity indicates maximum visibility at 18:00 UTC. Schedule your next post for peak reach."
          icon={Clock}
          cta="Configure Schedule"
        />
        <SuggestionCard
          title="Engagement Mechanics"
          body="Terminal inquiries (questions at the end) increase engagement volume by 45% across your audience segment."
          icon={LightbulbIcon}
          cta="View Examples"
        />
      </div>

      {/* Weekly Editorial Schedule */}
      <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
        <div className="px-5 py-5 md:px-8 md:py-6 border-b border-[rgba(229,226,218,0.3)] flex items-center justify-between bg-surface-2/30 gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-serif text-on-background">Weekly Posting Schedule</h3>
            <p className="text-[0.6875rem] font-bold text-on-surface-variant/50 uppercase tracking-widest font-mono mt-1">AI-Optimized Time Blocks</p>
          </div>
          <div className="px-3 py-1 bg-primary/8 text-primary text-[0.5625rem] font-bold uppercase tracking-widest rounded-[4px] font-mono ring-1 ring-primary/15 shrink-0">
            Strategy v1.0
          </div>
        </div>

        <div className="md:hidden p-4 space-y-4">
          {SCHEDULE_DATA.map((row) => (
            <div key={row.day} className="rounded-[10px] border border-[rgba(229,226,218,0.4)] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[0.625rem] font-bold text-on-surface-variant/40 uppercase tracking-widest font-mono mb-1">{row.shortDay}</div>
                  <div className="text-[1.125rem] font-serif text-on-background">{row.day}</div>
                </div>
                <div className="inline-block px-2 py-0.5 rounded-[4px] text-[0.5rem] font-bold uppercase tracking-widest" style={{ background: row.tagColor + "15", color: row.tagColor, border: `1px solid ${row.tagColor}30` }}>
                  {row.tag}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {row.slots.map((slot, i) => (
                  <div key={slot} className={`px-2.5 py-1 rounded-[4px] text-[0.6875rem] font-bold font-mono border ${
                    i === 0 ? "bg-primary/5 text-primary border-primary/10" : "bg-surface-2 text-on-surface-variant/60 border-[rgba(229,226,218,0.3)]"
                  }`}>
                    {slot}
                  </div>
                ))}
              </div>

              <div className="mt-3 text-[0.9rem] font-bold text-on-background">{row.contentType}</div>
              <p className="mt-1 text-[0.75rem] text-on-surface-variant leading-relaxed opacity-80">{row.contentDesc}</p>

              <div className="mt-3 flex items-center justify-between rounded-[6px] bg-surface-2/60 px-2.5 py-2">
                <span className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">Intensity</span>
                <div className="flex items-center gap-2">
                  <IntensityBar level={row.intensity} />
                  <span className="text-[0.5625rem] font-bold font-mono text-on-surface-variant/40 uppercase tracking-tighter">{row.intensity}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[880px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-2/40 border-b border-[rgba(229,226,218,0.2)]">
                <th className="px-8 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono">Day</th>
                <th className="px-8 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono">Best Slots</th>
                <th className="px-8 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono">Content Strategy</th>
                <th className="px-8 py-4 text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/40 font-mono text-center">Intensity</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE_DATA.map((row, idx) => (
                <tr key={row.day} className={`group hover:bg-primary/[0.02] transition-colors ${idx < SCHEDULE_DATA.length - 1 ? "border-b border-[rgba(229,226,218,0.15)]" : ""}`}>
                  <td className="px-8 py-6">
                    <div className="text-[0.625rem] font-bold text-on-surface-variant/40 uppercase tracking-widest font-mono mb-1">{row.shortDay}</div>
                    <div className="text-[1.125rem] font-serif text-on-background">{row.day}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                      {row.slots.map((slot, i) => (
                        <div key={i} className={`px-2.5 py-1 rounded-[4px] text-[0.6875rem] font-bold font-mono border ${
                          i === 0 ? "bg-primary/5 text-primary border-primary/10" : "bg-surface-2 text-on-surface-variant/60 border-[rgba(229,226,218,0.3)]"
                        }`}>
                          {slot}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <div className="inline-block px-2 py-0.5 rounded-[4px] text-[0.5rem] font-bold uppercase tracking-widest mb-2" style={{ background: row.tagColor + '15', color: row.tagColor, border: `1px solid ${row.tagColor}30` }}>
                      {row.tag}
                    </div>
                    <div className="text-[0.875rem] font-bold text-on-background mb-1">{row.contentType}</div>
                    <p className="text-[0.75rem] text-on-surface-variant leading-relaxed opacity-80">{row.contentDesc}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center flex-col items-center gap-1.5">
                      <IntensityBar level={row.intensity} />
                      <span className="text-[0.5625rem] font-bold font-mono text-on-surface-variant/30 uppercase tracking-tighter">{row.intensity}/5</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-serif text-gray-900 mb-2">Rate this tool</h3>
            <p className="text-sm text-gray-600 mb-4">Please share your name, star rating, and honest opinion.</p>

            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Your Name</label>
            <input
              value={ratingName}
              onChange={(e) => setRatingName(e.target.value)}
              className="w-full rounded-[8px] border border-gray-300 px-3 py-2 text-sm mb-4"
              placeholder="Enter your name"
            />

            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Your Rating</label>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingValue(star)}
                  className="p-1"
                >
                  <Star className={`h-6 w-6 ${star <= ratingValue ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Your Opinion</label>
            <textarea
              value={ratingOpinion}
              onChange={(e) => setRatingOpinion(e.target.value)}
              className="w-full min-h-[100px] rounded-[8px] border border-gray-300 px-3 py-2 text-sm mb-5"
              placeholder="Tool ke baare me apni opinion likho"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleRatingLater}
                className="rounded-[8px] border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Later
              </button>
              <button
                type="button"
                onClick={submitRating}
                disabled={ratingSubmitting || !ratingName.trim() || !ratingOpinion.trim() || ratingValue < 1}
                className="rounded-[8px] bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {ratingSubmitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rating-track {
          animation: rating-scroll 32s linear infinite;
        }

        @keyframes rating-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

const SCHEDULE_DATA = [
  { day: "Monday", shortDay: "MON", slots: ["8:00 AM", "11:00 AM", "1:00 PM"], contentType: "Thought Leadership", contentDesc: "Sets the tone for the week. Career lessons or personal insights.", tag: "Inspire", tagColor: "#6366f1", intensity: 3 },
  { day: "Tuesday", shortDay: "TUE", slots: ["7:00 AM", "11:00 AM", "4:00 PM"], contentType: "Case Study / Results", contentDesc: "Data-backed wins or process breakdowns. Best day for prime content.", tag: "Prime Day", tagColor: "#2563eb", intensity: 5 },
  { day: "Wednesday", shortDay: "WED", slots: ["8:00 AM", "12:00 PM", "3:00 PM"], contentType: "Educational / How-To", contentDesc: "Carousels and tactical tips. Middle-of-the-week learning mode.", tag: "Educate", tagColor: "#0891b2", intensity: 4 },
  { day: "Thursday", shortDay: "THU", slots: ["9:00 AM", "1:00 PM", "4:00 PM"], contentType: "Opinion / Hot Take", contentDesc: "Challenge a common belief. Controversy driven engagement.", tag: "Debate", tagColor: "#7c3aed", intensity: 4 },
  { day: "Friday", shortDay: "FRI", slots: ["8:00 AM", "11:00 AM"], contentType: "Behind the Scenes", contentDesc: "Human content wins. Personal story or weekend look-ahead.", tag: "Connect", tagColor: "#059669", intensity: 2 },
  { day: "Saturday", shortDay: "SAT", slots: ["9:00 AM", "12:00 PM"], contentType: "Long-form / Essay", contentDesc: "Deep personal essay. Less competition means more feed space.", tag: "Deep Dive", tagColor: "#d97706", intensity: 3 },
  { day: "Sunday", shortDay: "SUN", slots: ["7:00 AM"], contentType: "Poll / Teaser", contentDesc: "One strong question or a preview of your week ahead.", tag: "Warm Up", tagColor: "#64748b", intensity: 1 },
];

function IntensityBar({ level }: { level: number }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1 h-3.5 rounded-[1px] transition-all ${
            i <= level ? "bg-primary" : "bg-surface-container"
          }`}
          style={{ opacity: i <= level ? 0.3 + i * 0.14 : 1 }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: React.ElementType; trend: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-[12px] p-4 sm:p-5 md:p-7 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium hover:ring-primary/20 transition-all group">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="p-2.5 bg-surface-2 rounded-[8px]">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
        </div>
        <span className="text-[0.5rem] sm:text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-primary/70 font-mono">{trend}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-serif text-on-background mb-1">{value}</div>
      <div className="text-[0.65rem] sm:text-[0.75rem] font-bold uppercase tracking-wider text-on-surface-variant/60 font-mono">{label}</div>
    </div>
  );
}

function SuggestionCard({ title, body, icon: Icon, cta }: { title: string; body: string; icon: React.ElementType; cta: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-[12px] p-7 ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium flex items-start gap-5">
      <div className="p-3 bg-primary/5 rounded-[8px] flex-shrink-0 ring-1 ring-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-serif text-on-background text-[1rem] mb-2">{title}</h4>
        <p className="text-[0.875rem] font-medium text-on-surface-variant mb-5 leading-relaxed">{body}</p>
        <button className="text-[0.75rem] text-primary font-bold hover:underline underline-offset-4 transition-all flex items-center gap-1 uppercase tracking-wider font-mono">
          {cta} <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary">
      <path d="M16.6667 5L7.50001 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
  );
}
