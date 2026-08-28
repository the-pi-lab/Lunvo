"use client";

import { PROVIDER_REGISTRY } from "@/lib/ai/providers/registry";
import { useState } from "react";

function LogoChip({ name, slug, color }: { name: string; slug?: string; color: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full bg-white border border-black/10 px-4 py-2 shadow-sm shrink-0">
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
          className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[0.625rem] font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </span>
      )}
      <span className="text-sm font-semibold text-zinc-700 whitespace-nowrap">{name}</span>
    </span>
  );
}

export default function LogoMarquee() {
  const providers = PROVIDER_REGISTRY.filter((p) => !p.coming).slice(0, 28);
  const track = [...providers, ...providers, ...providers];

  return (
    <div className="relative overflow-hidden py-8">
      <p className="text-center text-[0.625rem] font-bold uppercase tracking-[0.3em] font-mono text-zinc-400 mb-6">
        Bring a key from any of these — one vault, automatic failover
      </p>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#FBFAF9] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#FBFAF9] to-transparent" />

      <div className="flex w-max items-center gap-3 animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused]">
        {track.map((p, i) => (
          <LogoChip key={`${p.id}-${i}`} name={p.name} slug={p.iconSlug} color={p.color} />
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
