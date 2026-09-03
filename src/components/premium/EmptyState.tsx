import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`px-8 py-16 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/[0.07] ring-1 ring-primary/15 flex items-center justify-center mb-5">
        <Icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
      </div>
      <h3 className="font-serif text-xl text-on-background mb-1.5">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-6">{body}</p>
      {action}
    </div>
  );
}
