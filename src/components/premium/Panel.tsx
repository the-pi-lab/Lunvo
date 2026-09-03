import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PanelProps {
  children: ReactNode;
  icon?: LucideIcon;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  aside?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function Panel({
  children,
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  aside,
  className = "",
  bodyClassName = "",
}: PanelProps) {
  const hasHeader = Boolean(title || eyebrow);
  return (
    <section
      className={`bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/40 shadow-premium overflow-hidden ${className}`}
    >
      {hasHeader && (
        <div className="flex items-center gap-4 px-7 py-5 border-b border-outline-variant/30">
          {Icon && (
            <div className="w-9 h-9 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="kicker mb-0.5">{eyebrow}</p>}
            {title && (
              <h2 className="font-serif text-lg text-on-background leading-snug">{title}</h2>
            )}
            {subtitle && (
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      )}
      <div className={bodyClassName || (hasHeader ? "p-7" : "")}>{children}</div>
    </section>
  );
}
