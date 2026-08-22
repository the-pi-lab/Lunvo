"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  CreditCard,
  ShieldCheck,
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface UserProfile {
  full_name: string;
  email: string;
  plan: string;
  daily_analyze_count: number;
  daily_generate_count: number;
  streak_count: number;
}

function getDailyAnalyzeLimit(plan: string): number {
  if (plan === "pro") return 15;
  if (plan === "starter") return 5;
  return 2;
}

function getDailyGenerateLimit(plan: string): number {
  if (plan === "pro") return 10;
  if (plan === "starter") return 5;
  return 2;
}

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [keysSaved, setKeysSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const p: UserProfile = {
        full_name: data?.full_name || "",
        email: user.email || "",
        plan: data?.plan || "free",
        daily_analyze_count: data?.daily_analyze_count ?? 0,
        daily_generate_count: data?.daily_generate_count ?? 0,
        streak_count: data?.streak_count ?? 0,
      };
      setProfile(p);
      setFullName(p.full_name);

      const storedGemini = localStorage.getItem("lunvo_gemini_key");
      const storedGroq = localStorage.getItem("lunvo_groq_key");
      if (storedGemini) setGeminiKey(storedGemini);
      if (storedGroq) setGroqKey(storedGroq);

      setLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("users")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveKeys = () => {
    localStorage.setItem("lunvo_gemini_key", geminiKey.trim());
    localStorage.setItem("lunvo_groq_key", groqKey.trim());
    setKeysSaved(true);
    setTimeout(() => setKeysSaved(false), 2500);
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    await supabase.auth.resetPasswordForEmail(profile.email);
    alert(`Password reset email sent to ${profile.email}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse pt-2">
        <div className="h-10 bg-surface-container rounded-[8px] w-1/3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-surface-container rounded-[12px]" />
        ))}
      </div>
    );
  }

  const isPro = profile?.plan === "pro";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-2">Configuration</p>
        <h1 className="text-4xl font-serif text-on-background">Settings</h1>
      </div>

      {/* Profile Section */}
      <SettingsCard
        icon={<User className="w-4 h-4" />}
        title="Identity"
        subtitle="Your editorial profile"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.4)] focus:ring-[2px] focus:ring-primary focus:bg-white outline-none text-[0.9375rem] font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)]">
              <Mail className="w-4 h-4 text-on-surface-variant/30 flex-shrink-0" />
              <span className="text-[0.9375rem] font-mono text-on-surface-variant/70">{profile?.email}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || fullName === profile?.full_name}
            className={`flex items-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98] disabled:pointer-events-none ${
              saved
                ? "bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                : "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md hover:shadow-premium disabled:opacity-40"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <><Check className="w-4 h-4" /> Saved</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </SettingsCard>

      {/* AI Configuration (BYOK) */}
      <SettingsCard
        icon={<Sparkles className="w-4 h-4" />}
        title="AI Configuration (BYOK)"
        subtitle="Bring Your Own Key for local generation"
      >
        <div className="space-y-5">
          <div className="bg-surface-2 p-4 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)] mb-4">
            <p className="text-[0.8125rem] text-on-surface-variant leading-relaxed">
              LUNVO is 100% free because you provide your own API keys. 
              Keys are stored securely in your browser's local storage and are only sent directly to our backend during generation.
            </p>
          </div>
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Gemini API Key (Google AI Studio)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.4)] focus:ring-[2px] focus:ring-primary focus:bg-white outline-none text-[0.9375rem] font-medium transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-[0.625rem] font-bold uppercase tracking-widest text-on-surface-variant/60 font-mono mb-2">
              Groq API Key (Groq Console)
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-4 py-3.5 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.4)] focus:ring-[2px] focus:ring-primary focus:bg-white outline-none text-[0.9375rem] font-medium transition-all font-mono"
            />
          </div>
          <button
            onClick={handleSaveKeys}
            className={`flex items-center gap-2 px-6 py-3 rounded-[8px] font-bold text-[0.8125rem] uppercase tracking-[0.05em] transition-all active:scale-[0.98] ${
              keysSaved
                ? "bg-secondary/10 text-secondary ring-1 ring-secondary/20"
                : "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md hover:shadow-premium"
            }`}
          >
            {keysSaved ? <><Check className="w-4 h-4" /> Keys Saved locally</> : "Save API Keys"}
          </button>
        </div>
      </SettingsCard>

      {/* Security */}
      <SettingsCard
        icon={<ShieldCheck className="w-4 h-4" />}
        title="Security"
        subtitle="Authentication & access keys"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)]">
            <div>
              <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-1">Password</div>
              <div className="text-[0.9375rem] font-mono text-on-surface-variant/60">••••••••••••</div>
            </div>
            <button
              onClick={handlePasswordReset}
              className="px-4 py-2 bg-surface-container-lowest rounded-[6px] font-bold text-[0.75rem] uppercase tracking-wider text-on-surface-variant font-mono ring-1 ring-[rgba(229,226,218,0.4)] hover:ring-primary/30 hover:text-primary transition-all"
            >
              Reset via Email
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* Help & Legal */}
      <SettingsCard
        icon={<BookOpen className="w-4 h-4" />}
        title="Resources & Legal"
        subtitle="Platform governance and support"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/support" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Help Center</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">FAQs & Analysis Guides</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/privacy" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Privacy Protocol</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Data Governance Standards</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/terms" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Terms of Service</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Usage & Editorial Policy</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </Link>
          <a href="mailto:hello@thepilab.in" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">Contact Concierge</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Direct Strategic Support</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </a>
          <a href="https://www.thepilab.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">THE Π LAB Website</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">www.thepilab.in</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </a>
          <a href="https://www.linkedin.com/company/the-%CF%80-lab/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-surface-2 rounded-[10px] ring-1 ring-[rgba(229,226,218,0.4)] hover:bg-white hover:shadow-premium transition-all group">
            <div>
              <div className="text-[0.8125rem] font-bold text-on-background">THE Π LAB LinkedIn</div>
              <div className="text-[0.6875rem] text-on-surface-variant/60">Official company profile</div>
            </div>
            <ArrowRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
          </a>
        </div>
      </SettingsCard>

    </div>
  );
}

function SettingsCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-[12px] ring-1 ring-[rgba(229,226,218,0.5)] shadow-premium overflow-hidden">
      <div className="flex items-center gap-3 px-7 py-5 border-b border-[rgba(229,226,218,0.3)]">
        <div className="w-7 h-7 bg-primary/8 rounded-[6px] flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <div className="text-[0.875rem] font-bold text-on-background">{title}</div>
          <div className="text-[0.6875rem] font-medium text-on-surface-variant/60">{subtitle}</div>
        </div>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

function QuotaChip({ label, value, suffix = "left" }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="p-4 bg-surface-2 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)] text-center">
      <div className="text-2xl font-serif text-on-background mb-1">{value}</div>
      <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono">{label}</div>
      <div className="text-[0.5rem] font-mono text-on-surface-variant/30 uppercase tracking-widest mt-0.5">{suffix}</div>
    </div>
  );
}
