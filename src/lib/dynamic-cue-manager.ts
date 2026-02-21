import type { BehavioralCue, RepMetricCue } from "./observable-cues";
import { HCP_CUES } from "./observable-cues";

/**
 * IMPORTANT ALIGNMENT FIXES:
 * - HCP_CUES is a Record<string, BehavioralCue> (NOT an array)
 * - BehavioralCue.category ∈ 'engagement' | 'resistance' | 'interest' | 'stress'
 * - All state logic normalized to those 4 canonical categories
 * - Removed invalid category references (e.g., "skepticism", "negative", etc.)
 */

export type HCPState =
  | "neutral"
  | "engaged"
  | "time-pressured"
  | "resistant"
  | "boundary-setting"
  | "irritated"
  | "disengaging"
  | "busy"
  | "defensive"
  | "disengaged";

type CanonicalCategory = BehavioralCue["category"];

function allCues(): BehavioralCue[] {
  return Object.values(HCP_CUES);
}

/* ============================================================
   STATE → CATEGORY MAPPING (CATEGORY-SAFE)
   ============================================================ */

function categoriesForState(state: HCPState): CanonicalCategory[] {
  switch (state) {
    case "time-pressured":
    case "busy":
      return ["stress", "engagement"];

    case "resistant":
    case "defensive":
    case "boundary-setting":
    case "irritated":
      return ["resistance", "stress"];

    case "disengaged":
    case "disengaging":
      return ["engagement", "resistance"];

    case "engaged":
      return ["interest"];

    case "neutral":
    default:
      return ["engagement"];
  }
}

/* ============================================================
   SELECT CUES FOR STATE
   ============================================================ */

export function selectCuesForState(
  state: HCPState,
  previousCues: string[] = []
): BehavioralCue[] {
  const allowedCategories = categoriesForState(state);

  const stateCues = allCues().filter((cue) =>
    allowedCategories.includes(cue.category)
  );

  const available = stateCues.filter(
    (cue) => !previousCues.includes(cue.id)
  );

  return available.slice(0, 3);
}

/* ============================================================
   VALIDATE STATE ALIGNMENT
   ============================================================ */

