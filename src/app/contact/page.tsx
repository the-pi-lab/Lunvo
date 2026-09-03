import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, ShieldCheck, Building2 } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-[rgba(229,226,218,0.3)]">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Image
              src="/brand/lunvo-logo.png"
              alt="LUNVO logo"
              width={16}
              height={16}
              className="rounded-[3px] object-contain"
            />
            <span className="font-serif italic text-xl text-on-background">LUNVO Contact Desk</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-[0.8125rem] font-medium text-on-surface-variant hover:text-primary transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-24">
        <div className="text-center mb-14">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary mb-4 font-mono">
            Official Merchant Contact
          </p>
          <h1 className="text-5xl md:text-6xl font-serif text-on-background mb-6 tracking-tight">
            Contact Us
          </h1>
          <p className="text-[1rem] text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            For payment verification, merchant validation, support, or legal correspondence, please
            use the details below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[16px] bg-surface-container-lowest shadow-premium ring-1 ring-[rgba(229,226,218,0.4)] p-8">
            <div className="w-11 h-11 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-on-surface-variant/60 mb-3 font-mono">
              Merchant Name
            </p>
            <p className="text-2xl md:text-3xl font-serif text-on-background leading-tight">
              MAHAVAR VINAYAK DILIPKUMAR
            </p>
            <p className="text-[0.875rem] text-on-surface-variant mt-5 leading-relaxed">
              This name is the official merchant identity for payment setup and business
              verification.
            </p>
          </div>

          <div className="rounded-[16px] bg-[#1A1814] text-white p-8 relative overflow-hidden shadow-premium">
            <div className="absolute top-0 right-0 w-56 h-56 bg-primary/20 blur-[90px] -mr-24 -mt-24" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-[10px] bg-white/10 text-white flex items-center justify-center mb-6">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white/70 mb-3 font-mono">
                Contact Email
              </p>
              <a
                href="mailto:mahavarvinayak@gmail.com"
                className="text-2xl md:text-3xl font-serif text-white hover:text-primary transition-colors break-words"
              >
                mahavarvinayak@gmail.com
              </a>
              <p className="text-[0.875rem] text-white/70 mt-5 leading-relaxed">
                Use this email for support requests, payment onboarding, and merchant documentation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[14px] bg-surface-container p-6 ring-1 ring-[rgba(229,226,218,0.35)] flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[0.875rem] font-bold text-on-background mb-2">
              Merchant verification note
            </p>
            <p className="text-[0.8125rem] text-on-surface-variant leading-relaxed">
              If your payment gateway provider asks for explicit merchant identity, share this page
              URL. It includes the legal merchant name and official communication email.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
