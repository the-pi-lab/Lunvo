"use client";

interface Score {
  score: number;
  label: string;
  explanation: string;
}

interface ScoreGridProps {
  scores: Record<string, Score>;
}

export function ScoreGrid({ scores }: ScoreGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(scores).map(([key, value]) => (
        <div
          key={key}
          className="bg-surface-container-lowest rounded-[12px] p-6 ring-1 ring-[rgba(229,226,218,0.4)] hover:shadow-premium transition-all"
        >
          <div className="text-[0.5625rem] font-bold uppercase tracking-widest text-on-surface-variant/50 font-mono mb-3">
            {key}
          </div>
          <div
            className={`text-3xl font-serif mb-3 ${
              value.score <= 4
                ? "text-error"
                : value.score <= 6
                  ? "text-tertiary"
                  : "text-secondary"
            }`}
          >
            {value.score}
            <span className="text-base text-on-surface-variant/30">/10</span>
          </div>
          <p className="text-[0.8125rem] font-medium text-on-surface-variant leading-relaxed">
            {value.explanation}
          </p>
        </div>
      ))}
    </div>
  );
}