export function validateCueStateAlignment(
  cues: BehavioralCue[],
  state: HCPState
): { valid: boolean; errors?: string[] } {
  const allowed = categoriesForState(state);
  const errors: string[] = [];

  cues.forEach((cue) => {
    if (!allowed.includes(cue.category)) {
      errors.push(
        `Cue "${cue.id}" (${cue.category}) does not match state "${state}"`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.length ? errors : undefined,
  };
}

/* ============================================================
   PERFORMANCE + MOOD TREND
   ============================================================ */

function analyzeRepPerformance(
  metrics: RepMetricCue[]
): "poor" | "fair" | "good" | "excellent" {
  const count = metrics.length;
  if (count <= 2) return "poor";
  if (count === 3) return "fair";
  if (count === 4) return "good";
  return "excellent";
}

function determineHCPMoodTrend(
  current: "improving" | "stable" | "declining",
  performance: "poor" | "fair" | "good" | "excellent"
): "improving" | "stable" | "declining" {
  if (performance === "excellent" || performance === "good")
    return "improving";
  if (performance === "poor") return "declining";
  return "stable";
}

/* ============================================================
   NEGATIVITY DETECTION (DEDUPED + NORMALIZED)
   ============================================================ */

const NEGATIVE_PATTERNS = Array.from(
  new Set([
    "you suck",
    "idiot",
    "stupid",
    "shut up",
    "hate you",
    "get lost",
    "waste of time",
    "annoying",
    "rude",
    "loser",
    "worthless",
    "cancel",
    "stop talking",
    "talk to me now",
    "answer me now",
    "or else",
  ])
);

const SENTIMENT_NEGATIVE_PATTERNS = Array.from(
  new Set([
    "no",
    "not",
    "don't",
    "cant",
    "won't",
    "never",
    "frustrated",
    "annoyed",
    "busy",
    "hurry",
    "rushed",
    "stressed",
    "problem",
    "issue",
    "difficult",
    "hard",
    "hate",
    "why",
    "upset",
    "mad",
    "angry",
    "impatient",
  ])
);

function detectRepNegativity(message?: string): boolean {
  if (!message) return false;

  const lower = message.toLowerCase();

  if (NEGATIVE_PATTERNS.some((p) => lower.includes(p))) return true;
  if (SENTIMENT_NEGATIVE_PATTERNS.some((p) => lower.includes(p))) return true;

  if (lower.includes("why don't") || lower.includes("why dont")) return true;

  const letters = message.replace(/\s+/g, "");
  const upper = (letters.match(/[A-Z]/g) || []).length;
  const ratio = letters.length ? upper / letters.length : 0;

  if (ratio > 0.5) return true;
  if ((message.match(/!/g) || []).length >= 2) return true;
  if ((message.match(/\?/g) || []).length >= 2) return true;

  return false;
}

/* ============================================================
   CONTEXT
   ============================================================ */

export interface ConversationContext {
  turnNumber: number;
  previousCues: string[];
  repPerformance: "poor" | "fair" | "good" | "excellent";
  hcpMood: "improving" | "stable" | "declining";
}

/* ============================================================
   DYNAMIC CUE SELECTION (CATEGORY SAFE)
   ============================================================ */

export function selectDynamicCues(
  rawDetectedCues: BehavioralCue[],
  context: ConversationContext,
  repMetrics: RepMetricCue[],
  lastRepMessage?: string,
  hcpMood?: string,
  sessionId?: string
): BehavioralCue[] {
  const performance = analyzeRepPerformance(repMetrics);
  const repIsNegative = detectRepNegativity(lastRepMessage);
  const newMood = determineHCPMoodTrend(context.hcpMood, performance);

  const recent = context.previousCues.slice(-6);

  let pool = allCues();

  if (hcpMood) {
    const lower = hcpMood.toLowerCase();

    const negativeMood =
      ["frustrated", "stressed", "rushed", "impatient"].some((k) =>
        lower.includes(k)
      );

    const positiveMood =
      ["excited", "interested", "engaged", "open"].some((k) =>
        lower.includes(k)
      );

    if (negativeMood && !positiveMood) {
      pool = pool.filter((c) => c.category !== "interest");
    }

    if (positiveMood && !negativeMood) {
      pool = pool.filter((c) => c.category !== "stress");
    }
  }

  if (repIsNegative) {
    pool = pool.filter((c) => c.category !== "interest");
  }

  const available = pool.filter((c) => !recent.includes(c.id));

  const sid = sessionId || "default";

  if (!rawDetectedCues.length) {
    if (performance === "poor" || repIsNegative) {
      const negativePool = available.filter(
        (c) => c.category === "resistance" || c.category === "stress"
      );
      return generateContextualCues(
        context.turnNumber,
        "declining",
        negativePool.length ? negativePool : available,
        sid
      ).slice(0, 2);
    }
    return [];
  }

  const filtered = rawDetectedCues.filter(
    (c) => !recent.includes(c.id)
  );

  if (!filtered.length) {
    return generateContextualCues(
      context.turnNumber,
      newMood,
      available,
      sid
    ).slice(0, 2);
  }

  return enhanceCuesBasedOnMood(filtered, newMood, available).slice(0, 2);
}

/* ============================================================
   CONTEXTUAL GENERATION
   ============================================================ */

function generateContextualCues(
  turn: number,
  mood: "improving" | "stable" | "declining",
  pool: BehavioralCue[],
  sessionId: string
): BehavioralCue[] {
  if (!pool.length) {
    return selectDeterministicCues(allCues(), 2, `${sessionId}:${turn}`);
  }

  return selectDeterministicCues([...pool], 2, `${sessionId}:${turn}`);
}

function enhanceCuesBasedOnMood(
  cues: BehavioralCue[],
  mood: "improving" | "stable" | "declining",
  pool: BehavioralCue[]
): BehavioralCue[] {
  const enhanced = [...cues];

  if (mood === "improving") {
    enhanced.forEach((cue, i) => {
      if (cue.severity === "high") {
        const replacement = pool.find(
          (c) =>
            c.category === cue.category &&
            c.severity !== "high"
        );
        if (replacement) enhanced[i] = replacement;
      }
    });
  }

  if (mood === "declining") {
    enhanced.forEach((cue, i) => {
      if (cue.severity === "low") {
        const replacement = pool.find(
          (c) =>
            c.category === cue.category &&
            c.severity === "high"
        );
        if (replacement) enhanced[i] = replacement;
      }
    });
  }

  return enhanced;
}

/* ============================================================
   DETERMINISTIC SELECTION
   ============================================================ */

function deterministicIndex(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

function selectDeterministicCues(
  pool: BehavioralCue[],
  count: number,
  seed: string
): BehavioralCue[] {
  if (!pool.length) return [];

  const selected: BehavioralCue[] = [];

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const index = deterministicIndex(`${seed}:${i}`, pool.length - i);
    selected.push(pool.splice(index, 1)[0]);
  }

  return selected;
}

/* ============================================================
   CONTEXT MANAGEMENT
   ============================================================ */

export function createInitialContext(): ConversationContext {
  return {
    turnNumber: 0,
    previousCues: [],
    repPerformance: "fair",
    hcpMood: "stable",
  };
}

export function updateContext(
  context: ConversationContext,
  newCues: BehavioralCue[],
  repMetrics: RepMetricCue[]
): ConversationContext {
  const performance = analyzeRepPerformance(repMetrics);
  const newMood = determineHCPMoodTrend(context.hcpMood, performance);

  return {
    turnNumber: context.turnNumber + 1,
    previousCues: [
      ...context.previousCues,
      ...newCues.map((c) => c.id),
    ],
    repPerformance: performance,
    hcpMood: newMood,
  };
}
