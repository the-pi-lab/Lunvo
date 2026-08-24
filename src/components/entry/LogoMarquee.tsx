"use client";

import { PROVIDER_REGISTRY } from "@/lib/ai/providers/registry";
import { useState } from "react";

function LogoChip({ name, slug, color }: { name: string; slug?: string; color: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="glass inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 !border-transparent shrink-0">
      {slug && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}/${color.replace("#", "")}`}
          alt=""
          width={18}
          height={18}
          className="rounded-[4px]"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[0.625rem] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </span>
      )}
      <span className="text-sm font-semibold text-on-background/80 whitespace-nowrap">{name}</span>
    </span>
  );
}

export default function LogoMarquee() {
  const providers = PROVIDER_REGISTRY.filter((p) => !p.coming);
  const track = [...providers, ...providers];

  return (
    <div className="group relative overflow-hidden py-10">
      <p className="mb-6 text-center text-[0.625rem] font-bold uppercase tracking-[0.3em] font-mono text-on-surface-variant/50">
        Bring a key from any of these — one vault, automatic failover
      </p>

      {/* edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-background to-transparent" />

      <div
        className="flex w-max items-center gap-4 px-4"
        style={{ animation: "logo-marquee 55s linear infinite" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.animationPlayState = "paused")}
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.animationPlayState = "running")
        }
      >
        {track.map((p, i) => (
          <LogoChip key={`${p.id}-${i}`} name={p.name} slug={p.iconSlug} color={p.color} />
        ))}
      </div>

      <style jsx>{`
        @keyframes logo-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          & div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
