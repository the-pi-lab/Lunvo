export interface LocalScore {
  score: number;
  label: string;
  explanation: string;
}

export interface LocalAnalysis {
  scores: {
    hook: LocalScore;
    readability: LocalScore;
    engagement: LocalScore;
    structure: LocalScore;
  };
  overall_score: number;
}

const BANNED_OPENERS = [
  "i am ",
  "i'm ",
  "im ",
  "hello",
  "hey everyone",
  "hi everyone",
  "in today's",
  "in todays",
  "today i want",
  "let me share",
  "thrilled",
  "excited to share",
  "humbled",
];

const CTA_PATTERNS = [
  "what's your",
  "whats your",
  "what do you",
  "have you ever",
  "reply with",
  "comment below",
  "drop a comment",
  "tag someone",
  "how many",
  "what would you",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n)));
}

function label(score: number): string {
  if (score <= 4) return "Weak";
  if (score <= 6) return "Good";
  return "Elite";
}

function getLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function scoreHook(text: string): LocalScore {
  const lines = getLines(text);
  const first = lines[0]?.toLowerCase() ?? "";
  let score = 3;
  const notes: string[] = [];

  if (!first) {
    return { score: 0, label: "Weak", explanation: "No content yet." };
  }

  const bannedHit = BANNED_OPENERS.some((p) => first.startsWith(p));
  if (bannedHit) {
    score = Math.min(score, 2);
    notes.push("opens with a cliché greeting/self-intro");
  }

  if (/\d/.test(first)) {
    score += 3;
    notes.push("specific number in the opener");
  }

  if (first.length <= 80) {
    score += 2;
    notes.push("tight first line");
  } else if (first.length <= 120) {
    score += 1;
  } else {
    score -= 1;
    notes.push("first line is long for mobile");
  }

  if (first.endsWith("?")) {
    score += 1;
    notes.push("question opener");
  }

  if (first.split(/\s+/).length > 18) {
    score -= 1;
    notes.push("too many words before the break");
  }

  let finalScore = clamp(score);
  if (bannedHit) {
    finalScore = Math.min(finalScore, 2);
    notes.unshift("cliche opener caps hook at 2");
  }
  return {
    score: finalScore,
    label: label(finalScore),
    explanation: notes.length
      ? notes[0]!.charAt(0).toUpperCase() + notes[0]!.slice(1)
      : "Solid start, add a number or bold claim.",
  };
}

function scoreReadability(text: string): LocalScore {
  const rawLines = text.split("\n");
  const lines = getLines(text);
  let score = 5;
  const notes: string[] = [];

  if (lines.length === 0) {
    return { score: 0, label: "Weak", explanation: "Nothing to scan yet." };
  }

  const totalWords = lines.reduce((acc, l) => acc + l.split(/\s+/).length, 0);
  const avgWords = totalWords / lines.length;

  if (avgWords <= 8) {
    score += 3;
    notes.push("short, scannable lines");
  } else if (avgWords <= 14) {
    score += 1;
    notes.push("mostly readable length");
  } else {
    score -= 2;
    notes.push("dense lines hurt mobile skimming");
  }

  const blankCount = rawLines.filter((l) => l.trim().length === 0).length;
  if (blankCount === 0 && lines.length > 2) {
    score = Math.min(score, 3);
    notes.push("no white space between ideas");
  } else if (blankCount >= 2) {
    score += 2;
    notes.push("good breathing room");
  }

  let run = 0;
  let maxRun = 0;
  for (const l of rawLines) {
    if (l.trim().length > 0) {
      run += 1;
      if (run > maxRun) maxRun = run;
    } else {
      run = 0;
    }
  }
  if (maxRun >= 6) {
    score -= 2;
    notes.push(`${maxRun}-line wall of text`);
  }

  const finalScore = clamp(score);
  return {
    score: finalScore,
    label: label(finalScore),
    explanation: notes.length
      ? notes[0]!.charAt(0).toUpperCase() + notes[0]!.slice(1)
      : "Balanced formatting.",
  };
}

function scoreEngagement(text: string): LocalScore {
  const lower = text.toLowerCase();
  const trimmed = text.trim();
  let score = 3;
  const notes: string[] = [];

  if (trimmed.endsWith("?")) {
    score += 4;
    notes.push("ends with a question");
  }

  const ctaHit = CTA_PATTERNS.find((p) => lower.includes(p));
  if (ctaHit) {
    score += 3;
    notes.push(`specific CTA ("${ctaHit}")`);
  }

  if (lower.includes("follow for more")) {
    score = Math.min(score, 3);
    notes.push('"follow for more" is a reach killer');
  }

  const hashtags = (text.match(/#\w+/g) ?? []).length;
  if (hashtags > 3) {
    score -= Math.min(2, hashtags - 3);
    notes.push(`${hashtags} hashtags dilutes reach`);
  }

  if (lower.includes("game-changer") || lower.includes("unlock your potential")) {
    score -= 2;
    notes.push("AI-slop phrase detected");
  }

  const finalScore = clamp(score);
  return {
    score: finalScore,
    label: label(finalScore),
    explanation: notes.length
      ? notes[0]!.charAt(0).toUpperCase() + notes[0]!.slice(1)
      : "Add a specific, answerable question.",
  };
}

function scoreStructure(text: string): LocalScore {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
  const words = text.split(/\s+/).filter(Boolean).length;
  let score = 3;
  const notes: string[] = [];

  if (blocks.length >= 4) {
    score += 3;
    notes.push(`${blocks.length} clear sections`);
  } else if (blocks.length >= 3) {
    score += 2;
    notes.push("hook-body-close shape visible");
  } else if (blocks.length <= 1 && words > 40) {
    score -= 2;
    notes.push("one giant block, no arc");
  }

  if (words >= 60 && words <= 220) {
    score += 2;
    notes.push("sweet-spot length");
  } else if (words > 300) {
    score -= 1;
    notes.push("long for LinkedIn");
  } else if (words < 30) {
    score -= 2;
    notes.push("too little substance yet");
  }

  const finalScore = clamp(score);
  return {
    score: finalScore,
    label: label(finalScore),
    explanation: notes.length
      ? notes[0]!.charAt(0).toUpperCase() + notes[0]!.slice(1)
      : "Shape it: hook, story, lesson, CTA.",
  };
}

export function analyzeLocally(text: string): LocalAnalysis {
  if (!text || text.trim().length === 0) {
    const zero: LocalScore = { score: 0, label: "Weak", explanation: "No content yet." };
    return {
      scores: { hook: zero, readability: zero, engagement: zero, structure: zero },
      overall_score: 0,
    };
  }

  const scores = {
    hook: scoreHook(text),
    readability: scoreReadability(text),
    engagement: scoreEngagement(text),
    structure: scoreStructure(text),
  };

  const values = Object.values(scores).map((s) => s.score);
  const overall = values.length
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    : 0;

  return { scores, overall_score: overall };
}
