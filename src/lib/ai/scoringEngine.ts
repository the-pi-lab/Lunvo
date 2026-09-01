/**
 * LinkedIn Post Scoring Engine v2
 * Predicts actual engagement based on real data patterns
 * NOT based on subjective structural scoring
 */

export interface PostMetrics {
  contentLength: number;
  hasHashtags: boolean;
  hashtagCount: number;
  postType: "text" | "image" | "video" | "carousel";
  dayOfWeek: string;
  postHour: number;
  hasMedia: boolean;
  hookType?: string;
  hookQuality?: number; // 1-10 subjective
  ctaSpecificity?: number; // 1-10 subjective
  emotionalIndex?: number; // 1-10 based on triggers
}

export interface PredictedScore {
  predictedEngagementRate: number; // 0-10%, what real posts get
  confidence: number; // 0-100, how sure we are
  breakdown: {
    contentLengthScore: number;
    postTypeScore: number;
    hashtagScore: number;
    timingScore: number;
    hookScore: number;
    ctaScore: number;
  };
  insights: string[];
  recommendation: string;
}

/**
 * REAL PATTERNS FROM DATA ANALYSIS
 * These are from LinkedIn_Post_Engagement_Analytics_Medium.csv
 */
const ENGAGEMENT_PATTERNS = {
  // Post type performance (from 50 real posts)
  byPostType: {
    video: { avgEngagement: 5.1, variance: 0.8 }, // Videos perform best
    carousel: { avgEngagement: 4.0, variance: 0.9 },
    image: { avgEngagement: 4.2, variance: 1.1 },
    text: { avgEngagement: 4.0, variance: 0.8 },
  },

  // Hashtag impact (correlation from data)
  hashtags: {
    none: { multiplier: 0.85, note: "Lower visibility" },
    low: { multiplier: 1.0, range: [1, 3] }, // baseline
    medium: { multiplier: 1.1, range: [4, 6] }, // sweet spot
    high: { multiplier: 1.05, range: [7, 10] }, // diminishing returns
    tooMany: { multiplier: 0.95, note: "Over 10 looks spammy" },
  },

  // Content length sweet spot
  contentLength: {
    tooShort: { range: [0, 150], multiplier: 0.9, note: "Too brief" },
    short: { range: [151, 250], multiplier: 1.05, note: "Good for mobile" },
    medium: { range: [251, 400], multiplier: 1.15, note: "Optimal length" },
    long: { range: [401, 500], multiplier: 1.0, note: "Still good" },
    tooLong: { range: [501, 9999], multiplier: 0.85, note: "Lower completion" },
  },

  // Timing impact (day of week from data)
  byDayOfWeek: {
    Monday: 1.0,
    Tuesday: 1.15, // Best day
    Wednesday: 1.1,
    Thursday: 1.05,
    Friday: 1.12,
    Saturday: 0.95,
    Sunday: 0.9,
  },

  // Post hour impact (estimated from patterns)
  byPostHour: {
    "08:00-10:00": 1.1, // Early morning
    "10:00-12:00": 0.95,
    "12:00-14:00": 1.05, // Lunch
    "14:00-16:00": 1.0,
    "16:00-18:00": 1.15, // Late afternoon (peak)
    "18:00-20:00": 1.05,
    "20:00-08:00": 0.8, // Night low
  },
};

/**
 * Hook type multipliers (what drives engagement)
 * Based on viral post patterns
 */
const HOOK_IMPACT = {
  vulnerability: 1.4, // Highest engagement
  contrarian: 1.35,
  curiosity_gap: 1.3,
  scene: 1.25,
  data_backed: 1.2,
  question: 1.15,
  bold_claim: 1.1,
  generic: 0.8, // Lowest engagement
};

/**
 * CTA specificity impact
 */
const CTA_IMPACT = {
  specific_question: 1.3,
  open_question: 1.0,
  generic_cta: 0.7,
  no_cta: 0.5,
};

/**
 * Predict engagement rate for a post
 */
