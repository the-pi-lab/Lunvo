"use client";

import { EngagementMetrics } from "@/lib/ai/engagementPredictor";
import { Zap, Eye, Brain, UserCheck } from "lucide-react";

interface EngagementMeterProps {
  metrics: EngagementMetrics | null;
  isLoading: boolean;
}

export function EngagementMeter({ metrics, isLoading }: EngagementMeterProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/40 animate-pulse">
        <div className="h-4 bg-surface-container-high rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-surface-container-high rounded"></div>
          <div className="h-10 bg-surface-container-high rounded"></div>
          <div className="h-10 bg-surface-container-high rounded"></div>
          <div className="h-10 bg-surface-container-high rounded"></div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getMetricColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-background">Engagement Prediction</h3>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border ${getMetricColor(metrics.overallScore)}`}
        >
          {metrics.overallScore} / 100 Overall
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Hook */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span className="flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1" /> Hook Strength
            </span>
            <span>{metrics.hookStrength}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${getBarColor(metrics.hookStrength)}`}
              style={{ width: `${metrics.hookStrength}%` }}
            />
          </div>
        </div>

        {/* Readability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span className="flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1" /> Readability
            </span>
            <span>{metrics.readability}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${getBarColor(metrics.readability)}`}
              style={{ width: `${metrics.readability}%` }}
            />
          </div>
        </div>

        {/* Value Density */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span className="flex items-center">
              <Brain className="w-3.5 h-3.5 mr-1" /> Value Density
            </span>
            <span>{metrics.valueDensity}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${getBarColor(metrics.valueDensity)}`}
              style={{ width: `${metrics.valueDensity}%` }}
            />
          </div>
        </div>

        {/* Authenticity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span className="flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1" /> Authenticity
            </span>
            <span>{metrics.authenticity}%</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${getBarColor(metrics.authenticity)}`}
              style={{ width: `${metrics.authenticity}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-outline-variant/30">
        <p className="text-xs text-on-surface-variant italic">" {metrics.criticalFeedback} "</p>
      </div>
    </div>
  );
}
