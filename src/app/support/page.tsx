"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Sparkles,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    items: [
      {
        question: "How do I analyze my first LinkedIn post?",
        answer: (
          <div className="font-mono text-[0.8125rem] text-on-surface-variant bg-surface-container p-6 rounded-[8px] ring-1 ring-[rgba(229,226,218,0.3)] leading-relaxed">
            <p className="mb-4">{"// AI LABS ANALYSIS PROTOCOL"}</p>
            <p className="mb-4">
              To analyze a post, navigate to the{" "}
              <span className="text-primary font-bold">Analyze Post</span> tab in your dashboard.
              You can either paste text from a live LinkedIn post or upload a draft for pre-flight
              checking.
            </p>
            <p className="mb-4">Our engine will evaluate:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Hook strength and scroll-stop probability.</li>
              <li>Formatting for mobile readability.</li>
              <li>Sentiment alignment with your personal brand.</li>
            </ul>
          </div>
        ),
        actions: true,
      },
      {
        question: "Is my LinkedIn account data safe?",
        answer: (
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            Yes. We do not require your LinkedIn password. We operate entirely via the content you
            paste or create. Your profile data is used only to tune the AI persona to your specific
            industry and role, ensuring every post feels authentic to your brand.
          </p>
        ),
      },
      {
        question: "How does the AI Persona logic work?",
        answer: (
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            When you set up your Persona (e.g., PM, Founder, Developer), our &ldquo;Editorial
            Intelligence&rdquo; engine adjusts its scoring weights. For a Founder, it prioritizes
            authority and vision; for a Developer, it prioritizes technical clarity and high-signal
            value.
          </p>
        ),
      },
    ],
  },
  {
    id: "billing",
    title: "Credits & Billing",
    icon: <CreditCard className="w-5 h-5 text-primary" />,
    items: [
      {
        question: "How do AI credits renew each month?",
        answer: (
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            Credits are allocated every 30 days based on your subscription date. Free users get a
            daily allotment, while Starter and Pro users get fixed monthly volumes. Credits do not
            roll over to ensure maximum compute availability for all users.
          </p>
        ),
      },
      {
        question: "Upgrading or canceling your Pro subscription",
        answer: (
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            You can upgrade at any time via the{" "}
            <Link href="/dashboard/pricing" className="text-primary hover:underline">
              Pricing
            </Link>{" "}
            page. Cancellations are handled instantly via the Settings dashboard; you will retain
            Access until the end of your current billing cycle.
          </p>
        ),
      },
    ],
  },
  {
    id: "account",
    title: "Trust & Security",
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    items: [
      {
        question: "Does the AI learn from my private data?",
        answer: (
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            No. We utilize &ldquo;Zero-Retention&rdquo; protocols. Your input data is sent to our
            inference engines (Gemini/Groq) for real-time analysis, but it is **never** used to
            train public models or shared with other users.
          </p>
        ),
      },
      {
        question: "Resetting your security credentials",
        answer: (
          <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
            Navigate to{" "}
            <Link href="/dashboard/settings" className="text-primary hover:underline">
              Settings &gt; Security
            </Link>{" "}
            to trigger a password reset email. All authentication is handled securely via Supabase
            Auth.
          </p>
        ),
      },
    ],
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "getting-started-0": true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[rgba(229,226,218,0.3)]">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/lunvo-logo.png"
              alt="LUNVO logo"
              width={16}
              height={16}
              className="rounded-[3px] object-contain"
            />
            <span className="font-serif italic text-xl text-on-background">LUNVO Help Center</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif text-on-background mb-8 tracking-tight">
            How can we help?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-on-surface-variant/40" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-none py-5 pl-16 pr-8 rounded-[12px] shadow-premium text-lg focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 outline-none"
              placeholder="Search for articles, guides, or troubleshooting..."
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="md:col-span-3 space-y-8">
            <div>
              <h3 className="text-[0.5625rem] font-bold tracking-[0.15em] text-on-surface-variant/50 mb-4 uppercase font-mono">
                Support Categories
              </h3>
              <nav className="space-y-3">
                {FAQ_CATEGORIES.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="block text-[0.875rem] font-medium text-on-surface-variant hover:text-primary pl-4 transition-colors border-l-2 border-transparent hover:border-primary"
                  >
                    {cat.title}
                  </a>
                ))}
              </nav>
            </div>

            <div className="p-6 bg-surface-container rounded-[12px]">
              <h4 className="font-serif text-lg mb-2">Need a Specialist?</h4>
              <p className="text-[0.8125rem] text-on-surface-variant mb-4 leading-relaxed">
                Merchant support is managed by MAHAVAR VINAYAK DILIPKUMAR.
              </p>
              <Link
                href="/contact"
                className="text-[0.6875rem] font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 font-mono"
              >
                Open Contact Us
              </Link>
            </div>
          </aside>

          {/* FAQ Sections */}
          <div className="md:col-span-9 space-y-12">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <section key={cat.id} id={cat.id}>
                  <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
                    {cat.icon} {cat.title}
                  </h2>
                  <div className="space-y-2">
                    {cat.items.map((item, idx) => {
                      const key = `${cat.id}-${idx}`;
                      const isOpen = openItems[key];
                      return (
                        <div
                          key={key}
                          className="bg-surface-container-lowest rounded-[12px] shadow-[0_2px_8px_rgba(26,24,20,0.03)] ring-1 ring-[rgba(229,226,218,0.3)] overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container transition-colors"
                          >
                            <span className="font-medium text-[1rem] text-on-background">
                              {item.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-on-surface-variant/40" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-on-surface-variant/40" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-8">
                              <div className="text-[0.9375rem] text-on-surface-variant leading-relaxed">
                                {item.answer}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-20 bg-surface-container rounded-[16px]">
                <p className="text-on-surface-variant font-medium">
                  No help articles found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Bento */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-10 bg-[#1A1814] rounded-[16px] text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="relative z-10">
              <h2 className="font-serif text-3xl mb-4">Still need assistance?</h2>
              <p className="text-white/50 max-w-sm mb-3 leading-relaxed">
                Our support concierge is available for technical implementation help.
              </p>
              <p className="text-white/70 text-[0.8125rem] font-mono">
                Merchant: MAHAVAR VINAYAK DILIPKUMAR
              </p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
              <a
                href="mailto:mahavarvinayak@gmail.com"
                className="bg-primary hover:px-8 text-white px-6 py-3 rounded-[8px] flex items-center gap-2 font-bold transition-all active:scale-[0.97]"
              >
                <Mail className="w-4 h-4" /> Email mahavarvinayak@gmail.com
              </a>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-[8px] flex items-center gap-2 font-bold transition-all active:scale-[0.97]"
              >
                Contact Us Page
              </Link>
              <a
                href="https://www.thepilab.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-[8px] flex items-center gap-2 font-bold transition-all active:scale-[0.97]"
              >
                THE Π LAB Website
              </a>
              <a
                href="https://www.linkedin.com/company/the-%CF%80-lab/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-[8px] flex items-center gap-2 font-bold transition-all active:scale-[0.97]"
              >
                THE Π LAB LinkedIn
              </a>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
          </div>

          <div className="p-10 bg-surface-container-high rounded-[16px] flex flex-col justify-between">
            <div>
              <h3 className="text-[0.5625rem] font-bold tracking-[0.15em] text-on-surface-variant/50 mb-6 uppercase font-mono">
                System Status
              </h3>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                <span className="font-mono text-[0.875rem] font-bold text-on-background">
                  All Inference Nodes Online
                </span>
              </div>
              <p className="text-[0.875rem] text-on-surface-variant leading-relaxed">
                The Gemini and Groq engines are operating within normal latency parameters.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-[rgba(229,226,218,0.4)]">
              <span className="text-[0.75rem] text-on-surface-variant/60 font-mono">
                Average Response: ~14 Minutes
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-10 border-t border-[rgba(229,226,218,0.3)] px-8 text-center">
        <p className="text-[0.625rem] text-on-surface-variant/40 font-mono uppercase tracking-widest">
          LUNVO © 2024 — Powered by THE Π LAB
        </p>
      </footer>
    </main>
  );
}