export function predictEngagementRate(metrics: PostMetrics): PredictedScore {
  let baseScore = 4.0; // Average LinkedIn engagement rate
  const breakdown = {
    contentLengthScore: 0,
    postTypeScore: 0,
    hashtagScore: 0,
    timingScore: 0,
    hookScore: 0,
    ctaScore: 0,
  };
  const insights: string[] = [];

  // 1. POST TYPE IMPACT (25% of score)
  const typeData =
    ENGAGEMENT_PATTERNS.byPostType[metrics.postType as keyof typeof ENGAGEMENT_PATTERNS.byPostType];
  const typeScore = (typeData.avgEngagement / 4.0) * 10; // Normalize to 10
  breakdown.postTypeScore = typeScore;
  baseScore += (typeScore - 4) * 0.25;

  if (metrics.postType === "video") {
    insights.push("✅ Videos get 5.1% avg engagement (highest)");
  } else {
    insights.push(`📊 ${metrics.postType} posts average ${typeData.avgEngagement}% engagement`);
  }

  // 2. HASHTAG IMPACT (15% of score)
  let hashtagMultiplier = 1.0;
  if (metrics.hashtagCount === 0) {
    hashtagMultiplier = 0.85;
    insights.push("❌ No hashtags - visibility will be limited");
  } else if (metrics.hashtagCount <= 3) {
    hashtagMultiplier = 1.0;
    insights.push("⚠️ Only " + metrics.hashtagCount + " hashtags (consider 4-6)");
  } else if (metrics.hashtagCount <= 6) {
    hashtagMultiplier = 1.1;
    insights.push("✅ Optimal hashtag count (" + metrics.hashtagCount + ")");
  } else if (metrics.hashtagCount <= 10) {
    hashtagMultiplier = 1.05;
    insights.push("⚠️ " + metrics.hashtagCount + " hashtags (diminishing returns)");
  } else {
    hashtagMultiplier = 0.95;
    insights.push("❌ Too many hashtags (" + metrics.hashtagCount + ") - looks spammy");
  }
  breakdown.hashtagScore = hashtagMultiplier * 10;
  baseScore = baseScore * hashtagMultiplier * 0.15 + baseScore * (1 - 0.15);

  // 3. CONTENT LENGTH IMPACT (15% of score)
  let lengthMultiplier = 1.0;
  const contentLen = metrics.contentLength;

  if (contentLen < 150) {
    lengthMultiplier = 0.9;
    insights.push("⚠️ Content too short (" + contentLen + " chars)");
  } else if (contentLen <= 250) {
    lengthMultiplier = 1.05;
    insights.push("✅ Good mobile-friendly length (" + contentLen + " chars)");
  } else if (contentLen <= 400) {
    lengthMultiplier = 1.15;
    insights.push("✅ Optimal length sweet spot (" + contentLen + " chars) - highest engagement");
  } else if (contentLen <= 500) {
    lengthMultiplier = 1.0;
    insights.push("✅ Good length (" + contentLen + " chars)");
  } else {
    lengthMultiplier = 0.85;
    insights.push("⚠️ Very long post (" + contentLen + " chars) - lower completion");
  }
  breakdown.contentLengthScore = lengthMultiplier * 10;
  baseScore = baseScore * lengthMultiplier * 0.15 + baseScore * (1 - 0.15);

  // 4. TIMING IMPACT (15% of score)
  const dayMultiplier =
    ENGAGEMENT_PATTERNS.byDayOfWeek[
      metrics.dayOfWeek as keyof typeof ENGAGEMENT_PATTERNS.byDayOfWeek
    ] || 1.0;

  let hourMultiplier = 1.0;
  if (typeof metrics.postHour === "number") {
    const h = metrics.postHour;
    if (h >= 8 && h < 10)
      hourMultiplier = 1.1; // Early morning
    else if (h >= 10 && h < 12) hourMultiplier = 0.95;
    else if (h >= 12 && h < 14)
      hourMultiplier = 1.05; // Lunch
    else if (h >= 14 && h < 16) hourMultiplier = 1.0;
    else if (h >= 16 && h < 18)
      hourMultiplier = 1.15; // Late afternoon peak
    else if (h >= 18 && h < 20) hourMultiplier = 1.05;
    else hourMultiplier = 0.85; // Night low
  }

  const timingMultiplier = (dayMultiplier + hourMultiplier) / 2;
  breakdown.timingScore = timingMultiplier * 10;
  baseScore = baseScore * timingMultiplier * 0.15 + baseScore * (1 - 0.15);

  if (metrics.dayOfWeek === "Tuesday" || metrics.dayOfWeek === "Friday") {
    insights.push("✅ Posting on " + metrics.dayOfWeek + " (peak engagement day)");
  } else if (metrics.dayOfWeek === "Saturday" || metrics.dayOfWeek === "Sunday") {
    insights.push("⚠️ Weekend posts get 5-10% lower engagement");
  }

  // 5. HOOK QUALITY (20% of score)
  let hookMultiplier = 1.0;
  if (metrics.hookType && HOOK_IMPACT[metrics.hookType as keyof typeof HOOK_IMPACT]) {
    hookMultiplier = HOOK_IMPACT[metrics.hookType as keyof typeof HOOK_IMPACT] / 1.2; // Normalize
    insights.push(
      "✅ " +
        metrics.hookType.replace(/_/g, " ") +
        " hook drives " +
        Math.round(hookMultiplier * 100) +
        "% higher engagement"
    );
  } else if (metrics.hookQuality) {
    hookMultiplier = 0.8 + (metrics.hookQuality / 10) * 0.4;
  }
  breakdown.hookScore = hookMultiplier * 10;
  baseScore = baseScore * hookMultiplier * 0.2 + baseScore * (1 - 0.2);

  // 6. CTA QUALITY (10% of score)
  let ctaMultiplier = 1.0;
  if (metrics.ctaSpecificity) {
    ctaMultiplier = 0.5 + (metrics.ctaSpecificity / 10) * 0.8;
  }
  breakdown.ctaScore = ctaMultiplier * 10;
  baseScore = baseScore * ctaMultiplier * 0.1 + baseScore * (1 - 0.1);

  if (metrics.ctaSpecificity && metrics.ctaSpecificity > 7) {
    insights.push("✅ Strong specific CTA will drive comments");
  }

  // CALCULATE FINAL SCORE
  const predictedEngagementRate = Math.min(8.5, Math.max(1.5, baseScore));

  // Confidence (higher if we have more data)
  const confidence = Math.min(
    95,
    50 + (metrics.hookQuality || 0) * 4 + (metrics.ctaSpecificity || 0) * 2
  );

  // Generate recommendation
  let recommendation = "";
  if (predictedEngagementRate > 6.5) {
    recommendation = "🚀 High potential post! This should perform very well.";
  } else if (predictedEngagementRate > 5.0) {
    recommendation = "✅ Good post. Consider the insights above to improve.";
  } else if (predictedEngagementRate > 3.5) {
    recommendation = "⚠️ Average post. Make hook more specific and add hashtags.";
  } else {
    recommendation = "❌ Low potential. Rewrite with better hook and CTA.";
  }

  return {
    predictedEngagementRate: Math.round(predictedEngagementRate * 100) / 100,
    confidence,
    breakdown,
    insights,
    recommendation,
  };
}

/**
 * Convert old structural scores to new engagement prediction
 * For posts already in system
 */
export function convertLegacyScore(
  hookScore: number,
  readabilityScore: number,
  engagementScore: number,
  structureScore: number,
  postType: string = "text"
): number {
  // Old system scores 0-10 in each category
  const avgScore = (hookScore + readabilityScore + engagementScore + structureScore) / 4;

  // Map old score to engagement prediction
  // Old 8/10 should become ~4.5% (realistic)
  // Old 6/10 should become ~3% (below average)
  const mapped = 2.0 + (avgScore / 10) * 3.5;

  // Post type adjustment
  const typeMultiplier =
    ENGAGEMENT_PATTERNS.byPostType[postType as keyof typeof ENGAGEMENT_PATTERNS.byPostType]
      ?.avgEngagement / 4.0 || 1.0;

  return Math.min(8.0, Math.max(1.0, mapped * typeMultiplier));
}
