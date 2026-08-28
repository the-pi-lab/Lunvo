"use client";

import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";

interface PageHeaderProps {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  divider?: boolean;
}

export default function PageHeader({
  kicker,
  title,
  description,
  actions,
  divider = true,
}: PageHeaderProps) {
  return (
    <Reveal>
      <header className="pt-2">
        <p className="kicker mb-4">{kicker}</p>
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${
            divider ? "pb-8 border-b border-outline-variant/40" : ""
          }`}
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif text-on-background tracking-tight leading-[1.05]">
              {title}
            </h1>
            {description && (
              <p className="text-on-surface-variant font-medium text-base max-w-xl mt-4 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      </header>
    </Reveal>
  );
}
