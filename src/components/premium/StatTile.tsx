"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  suffix?: string;
  icon?: LucideIcon;
  note?: string;
}

export default function StatTile({ label, value, suffix, icon: Icon, note }: StatTileProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 p-6 flex flex-col gap-4 hover:shadow-premium transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <p className="kicker">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-primary/50" />}
      </div>
      <div>
        <p className="font-serif text-3xl sm:text-4xl text-on-background leading-none tracking-tight">
          {value}
          {suffix && (
            <span className="text-base font-serif text-on-surface-variant/40 ml-1">{suffix}</span>
          )}
        </p>
        {note && <p className="text-xs text-on-surface-variant mt-2">{note}</p>}
      </div>
    </div>
  );
}
