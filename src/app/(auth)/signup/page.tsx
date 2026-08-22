"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2, Mail, Lock, User, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder.supabase.co") &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder-anon-key")
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("pending_ref_code", ref);
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        router.push("/onboarding");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const message = String(err?.message || "");
      if (/failed to fetch|placeholder|invalid url/i.test(message)) {
        setError(
          "Unable to connect to authentication service. Check Supabase URL/Anon key in .env.local."
        );
      } else {
        setError(message || "An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans">
      {/* Editorial Sidebar */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-surface shadow-[1px_0_0_rgba(229,226,218,0.4)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
          <Sparkles className="w-96 h-96 text-primary rotate-12" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-16 px-4 py-2 bg-primary/5 rounded-[6px] ring-1 ring-primary/10"
          >
            <img
              src="/brand/lunvo-logo.png"
              alt="LUNVO logo"
              className="w-4 h-4 rounded-[3px] object-contain"
            />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-primary">
              LUNVO
            </span>
          </Link>

          <h1 className="text-6xl font-serif text-on-background leading-[1.1] mb-6">
            Scale Your <br /> Influence.
          </h1>
          <p className="text-xl font-medium text-on-surface-variant max-w-sm leading-relaxed">
            Join the elite circle of LinkedIn strategists using AI-driven editorial precision.
          </p>
        </div>

        <div className="relative z-10">
          <div className="p-6 bg-surface-2 rounded-[12px] ring-1 ring-outline-variant/10 max-w-xs">
            <div className="text-[0.625rem] font-bold uppercase tracking-widest text-primary mb-2">
              Protocol Active
            </div>
            <div className="text-[0.85rem] font-medium text-on-surface-variant">
              High-accuracy trend analysis and semantic hook generation enabled.
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">
          <div className="mb-12">
            <h2 className="text-3xl font-serif text-on-background mb-3">Create Profile</h2>
            <p className="text-[0.95rem] font-medium text-on-surface-variant">
              Set up your workspace to initiate optimization protocols.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-error/5 border-l-2 border-error text-error text-[0.85rem] font-medium font-mono rounded-[4px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant/80 mb-2 mt-4 ml-1">
                Editorial Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Johnathan Doe"
                  className="w-full pl-11 pr-4 py-4 bg-surface-2 border-none ring-1 ring-outline-variant/20 rounded-[8px] focus:ring-[2px] focus:ring-primary focus:bg-surface-container-lowest focus:shadow-sm outline-none transition-all text-[0.95rem] font-medium"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant/80 mb-2 mt-4 ml-1">
                Identity Key
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="contact@suite.com"
                  className="w-full pl-11 pr-4 py-4 bg-surface-2 border-none ring-1 ring-outline-variant/20 rounded-[8px] focus:ring-[2px] focus:ring-primary focus:bg-surface-container-lowest focus:shadow-sm outline-none transition-all text-[0.95rem] font-medium font-mono"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant/80 mb-2 mt-4 ml-1">
                Security Sequence
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 bg-surface-2 border-none ring-1 ring-outline-variant/20 rounded-[8px] focus:ring-[2px] focus:ring-primary focus:bg-surface-container-lowest focus:shadow-sm outline-none transition-all text-[0.95rem] font-medium font-mono"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex items-center justify-center gap-3 bg-gradient-to-br from-primary to-primary-container hover:shadow-premium text-on-primary font-bold py-4 rounded-[8px] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.05em]">Deploy Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-on-surface-variant text-[0.85rem] font-medium">
            Already have a sequence?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
            >
              Access Suite
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
